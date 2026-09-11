'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteCards } from '@/actions/card-actions';

interface DeleteCardsDialogCard {
  id: number;
  title: string | null;
  front: string;
}

interface DeleteCardsDialogProps {
  deckId: number;
  cards: DeleteCardsDialogCard[];
  children?: React.ReactNode;
}

export function DeleteCardsDialog({
  deckId,
  cards,
  children,
}: DeleteCardsDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setMessage(null);
      setIsLoading(false);
    }
  }, [open]);

  const allSelected = cards.length > 0 && selectedIds.size === cards.length;
  const selectedCount = selectedIds.size;

  const toggleCard = (cardId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(cardId);
      } else {
        next.delete(cardId);
      }
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(cards.map((card) => card.id)));
      return;
    }
    setSelectedIds(new Set());
  };

  const handleDelete = async () => {
    if (selectedCount === 0) {
      setMessage({ type: 'error', text: 'Select at least one card' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await deleteCards({
        deckId: String(deckId),
        cardIds: Array.from(selectedIds).map(String),
      });

      if (result.success) {
        const count = result.deletedCount;
        setMessage({
          type: 'success',
          text: count === 1 ? 'Card deleted successfully!' : `${count} cards deleted successfully!`,
        });
        router.refresh();
        setTimeout(() => {
          setOpen(false);
          setMessage(null);
        }, 1000);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to delete cards',
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Delete Cards</DialogTitle>
          <DialogDescription>
            Select specific cards or all cards to delete. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 rounded-md border p-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected ? true : selectedCount > 0 ? 'indeterminate' : false}
              onCheckedChange={(checked) => toggleAll(checked === true)}
              aria-label="Select all cards"
              disabled={isLoading}
            />
            <span className="text-sm font-medium">Select all</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {selectedCount} of {cards.length} selected
          </span>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {cards.map((card, index) => {
            const label = card.title?.trim() || card.front.trim() || `Card ${index + 1}`;
            const isSelected = selectedIds.has(card.id);

            return (
              <div
                key={card.id}
                className="flex items-start gap-3 rounded-md border p-3"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => toggleCard(card.id, checked === true)}
                  aria-label={`Select ${label}`}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto min-w-0 flex-1 justify-start whitespace-normal p-0 text-left hover:bg-transparent"
                  onClick={() => toggleCard(card.id, !isSelected)}
                  disabled={isLoading}
                >
                  <span className="block min-w-0">
                    <span className="block text-sm font-medium">{label}</span>
                    {card.title?.trim() && (
                      <span className="mt-1 block text-xs text-muted-foreground line-clamp-2">
                        {card.front}
                      </span>
                    )}
                  </span>
                </Button>
              </div>
            );
          })}
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm border ${
            message.type === 'success'
              ? 'bg-muted text-foreground border-border'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="flex-1"
            disabled={isLoading || selectedCount === 0}
          >
            {isLoading
              ? 'Deleting...'
              : selectedCount === 0
                ? 'Delete Cards'
                : selectedCount === 1
                  ? 'Delete 1 Card'
                  : `Delete ${selectedCount} Cards`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
