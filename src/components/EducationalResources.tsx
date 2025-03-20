import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Book, Heart, Lightbulb, Settings, Sparkles } from 'lucide-react';

interface EducationalContent {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'tutorial' | 'article' | 'guide';
  category: 'getting_started' | 'journaling_techniques' | 'mental_health' | 'app_features' | 'wellness_tips';
  author: string;
  image_url?: string;
  video_url?: string;
  metadata: any;
}

const categoryIcons = {
  getting_started: Sparkles,
  journaling_techniques: Book,
  mental_health: Heart,
  app_features: Settings,
  wellness_tips: Lightbulb,
};

export function EducationalResources() {
  const [content, setContent] = useState<Record<string, EducationalContent[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const categories = [
        'getting_started',
        'journaling_techniques',
        'mental_health',
        'app_features',
        'wellness_tips',
      ];

      const contentPromises = categories.map(async (category) => {
        const { data, error } = await supabase
          .rpc('get_educational_content_by_category', {
            p_category: category,
          });

        if (error) throw error;
        return { category, data };
      });

      const results = await Promise.all(contentPromises);
      const contentMap = results.reduce((acc, { category, data }) => {
        acc[category] = data || [];
        return acc;
      }, {} as Record<string, EducationalContent[]>);

      setContent(contentMap);
    } catch (error) {
      console.error('Error loading educational content:', error);
      toast({
        title: t('resources.error'),
        description: t('resources.error_description'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('resources.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('resources.description')}
          </p>
        </div>

        <Tabs defaultValue="getting_started" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            {Object.entries(categoryIcons).map(([category, Icon]) => (
              <TabsTrigger
                key={category}
                value={category}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {t(`resources.categories.${category}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(content).map(([category, items]) => (
            <TabsContent key={category} value={category}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Card key={item.id} className="p-4">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {item.author}
                      </span>
                      <Button variant="outline" size="sm">
                        {t('resources.read_more')}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Card>
  );
} 