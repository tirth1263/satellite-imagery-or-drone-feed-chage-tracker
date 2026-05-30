type TimelineItem = {
  month: string;
  value: number;
};

type SignalChartProps = {
  timeline: TimelineItem[];
};

export function SignalChart({ timeline }: SignalChartProps) {
  return (
    <div className="chart" aria-label="Temporal drift chart">
      {timeline.map((item) => (
        <div className="chart-bar" key={item.month} title={`${item.month}: ${item.value}%`}>
          <div className="bar-track">
            <span className="bar-fill" style={{ height: `${item.value}%` }} />
          </div>
          <span>{item.month}</span>
        </div>
      ))}
    </div>
  );
}
