
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoodType } from '@/types/journal';
import MoodPicker from './MoodPicker';

interface TextJournalProps {
  onSaveEntry?: (content: string, mood: MoodType | null) => void;
  isLoading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => Promise<void>;
  isSubmitting?: boolean;
  formatting?: {
    bold: boolean;
    italic: boolean;
    list: boolean;
  };
  onFormattingChange?: (formatting: { bold: boolean; italic: boolean; list: boolean }) => void;
}

const TextJournal: React.FC<TextJournalProps> = ({ 
  onSaveEntry, 
  isLoading = false,
  value, 
  onChange,
  onSubmit,
  isSubmitting,
  formatting = { bold: false, italic: false, list: false },
  onFormattingChange,
}) => {
  const [content, setContent] = useState(value || '');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAutoResizing, setIsAutoResizing] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setContent(value);
    }
  }, [value]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      };

      textarea.addEventListener('input', resize);
      resize(); // Initial resize

      return () => textarea.removeEventListener('input', resize);
    }
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  const handleFormatting = (type: 'bold' | 'italic' | 'list') => {
    if (!onFormattingChange) return;

    const newFormatting = { ...formatting, [type]: !formatting[type] };
    onFormattingChange(newFormatting);

    // Apply formatting to selected text
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = content;

    switch (type) {
      case 'bold':
        newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
        break;
      case 'italic':
        newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
        break;
      case 'list':
        const lines = selectedText.split('\n');
        newText = content.substring(0, start) + 
          lines.map(line => line.trim() ? `- ${line}` : line).join('\n') + 
          content.substring(end);
        break;
    }

    setContent(newText);
    if (onChange) {
      onChange(newText);
    }

    // Restore selection
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(start, end);
      }
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Empty Journal Entry",
        description: "Please write something before saving.",
        variant: "destructive",
      });
      return;
    }
    
    if (onSubmit) {
      onSubmit();
    } else if (onSaveEntry) {
      onSaveEntry(content, selectedMood);
      setContent('');
      setSelectedMood(null);
    } else {
      console.error("Either onSubmit or onSaveEntry prop must be provided");
    }
  };

  const isInLoadingState = isLoading || isSubmitting;

  const handleMoodSelect = (mood: MoodType | null) => {
    setSelectedMood(mood);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Write in your journal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-1 border-b pb-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${formatting.bold ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => handleFormatting('bold')}
            >
              <strong>B</strong>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${formatting.italic ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => handleFormatting('italic')}
            >
              <em>I</em>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${formatting.list ? 'bg-primary/10 text-primary' : ''}`}
              onClick={() => handleFormatting('list')}
            >
              ••
            </Button>
          </div>
          
          <Textarea 
            ref={textareaRef}
            placeholder="How are you feeling today? What's on your mind?"
            className="min-h-[200px] resize-none focus-visible:ring-1"
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            disabled={isInLoadingState}
          />
          
          <div>
            <h3 className="text-sm font-medium mb-2">How are you feeling?</h3>
            <MoodPicker selected={selectedMood} onSelect={handleMoodSelect} />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isInLoadingState}
          >
            {isInLoadingState ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Entry'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TextJournal;
