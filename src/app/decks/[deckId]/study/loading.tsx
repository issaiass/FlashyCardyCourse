import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function StudyLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-9 w-28 bg-muted rounded animate-pulse" />
            <div className="h-6 w-px bg-border" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="w-24 h-6 bg-muted animate-pulse">
              <span className="opacity-0">Loading</span>
            </Badge>
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-2 w-full bg-muted rounded animate-pulse" />
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-muted/50 rounded-lg animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
