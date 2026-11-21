import {
  Calendar,
  Home,
  Images,
  Newspaper,
  Shield,
} from 'lucide-react';
import type { TabKey } from '../types/bulletin';
import { useBulletin } from '../context/BulletinContext';

interface HeaderProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

const NAV_ITEMS: { key: Exclude<TabKey, 'admin'>; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Beranda', icon: Home },
  { key: 'news', label: 'Berita', icon: Newspaper },
  { key: 'schedules', label: 'Jadwal', icon: Calendar },
  { key: 'gallery', label: 'Galeri', icon: Images },
];

export function Header({ activeTab, onSelectTab }: HeaderProps) {
  const { isAdmin } = useBulletin();

  return (
    <>
      {/* Desktop & Tablet Top Bar (Strict 3-Zone Top Bar Contract) */}
      <header className="md:sticky md:top-0 z-30 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-[#E4DFD7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#171614] hover:text-[#1B3B6F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Buletin SIB TOBURON
          </button>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectTab(item.key)}
                  aria-current={active ? 'page' : undefined}
                  className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-[#1B3B6F] text-[#171614]'
                      : 'border-transparent text-[#57534E] hover:text-[#171614] hover:border-[#D4CEC3]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('admin')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] ${
                activeTab === 'admin'
                  ? 'bg-[#132B52] text-white'
                  : 'bg-[#1B3B6F] text-white hover:bg-[#132B52]'
              }`}
            >
              {isAdmin ? 'Kelola Buletin' : 'Panel Admin'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Thumb-Zone Tab Bar (56px height <= 15% mobile sticky cap) */}
      <nav
        aria-label="Navigasi bawah perangkat seluler"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4DFD7] pb-safe"
      >
        <div className="grid grid-cols-5 h-14 items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
                  active ? 'text-[#1B3B6F]' : 'text-[#57534E]'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 1.75} />
                <span className="text-[11px] font-medium mt-0.5 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onSelectTab('admin')}
            aria-current={activeTab === 'admin' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
              activeTab === 'admin' ? 'text-[#1B3B6F]' : 'text-[#57534E]'
            }`}
          >
            <Shield
              className="w-5 h-5"
              strokeWidth={activeTab === 'admin' ? 2.25 : 1.75}
            />
            <span className="text-[11px] font-medium mt-0.5 whitespace-nowrap">
              Admin
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
