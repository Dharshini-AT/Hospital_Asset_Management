const SectionCard = ({ title, subtitle, action, children, className = '' }) => (
  <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
    {(title || subtitle || action) && (
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          {title && <h2 className="text-sm font-bold text-[#09284d]">{title}</h2>}
          {subtitle && <p className="mt-1 text-[10px] leading-4 text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-5">{children}</div>
  </section>
);
export default SectionCard;
