
import React, { useRef, useState, useEffect, useCallback } from 'react';
import AddressBar from './AddressBar';
import HomePage from './HomePage';
import SettingsPage from './SettingsPage';
import SearchPage from './SearchPage';
import { 
  X, Plus, Pin, Copy, Volume2, VolumeX, Bookmark, 
  Star, StarOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Tab {
  id: string;
  url: string;
  title: string;
  history: string[];
  historyIndex: number;
  isPinned: boolean;
  isMuted: boolean;
}

export interface BrowserSettings {
  background: string;
  theme: 'light' | 'dark' | 'colored';
  showClock: boolean;
  searchEngine: string;
  incognito: boolean;
  adBlocker: boolean;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  dateAdded: Date;
}

const HOME_PAGE = 'home://';
const SETTINGS_PAGE = 'settings://';
const SEARCH_PAGE = 'search://';

// Префикс для поисковых запросов
export const SEARCH_PREFIX = 'search://?q=';

// Локальное хранилище
const STORAGE_KEYS = {
  SETTINGS: 'browser_settings',
  TABS: 'browser_tabs',
  ACTIVE_TAB: 'browser_active_tab',
  HISTORY: 'browser_history',
  BOOKMARKS: 'browser_bookmarks'
};

const BrowserFrame: React.FC = () => {
  // Закладки
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  // Настройки браузера
  const [settings, setSettings] = useState<BrowserSettings>({
    background: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?q=80&w=2874&auto=format&fit=crop',
    theme: 'light',
    showClock: true,
    searchEngine: 'own',
    incognito: false,
    adBlocker: false
  });
  
  // История посещенных URL
  const [browserHistory, setBrowserHistory] = useState<{url: string, title: string, date: Date}[]>([]);
  
  // Состояние для поиска
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояние для вкладок
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      url: HOME_PAGE,
      title: 'Новая вкладка',
      history: [HOME_PAGE],
      historyIndex: 0,
      isPinned: false,
      isMuted: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);
  
  // Загрузка данных из локального хранилища при первом рендере
  useEffect(() => {
    // Загрузка настроек
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Ошибка при загрузке настроек:', e);
      }
    }
    
    // Загрузка истории
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) {
      try {
        // Преобразуем строки дат обратно в объекты Date
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
        setBrowserHistory(parsedHistory);
      } catch (e) {
        console.error('Ошибка при загрузке истории:', e);
      }
    }
    
    // Загрузка закладок
    const savedBookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (savedBookmarks) {
      try {
        const parsedBookmarks = JSON.parse(savedBookmarks).map((item: any) => ({
          ...item,
          dateAdded: new Date(item.dateAdded)
        }));
        setBookmarks(parsedBookmarks);
      } catch (e) {
        console.error('Ошибка при загрузке закладок:', e);
      }
    }
    
    // Загрузка вкладок
    const savedTabs = localStorage.getItem(STORAGE_KEYS.TABS);
    if (savedTabs) {
      try {
        setTabs(JSON.parse(savedTabs));
      } catch (e) {
        console.error('Ошибка при загрузке вкладок:', e);
      }
    }
    
    // Загрузка активной вкладки
    const savedActiveTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    if (savedActiveTab) {
      setActiveTabId(savedActiveTab);
    }
  }, []);
  
  // Сохранение настроек в локальное хранилище при их изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);
  
  // Сохранение вкладок и активной вкладки
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTabId);
  }, [tabs, activeTabId]);
  
  // Сохранение истории
  useEffect(() => {
    if (!settings.incognito) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(browserHistory));
    }
  }, [browserHistory, settings.incognito]);
  
  // Сохранение закладок
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Получение активной вкладки
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  // Загрузка начальной страницы
  useEffect(() => {
    if (iframeRef.current && !isSpecialPage(activeTab.url)) {
      iframeRef.current.src = activeTab.url;
    }
  }, [activeTabId]);

  // Проверка на специальную страницу
  const isSpecialPage = (url: string) => {
    return url === HOME_PAGE || 
           url === SETTINGS_PAGE || 
           url === SEARCH_PAGE || 
           url.startsWith(SEARCH_PREFIX);
  };

  // Обновление заголовка вкладки
  const updateTabTitle = useCallback((title: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => {
        if (tab.id === activeTabId) {
          return { ...tab, title };
        }
        return tab;
      })
    );
  }, [activeTabId]);

  // Навигация
  const navigateTo = (url: string) => {
    // Если мы уже на этом URL, не перезагружаем
    if (url === activeTab.url) return;
    
    // Если это не внутренняя страница, показываем загрузку
    if (!isSpecialPage(url)) {
      setLoading(true);
    }
    
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
    
    // Добавляем запись в историю браузера (только для реальных URL)
    if (!isSpecialPage(url) && !settings.incognito) {
      const historyEntry = {
        url,
        title: activeTab.title,
        date: new Date()
      };
      setBrowserHistory(prev => [historyEntry, ...prev]);
    }
  };
  
  // Функция для поиска
  const search = (query: string) => {
    setSearchQuery(query);
    navigateTo(`${SEARCH_PREFIX}${encodeURIComponent(query)}`);
  };

  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      const prevUrl = activeTab.history[activeTab.historyIndex - 1];
      
      // Проверяем, нужно ли показывать загрузку
      if (!isSpecialPage(prevUrl)) {
        setLoading(true);
      }
      
      setTabs(prevTabs => 
        prevTabs.map(tab => {
          if (tab.id === activeTabId) {
            return {
              ...tab,
              url: prevUrl,
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
      const nextUrl = activeTab.history[activeTab.historyIndex + 1];
      
      // Проверяем, нужно ли показывать загрузку
      if (!isSpecialPage(nextUrl)) {
        setLoading(true);
      }
      
      setTabs(prevTabs => 
        prevTabs.map(tab => {
          if (tab.id === activeTabId) {
            return {
              ...tab,
              url: nextUrl,
              historyIndex: tab.historyIndex + 1
            };
          }
          return tab;
        })
      );
    }
  };

  const refresh = () => {
    if (isSpecialPage(activeTab.url)) {
      // Для внутренних страниц просто обновляем состояние
      setTabs(prevTabs => [...prevTabs]);
    } else if (iframeRef.current) {
      setLoading(true);
      iframeRef.current.src = activeTab.url;
    }
  };

  const goHome = () => {
    navigateTo(HOME_PAGE);
  };

  // Открыть настройки
  const openSettings = () => {
    navigateTo(SETTINGS_PAGE);
  };

  // Управление вкладками
  const addNewTab = () => {
    const newTabId = Date.now().toString();
    
    setTabs(prevTabs => [
      ...prevTabs, 
      {
        id: newTabId,
        url: HOME_PAGE,
        title: 'Новая вкладка',
        history: [HOME_PAGE],
        historyIndex: 0,
        isPinned: false,
        isMuted: false
      }
    ]);
    
    setActiveTabId(newTabId);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Важно! Предотвращаем открытие контекстного меню
    
    // Не даём закрыть закрепленную вкладку
    if (tabs.find(tab => tab.id === tabId)?.isPinned) return;
    
    if (tabs.length === 1) {
      // Если это последняя вкладка, создаем новую
      setTabs([{
        id: Date.now().toString(),
        url: HOME_PAGE,
        title: 'Новая вкладка',
        history: [HOME_PAGE],
        historyIndex: 0,
        isPinned: false,
        isMuted: false
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

  // Управление закладками
  const addBookmark = (url: string, title: string) => {
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      url,
      title,
      dateAdded: new Date()
    };
    
    setBookmarks(prev => [newBookmark, ...prev]);
  };
  
  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  const isCurrentPageBookmarked = () => {
    const currentUrl = activeTab.url;
    return bookmarks.some(bookmark => bookmark.url === currentUrl);
  };
  
  const toggleBookmark = () => {
    const currentUrl = activeTab.url;
    if (isCurrentPageBookmarked()) {
      const bookmark = bookmarks.find(b => b.url === currentUrl);
      if (bookmark) {
        removeBookmark(bookmark.id);
      }
    } else {
      addBookmark(currentUrl, activeTab.title);
    }
  };

  // Операции контекстного меню вкладок
  const togglePin = (tabId: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => {
        if (tab.id === tabId) {
          return { ...tab, isPinned: !tab.isPinned };
        }
        return tab;
      })
    );
  };

  const duplicateTab = (tabId: string) => {
    const sourceTab = tabs.find(tab => tab.id === tabId);
    if (!sourceTab) return;
    
    const newTabId = Date.now().toString();
    const newTab = {
      ...sourceTab,
      id: newTabId,
      isPinned: false
    };
    
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTabId);
  };

  const toggleMute = (tabId: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => {
        if (tab.id === tabId) {
          return { ...tab, isMuted: !tab.isMuted };
        }
        return tab;
      })
    );
    
    // Применяем состояние к iframe
    if (tabId === activeTabId && iframeRef.current) {
      iframeRef.current.muted = !tabs.find(tab => tab.id === tabId)?.isMuted;
    }
  };

  const closeOtherTabs = (tabId: string) => {
    const pinnedTabs = tabs.filter(tab => tab.isPinned && tab.id !== tabId);
    const targetTab = tabs.find(tab => tab.id === tabId);
    
    if (targetTab) {
      setTabs([...pinnedTabs, targetTab]);
      setActiveTabId(tabId);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    // Обновляем заголовок вкладки
    if (iframeRef.current && iframeRef.current.contentDocument) {
      setTabs(prevTabs => 
        prevTabs.map(tab => {
          if (tab.id === activeTabId) {
            const newTitle = iframeRef.current?.contentDocument?.title || 'Новая вкладка';
            return { ...tab, title: newTitle };
          }
          return tab;
        })
      );
    }
  };

  // Обновление настроек
  const updateSettings = (newSettings: Partial<BrowserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Сортируем вкладки: сначала закрепленные
  const sortedTabs = [...tabs].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });

  // Извлекаем поисковый запрос из URL
  const getSearchQueryFromUrl = (url: string) => {
    if (url.startsWith(SEARCH_PREFIX)) {
      const queryParam = url.substring(SEARCH_PREFIX.length);
      return decodeURIComponent(queryParam);
    }
    return '';
  };

  return (
    <div className={`flex flex-col h-screen border-x shadow-md overflow-hidden ${
      settings.theme === 'dark' ? 'bg-gray-900 text-white' : 
      settings.theme === 'colored' ? 'bg-indigo-50' : ''
    }`}>
      {/* Вкладки */}
      <div className={`flex items-center overflow-x-auto ${
        settings.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 
        settings.theme === 'colored' ? 'bg-indigo-200 border-indigo-300' : 
        'bg-gray-200'
      } border-b`}>
        {sortedTabs.map(tab => (
          <div key={tab.id}>
            <div 
              className={`flex items-center max-w-[200px] px-3 py-1.5 mr-1 rounded-t-md cursor-pointer ${
                tab.isPinned ? 'pl-2 pr-2 max-w-[150px]' : ''
              } ${
                activeTabId === tab.id ? 
                  settings.theme === 'dark' ? 'bg-gray-900' : 
                  settings.theme === 'colored' ? 'bg-indigo-100' : 
                  'bg-white' 
                : 
                  settings.theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 
                  settings.theme === 'colored' ? 'bg-indigo-200 hover:bg-indigo-100' : 
                  'bg-gray-100 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTabId(tab.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                // Открыть меню здесь
              }}
            >
              {tab.isPinned && <Pin className="h-3 w-3 mr-1 text-blue-500" />}
              {tab.isMuted && <VolumeX className="h-3 w-3 mr-1 text-red-500" />}
              <div className="truncate text-sm">{tab.title}</div>
              {!tab.isPinned && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 ml-2"
                  onClick={(e) => closeTab(tab.id, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="hidden">Меню</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => togglePin(tab.id)}>
                  <Pin className="h-4 w-4 mr-2" />
                  {tab.isPinned ? 'Открепить' : 'Закрепить'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => duplicateTab(tab.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Дублировать
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleMute(tab.id)}>
                  {tab.isMuted ? 
                    <><Volume2 className="h-4 w-4 mr-2" />Включить звук</> : 
                    <><VolumeX className="h-4 w-4 mr-2" />Отключить звук</>
                  }
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => closeOtherTabs(tab.id)}>
                  <X className="h-4 w-4 mr-2" />
                  Закрыть остальные вкладки
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        url={isSpecialPage(activeTab.url) ? '' : activeTab.url}
        onNavigate={navigateTo}
        onBack={goBack}
        onForward={goForward}
        onRefresh={refresh}
        onHome={goHome}
        onOpenSettings={openSettings}
        onToggleBookmark={toggleBookmark}
        isBookmarked={isCurrentPageBookmarked()}
        canGoBack={activeTab.historyIndex > 0}
        canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
        theme={settings.theme}
      />
      
      {/* Окно браузера */}
      <div className="relative flex-1">
        {/* Загрузка */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <img 
              src="https://icons8.com/preloaders/preloaders/329/Яйцо%20катится.gif" 
              alt="Загрузка" 
              className="w-16 h-16"
            />
          </div>
        )}
        
        {/* Внутренние страницы */}
        {activeTab.url === HOME_PAGE && (
          <HomePage 
            settings={settings} 
            onNavigate={navigateTo}
            onSearch={search}
            bookmarks={bookmarks}
            onUpdateTitle={updateTabTitle}
          />
        )}
        
        {activeTab.url === SETTINGS_PAGE && (
          <SettingsPage 
            settings={settings} 
            onUpdateSettings={updateSettings}
            history={browserHistory}
            bookmarks={bookmarks}
            onRemoveBookmark={removeBookmark}
            onUpdateTitle={updateTabTitle}
          />
        )}
        
        {activeTab.url.startsWith(SEARCH_PREFIX) && (
          <SearchPage
            query={getSearchQueryFromUrl(activeTab.url)}
            onNavigate={navigateTo}
            onUpdateTitle={updateTabTitle}
            theme={settings.theme}
          />
        )}
        
        {/* Внешние страницы */}
        {!isSpecialPage(activeTab.url) && (
          <iframe
            ref={iframeRef}
            src={activeTab.url}
            title="browser-frame"
            className="w-full h-full border-none"
            onLoad={handleIframeLoad}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="no-referrer"
            muted={activeTab.isMuted}
          />
        )}
      </div>
    </div>
  );
};

export default BrowserFrame;
