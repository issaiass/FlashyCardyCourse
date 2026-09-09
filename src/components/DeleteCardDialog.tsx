'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteCard } from '@/actions/card-actions';

interface DeleteCardDialogProps {
  cardId: number;
  deckId: number;
  cardLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCardDialog({
  cardId,
  deckId,
  cardLabel,
  open,
  onOpenChange,
}: DeleteCardDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setMessage(null);
      setIsLoading(false);
    }
  }, [open, cardId]);

  const handleDelete = async () => {
    if (!cardId) {
      setMessage({ type: 'error', text: 'Resource not found' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await deleteCard({
        cardId: String(cardId),
        deckId: String(deckId),
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Card deleted successfully!' });
        router.refresh();
        setTimeout(() => {
          onOpenChange(false);
          setMessage(null);
        }, 1000);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to delete card',
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Card</DialogTitle>
          <DialogDescription>
            This will permanently delete &quot;{cardLabel}&quot;. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

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
            onClick={() => onOpenChange(false)}
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
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Card'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
