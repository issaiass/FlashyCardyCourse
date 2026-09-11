'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { generateCardsWithAI } from '@/actions/card-actions';
import { EditDeckDialog } from '@/components/EditDeckDialog';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GenerateCardsWithAIControlsProps {
  deckId?: number;
  title?: string;
  description?: string | null;
  size?: 'default' | 'sm';
  entitled: boolean;
}

function DisabledGenerateButton({
  size = 'sm',
  reason,
  label = 'Generate cards with AI',
}: {
  size?: 'default' | 'sm';
  reason: string;
  label?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button size={size} variant="outline" disabled>
            <Sparkles className="h-4 w-4 mr-2" />
            {label}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{reason}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function UpgradeGenerateButton({ size = 'sm' }: { size?: 'default' | 'sm' }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size={size} variant="outline" asChild>
          <Link href="/pricing">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate cards with AI
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a paid feature. Upgrade to generate flashcards with AI.</p>
      </TooltipContent>
    </Tooltip>
  );
}

function MissingDescriptionButton({
  deckId,
  title,
  description,
  size = 'sm',
}: {
  deckId: number;
  title: string;
  description: string | null;
  size?: 'default' | 'sm';
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <EditDeckDialog
            deckId={deckId}
            title={title}
            description={description}
            requireDescription
          >
            <Button size={size} variant="outline" type="button">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate cards with AI
            </Button>
          </EditDeckDialog>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add a description to this deck first to generate cards with AI.</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ReadyGenerateButton({
  deckId,
  size = 'sm',
}: {
  deckId: number;
  size?: 'default' | 'sm';
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setTooltipOpen(false);

    try {
      const result = await generateCardsWithAI({ deckId: String(deckId) });

      if (result.success) {
        router.refresh();
        return;
      }

      setError(result.error || 'Failed to generate cards');
      setTooltipOpen(true);
    } catch {
      setError('Something went wrong. Please try again.');
      setTooltipOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DisabledGenerateButton
        size={size}
        label="Generating..."
        reason="Generating flashcards. This may take a moment."
      />
    );
  }

  return (
    <Tooltip open={error ? tooltipOpen : undefined} onOpenChange={setTooltipOpen}>
      <TooltipTrigger asChild>
        <Button size={size} variant="outline" type="button" onClick={handleGenerate}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate cards with AI
        </Button>
      </TooltipTrigger>
      {error ? (
        <TooltipContent>
          <p>{error}</p>
        </TooltipContent>
      ) : null}
    </Tooltip>
  );
}

export function GenerateCardsWithAIControls({
  deckId,
  title,
  description,
  size = 'sm',
  entitled,
}: GenerateCardsWithAIControlsProps) {
  return (
    <TooltipProvider>
      {!entitled ? (
        <UpgradeGenerateButton size={size} />
      ) : deckId == null || title == null ? null : title.trim() && description?.trim() ? (
        <ReadyGenerateButton deckId={deckId} size={size} />
      ) : (
        <MissingDescriptionButton
          deckId={deckId}
          title={title}
          description={description ?? null}
          size={size}
        />
      )}
    </TooltipProvider>
  );
}
