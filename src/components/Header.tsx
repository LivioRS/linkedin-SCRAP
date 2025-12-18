import { Button } from '@/components/ui/button'
import { RefreshCw, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export function AppHeader({ title }: { title: string }) {
  const { isScraping, triggerGlobalScrape } = useAppStore()

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

        <Button
          onClick={triggerGlobalScrape}
          disabled={isScraping}
          variant={isScraping ? 'secondary' : 'default'}
          className="min-w-[140px]"
        >
          <RefreshCw
            className={cn('mr-2 h-4 w-4', isScraping && 'animate-spin')}
          />
          {isScraping ? 'Atualizando...' : 'Global Scrape'}
        </Button>
      </div>
    </header>
  )
}
