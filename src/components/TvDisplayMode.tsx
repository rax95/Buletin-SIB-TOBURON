import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { useBulletin } from '../context/BulletinContext';
import { formatIndonesianDate } from '../data/seedBulletin';
import { SafeImage } from './SafeImage';

interface TvDisplayModeProps {
  onExit: () => void;
}

type TvSlide =
  | { type: 'news'; id: string; title: string; summary: string; category: string; date: string; author: string; imageUrl: string }
  | { type: 'schedules'; id: string }
  | { type: 'photo'; id: string; title: string; caption: string; album: string; date: string; photographer: string; imageUrl: string };

export function TvDisplayMode({ onExit }: TvDisplayModeProps) {
  const { news, schedules, gallery } = useBulletin();
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const publishedNews = useMemo(
    () => news.filter((n) => n.status === 'published'),
    [news],
  );
  const publishedSchedules = useMemo(
    () => schedules.filter((s) => s.status === 'published'),
    [schedules],
  );
  const publishedGallery = useMemo(
    () => gallery.filter((g) => g.status === 'published'),
    [gallery],
  );

  const slides = useMemo<TvSlide[]>(() => {
    const list: TvSlide[] = [];
    publishedNews.slice(0, 3).forEach((n) =>
      list.push({
        type: 'news',
        id: `news-${n.id}`,
        title: n.title,
        summary: n.summary,
        category: n.category,
        date: n.publishedDate,
        author: n.authorName,
        imageUrl: n.imageUrl,
      }),
    );
    if (publishedSchedules.length > 0) {
      list.push({ type: 'schedules', id: 'schedules-overview' });
    }
    publishedGallery.slice(0, 4).forEach((p) =>
      list.push({
        type: 'photo',
        id: `photo-${p.id}`,
        title: p.title,
        caption: p.caption,
        album: p.album,
        date: p.takenDate,
        photographer: p.photographer,
        imageUrl: p.imageUrl,
      }),
    );
    return list;
  }, [publishedNews, publishedSchedules, publishedGallery]);

  const safeIndex = slides.length > 0 ? slideIndex % slides.length : 0;
  const activeSlide = slides[safeIndex] || null;

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setSlideIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Live digital clock
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Auto-advance every 9 seconds
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = window.setInterval(nextSlide, 9000);
    return () => window.clearInterval(id);
  }, [paused, nextSlide, slides.length]);

  // Smart TV D-Pad / Remote & Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        onExit();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if ((e.target as HTMLElement)?.tagName !== 'BUTTON') {
          e.preventDefault();
          setPaused((p) => !p);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onExit, nextSlide, prevSlide]);

  const clockStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      role="region"
      aria-label="Mode Layar TV Buletin SIB TOBURON"
      className="fixed inset-0 z-50 bg-[#12161E] text-[#F9F8F6] flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden"
    >
      {/* TV Header */}
      <header className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/15">
        <div>
          <p className="text-xs sm:text-sm tracking-widest uppercase text-[#CBD5E1]">
            Papan Informasi Jemaat
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold tracking-tight text-white">
            Buletin SIB TOBURON
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="font-mono text-2xl sm:text-4xl font-medium tabular-nums text-white">
              {clockStr}
            </div>
            <div className="text-xs sm:text-sm text-[#CBD5E1]">{dateStr}</div>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer min-h-[48px]"
          >
            <X className="w-5 h-5" />
            Keluar TV
          </button>
        </div>
      </header>

      {/* Main 10-foot Readable Stage */}
      <main className="flex-1 flex items-center py-6 sm:py-8 min-h-0">
        {!activeSlide ? (
          <div className="w-full text-center space-y-3">
            <h2 className="font-serif text-4xl text-white">
              Menunggu Pembaruan Buletin
            </h2>
            <p className="text-lg text-[#CBD5E1]">
              Konten yang dipublikasikan admin akan tampil otomatis di layar ini.
            </p>
          </div>
        ) : activeSlide.type === 'news' ? (
          <div className="w-full h-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 h-full max-h-[58vh] overflow-hidden rounded-2xl bg-white/5">
              <SafeImage
                src={activeSlide.imageUrl}
                alt={activeSlide.title}
                fallbackTitle={activeSlide.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-base text-[#93C5FD] font-medium">
                <span>{activeSlide.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-white/80">
                  {formatIndonesianDate(activeSlide.date)}
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-white leading-[1.15]">
                {activeSlide.title}
              </h2>

              <p className="text-lg sm:text-2xl text-[#E2E8F0] leading-relaxed">
                {activeSlide.summary}
              </p>

              <div className="pt-4 border-t border-white/15 text-base text-[#CBD5E1]">
                Diterbitkan oleh {activeSlide.author}
              </div>
            </div>
          </div>
        ) : activeSlide.type === 'schedules' ? (
          <div className="w-full space-y-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-white">
                Jadwal Kegiatan Gereja
              </h2>
              <span className="text-base text-[#93C5FD]">
                SIB TOBURON · Pekan Ini
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {publishedSchedules.slice(0, 4).map((sched) => (
                <div
                  key={sched.id}
                  className="bg-white/6 border border-white/15 rounded-2xl p-6 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 text-sm text-[#93C5FD]">
                    <span className="font-semibold">{sched.category}</span>
                    <span className="font-mono tabular-nums text-white">
                      {sched.dayLabel}, {formatIndonesianDate(sched.eventDate)}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-white">
                    {sched.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-base text-[#E2E8F0]">
                    <span className="inline-flex items-center gap-2 font-mono tabular-nums">
                      <Clock className="w-4 h-4 text-[#93C5FD]" />
                      {sched.startTime} – {sched.endTime} WITA
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#93C5FD]" />
                      {sched.location}
                    </span>
                  </div>
                  <div className="text-sm text-[#CBD5E1] inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {sched.speakerOrLead}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 h-full max-h-[60vh] overflow-hidden rounded-2xl bg-white/5">
              <SafeImage
                src={activeSlide.imageUrl}
                alt={activeSlide.title}
                fallbackTitle={activeSlide.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:col-span-5 space-y-5">
              <div className="flex items-center gap-3 text-base text-[#93C5FD] font-medium">
                <span>Galeri Foto</span>
                <span aria-hidden="true">·</span>
                <span>{activeSlide.album}</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-white leading-tight">
                {activeSlide.title}
              </h2>

              <p className="text-lg sm:text-2xl text-[#E2E8F0] leading-relaxed">
                {activeSlide.caption}
              </p>

              <div className="pt-4 border-t border-white/15 text-base text-[#CBD5E1] font-mono tabular-nums">
                {formatIndonesianDate(activeSlide.date)} · {activeSlide.photographer}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* TV Footer Controls (D-Pad / Remote Friendly) */}
      <footer className="pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide sebelumnya"
            className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="inline-flex items-center gap-2 px-5 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors cursor-pointer"
          >
            {paused ? (
              <>
                <Play className="w-4 h-4" />
                Lanjutkan Otomatis
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Jeda Tayangan
              </>
            )}
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide berikutnya"
            className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs sm:text-sm text-[#CBD5E1]">
          <span className="font-mono tabular-nums">
            Halaman {slides.length > 0 ? safeIndex + 1 : 0} / {slides.length}
          </span>
          <span aria-hidden="true">·</span>
          <span className="hidden sm:inline">
            Gunakan tombol panah kiri/kanan pada remote TV atau keyboard
          </span>
        </div>
      </footer>
    </div>
  );
}
