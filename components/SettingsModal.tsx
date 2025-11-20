
import React from 'react';
import { X, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Globe size={18} />
                {t('language')}
              </div>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('ar')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  language === 'ar'
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300 font-bold'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {t('arabic')}
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  language === 'en'
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300 font-bold'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {t('english')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
