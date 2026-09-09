import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DeckLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-9 w-24 bg-muted rounded animate-pulse" />
              <div className="h-6 w-px bg-border" />
              <div className="space-y-2">
                <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-96 bg-muted rounded animate-pulse" />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="w-16 h-6 bg-muted animate-pulse">
                <span className="opacity-0">Loading</span>
              </Badge>
              <div className="h-9 w-24 bg-muted rounded animate-pulse" />
              <div className="h-9 w-28 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        {/* Deck Stats Skeleton */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-12 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards Section Skeleton */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="h-7 w-16 bg-muted rounded animate-pulse" />
            <div className="h-9 w-28 bg-muted rounded animate-pulse" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Badge variant="secondary" className="w-8 h-6 bg-muted animate-pulse">
                        <span className="opacity-0">{i + 1}</span>
                      </Badge>
                      <div className="space-y-2 flex-1">
                        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                      <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}