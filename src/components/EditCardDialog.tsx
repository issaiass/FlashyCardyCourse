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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateCard } from '@/actions/card-actions';

interface EditCardDialogProps {
  cardId: number;
  deckId: number;
  title: string | null;
  front: string;
  back: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCardDialog({
  cardId,
  deckId,
  title,
  front,
  back,
  open,
  onOpenChange,
}: EditCardDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: title ?? '',
    front,
    back,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: title ?? '',
        front,
        back,
      });
      setMessage(null);
      setIsLoading(false);
    }
  }, [open, title, front, back, cardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardId) {
      setMessage({ type: 'error', text: 'Resource not found' });
      return;
    }

    if (!formData.front.trim() || !formData.back.trim()) {
      setMessage({ type: 'error', text: 'Question and answer are required' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await updateCard(String(cardId), String(deckId), {
        title: formData.title.trim() || null,
        front: formData.front.trim(),
        back: formData.back.trim(),
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Card updated successfully!' });
        router.refresh();
        setTimeout(() => {
          onOpenChange(false);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to update card',
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
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update this card&apos;s title, question, and answer.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-card-title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Title (Optional)
            </label>
            <Input
              id="edit-card-title"
              placeholder="Enter a short title..."
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-card-front" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Question
            </label>
            <Textarea
              id="edit-card-front"
              placeholder="Enter the question or prompt..."
              rows={3}
              value={formData.front}
              onChange={(e) => setFormData((prev) => ({ ...prev, front: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-card-back" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Answer
            </label>
            <Textarea
              id="edit-card-back"
              placeholder="Enter the answer..."
              rows={3}
              value={formData.back}
              onChange={(e) => setFormData((prev) => ({ ...prev, back: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
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
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
