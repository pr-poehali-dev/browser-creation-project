
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, RotateCw, Home } from 'lucide-react';

interface AddressBarProps {
  url: string;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

const AddressBar: React.FC<AddressBarProps> = ({ 
  url,
  onNavigate, 
  onBack, 
  onForward, 
  onRefresh,
  onHome,
  canGoBack,
  canGoForward 
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
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    onNavigate(processedUrl);
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 border-b">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBack} 
        disabled={!canGoBack}
        className="h-7 w-7"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onForward} 
        disabled={!canGoForward}
        className="h-7 w-7"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onRefresh}
        className="h-7 w-7"
      >
        <RotateCw className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onHome}
        className="h-7 w-7"
      >
        <Home className="h-4 w-4" />
      </Button>
      
      <form onSubmit={handleSubmit} className="flex-1">
        <Input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Введите URL"
          className="h-7"
        />
      </form>
    </div>
  );
};

export default AddressBar;
