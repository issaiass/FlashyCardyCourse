'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface CardData {
  id: number;
  deckId: number;
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

  const toggleCard = (cardId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedCards(new Set(cards.map(card => card.id)));
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
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

      {/* Cards List */}
      <div className="space-y-3">
        {cards.map((card, index) => {
          const isExpanded = expandedCards.has(card.id);
          
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
                        Card {index + 1}
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
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/decks/${deckId}/cards/${card.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Front Side */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Front (Question)
                        </span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 min-h-20">
                        <div className="text-sm whitespace-pre-wrap">
                          {card.front}
                        </div>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Back (Answer)
                        </span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 min-h-20">
                        <div className="text-sm whitespace-pre-wrap">
                          {card.back}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Metadata */}
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
    </div>
  );
}