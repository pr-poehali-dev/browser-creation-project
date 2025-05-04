
import React, { useRef, useState, useEffect } from 'react';
import AddressBar from './AddressBar';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tab {
  id: string;
  url: string;
  title: string;
  history: string[];
  historyIndex: number;
}

const BrowserFrame: React.FC = () => {
  // Функция для получения случайной домашней страницы
  const getRandomHomePage = () => {
    const homePages = ['https://ya.ru', 'https://ya.com'];
    return homePages[Math.floor(Math.random() * homePages.length)];
  };

  const defaultHomePage = getRandomHomePage();
  
  // Состояние для вкладок
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      url: defaultHomePage,
      title: 'Новая вкладка',
      history: [defaultHomePage],
      historyIndex: 0
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);

  // Получение активной вкладки
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  // Загрузка начальной страницы
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = activeTab.url;
    }
  }, [activeTabId]);

  // Навигация
  const navigateTo = (url: string) => {
    setLoading(true);
    
    // Обновляем историю активной вкладки
    setTabs(prevTabs => 
      prevTabs.map(tab => {
        if (tab.id === activeTabId) {
          const newHistory = tab.history.slice(0, tab.historyIndex + 1);
          newHistory.push(url);
          return {
            ...tab,
            url,
            history: newHistory,
            historyIndex: newHistory.length - 1
          };
        }
        return tab;
      })
    );
  };

  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      setTabs(prevTabs => 
        prevTabs.map(tab => {
          if (tab.id === activeTabId) {
            return {
              ...tab,
              url: tab.history[tab.historyIndex - 1],
              historyIndex: tab.historyIndex - 1
            };
          }
          return tab;
        })
      );
    }
  };

  const goForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      setTabs(prevTabs => 
        prevTabs.map(tab => {
          if (tab.id === activeTabId) {
            return {
              ...tab,
              url: tab.history[tab.historyIndex + 1],
              historyIndex: tab.historyIndex + 1
            };
          }
          return tab;
        })
      );
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = activeTab.url;
    }
  };

  const goHome = () => {
    const homePage = getRandomHomePage();
    navigateTo(homePage);
  };

  // Управление вкладками
  const addNewTab = () => {
    const homePage = getRandomHomePage();
    const newTabId = Date.now().toString();
    
    setTabs(prevTabs => [
      ...prevTabs, 
      {
        id: newTabId,
        url: homePage,
        title: 'Новая вкладка',
        history: [homePage],
        historyIndex: 0
      }
    ]);
    
    setActiveTabId(newTabId);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (tabs.length === 1) {
      // Если это последняя вкладка, создаем новую
      const homePage = getRandomHomePage();
      setTabs([{
        id: Date.now().toString(),
        url: homePage,
        title: 'Новая вкладка',
        history: [homePage],
        historyIndex: 0
      }]);
    } else {
      setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
      
      // Если закрыли активную вкладку, активируем предыдущую
      if (tabId === activeTabId) {
        const tabIndex = tabs.findIndex(tab => tab.id === tabId);
        const newActiveTabId = tabs[tabIndex === 0 ? 1 : tabIndex - 1].id;
        setActiveTabId(newActiveTabId);
      }
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    // Обновляем заголовок вкладки
    if (iframeRef.current && iframeRef.current.contentDocument) {
      setTabs(prevTabs => 
        prevTabs.map(tab => {
          if (tab.id === activeTabId) {
            return {
              ...tab,
              title: iframeRef.current?.contentDocument?.title || 'Новая вкладка'
            };
          }
          return tab;
        })
      );
    }
  };

  // Проверяем, является ли текущий URL домашней страницей
  const isHomePage = (url: string) => {
    return url === 'https://ya.ru' || url === 'https://ya.com';
  };

  return (
    <div className="flex flex-col h-screen border-x shadow-md overflow-hidden">
      {/* Вкладки */}
      <div className="flex items-center bg-gray-200 border-b">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`flex items-center max-w-[200px] px-3 py-1.5 mr-1 rounded-t-md cursor-pointer ${
              activeTabId === tab.id ? 'bg-white' : 'bg-gray-100 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <div className="truncate text-sm">{tab.title}</div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 ml-2"
              onClick={(e) => closeTab(tab.id, e)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 ml-1"
          onClick={addNewTab}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Адресная строка */}
      <AddressBar
        url={isHomePage(activeTab.url) ? '' : activeTab.url}
        onNavigate={navigateTo}
        onBack={goBack}
        onForward={goForward}
        onRefresh={refresh}
        onHome={goHome}
        canGoBack={activeTab.historyIndex > 0}
        canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
      />
      
      {/* Окно браузера */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="w-8 h-8 border-4 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={activeTab.url}
          title="browser-frame"
          className="w-full h-full border-none"
          onLoad={handleIframeLoad}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};

export default BrowserFrame;
