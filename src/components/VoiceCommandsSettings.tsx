import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useVoiceCommands } from '@/services/VoiceCommandsService';
import { useLanguage } from '@/contexts/LanguageContext';

export function VoiceCommandsSettings() {
  const { isEnabled, toggleVoiceCommands, getCommands } = useVoiceCommands();
  const { t } = useLanguage();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('voice_commands.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('voice_commands.description')}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">
              {t('voice_commands.enable')}
            </label>
            <p className="text-sm text-muted-foreground">
              {t('voice_commands.enable_description')}
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={toggleVoiceCommands}
          />
        </div>

        {isEnabled && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              {t('voice_commands.available_commands')}
            </h4>
            <div className="space-y-2">
              {getCommands().map((command) => (
                <div
                  key={command.command}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{command.command}</p>
                    <p className="text-xs text-muted-foreground">
                      {command.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 