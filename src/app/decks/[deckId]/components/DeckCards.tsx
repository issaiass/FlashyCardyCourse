'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { EditCardDialog } from '@/components/EditCardDialog';
import { DeleteCardDialog } from '@/components/DeleteCardDialog';

interface CardData {
  id: number;
  deckId: number;
  title: string | null;
  front: string;
  back: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DeckCardsProps {
  cards: CardData[];
  deckId: number;
}

export default function DeckCards({ cards, deckId }: DeckCardsProps) {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [deletingCard, setDeletingCard] = useState<CardData | null>(null);

  const toggleCard = (cardId: number) => {
    const isCurrentlyExpanded = expandedCards.has(cardId);
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyExpanded) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
    if (isCurrentlyExpanded) {
      setRevealedAnswers(prev => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }
  };

  const toggleAnswerReveal = (cardId: number) => {
    setRevealedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCards(new Set(cards.map(card => card.id)));
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
    setRevealedAnswers(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
        <Badge variant="outline">
          {cards.length} {cards.length === 1 ? 'card' : 'cards'}
        </Badge>
      </div>

      <div className="space-y-3">
        {cards.map((card, index) => {
          const isExpanded = expandedCards.has(card.id);
          const cardTitle = card.title?.trim() ? card.title.trim() : `Card ${index + 1}`;

          return (
            <Card key={card.id} className="transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Badge variant="secondary" className="shrink-0">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-medium">
                        {cardTitle}
                      </CardTitle>
                      <div
                        className="mt-2 cursor-pointer"
                        onClick={() => toggleCard(card.id)}
                      >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          Click to {isExpanded ? 'collapse' : 'expand'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Edit card"
                      onClick={() => setEditingCard(card)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Delete card"
                      onClick={() => setDeletingCard(card)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Front (Question)
                        </span>
                      </div>
                      <div className="flex min-h-20 items-center justify-center bg-muted/50 rounded-lg p-4">
                        <div className="text-sm text-center whitespace-pre-wrap">
                          {card.front}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Back (Answer)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        aria-pressed={revealedAnswers.has(card.id)}
                        aria-label={
                          revealedAnswers.has(card.id)
                            ? 'Hide answer'
                            : 'Reveal answer'
                        }
                        onClick={() => toggleAnswerReveal(card.id)}
                        className="flex h-auto min-h-20 w-full items-center justify-center whitespace-normal bg-muted/50 rounded-lg p-4 hover:bg-muted"
                      >
                        <span className="relative flex w-full items-center justify-center">
                          <span
                            aria-hidden={!revealedAnswers.has(card.id)}
                            className={`block text-sm text-center whitespace-pre-wrap transition-[filter] duration-200 ${
                              revealedAnswers.has(card.id)
                                ? 'blur-none select-text'
                                : 'blur-xl select-none pointer-events-none'
                            }`}
                          >
                            {card.back}
                          </span>
                          {!revealedAnswers.has(card.id) && (
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                              Click to reveal answer
                            </span>
                          )}
                        </span>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Created: {new Date(card.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        Updated: {new Date(card.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <EditCardDialog
        cardId={editingCard?.id ?? 0}
        deckId={deckId}
        title={editingCard?.title ?? null}
        front={editingCard?.front ?? ''}
        back={editingCard?.back ?? ''}
        open={editingCard !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCard(null);
          }
        }}
      />

      <DeleteCardDialog
        cardId={deletingCard?.id ?? 0}
        deckId={deckId}
        cardLabel={
          deletingCard?.title?.trim()
            || deletingCard?.front?.trim()
            || 'this card'
        }
        open={deletingCard !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCard(null);
          }
        }}
      />
    </div>
  );
}
