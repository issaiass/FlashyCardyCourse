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
import { updateDeck } from '@/actions/deck-actions';

interface EditDeckDialogProps {
  deckId: number;
  title: string;
  description: string | null;
  requireDescription?: boolean;
  children: React.ReactNode;
}

export function EditDeckDialog({
  deckId,
  title,
  description,
  requireDescription = false,
  children,
}: EditDeckDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    title,
    description: description ?? '',
  });

  const resetForm = () => {
    setFormData({
      title,
      description: description ?? '',
    });
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }

    if (requireDescription && !formData.description.trim()) {
      setMessage({ type: 'error', text: 'Add a description before generating cards with AI.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await updateDeck(String(deckId), {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Deck updated successfully!' });
        router.refresh();
        setTimeout(() => {
          setOpen(false);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to update deck',
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
      resetForm();
    } else {
      setFormData({
        title,
        description: description ?? '',
      });
      setMessage(null);
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
          <DialogTitle>Edit Deck</DialogTitle>
          <DialogDescription>
            {requireDescription
              ? 'Add a description first so AI can generate flashcards for this deck.'
              : "Update this deck's title and description."}
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
            <label htmlFor="edit-deck-title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Title
            </label>
            <Input
              id="edit-deck-title"
              placeholder="Enter deck title..."
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-deck-description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {requireDescription ? 'Description' : 'Description (Optional)'}
            </label>
            <Textarea
              id="edit-deck-description"
              placeholder="Enter a description for your deck..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required={requireDescription}
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
