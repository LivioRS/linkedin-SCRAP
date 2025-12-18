import { Card } from '@/components/ui/card'

export function AnalysisHeader() {
  return (
    <Card className="bg-primary border-none shadow-planin overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-accent/20 to-transparent pointer-events-none" />
      <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
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
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight font-sans">
              PLANIN
            </h1>
          </div>
          <p className="text-accent-foreground/90 font-medium text-lg">
            Monitor de Reputação Digital
          </p>
        </div>
        <div className="flex flex-col items-end text-right text-white/80 text-sm">
          <p>Análise Estratégica & Inteligência de Dados</p>
          <p className="font-mono mt-1 opacity-60">
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
