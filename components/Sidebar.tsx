
import React from 'react';
import { LayoutDashboard, MessageSquareText, Settings, Activity, LogOut, X } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, onOpenSettings, isOpen, onClose }) => {
  const { t, dir } = useLanguage();
  
  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'chat', label: t('smartAssistant'), icon: MessageSquareText },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`
          fixed md:static top-0 z-50 h-full w-64 bg-white dark:bg-gray-800 
          border-l rtl:border-l-0 rtl:border-r ltr:border-r ltr:border-l-0 
          border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300
          ${dir === 'rtl' 
            ? (isOpen ? 'right-0' : '-right-64 md:right-0') 
            : (isOpen ? 'left-0' : '-left-64 md:left-0')
          }
        `}
      >
        <div className="p-4 md:p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 h-16 md:h-20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 md:p-2 bg-primary-100 dark:bg-primary-900 rounded-lg text-primary-600 dark:text-primary-300">
              <Activity className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="font-bold text-lg md:text-xl text-gray-800 dark:text-white">{t('appName')}</h1>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-200 text-sm md:text-base ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-[18px] h-[18px] md:w-5 md:h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 md:p-4 border-t border-gray-100 dark:border-gray-700 space-y-1 md:space-y-2">
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm md:text-base"
          >
            <Settings className="w-[18px] h-[18px] md:w-5 md:h-5" />
            <span>{t('settings')}</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm md:text-base"
          >
            <LogOut className="w-[18px] h-[18px] md:w-5 md:h-5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
