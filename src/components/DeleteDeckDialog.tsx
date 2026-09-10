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
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteDeck } from '@/actions/deck-actions';

interface DeleteDeckDialogProps {
  deckId: number;
  deckTitle: string;
  cardCount: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  redirectTo?: string;
  children?: React.ReactNode;
}

export function DeleteDeckDialog({
  deckId,
  deckTitle,
  cardCount,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  redirectTo,
  children,
}: DeleteDeckDialogProps) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const onOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    controlledOnOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (open) {
      setMessage(null);
      setIsLoading(false);
    }
  }, [open, deckId]);

  const handleDelete = async () => {
    if (!deckId) {
      setMessage({ type: 'error', text: 'Resource not found' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await deleteDeck({
        deckId: String(deckId),
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Deck deleted successfully!' });
        onOpenChange(false);
        setMessage(null);
        if (redirectTo) {
          router.push(redirectTo);
        }
        router.refresh();
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to delete deck',
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

  const cardLabel = cardCount === 1 ? '1 card' : `${cardCount} cards`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Deck</DialogTitle>
          <DialogDescription>
            This will permanently delete &quot;{deckTitle}&quot; and {cardLabel}. This action cannot be undone.
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
            {isLoading ? 'Deleting...' : 'Delete Deck'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
