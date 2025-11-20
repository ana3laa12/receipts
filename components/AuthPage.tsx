
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { LogIn, UserPlus, Activity, ArrowLeft, ArrowRight, Loader2, UserCircle, CheckCircle, Shield, Zap, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const { t, dir, language, setLanguage } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const authSectionRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const usersKey = 'fwateery_users';
      const existingUsersStr = localStorage.getItem(usersKey);
      const existingUsers: any[] = existingUsersStr ? JSON.parse(existingUsersStr) : [];

      if (isLogin) {
        const user = existingUsers.find(u => u.email === formData.email && u.password === formData.password);
        if (user) {
          onLogin({ id: user.id, name: user.name, email: user.email });
        } else {
          throw new Error(t('authError'));
        }
      } else {
        if (existingUsers.find(u => u.email === formData.email)) {
          throw new Error(t('emailExists'));
        }
        
        const newUser = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          password: formData.password
        };

        existingUsers.push(newUser);
        localStorage.setItem(usersKey, JSON.stringify(existingUsers));
        onLogin({ id: newUser.id, name: newUser.name, email: newUser.email });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    onLogin({
      id: 'guest',
      name: t('guestName'),
      email: 'guest@fwateery.local'
    });
  };

  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100" dir={dir}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <Activity size={24} strokeWidth={2.5} className="w-6 h-6 md:w-8 md:h-8" />
            <span className="text-xl md:text-2xl font-bold tracking-tight">{t('appName')}</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium"
            >
              <Globe size={18} className="md:w-5 md:h-5" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>
            <button 
              onClick={scrollToAuth}
              className="px-4 py-2 md:px-6 md:py-2.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs md:text-sm transition-all shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40"
            >
              {t('login')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-12 pb-24 lg:pt-24 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-20">
            <div className="flex-1 text-center lg:rtl:text-right lg:ltr:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium text-xs md:text-sm mb-4 md:mb-6">
                <Zap size={14} className="fill-current md:w-4 md:h-4" />
                <span>{t('feature1Title')}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold leading-tight mb-4 md:mb-6 text-gray-900 dark:text-white">
                {t('heroTitle')}
              </h1>
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t('heroDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <button 
                  onClick={scrollToAuth}
                  className="px-6 py-3 md:px-8 md:py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base md:text-lg transition-all shadow-xl shadow-primary-600/20 hover:-translate-y-1"
                >
                  {t('getStarted')}
                </button>
                <button className="px-6 py-3 md:px-8 md:py-4 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 font-bold text-base md:text-lg transition-all">
                  {t('learnMore')}
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
               {/* Abstract Decoration */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-primary-200/30 to-blue-200/30 dark:from-primary-900/20 dark:to-blue-900/20 rounded-full blur-3xl -z-10"></div>
               <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 md:p-6 rotate-2 hover:rotate-0 transition-all duration-500">
                 {/* Mock UI */}
                 <div className="flex items-center gap-4 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                     <Activity size={18} className="md:w-5 md:h-5" />
                   </div>
                   <div>
                     <div className="h-2 w-20 md:w-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
                     <div className="h-2 w-12 md:w-16 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                   </div>
                 </div>
                 <div className="space-y-3 md:space-y-4">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                       <div className="flex items-center gap-3">
                         <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white dark:bg-gray-800 shadow-sm"></div>
                         <div className="w-24 md:w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                       </div>
                       <div className="w-12 md:w-16 h-4 md:h-6 rounded-full bg-green-100 dark:bg-green-900/30"></div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{t('featuresTitle')}</h2>
            <div className="h-1 w-16 md:w-20 bg-primary-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Zap, title: t('feature1Title'), desc: t('feature1Desc'), color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
              { icon: Shield, title: t('feature2Title'), desc: t('feature2Desc'), color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
              { icon: CheckCircle, title: t('feature3Title'), desc: t('feature3Desc'), color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 md:p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-6 ${feature.color}`}>
                  <feature.icon size={24} className="md:w-7 md:h-7" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section ref={authSectionRef} className="py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-md mx-auto px-4 md:px-6 relative z-10">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {isLogin ? t('welcomeBack') : t('createAccount')}
                </h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                  {isLogin ? t('enterDetails') : t('registerText')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('fullName')}</label>
                    <input
                      type="text"
                      required={!isLogin}
                      className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white text-sm md:text-base"
                      placeholder={t('fullName')}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white text-sm md:text-base"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white text-sm md:text-base"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs md:text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 md:py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 mt-4 text-sm md:text-base"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? t('login') : t('signup'))}
                  {!isLoading && (dir === 'rtl' ? <ArrowLeft size={18} className="md:w-5 md:h-5" /> : <ArrowRight size={18} className="md:w-5 md:h-5" />)}
                </button>
              </form>

              <div className="my-5 md:my-6 flex items-center gap-4">
                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                <span className="text-gray-400 text-xs md:text-sm">{t('or')}</span>
                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
              </div>

              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full py-3 md:py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium transition-colors flex items-center justify-center gap-2 group border border-gray-200 dark:border-gray-700 text-sm md:text-base"
              >
                <UserCircle size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors md:w-5 md:h-5" />
                <span>{t('guestLogin')}</span>
              </button>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setIsLogin(!isLogin); setError(null); }}
                  className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                >
                  {isLogin ? t('noAccount') : t('haveAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Activity size={20} className="md:w-6 md:h-6" />
            <span className="font-bold text-base md:text-lg">{t('appName')}</span>
          </div>
          
          <div className="flex gap-6 md:gap-8 text-xs md:text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-primary-600 transition-colors">{t('privacy')}</a>
            <a href="#" className="hover:text-primary-600 transition-colors">{t('terms')}</a>
            <a href="#" className="hover:text-primary-600 transition-colors">{t('contact')}</a>
          </div>

          <div className="text-xs md:text-sm text-gray-400">
            {t('copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
};
