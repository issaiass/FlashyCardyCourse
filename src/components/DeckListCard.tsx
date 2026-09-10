'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeleteDeckDialog } from '@/components/DeleteDeckDialog';

interface DeckListCardProps {
  deck: {
    id: number;
    title: string;
    description: string | null;
    createdAt: Date;
    cardCount: number;
  };
}

export function DeckListCard({ deck }: DeckListCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <Link href={`/decks/${deck.id}`} className="min-w-0 flex-1">
              <CardTitle className="text-lg line-clamp-2 hover:underline">
                {deck.title}
              </CardTitle>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="secondary">
                {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Delete deck ${deck.title}`}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {deck.description && (
            <Link href={`/decks/${deck.id}`} className="block">
              <CardDescription className="line-clamp-2">
                {deck.description}
              </CardDescription>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Created {new Date(deck.createdAt).toLocaleDateString()}
            </span>
            <Link href={`/decks/${deck.id}`} className="text-primary font-medium hover:underline">
              View Deck →
            </Link>
          </div>
        </CardContent>
      </Card>

      <DeleteDeckDialog
        deckId={deck.id}
        deckTitle={deck.title}
        cardCount={deck.cardCount}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
