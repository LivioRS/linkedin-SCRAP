import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThumbsUp, MessageSquare, Share2, Calendar, Search } from 'lucide-react'
import { Post, Client } from '@/types'

interface MentionsFeedProps {
  posts: Post[]
  clients: Client[]
}

export function MentionsFeed({ posts, clients }: MentionsFeedProps) {
  const getSentimentBadge = (score: number) => {
    if (score > 0.3) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 px-2 py-0.5 text-[10px] uppercase font-bold">
          Positivo
        </Badge>
      )
    }
    if (score < -0.3) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200 px-2 py-0.5 text-[10px] uppercase font-bold">
          Negativo
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 px-2 py-0.5 text-[10px] uppercase font-bold">
        Neutro
      </Badge>
    )
  }

  return (
    <Card className="shadow-sm border-none bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">
          Feed de Menções
        </CardTitle>
        <CardDescription>Últimas publicações analisadas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => {
            const client = clients.find((c) => c.id === post.clientId)
            return (
              <div
                key={post.id}
                className="p-4 rounded-lg border border-border/50 bg-white hover:border-primary/20 hover:shadow-sm transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border shadow-sm">
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
                        <span className="capitalize font-medium bg-slate-100 px-1.5 rounded">
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
                <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-2 font-medium">
                  {post.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium pt-2 border-t border-dashed">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {post.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" /> {post.shares}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
            <Search className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">Nenhuma menção encontrada.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
