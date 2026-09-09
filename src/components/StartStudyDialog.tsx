'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BookOpen } from 'lucide-react';

export interface StudyDeckOption {
  id: number;
  title: string;
  description: string | null;
  cardCount: number;
}

interface StartStudyDialogProps {
  decks: StudyDeckOption[];
  children: React.ReactNode;
}

export function StartStudyDialog({ decks, children }: StartStudyDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start Studying</DialogTitle>
          <DialogDescription>
            Choose a deck to begin a study session.
          </DialogDescription>
        </DialogHeader>

        {decks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any decks yet. Create a deck first, then come back to study.
          </p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {decks.map((deck) => {
              const content = (
                <>
                  <div className="min-w-0 space-y-1 text-left">
                    <div className="flex items-center gap-2 font-medium">
                      <BookOpen className="h-4 w-4 shrink-0" />
                      <span className="truncate">{deck.title}</span>
                    </div>
                    {deck.description && (
                      <p className="text-sm font-normal text-muted-foreground line-clamp-2">
                        {deck.description}
                      </p>
                    )}
                    {deck.cardCount === 0 && (
                      <p className="text-xs font-normal text-muted-foreground">
                        Add cards before studying this deck
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                  </Badge>
                </>
              );

              if (deck.cardCount === 0) {
                return (
                  <Button
                    key={deck.id}
                    type="button"
                    variant="outline"
                    disabled
                    className="h-auto w-full items-start justify-between gap-3 whitespace-normal p-4"
                  >
                    {content}
                  </Button>
                );
              }

              return (
                <Button
                  key={deck.id}
                  variant="outline"
                  className="h-auto w-full items-start justify-between gap-3 whitespace-normal p-4"
                  asChild
                >
                  <Link href={`/decks/${deck.id}/study`} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                </Button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
