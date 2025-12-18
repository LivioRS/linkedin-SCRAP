import { useState, useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Eye,
  ExternalLink,
  Bot,
  MessageSquareText,
  Search,
  Calendar,
} from 'lucide-react'
import { SentimentBadge } from '@/components/SentimentBadge'
import { useSearchParams } from 'react-router-dom'
import { subDays } from 'date-fns'

export default function Feed() {
  const { posts, comments, clients } = useAppStore()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [sentimentFilter, setSentimentFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('90') // Padrão: últimos 90 dias

  // Calcular data de corte baseada no período selecionado
  const cutoffDate = useMemo(() => {
    const days = parseInt(periodFilter)
    return subDays(new Date(), days)
  }, [periodFilter])

  const filteredPosts = posts
    .filter((post) => {
      const postDate = new Date(post.postedAt)
      const matchesPeriod = postDate >= cutoffDate
      
      const matchesSearch = post.content
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesSentiment =
        sentimentFilter === 'all'
          ? true
          : sentimentFilter === 'positive'
            ? post.sentimentScore > 0.3
            : sentimentFilter === 'negative'
              ? post.sentimentScore < -0.3
              : post.sentimentScore >= -0.3 && post.sentimentScore <= 0.3
      return matchesSearch && matchesSentiment && matchesPeriod
    })
    .sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-planin">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            Feed de Reputação
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe posts e comentários analisados pela IA.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por palavra-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="180">Últimos 6 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sentimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="positive">Positivo</SelectItem>
              <SelectItem value="neutral">Neutro</SelectItem>
              <SelectItem value="negative">Negativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {filteredPosts.map((post) => {
          const client = clients.find((c) => c.id === post.clientId)
          const postComments = comments.filter((c) => c.postId === post.id)
          return (
            <Card
              key={post.id}
              className="overflow-hidden hover:shadow-planin-hover transition-all duration-300 border-border/60"
            >
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4 border-b border-gray-100 bg-gray-50/50">
                <Avatar className="h-12 w-12 border shadow-sm">
                  <AvatarImage src={client?.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {client?.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900">
                      {client?.name}
                    </h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span className="bg-white px-2 py-1 rounded border">
                        {new Date(post.postedAt).toLocaleString('pt-BR')}
                      </span>
                      <a
                        href={post.url}
                        target="_blank"
                        className="text-accent hover:text-accent/80 hover:underline flex items-center gap-1"
                      >
                        Link <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {client?.type === 'own' ? 'Cliente Próprio' : 'Concorrente'}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap mb-6">
                  {post.content}
                </p>
                <div className="flex items-center gap-3 mb-2 p-3 bg-gray-50 rounded-lg inline-flex">
                  <span className="text-sm font-semibold text-gray-700">
                    Análise IA:
                  </span>
                  <SentimentBadge score={post.sentimentScore} />
                </div>
              </CardContent>
              <CardFooter className="flex-col p-0">
                <div className="flex w-full justify-between items-center p-6 border-t border-gray-100 bg-gray-50/30">
                  <div className="flex gap-6 text-sm text-gray-600 font-medium">
                    <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                      <ThumbsUp className="h-4 w-4" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                      <MessageCircle className="h-4 w-4" /> {post.comments}
                    </span>
                    <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                      <Share2 className="h-4 w-4" /> {post.shares}
                    </span>
                    <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                      <Eye className="h-4 w-4" /> {post.views}
                    </span>
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="planin" size="sm" className="gap-2">
                        <Bot className="h-4 w-4" /> IA Insights
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle className="text-primary">
                          Análise Profunda (Claude)
                        </SheetTitle>
                        <SheetDescription>
                          Detalhes processados sobre este post.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-8 space-y-8">
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Score de Sentimento
                          </h4>
                          <div className="p-4 bg-gray-50 rounded-xl border">
                            <div className="text-4xl font-bold flex items-center gap-3">
                              <span
                                className={
                                  post.sentimentScore > 0.3
                                    ? 'text-green-600'
                                    : post.sentimentScore < -0.3
                                      ? 'text-red-600'
                                      : 'text-gray-600'
                                }
                              >
                                {post.sentimentScore.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Raciocínio da IA
                          </h4>
                          <div className="p-5 bg-blue-50/50 rounded-xl text-sm leading-relaxed border border-blue-100 text-gray-800 shadow-sm">
                            {post.sentimentExplanation}
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                {postComments.length > 0 && (
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full px-6 pb-2"
                  >
                    <AccordionItem value="comments" className="border-none">
                      <AccordionTrigger className="text-sm text-muted-foreground py-3 hover:no-underline hover:text-primary transition-colors">
                        <div className="flex items-center gap-2 font-medium">
                          <MessageSquareText className="h-4 w-4" /> Ver{' '}
                          {postComments.length} comentários analisados
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pl-2 pt-2">
                          {postComments.map((comment) => (
                            <div
                              key={comment.id}
                              className="p-4 bg-white border border-gray-100 rounded-lg text-sm shadow-sm"
                            >
                              <div className="flex justify-between mb-2">
                                <span className="font-bold text-gray-900 text-xs">
                                  {comment.author}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.postedAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="mb-3 text-gray-700">
                                {comment.content}
                              </p>
                              <SentimentBadge score={comment.sentimentScore} />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardFooter>
            </Card>
          )
        })}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground bg-white rounded-xl border border-dashed shadow-sm">
            <Search className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">Nenhum post encontrado</p>
            <p className="text-sm">Tente ajustar os filtros de período ou sentimento.</p>
          </div>
        )}
        
        {filteredPosts.length > 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground bg-white rounded-lg border">
            Mostrando <strong>{filteredPosts.length}</strong> post(s) dos últimos {periodFilter} dias
          </div>
        )}
      </div>
    </div>
  )
}
