import { Show } from '@clerk/nextjs';
import { GenerateCardsWithAIControls } from '@/components/GenerateCardsWithAIControls';

interface GenerateCardsWithAIButtonProps {
  deckId: number;
  title: string;
  description: string | null;
  size?: 'default' | 'sm';
}

export function GenerateCardsWithAIButton({
  deckId,
  title,
  description,
  size = 'sm',
}: GenerateCardsWithAIButtonProps) {
  return (
    <Show
      when={(has) =>
        has({ feature: 'ai_flashcard_generation' }) || has({ plan: 'paid_user' })
      }
      fallback={<GenerateCardsWithAIControls size={size} entitled={false} />}
    >
      <GenerateCardsWithAIControls
        deckId={deckId}
        title={title}
        description={description}
        size={size}
        entitled
      />
    </Show>
  );
}
