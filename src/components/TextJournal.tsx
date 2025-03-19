
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TextJournalProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const TextJournal: React.FC<TextJournalProps> = ({
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (value.trim() && !isSubmitting) {
        onSubmit();
      }
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full min-h-[200px] p-4 rounded-md border",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          "resize-none bg-background"
        )}
        placeholder="What's on your mind today?"
        disabled={isSubmitting}
      />
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {value.trim().length > 0 ? (
            <span>{value.trim().length} characters</span>
          ) : (
            <span>Press Ctrl+Enter to save</span>
          )}
        </div>
        <Button
          onClick={onSubmit}
          disabled={!value.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
              Saving...
            </>
          ) : (
            "Save Entry"
          )}
        </Button>
      </div>
    </div>
  );
};

export default TextJournal;
