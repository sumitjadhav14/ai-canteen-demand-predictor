import React from 'react';
import { ActivePage } from '../types/canteen';
import { User } from '../types/auth';
import {
  Home,
  Sparkles,
  Database,
  BarChart3,
  Info,
  Smartphone,
  Maximize2,
  User as UserIcon,
  LogOut,
  KeyRound
} from 'lucide-react';

interface NavigationProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const navItems: { id: ActivePage; label: string; icon: React.ElementType; shortLabel: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, shortLabel: 'Home' },
  { id: 'predict', label: 'Predict Demand', icon: Sparkles, shortLabel: 'Predict' },
  { id: 'sales_data', label: 'Sales Data', icon: Database, shortLabel: 'Sales' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, shortLabel: 'Analytics' },
  { id: 'about', label: 'About Project', icon: Info, shortLabel: 'About' },
];

export const TopHeader: React.FC<{
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}> = ({
  activePage,
  isMobileFrame,
  setIsMobileFrame,
  currentUser,
  onOpenAuth,
}) => {
  const currentItem = navItems.find((n) => n.id === activePage);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 py-2.5 flex items-center justify-between">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
          ☕
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-tight">
            CanteenAI
          </h1>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Smart Demand Predictor
          </p>
        </div>
      </div>

      {/* Zone 2: Current screen breadcrumb / title on mobile */}
      <div className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
        {currentItem?.icon && React.createElement(currentItem.icon, { className: 'w-3.5 h-3.5' })}
        <span>{currentItem?.label || 'Account'}</span>
      </div>

      {/* Zone 3: User Auth Profile & Device Frame Toggle */}
      <div className="flex items-center gap-2">
        {/* User Account Button */}
        {currentUser ? (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 pl-2 pr-3 py-1 rounded-full transition-colors cursor-pointer group"
            title="Manage profile, password & account settings"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold text-[11px] flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 leading-none truncate max-w-[110px]">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[9px] text-amber-400/90 leading-tight">
                {currentUser.role.split(' ')[0]}
              </div>
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Mobile simulator toggle */}
        <button
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          className="hidden md:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          title="Toggle Mobile Simulator vs Full Desktop Screen"
        >
          {isMobileFrame ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Full View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Phone Frame</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export const DesktopSidebar: React.FC<{
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}> = ({
  activePage,
  setActivePage,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-slate-800 p-4 shrink-0 h-screen sticky top-0 justify-between">
      <div>
        {/* Brand header */}
        <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-800/80 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md">
            ☕
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">AI Canteen</div>
            <div className="text-[11px] text-amber-400 font-medium">Demand Predictor</div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-950" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Card at bottom of sidebar */}
      <div className="border-t border-slate-800/80 pt-3">
        {currentUser ? (
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2.5 text-left cursor-pointer group flex-1 min-w-0 mr-2"
              title="Click to view profile & change password"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-amber-400 truncate font-medium">
                  {currentUser.role}
                </div>
              </div>
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UserIcon className="w-4 h-4 text-amber-400" />
            <span>Login / Sign Up</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export const BottomTabBar: React.FC<{
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
}> = ({ activePage, setActivePage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 max-w-md mx-auto sm:max-w-none">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] relative transition-colors focus:outline-none"
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[9px] font-medium tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-400'
                }`}
              >
                {item.shortLabel}
              </span>
              {isActive && (
                <div className="absolute top-1 w-1 h-1 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
