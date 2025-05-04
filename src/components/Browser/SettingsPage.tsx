
import React, { useEffect, useState } from 'react';
import { BrowserSettings } from './BrowserFrame';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SettingsPageProps {
  settings: BrowserSettings;
  onUpdateSettings: (settings: Partial<BrowserSettings>) => void;
  history: {url: string, title: string, date: Date}[];
  onUpdateTitle: (title: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  settings, 
  onUpdateSettings,
  history,
  onUpdateTitle
}) => {
  const [backgroundUrl, setBackgroundUrl] = useState(settings.background);
  
  // Обновляем заголовок
  useEffect(() => {
    onUpdateTitle('Настройки');
  }, [onUpdateTitle]);
  
  const handleBackgroundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ background: backgroundUrl });
  };
  
  const handleThemeChange = (value: string) => {
    onUpdateSettings({ theme: value as 'light' | 'dark' | 'colored' });
  };
  
  const handleClockToggle = (checked: boolean) => {
    onUpdateSettings({ showClock: checked });
  };
  
  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'colored':
        return 'bg-indigo-50 text-indigo-900';
      default:
        return 'bg-white text-gray-900';
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };
  
  return (
    <div className={`p-6 min-h-full ${getThemeClasses()}`}>
      <h1 className="text-2xl font-bold mb-6">Настройки браузера</h1>
      
      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="p-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Фон домашней страницы</h2>
              <form onSubmit={handleBackgroundSubmit} className="flex flex-col space-y-2">
                <Label htmlFor="bg-url">URL изображения фона</Label>
                <div className="flex">
                  <Input 
                    id="bg-url"
                    value={backgroundUrl} 
                    onChange={(e) => setBackgroundUrl(e.target.value)}
                    placeholder="URL изображения"
                    className="rounded-r-none"
                  />
                  <Button type="submit" className="rounded-l-none">
                    Сохранить
                  </Button>
                </div>
              </form>
              
              {backgroundUrl && (
                <div className="mt-4">
                  <Label>Предпросмотр</Label>
                  <div className="h-40 w-full mt-2 rounded-md overflow-hidden">
                    <img 
                      src={backgroundUrl} 
                      alt="Background preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Тема</h2>
              <RadioGroup 
                defaultValue={settings.theme} 
                onValueChange={handleThemeChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light">Светлая</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark">Тёмная</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="colored" id="theme-colored" />
                  <Label htmlFor="theme-colored">Цветная</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Часы</h2>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-clock" 
                  checked={settings.showClock}
                  onCheckedChange={handleClockToggle}
                />
                <Label htmlFor="show-clock">Показывать часы на домашней странице</Label>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="p-4">
          <h2 className="text-xl font-semibold mb-4">История посещений</h2>
          
          {history.length === 0 ? (
            <p className="text-gray-500">История пуста</p>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-md ${
                    settings.theme === 'dark' ? 'bg-gray-800' : 
                    settings.theme === 'colored' ? 'bg-indigo-100' : 
                    'bg-gray-100'
                  }`}
                >
                  <div className="font-medium truncate">{item.title || 'Без заголовка'}</div>
                  <div className="text-sm truncate text-blue-500">{item.url}</div>
                  <div className="text-xs text-gray-500">{formatDate(item.date)}</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
