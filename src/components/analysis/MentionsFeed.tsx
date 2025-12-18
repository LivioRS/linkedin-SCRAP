import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThumbsUp, MessageSquare, Share2, Calendar } from 'lucide-react'
import { Post, Client } from '@/types'

interface MentionsFeedProps {
  posts: Post[]
  clients: Client[]
}

export function MentionsFeed({ posts, clients }: MentionsFeedProps) {
  const getSentimentBadge = (score: number) => {
    if (score > 0.3) {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
        >
          Positivo
        </Badge>
      )
    }
    if (score < -0.3) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
        >
          Negativo
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100"
      >
        Neutro
      </Badge>
    )
  }

  return (
    <Card className="shadow-planin border-none">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">
          Feed de Menções Detalhado
        </CardTitle>
        <CardDescription>
          Análise individual de publicações e seus impactos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => {
            const client = clients.find((c) => c.id === post.clientId)
            return (
              <div
                key={post.id}
                className="p-5 rounded-xl border border-border/50 bg-white hover:border-accent/30 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarImage src={client?.avatarUrl} />
                      <AvatarFallback>
                        {client?.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {client?.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">
                          {post.vehicle || 'LinkedIn'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.postedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {getSentimentBadge(post.sentimentScore)}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                  {post.content}
                </p>
                <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium pt-3 border-t border-gray-50">
                  <span className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
                    <ThumbsUp className="h-3.5 w-3.5" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
                    <MessageSquare className="h-3.5 w-3.5" /> {post.comments}
                  </span>
                  <span className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
                    <Share2 className="h-3.5 w-3.5" /> {post.shares}
                  </span>
                  <span className="ml-auto text-xs text-primary/70 font-semibold">
                    Score: {post.sentimentScore.toFixed(2)}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
            Nenhuma menção encontrada para os filtros selecionados.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
