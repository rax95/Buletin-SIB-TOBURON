import { useEffect, useState } from 'react';
import { MonitorPlay, X } from 'lucide-react';
import { BulletinProvider, useBulletin } from './context/BulletinContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ArticleModal, NewsView } from './components/NewsView';
import { ScheduleModal, ScheduleView } from './components/ScheduleView';
import { GalleryView, PhotoLightbox } from './components/GalleryView';
import { AdminView } from './components/AdminView';
import { TvDisplayMode } from './components/TvDisplayMode';
import type {
  ChurchSchedule,
  GalleryPhoto,
  NewsArticle,
  TabKey,
} from './types/bulletin';

function BulletinShell() {
  const { gallery, realtimeNotice, clearRealtimeNotice } = useBulletin();

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [tvMode, setTvMode] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null,
  );
  const [selectedSchedule, setSelectedSchedule] =
    useState<ChurchSchedule | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const handleSelectTab = (tab: TabKey) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close open modals with Escape when not in TV mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !tvMode) {
        if (selectedArticle) setSelectedArticle(null);
        if (selectedSchedule) setSelectedSchedule(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tvMode, selectedArticle, selectedSchedule]);

  if (tvMode) {
    return <TvDisplayMode onExit={() => setTvMode(false)} />;
  }

  const publishedPhotos = gallery.filter((g) => g.status === 'published');

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-[#171614] pb-16 md:pb-0">
      <Header activeTab={activeTab} onSelectTab={handleSelectTab} />

      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onSelectTab={handleSelectTab}
            onOpenArticle={(article) => setSelectedArticle(article)}
            onOpenSchedule={(schedule) => setSelectedSchedule(schedule)}
            onOpenPhoto={(photo) => setSelectedPhoto(photo)}
            onLaunchTvMode={() => setTvMode(true)}
          />
        )}

        {activeTab === 'news' && (
          <NewsView
            selectedArticle={selectedArticle}
            onSelectArticle={setSelectedArticle}
          />
        )}

        {activeTab === 'schedules' && (
          <ScheduleView
            selectedSchedule={selectedSchedule}
            onSelectSchedule={setSelectedSchedule}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryView
            selectedPhoto={selectedPhoto}
            onSelectPhoto={setSelectedPhoto}
          />
        )}

        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* Modals when opened from HomeView */}
      {activeTab === 'home' && selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {activeTab === 'home' && selectedSchedule && (
        <ScheduleModal
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
        />
      )}

      {activeTab === 'home' && selectedPhoto && (
        <PhotoLightbox
          photos={publishedPhotos}
          activePhoto={selectedPhoto}
          onChangePhoto={setSelectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Real-time Cloud Sync Toast (only shown when live Firestore updates arrive) */}
      {realtimeNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 max-w-sm bg-[#171614] text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 text-sm"
        >
          <span>{realtimeNotice}</span>
          <button
            type="button"
            onClick={clearRealtimeNotice}
            aria-label="Tutup pemberitahuan"
            className="text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quiet Institutional Footer */}
      <footer className="mt-16 border-t border-[#E4DFD7] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="font-serif text-lg font-semibold text-[#171614]">
              Buletin SIB TOBURON
            </div>
            <p className="text-xs text-[#57534E]">
              Sidang Injil Borneo Toburon · Informasi Jemaat, Jadwal Ibadah &
              Galeri Dokumentasi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#57534E]">
            <button
              type="button"
              onClick={() => handleSelectTab('news')}
              className="hover:text-[#171614] cursor-pointer"
            >
              Berita
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('schedules')}
              className="hover:text-[#171614] cursor-pointer"
            >
              Jadwal
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('gallery')}
              className="hover:text-[#171614] cursor-pointer"
            >
              Galeri
            </button>
            <button
              type="button"
              onClick={() => setTvMode(true)}
              className="inline-flex items-center gap-1.5 text-[#1B3B6F] hover:text-[#132B52] cursor-pointer"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              Mode Layar TV
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BulletinProvider>
        <BulletinShell />
      </BulletinProvider>
    </ErrorBoundary>
  );
}
