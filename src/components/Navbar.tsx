import React from 'react';
import { UserProfile } from '../types';
import { INITIAL_USERS } from '../utils/storage';
import {
  Store,
  Camera,
  Layers,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileText,
  Database,
  User,
  ChevronDown,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'detect' | 'inventory' | 'analytics' | 'alerts' | 'reports';
  setActiveTab: (tab: 'detect' | 'inventory' | 'analytics' | 'alerts' | 'reports') => void;
  currentUser: UserProfile;
  setCurrentUser: (u: UserProfile) => void;
  lowStockCount: number;
  onOpenSqlModal: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  lowStockCount,
  onOpenSqlModal,
  onNavigateSection
}) => {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  const navItems = [
    { id: 'detect', label: 'Visual Shelf Scanner', icon: Camera, color: 'text-cyan-400', activeBg: 'bg-cyan-600' },
    { id: 'inventory', label: 'Master Store Catalog', icon: Layers, badgeText: '10,000 SKUs', color: 'text-emerald-400', activeBg: 'bg-emerald-600' },
    { id: 'analytics', label: 'Sales Prediction & Product Organisation', icon: TrendingUp, color: 'text-indigo-400', activeBg: 'bg-indigo-600' },
    {
      id: 'alerts',
      label: 'Stock Replenishment Alerts',
      icon: AlertTriangle,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      color: 'text-amber-400',
      activeBg: 'bg-amber-600'
    },
    { id: 'reports', label: 'Store Audit Logs & Reports', icon: FileText, color: 'text-blue-400', activeBg: 'bg-blue-600' },
  ];

  const handleItemClick = (id: string) => {
    setActiveTab(id as any);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        const navOffset = 90;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upper Bar */}
        <div className="h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* SmartStock Logo */}
            <div className="p-2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-xl text-white shadow-md shadow-emerald-600/20 flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 3D Isometric Stock Cube */}
                <path d="M14 2L25 8.2V19.8L14 26L3 19.8V8.2L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="rgba(16, 185, 129, 0.25)" />
                <path d="M14 2V26" stroke="currentColor" strokeWidth="2" />
                <path d="M14 14L25 8" stroke="currentColor" strokeWidth="2" />
                <path d="M14 14L3 8" stroke="currentColor" strokeWidth="2" />
                {/* Optical Smart Scanning Beam */}
                <path d="M8 12L14 15.5L20 12" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                <circle cx="14" cy="14" r="2.5" fill="#38bdf8" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                  <span className="text-white">Smart</span>
                  <span className="text-emerald-400">Stock</span>
                  <span className="hidden sm:inline-block text-[11px] font-normal text-slate-400 font-sans ml-1">
                    | Enterprise Store Suite
                  </span>
                </h1>
                <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full hidden md:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  10,000 SKUs Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span className="text-slate-300 font-medium">Store #104 — Central Retail Store</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-medium">Live Shelf & POS Sync</span>
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Database Inspector Button */}
            <button
              onClick={onOpenSqlModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all shadow-sm cursor-pointer"
              title="Inspect Master SQL Database & Backup"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Master Data Store</span>
            </button>

            {/* Executive Role Switcher (Blank PFP) */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs transition-all text-left cursor-pointer shadow-sm"
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-[11px]">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-slate-950 rounded-full" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-slate-100 text-xs leading-none">{currentUser.name}</p>
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                  </div>
                  <p className="text-[10px] text-emerald-300 font-medium leading-tight mt-0.5">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-76 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Executive Leadership Roles
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Executive store management authority
                    </p>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                    {INITIAL_USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setCurrentUser(user);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-all cursor-pointer ${
                          currentUser.id === user.id
                            ? 'bg-emerald-950/40 text-emerald-200 font-medium'
                            : 'text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs shrink-0">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold leading-tight text-slate-100">{user.name}</p>
                          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">{user.role}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Department: {user.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lower Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-t border-slate-800/70 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
                  isActive
                    ? `${item.activeBg} text-white shadow-md font-semibold`
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
                {item.badgeText && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-emerald-400 border border-slate-700'
                  }`}>
                    {item.badgeText}
                  </span>
                )}
                {item.badge !== undefined && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
