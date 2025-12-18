import { useState } from 'react'
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
} from 'lucide-react'
import { SentimentBadge } from '@/components/SentimentBadge'
import { useSearchParams } from 'react-router-dom'

export default function Feed() {
  const { posts, comments, clients } = useAppStore()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [sentimentFilter, setSentimentFilter] = useState('all')

  const filteredPosts = posts
    .filter((post) => {
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
      return matchesSearch && matchesSentiment
    })
    .sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Feed de Reputação
          </h2>
          <p className="text-muted-foreground">
            Acompanhe posts e comentários analisados pela IA.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Filtrar por palavra-chave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-[300px]"
          />
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-[180px]">
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
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4 border-b bg-muted/20">
                <Avatar>
                  <AvatarImage src={client?.avatarUrl} />
                  <AvatarFallback>
                    {client?.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-base">{client?.name}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>
                        {new Date(post.postedAt).toLocaleString('pt-BR')}
                      </span>
                      <a
                        href={post.url}
                        target="_blank"
                        className="hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {client?.type === 'own' ? 'Cliente Próprio' : 'Concorrente'}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-base whitespace-pre-wrap mb-4">
                  {post.content}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Sentimento (Claude AI):
                  </span>
                  <SentimentBadge score={post.sentimentScore} />
                </div>
              </CardContent>
              <CardFooter className="flex-col p-0">
                <div className="flex w-full justify-between items-center p-6 border-t bg-gray-50 dark:bg-muted/10">
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" /> {post.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" /> {post.shares}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> {post.views}
                    </span>
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-primary hover:text-primary/80"
                      >
                        <Bot className="h-4 w-4" /> IA Insights
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Análise Profunda (Claude)</SheetTitle>
                        <SheetDescription>
                          Detalhes processados sobre este post.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Score de Sentimento
                          </h4>
                          <div className="text-3xl font-bold flex items-center gap-3">
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

                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Raciocínio da IA
                          </h4>
                          <div className="p-4 bg-muted rounded-md text-sm leading-relaxed border-l-4 border-primary">
                            {post.sentimentExplanation}
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Comments Section */}
                {postComments.length > 0 && (
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full px-6 pb-2"
                  >
                    <AccordionItem value="comments" className="border-none">
                      <AccordionTrigger className="text-sm text-muted-foreground py-2 hover:no-underline hover:text-foreground">
                        <div className="flex items-center gap-2">
                          <MessageSquareText className="h-4 w-4" />
                          Ver {postComments.length} comentários analisados
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pl-2 pt-2">
                          {postComments.map((comment) => (
                            <div
                              key={comment.id}
                              className="p-3 bg-background border rounded-md text-sm"
                            >
                              <div className="flex justify-between mb-1">
                                <span className="font-semibold text-xs">
                                  {comment.author}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.postedAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="mb-2">{comment.content}</p>
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
          <div className="text-center py-12 text-muted-foreground">
            Nenhum post encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  )
}
