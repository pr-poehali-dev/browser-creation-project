
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink } from 'lucide-react';
import { BrowserSettings } from './BrowserFrame';
import type { Bookmark } from './BrowserFrame';

interface HomePageProps {
  settings: BrowserSettings;
  onNavigate: (url: string) => void;
  onSearch: (query: string) => void;
  bookmarks: Bookmark[];
  onUpdateTitle: (title: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  settings, 
  onNavigate, 
  onSearch,
  bookmarks,
  onUpdateTitle 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [time, setTime] = useState(new Date());
  
  // Обновляем заголовок
  useEffect(() => {
    onUpdateTitle('Домашняя страница');
  }, [onUpdateTitle]);
  
  // Обновляем время
  useEffect(() => {
    if (settings.showClock) {
      const interval = setInterval(() => {
        setTime(new Date());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [settings.showClock]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };
  
  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get('url') as string;
    
    if (url) {
      let processedUrl = url.trim();
      if (!/^https?:\/\//i.test(processedUrl)) {
        processedUrl = 'https://' + processedUrl;
      }
      onNavigate(processedUrl);
    }
  };
  
  // Форматирование времени
  const formatTime = () => {
    return time.toLocaleTimeString();
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

  // Получаем часто посещаемые закладки (до 8)
  const topBookmarks = bookmarks.slice(0, 8);
  
  return (
    <div 
      className={`flex flex-col items-center justify-center min-h-full ${getThemeClasses()}`}
      style={{
        backgroundImage: `url(${settings.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-3xl p-8 backdrop-blur-sm bg-white/30 rounded-lg shadow-lg">
        {settings.showClock && (
          <div className="mb-8 text-center">
            <div className="text-5xl font-bold text-white shadow-text">
              {formatTime()}
            </div>
          </div>
        )}
        
        <div className="mb-6 w-full">
          <form onSubmit={handleUrlSubmit} className="flex">
            <Input 
              name="url"
              type="text" 
              placeholder="Введите ссылку" 
              className="rounded-r-none bg-white/80"
            />
            <Button type="submit" className="rounded-l-none">
              Перейти
            </Button>
          </form>
        </div>
        
        <div className="w-full mb-8">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск в интернете"
              className="pr-12 bg-white/80"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>
        
        {/* Закладки */}
        {topBookmarks.length > 0 && (
          <div className="w-full">
            <h3 className="font-medium text-white mb-2 shadow-text">Закладки</h3>
            <div className="grid grid-cols-4 gap-2">
              {topBookmarks.map(bookmark => (
                <div 
                  key={bookmark.id}
                  onClick={() => onNavigate(bookmark.url)}
                  className="flex flex-col items-center p-3 bg-white/70 rounded-md cursor-pointer hover:bg-white/90 transition duration-200"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-medium text-center truncate w-full">
                    {bookmark.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
