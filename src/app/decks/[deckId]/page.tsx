import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getDeckWithCards } from '@/db/queries/decks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Plus } from 'lucide-react';
import Link from 'next/link';
import DeckCards from './components/DeckCards';
import { CreateCardDialog } from '@/components/CreateCardDialog';
import { EditDeckDialog } from '@/components/EditDeckDialog';

export default async function DeckPage({
  params,
}: PageProps<'/decks/[deckId]'>) {
  const { userId } = await auth();
  const { deckId } = await params;
  
  // Redirect unauthenticated users to homepage
  if (!userId) {
    redirect('/');
  }

  if (!/^\d+$/.test(deckId)) {
    notFound();
  }

  // Fetch deck with cards using the query helper
  const deckWithCards = await getDeckWithCards(deckId, userId);
  
  // If no deck found or user doesn't own it, show 404
  if (!deckWithCards || deckWithCards.length === 0) {
    notFound();
  }

  // Extract deck info and cards
  const deck = deckWithCards[0].deck;
  const cards = deckWithCards
    .filter(item => item.card !== null)
    .map(item => item.card!)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const cardCount = cards.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-bold">{deck.title}</h1>
                {deck.description && (
                  <p className="text-sm text-muted-foreground">{deck.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {cardCount} {cardCount === 1 ? 'card' : 'cards'}
              </Badge>
              <EditDeckDialog
                key={deck.updatedAt.toISOString()}
                deckId={deck.id}
                title={deck.title}
                description={deck.description}
              >
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Deck
                </Button>
              </EditDeckDialog>
              <CreateCardDialog deckId={deck.id}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Card
                </Button>
              </CreateCardDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Deck Stats */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deck Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Total Cards</div>
                  <div className="text-2xl font-bold">{cardCount}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Created</div>
                  <div className="text-lg">
                    {new Date(deck.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Last Updated</div>
                  <div className="text-lg">
                    {new Date(deck.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Cards</h2>
            {cardCount > 0 && (
              <Button variant="outline" asChild>
                <Link href={`/decks/${deck.id}/study`}>
                  Start Studying
                </Link>
              </Button>
            )}
          </div>

          {cardCount === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="text-muted-foreground text-lg">No cards yet</div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Get started by adding your first flashcard to this deck.
                  </p>
                  <CreateCardDialog deckId={deck.id}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Card
                    </Button>
                  </CreateCardDialog>
                </div>
              </CardContent>
            </Card>
          ) : (
            <DeckCards cards={cards} deckId={deck.id} />
          )}
        </section>
      </main>
    </div>
  );
}