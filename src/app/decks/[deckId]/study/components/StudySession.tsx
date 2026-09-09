'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
} from 'lucide-react';

export interface StudyCard {
  id: number;
  title: string | null;
  front: string;
  back: string;
}

interface StudySessionProps {
  cards: StudyCard[];
}

function shuffleIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = indices[i];
    indices[i] = indices[j];
    indices[j] = current;
  }
  return indices;
}

export function StudySession({ cards }: StudySessionProps) {
  const [order, setOrder] = useState<number[]>(() => cards.map((_, index) => index));
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const total = cards.length;
  const currentCard = cards[order[index]];
  const progressValue = isComplete ? 100 : ((index + 1) / total) * 100;
  const cardLabel = useMemo(() => {
    if (!currentCard) {
      return '';
    }
    return currentCard.title?.trim() || `Card${index + 1}`;
  }, [currentCard, index]);

  const goToPrevious = useCallback(() => {
    setIsComplete(false);
    setIndex((current) => Math.max(0, current - 1));
    setIsFlipped(false);
  }, []);

  const goToNext = useCallback(() => {
    if (index >= total - 1) {
      setIsComplete(true);
      return;
    }
    setIndex((current) => current + 1);
    setIsFlipped(false);
  }, [index, total]);

  const restart = useCallback(() => {
    setOrder(cards.map((_, cardIndex) => cardIndex));
    setIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  }, [cards]);

  const shuffle = useCallback(() => {
    setOrder(shuffleIndices(cards.length));
    setIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  }, [cards.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.code === 'Space' || event.key === 'Enter') {
        event.preventDefault();
        if (!isComplete) {
          setIsFlipped((current) => !current);
        }
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        goToNext();
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        goToPrevious();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToNext, goToPrevious, isComplete]);

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Session complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              You reviewed all {total} {total === 1 ? 'card' : 'cards'} in this deck.
            </p>
            <Progress value={100} className="h-2" />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" onClick={restart}>
                <RotateCcw className="h-4 w-4" />
                Study Again
              </Button>
              <Button variant="outline" className="flex-1" onClick={shuffle}>
                <Shuffle className="h-4 w-4" />
                Shuffle and Restart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">
            Card {index + 1} of {total}
          </Badge>
          <p className="text-sm text-muted-foreground">
            Space to flip · Arrows to navigate
          </p>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={shuffle}>
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg truncate">{cardLabel}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {isFlipped ? 'Answer' : 'Question'}
            </p>
          </div>
          <Badge variant="outline">{isFlipped ? 'Back' : 'Front'}</Badge>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="ghost"
            aria-pressed={isFlipped}
            aria-label={isFlipped ? 'Show question' : 'Show answer'}
            onClick={() => setIsFlipped((current) => !current)}
            className="flex h-auto min-h-64 w-full items-center justify-center whitespace-normal rounded-lg bg-muted/50 p-6 hover:bg-muted"
          >
            <span className="text-xl text-center whitespace-pre-wrap">
              {isFlipped ? currentCard.back : currentCard.front}
            </span>
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={goToPrevious}
          disabled={index === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setIsFlipped((current) => !current)}
        >
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </Button>
        <Button type="button" className="flex-1" onClick={goToNext}>
          {index >= total - 1 ? 'Finish' : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
