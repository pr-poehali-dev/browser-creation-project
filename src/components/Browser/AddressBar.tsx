
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, RotateCw, Home, Settings, Star, StarOff } from 'lucide-react';

interface AddressBarProps {
  url: string;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  theme?: 'light' | 'dark' | 'colored';
}

const AddressBar: React.FC<AddressBarProps> = ({ 
  url,
  onNavigate, 
  onBack, 
  onForward, 
  onRefresh,
  onHome,
  onOpenSettings,
  onToggleBookmark,
  isBookmarked = false,
  canGoBack,
  canGoForward,
  theme = 'light'
}) => {
  const [inputUrl, setInputUrl] = useState('');
  
  // Обновляем значение ввода при изменении url
  useEffect(() => {
    setInputUrl(url);
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let processedUrl = inputUrl.trim();
    
    // Если поле пустое, не выполняем навигацию
    if (!processedUrl) return;
    
    // Проверяем наличие протокола, если нет - добавляем https://
    if (!/^(https?:\/\/|home:\/\/|settings:\/\/|search:\/\/)/i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    onNavigate(processedUrl);
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-white border-gray-700';
      case 'colored':
        return 'bg-indigo-200 text-indigo-900 border-indigo-300';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getButtonThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'hover:bg-gray-700 text-gray-300';
      case 'colored':
        return 'hover:bg-indigo-300 text-indigo-800';
      default:
        return 'hover:bg-gray-200 text-gray-700';
    }
  };

  const getInputThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400';
      case 'colored':
        return 'bg-indigo-100 border-indigo-200 text-indigo-900 placeholder:text-indigo-500';
      default:
        return 'bg-white border-gray-300';
    }
  };

  return (
    <div className={`flex items-center gap-1 p-1 ${getThemeClasses()} border-b`}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBack} 
        disabled={!canGoBack}
        className={`h-7 w-7 ${getButtonThemeClasses()}`}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onForward} 
        disabled={!canGoForward}
        className={`h-7 w-7 ${getButtonThemeClasses()}`}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onRefresh}
        className={`h-7 w-7 ${getButtonThemeClasses()}`}
      >
        <RotateCw className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onHome}
        className={`h-7 w-7 ${getButtonThemeClasses()}`}
      >
        <Home className="h-4 w-4" />
      </Button>
      
      <form onSubmit={handleSubmit} className="flex-1">
        <Input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Введите URL"
          className={`h-7 ${getInputThemeClasses()}`}
        />
      </form>
      
      {onToggleBookmark && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleBookmark}
          className={`h-7 w-7 ${getButtonThemeClasses()}`}
        >
          {isBookmarked ? (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onOpenSettings}
        className={`h-7 w-7 ${getButtonThemeClasses()}`}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AddressBar;
