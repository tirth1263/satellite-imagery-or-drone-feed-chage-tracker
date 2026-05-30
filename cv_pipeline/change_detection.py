from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Literal

import cv2
import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.io import DatasetReader
from rasterio.warp import reproject
from shapely.geometry import mapping, shape

IndexMode = Literal["ndvi", "ndwi", "rgb"]


@dataclass
class ChangeSummary:
    mode: str
    threshold: float
    changed_pixels: int
    total_pixels: int
    changed_percent: float
    estimated_area_sq_m: float | None
    contour_count: int


def _read_band(dataset: DatasetReader, band_index: int) -> np.ndarray:
    return dataset.read(band_index).astype("float32")


def _normalize_band(band: np.ndarray) -> np.ndarray:
    valid = np.isfinite(band)
    if not np.any(valid):
        return np.zeros_like(band, dtype="float32")

    low, high = np.percentile(band[valid], [2, 98])
    if high <= low:
        return np.zeros_like(band, dtype="float32")

    return np.clip((band - low) / (high - low), 0, 1).astype("float32")


def _normalized_difference(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    denominator = a + b
    return np.divide(a - b, denominator, out=np.zeros_like(a, dtype="float32"), where=np.abs(denominator) > 1e-6)


def _index(dataset: DatasetReader, mode: IndexMode) -> np.ndarray:
    if mode == "ndvi":
        # Landsat/Sentinel common order in prepared GeoTIFFs: red=3, nir=4.
        red = _normalize_band(_read_band(dataset, 3))
        nir = _normalize_band(_read_band(dataset, 4))
        return _normalized_difference(nir, red)

    if mode == "ndwi":
        # Green=2, nir=4 for water-boundary monitoring.
        green = _normalize_band(_read_band(dataset, 2))
        nir = _normalize_band(_read_band(dataset, 4))
        return _normalized_difference(green, nir)

    bands = [_normalize_band(_read_band(dataset, band)) for band in (1, 2, 3)]
    return np.mean(np.stack(bands, axis=0), axis=0).astype("float32")


def _aligned_index(reference: DatasetReader, target: DatasetReader, mode: IndexMode) -> np.ndarray:
    target_index = _index(target, mode)
    aligned = np.empty((reference.height, reference.width), dtype="float32")

    reproject(
        source=target_index,
        destination=aligned,
        src_transform=target.transform,
        src_crs=target.crs,
        dst_transform=reference.transform,
        dst_crs=reference.crs,
        resampling=Resampling.bilinear,
    )

    return aligned


def _mask_from_delta(delta: np.ndarray, threshold: float, min_area: int) -> np.ndarray:
    raw_mask = (np.abs(delta) >= threshold).astype("uint8") * 255
    kernel = np.ones((5, 5), dtype="uint8")
    opened = cv2.morphologyEx(raw_mask, cv2.MORPH_OPEN, kernel)
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel)

    if min_area <= 0:
        return closed

    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    filtered = np.zeros_like(closed)
    for contour in contours:
        if cv2.contourArea(contour) >= min_area:
            cv2.drawContours(filtered, [contour], -1, 255, thickness=cv2.FILLED)
    return filtered


def _pixel_area_sq_m(dataset: DatasetReader) -> float | None:
    if not dataset.crs or not dataset.crs.is_projected:
        return None
    return abs(dataset.transform.a * dataset.transform.e)


def _write_mask(path: Path, reference: DatasetReader, mask: np.ndarray) -> None:
    profile = reference.profile.copy()
    profile.update(count=1, dtype="uint8", nodata=0, compress="deflate")
    with rasterio.open(path, "w", **profile) as dst:
        dst.write(mask, 1)


def _contours_geojson(reference: DatasetReader, mask: np.ndarray) -> dict:
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    features = []

    for index, contour in enumerate(contours, start=1):
        if len(contour) < 4:
            continue

        coords = []
        for point in contour[:, 0, :]:
            col, row = int(point[0]), int(point[1])
            x, y = reference.transform * (col, row)
            coords.append((x, y))

        if coords[0] != coords[-1]:
            coords.append(coords[0])

        geometry = shape({"type": "Polygon", "coordinates": [coords]})
        if not geometry.is_valid or geometry.area == 0:
            continue

        features.append(
            {
                "type": "Feature",
                "properties": {"id": index, "pixel_count": int(cv2.contourArea(contour))},
                "geometry": mapping(geometry),
            }
        )

    return {
        "type": "FeatureCollection",
        "name": "change_zones",
        "crs": {"type": "name", "properties": {"name": str(reference.crs)}},
        "features": features,
    }


def detect_change(
    before_path: Path,
    after_path: Path,
    output_dir: Path,
    mode: IndexMode,
    threshold: float,
    min_area: int,
) -> ChangeSummary:
    output_dir.mkdir(parents=True, exist_ok=True)

    with rasterio.open(before_path) as before, rasterio.open(after_path) as after:
        before_index = _index(before, mode)
        after_index = _aligned_index(before, after, mode)
        delta = after_index - before_index
        mask = _mask_from_delta(delta, threshold, min_area)

        changed_pixels = int(np.count_nonzero(mask))
        total_pixels = int(mask.size)
        pixel_area = _pixel_area_sq_m(before)
        estimated_area = changed_pixels * pixel_area if pixel_area is not None else None

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        summary = ChangeSummary(
            mode=mode,
            threshold=threshold,
            changed_pixels=changed_pixels,
            total_pixels=total_pixels,
            changed_percent=round((changed_pixels / total_pixels) * 100, 4),
            estimated_area_sq_m=round(estimated_area, 2) if estimated_area is not None else None,
            contour_count=len(contours),
        )

        _write_mask(output_dir / "change_mask.tif", before, mask)
        (output_dir / "change_zones.geojson").write_text(
            json.dumps(_contours_geojson(before, mask), indent=2),
            encoding="utf-8",
        )
        (output_dir / "summary.json").write_text(json.dumps(asdict(summary), indent=2), encoding="utf-8")

    return summary


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Detect change between two georeferenced raster scenes.")
    parser.add_argument("--before", required=True, type=Path, help="Baseline GeoTIFF path.")
    parser.add_argument("--after", required=True, type=Path, help="Comparison GeoTIFF path.")
    parser.add_argument("--out", default=Path("outputs/change-run"), type=Path, help="Output directory.")
    parser.add_argument("--mode", choices=["ndvi", "ndwi", "rgb"], default="ndvi", help="Change index to compare.")
    parser.add_argument("--threshold", default=0.18, type=float, help="Absolute delta threshold.")
    parser.add_argument("--min-area", default=64, type=int, help="Minimum contour area in pixels.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    summary = detect_change(args.before, args.after, args.out, args.mode, args.threshold, args.min_area)
    print(json.dumps(asdict(summary), indent=2))


if __name__ == "__main__":
    main()
