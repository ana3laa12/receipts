
import React from 'react';
import { Mail, LogOut, UserCircle, X, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onLogout }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const isGuest = user.id === 'guest';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile')}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-500 to-blue-600 text-white flex items-center justify-center text-4xl font-bold shadow-xl shadow-primary-500/20">
              {user.name.charAt(0)}
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h4>
              <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                <Mail size={14} />
                {user.email}
              </p>
              {isGuest && (
                <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-full">
                  <UserCircle size={14} />
                  {t('guestAccount')}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {!isGuest && (
               <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                 <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                   <ShieldCheck size={20} className="text-primary-500" />
                   <span className="font-medium">{t('accountStatus')}</span>
                   <span className="text-sm text-green-600 dark:text-green-400 font-bold px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">{t('active')}</span>
                 </div>
               </div>
            )}

            {isGuest && (
               <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-300 leading-relaxed border border-blue-100 dark:border-blue-800">
                 {t('guestWarning')}
               </div>
            )}

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-200 transform active:scale-95 ${
                isGuest 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20'
                  : 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-800'
              }`}
            >
              {isGuest ? (
                <>
                  <UserCircle size={20} />
                  <span>{t('loginSignupAction')}</span>
                </>
              ) : (
                <>
                  <LogOut size={20} />
                  <span>{t('logout')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
