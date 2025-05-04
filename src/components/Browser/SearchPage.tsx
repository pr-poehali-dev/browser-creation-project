
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink } from 'lucide-react';

interface SearchResult {
  title: string;
  url: string;
  description: string;
}

interface SearchPageProps {
  query: string;
  onNavigate: (url: string) => void;
  onUpdateTitle: (title: string) => void;
  theme?: 'light' | 'dark' | 'colored';
}

const SearchPage: React.FC<SearchPageProps> = ({ 
  query, 
  onNavigate, 
  onUpdateTitle,
  theme = 'light'
}) => {
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Обновляем заголовок
    onUpdateTitle(`Поиск: ${query}`);
    
    // Если есть запрос, выполняем поиск
    if (query) {
      setLoading(true);
      
      // Имитация задержки запроса
      setTimeout(() => {
        performSearch(query);
        setLoading(false);
      }, 800);
    }
  }, [query, onUpdateTitle]);
  
  // Выполнение поиска
  const performSearch = (searchTerm: string) => {
    // Симуляция поиска - в реальном проекте здесь будет API запрос
    const dummyResults: SearchResult[] = [
      {
        title: `Результаты поиска для "${searchTerm}" - Wikipedia`,
        url: `https://ru.wikipedia.org/wiki/${encodeURIComponent(searchTerm)}`,
        description: `Здесь вы найдете информацию о ${searchTerm} и связанных темах. Wikipedia - свободная энциклопедия.`
      },
      {
        title: `${searchTerm} - Новости и актуальная информация`,
        url: `https://news.google.com/search?q=${encodeURIComponent(searchTerm)}`,
        description: `Последние новости, статьи и публикации по теме "${searchTerm}". Актуальная информация из надежных источников.`
      },
      {
        title: `${searchTerm} - Официальный сайт`,
        url: `https://${searchTerm.toLowerCase().replace(/\s+/g, '')}.org`,
        description: `Официальный сайт ${searchTerm}. Узнайте больше о продукте, услуге или компании.`
      },
      {
        title: `${searchTerm} в социальных сетях`,
        url: `https://twitter.com/search?q=${encodeURIComponent(searchTerm)}`,
        description: `Просмотрите обсуждения и публикации о "${searchTerm}" в социальных сетях.`
      },
      {
        title: `Изображения по запросу "${searchTerm}"`,
        url: `https://images.google.com/search?q=${encodeURIComponent(searchTerm)}`,
        description: `Галерея изображений, связанных с "${searchTerm}". Тысячи качественных фотографий.`
      }
    ];
    
    setResults(dummyResults);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Обновляем URL для поиска
    onNavigate(`search://?q=${encodeURIComponent(searchQuery)}`);
  };
  
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'colored':
        return 'bg-indigo-50 text-indigo-900';
      default:
        return 'bg-white text-gray-900';
    }
  };
  
  const getResultCardClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 hover:bg-gray-700';
      case 'colored':
        return 'bg-indigo-100 hover:bg-indigo-200';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };
  
  return (
    <div className={`p-4 min-h-full ${getThemeClasses()}`}>
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="mb-6 relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск в интернете"
            className="pr-12"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          >
            <Search className="h-5 w-5" />
          </Button>
        </form>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <img 
              src="https://icons8.com/preloaders/preloaders/319/Поиск.gif" 
              alt="Поиск" 
              className="w-16 h-16"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {results.length > 0 ? (
              results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg shadow ${getResultCardClasses()} cursor-pointer transition-colors duration-200`}
                  onClick={() => onNavigate(result.url)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <ExternalLink className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-blue-600 hover:underline">
                        {result.title}
                      </h3>
                      <div className="text-sm text-green-700 mb-1 truncate">
                        {result.url}
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {result.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              query ? (
                <div className="text-center py-12">
                  <p>По запросу "{query}" ничего не найдено</p>
                  <p className="text-sm text-gray-500 mt-2">Попробуйте изменить запрос или проверить правильность написания</p>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
