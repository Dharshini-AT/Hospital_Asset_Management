const MiniDonut = ({ items = [], total = 0 }) => {
  const palette = ['#0891b2', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];
  let cursor = 0;
  const stops = items.map((item, index) => {
    const pct = total ? (item.value / total) * 100 : 0;
    const start = cursor;
    cursor += pct;
    return `${palette[index % palette.length]} ${start}% ${cursor}%`;
  }).join(', ');
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops || '#e2e8f0 0 100%'})` }}>
        <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white">
          <span className="text-2xl font-bold text-[#09284d]">{total}</span>
          <span className="text-[9px] text-slate-400">Total</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center gap-2 text-[10px]">
            <span className="h-2 w-2 rounded-full" style={{ background: palette[index % palette.length] }} />
            <span className="min-w-[90px] text-slate-500">{item.label}</span>
            <span className="font-bold text-slate-700">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MiniDonut;
