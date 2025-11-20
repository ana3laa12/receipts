
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InvoiceUploader } from './components/InvoiceUploader';
import { InvoiceList } from './components/InvoiceList';
import { ChatBot } from './components/ChatBot';
import { AuthPage } from './components/AuthPage';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { InvoiceData, ViewState, User } from './types';
import { Moon, Sun, Bell, Menu } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setView] = useState<ViewState>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check for logged in user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('fwateery_user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load user-specific data when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('fwateery_user_session', JSON.stringify(user));
      try {
        const savedData = localStorage.getItem(`fwateery_data_${user.id}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed)) {
            setInvoices(parsed);
          } else {
            setInvoices([]);
          }
        } else {
          setInvoices([]);
        }
      } catch (e) {
        console.error("Failed to load user data", e);
        setInvoices([]);
      }
    } else {
      localStorage.removeItem('fwateery_user_session');
      setInvoices([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && invoices) {
      try {
        localStorage.setItem(`fwateery_data_${user.id}`, JSON.stringify(invoices));
      } catch (e) {
        console.error("Failed to save to local storage", e);
      }
    }
  }, [invoices, user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleScanComplete = (data: InvoiceData) => {
    setInvoices(prev => [data, ...prev]);
  };

  const handleUpdateInvoice = (updatedInvoice: InvoiceData) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    ));
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const handleLogout = () => {
    setUser(null);
    setInvoices([]);
  };

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        setView={(view) => {
          setView(view);
          setIsSidebarOpen(false);
        }} 
        onLogout={handleLogout} 
        onOpenSettings={() => {
          setIsSettingsOpen(true);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Top Navigation Bar */}
        <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shrink-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white truncate max-w-[150px] md:max-w-none">
                {currentView === 'dashboard' ? t('dashboard') : t('smartAssistant')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm hidden sm:block">
                {t('welcomeUser', { name: user.name })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 md:p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              <span className="absolute top-2 md:top-2.5 rtl:right-2 md:rtl:right-2.5 ltr:left-2 md:ltr:left-2.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 md:p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-primary-500 to-blue-500 text-white flex items-center justify-center text-sm md:text-base font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all transform hover:scale-105 cursor-pointer"
            >
              {user.name.charAt(0)}
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto h-full">
            {currentView === 'dashboard' ? (
              <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 md:pb-0">
                <section>
                  <InvoiceUploader onScanComplete={handleScanComplete} />
                </section>
                <section>
                  <InvoiceList 
                    invoices={invoices || []} 
                    onUpdateInvoice={handleUpdateInvoice}
                    onDeleteInvoice={handleDeleteInvoice}
                  />
                </section>
              </div>
            ) : (
              <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] animate-fade-in pb-4">
                <ChatBot />
              </div>
            )}
          </div>
        </div>

        <ProfileModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          user={user} 
          onLogout={handleLogout} 
        />
        
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
