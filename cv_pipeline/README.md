# Computer Vision Pipeline

This folder contains the Python side of the project. The dashboard is polished for presentation, while this pipeline shows the geospatial workflow behind the UI.

## Inputs

- `--before`: a baseline georeferenced GeoTIFF.
- `--after`: a later georeferenced GeoTIFF covering the same region.
- `--mode`: `ndvi`, `ndwi`, or `rgb`.

The script reprojects the comparison scene to the baseline scene before calculating change, so the output mask keeps the baseline CRS and transform.

## Run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python cv_pipeline/change_detection.py --before data/before.tif --after data/after.tif --mode ndvi --out outputs/amazon-run
```

## Outputs

- `change_mask.tif`: georeferenced binary raster mask.
- `change_zones.geojson`: polygonized change regions for map overlays.
- `summary.json`: changed pixels, percent changed, area estimate, and contour count.

## Next Steps

- Add a Google Earth Engine downloader for Sentinel-2 or Landsat scenes.
- Train a U-Net segmentation model on labeled land-cover masks.
- Add YOLO object detection for roads, buildings, vehicles, or construction equipment in drone frames.
- Stream `summary.json` and `change_zones.geojson` into the React dashboard.
