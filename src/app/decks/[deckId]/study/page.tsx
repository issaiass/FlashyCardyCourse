import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getUserDeckById } from '@/db/queries/decks';
import { getCardsByDeck } from '@/db/queries/cards';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { StudySession } from './components/StudySession';

export default async function StudyPage({
  params,
}: PageProps<'/decks/[deckId]/study'>) {
  const { userId } = await auth();
  const { deckId } = await params;

  if (!userId) {
    redirect('/');
  }

  if (!/^\d+$/.test(deckId)) {
    notFound();
  }

  const deck = await getUserDeckById(deckId, userId);
  if (!deck) {
    notFound();
  }

  const cardRows = await getCardsByDeck(deckId, userId);
  const cards = cardRows.map(({ card }) => ({
    id: card.id,
    title: card.title,
    front: card.front,
    back: card.back,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/decks/${deck.id}`} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Deck
                </Link>
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Study session</p>
                <h1 className="text-2xl font-bold truncate">{deck.title}</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {cards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="text-muted-foreground text-lg">No cards to study</div>
                <p className="text-sm text-muted-foreground max-w-md">
                  Add flashcards to this deck before starting a study session.
                </p>
                <Button asChild>
                  <Link href={`/decks/${deck.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Cards
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <StudySession cards={cards} />
        )}
      </main>
    </div>
  );
}
