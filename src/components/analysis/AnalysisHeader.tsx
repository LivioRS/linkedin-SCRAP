import { Card } from '@/components/ui/card'

export function AnalysisHeader() {
  return (
    <Card className="bg-slate-900 border-none shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-primary/30 to-transparent pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />

      <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight font-display">
              PLANIN
            </h1>
          </div>
          <p className="text-slate-300 font-medium text-lg">
            Monitoramento Estratégico & Inteligência de Dados
          </p>
        </div>
        <div className="flex flex-col items-end text-right text-slate-400 text-sm">
          <p className="font-semibold text-white">Análise Competitiva</p>
          <p className="font-mono mt-1 opacity-80 bg-white/5 px-2 py-1 rounded">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </Card>
  )
}
