export function LineChart({ data, height = 160 }: { data: { t: number; y: number }[]; height?: number }) {
  const w = 640;
  if (!data.length)
    return (
      <div className="h-[160px] flex items-center justify-center text-xs text-[#666666]">No data yet</div>
    );

  const xs = data.map((d) => d.t);
  const ys = data.map((d) => d.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const pad = 6;
  const toX = (t: number) => pad + ((t - minX) / (maxX - minX || 1)) * (w - pad * 2);
  const toY = (y: number) => pad + (1 - (y - minY) / (maxY - minY || 1)) * (height - pad * 2);
  const pts = data.map((d) => `${toX(d.t)},${toY(d.y)}`).join(' ');
  const change = ((ys[ys.length - 1] - ys[0]) / (ys[0] || 1)) * 100;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full h-[160px]">
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2979FF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2979FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1={0} x2={w} y1={p * height} y2={p * height} stroke="rgba(0,0,0,.05)" strokeWidth={1} />
      ))}
      <polyline points={`0,${height} ${pts} ${w},${height}`} fill="url(#g1)" stroke="none" />
      <polyline points={pts} fill="none" stroke="#2979FF" strokeWidth={2.5} />
      <circle cx={toX(xs[xs.length - 1])} cy={toY(ys[ys.length - 1])} r={4} fill="#2979FF" stroke="#FFFFFF" strokeWidth={2} />
      <text x={w - 8} y={16} textAnchor="end" fontSize="12" fontWeight="600" fill="#2C2C2C">
        {ys[ys.length - 1].toFixed(1)} ({change >= 0 ? '+' : ''}{change.toFixed(1)}%)
      </text>
    </svg>
  );
}
