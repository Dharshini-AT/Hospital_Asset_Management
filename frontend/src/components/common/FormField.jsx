const FormField = ({ label, required = false, children, hint }) => (
  <label className="block">
    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-[9px] text-slate-400">{hint}</span>}
  </label>
);

export const inputClass = 'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10';
export const selectClass = inputClass;
export const textareaClass = 'min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10';

export default FormField;
