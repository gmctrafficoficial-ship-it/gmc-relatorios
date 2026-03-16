export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-5xl font-bold text-slate-300">404</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          Relatório não encontrado
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          O relatório solicitado não existe ou ainda não foi gerado.
        </p>
      </div>
    </div>
  );
}
