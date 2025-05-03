
import BrowserFrame from '@/components/Browser/BrowserFrame';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="p-2">
        <h1 className="text-xl font-bold text-center">Мой Браузер</h1>
      </header>
      
      <main className="flex-1">
        <BrowserFrame />
      </main>
      
      <footer className="p-1 text-center text-xs text-gray-500">
        <p>© 2025 Мой Браузер</p>
      </footer>
    </div>
  );
};

export default Index;
