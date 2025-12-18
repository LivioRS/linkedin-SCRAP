import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

export function AppHeader({ title }: { title: string }) {
  const { isScraping, triggerGlobalScrape, scrapingStatus } = useAppStore()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-200" />
    }
  }

  return (
    <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-9 h-9 bg-secondary border-none"
          />
        </div>
        <HoverCard openDelay={0} closeDelay={200}>
          <HoverCardTrigger asChild>
            <Button
              onClick={triggerGlobalScrape}
              disabled={isScraping}
              variant={isScraping ? 'secondary' : 'default'}
              className="min-w-[160px] relative overflow-hidden"
            >
              {isScraping && (
                <span className="absolute inset-0 bg-primary/10 animate-pulse" />
              )}
              <RefreshCw
                className={cn('mr-2 h-4 w-4', isScraping && 'animate-spin')}
              />
              {isScraping ? 'Coletando Dados...' : 'Global Scrape'}
            </Button>
          </HoverCardTrigger>
          {isScraping && (
            <HoverCardContent className="w-80 p-4" align="end">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold mb-2">Status da Coleta</h4>
                {Object.entries(scrapingStatus).map(([platform, status]) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize">{platform}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {status}
                      </span>
                      {getStatusIcon(status)}
                    </div>
                  </div>
                ))}
              </div>
            </HoverCardContent>
          )}
        </HoverCard>
      </div>
    </header>
  )
}
