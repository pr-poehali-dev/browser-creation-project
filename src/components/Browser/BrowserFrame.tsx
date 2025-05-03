
import React, { useRef, useState, useEffect } from 'react';
import AddressBar from './AddressBar';

const BrowserFrame: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentUrl, setCurrentUrl] = useState('https://google.com');
  const [history, setHistory] = useState<string[]>(['https://google.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Загрузка начальной страницы
  useEffect(() => {
    if (iframeRef.current) {
      navigateTo('https://google.com');
    }
  }, []);

  const navigateTo = (url: string) => {
    setLoading(true);
    setCurrentUrl(url);
    
    // Обновляем историю
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(url);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentUrl(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentUrl(history[historyIndex + 1]);
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const goHome = () => {
    navigateTo('https://google.com');
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen border-x shadow-md overflow-hidden">
      <AddressBar
        onNavigate={navigateTo}
        onBack={goBack}
        onForward={goForward}
        onRefresh={refresh}
        onHome={goHome}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
      />
      
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="w-8 h-8 border-4 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={currentUrl}
          title="browser-frame"
          className="w-full h-full border-none"
          onLoad={handleIframeLoad}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

export default BrowserFrame;
