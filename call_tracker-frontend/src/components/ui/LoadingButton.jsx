export default function LoadingButton({
  children,
  loading,
  loadingText = "Loading...",
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      disabled={loading}
      className={`w-full py-3 border border-cyan-400 rounded-md hover:bg-cyan-400 hover:text-black transition shadow-[0_0_15px_#00f0ff] flex items-center justify-center gap-2 disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}