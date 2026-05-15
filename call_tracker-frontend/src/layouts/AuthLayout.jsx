export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.12)_0%,_transparent_60%)]" />

      <div className="relative z-10 w-full flex flex-col items-center px-4">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Call<span className="text-blue-500">Tracker</span> CRM
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sales & Lead Management</p>
        </div>

        {children}
      </div>
    </div>
  );
}
