
import BrowserFrame from '@/components/Browser/BrowserFrame';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col p-4 bg-gray-50">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-center">Мой Браузер</h1>
      </header>
      
      <main className="flex-1">
        <BrowserFrame />
      </main>
      
      <footer className="mt-4 text-center text-sm text-gray-500">
        <p>© 2025 Мой Браузер</p>
      </footer>
    </div>
  );
};

export default Index;
