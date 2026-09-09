'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createCard } from '@/actions/card-actions';

interface CreateCardDialogProps {
  deckId: number;
  children: React.ReactNode;
}

export function CreateCardDialog({ deckId, children }: CreateCardDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    front: '',
    back: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.front.trim() || !formData.back.trim()) {
      setMessage({ type: 'error', text: 'Front and back text are required' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await createCard(String(deckId), {
        title: formData.title.trim() || null,
        front: formData.front.trim(),
        back: formData.back.trim(),
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Card created successfully!' });
        setFormData({ title: '', front: '', back: '' });
        router.refresh();
        setTimeout(() => {
          setOpen(false);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to create card',
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMessage(null);
      setFormData({ title: '', front: '', back: '' });
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>
            Create a flashcard with a question on the front and an answer on the back.
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
            <label htmlFor="create-card-title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Title (Optional)
            </label>
            <Input
              id="create-card-title"
              placeholder="Leave blank to use Card1, Card2, ..."
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="front" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Front (Question)
            </label>
            <Textarea
              id="front"
              placeholder="Enter the question or prompt..."
              rows={3}
              value={formData.front}
              onChange={(e) => setFormData((prev) => ({ ...prev, front: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="back" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Back (Answer)
            </label>
            <Textarea
              id="back"
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
              onClick={() => handleOpenChange(false)}
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
              {isLoading ? 'Adding...' : 'Add Card'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
