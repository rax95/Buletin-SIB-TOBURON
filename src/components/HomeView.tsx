import { ArrowRight, Calendar, Clock, MapPin, MonitorPlay } from 'lucide-react';
import { useBulletin } from '../context/BulletinContext';
import {
  estimateReadMinutes,
  formatIndonesianDate,
} from '../data/seedBulletin';
import type {
  ChurchSchedule,
  GalleryPhoto,
  NewsArticle,
  TabKey,
} from '../types/bulletin';
import { SafeImage } from './SafeImage';

interface HomeViewProps {
  onSelectTab: (tab: TabKey) => void;
  onOpenArticle: (article: NewsArticle) => void;
  onOpenSchedule: (schedule: ChurchSchedule) => void;
  onOpenPhoto: (photo: GalleryPhoto) => void;
  onLaunchTvMode: () => void;
}

export function HomeView({
  onSelectTab,
  onOpenArticle,
  onOpenSchedule,
  onOpenPhoto,
  onLaunchTvMode,
}: HomeViewProps) {
  const { news, schedules, gallery, isLoadingData } = useBulletin();

  const publishedNews = news.filter((n) => n.status === 'published');
  const publishedSchedules = schedules.filter((s) => s.status === 'published');
  const publishedGallery = gallery.filter((g) => g.status === 'published');

  const leadArticle = publishedNews[0] || null;
  const secondaryArticles = publishedNews.slice(1, 4);
  const upcomingSchedules = publishedSchedules.slice(0, 4);
  const featuredPhotos = publishedGallery.slice(0, 4);
  const nextService = upcomingSchedules[0] || null;

  if (isLoadingData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="h-12 bg-[#EFECE7] rounded-xl animate-pulse" />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 bg-[#EFECE7] rounded-2xl animate-pulse" />
          <div className="lg:col-span-5 h-96 bg-[#EFECE7] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-14 sm:space-y-16">
      {/* Operational Utility Ribbon (Church Service Summary + TV Mode Launcher) */}
      <section
        aria-label="Informasi ibadah terdekat dan mode tampilan TV"
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#E4DFD7]"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-[#57534E]">
          <span className="font-semibold text-[#171614]">
            Sidang Injil Borneo Toburon
          </span>
          <span aria-hidden="true">·</span>
          {nextService ? (
            <>
              <span>
                Kegiatan Terdekat:{' '}
                <strong className="font-medium text-[#171614]">
                  {nextService.title}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-[#1B3B6F] font-medium">
                {nextService.dayLabel}, {nextService.startTime}–{nextService.endTime}
              </span>
              <span aria-hidden="true" className="hidden sm:inline">
                ·
              </span>
              <span className="hidden sm:inline">{nextService.location}</span>
            </>
          ) : (
            <span>Warta Jemaat, Jadwal Kegiatan & Dokumentasi Gereja</span>
          )}
        </div>

        <button
          type="button"
          onClick={onLaunchTvMode}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#1B3B6F] bg-white border border-[#E4DFD7] hover:border-[#1B3B6F] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
        >
          <MonitorPlay className="w-4 h-4" />
          Mode Layar TV
        </button>
      </section>

      {/* Tier 1: Lead Editorial Story (2-column balanced split) */}
      {leadArticle ? (
        <section aria-label="Berita utama jemaat">
          <article className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <button
              type="button"
              onClick={() => onOpenArticle(leadArticle)}
              className="lg:col-span-7 group block overflow-hidden rounded-2xl bg-[#EFECE7] text-left cursor-pointer"
            >
              <SafeImage
                src={leadArticle.imageUrl}
                alt={leadArticle.title}
                fallbackTitle={leadArticle.title}
                className="w-full h-72 sm:h-96 lg:h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </button>

            <div className="lg:col-span-5 flex flex-col justify-between py-1">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#57534E] mb-4">
                  <span className="text-[#1B3B6F] font-semibold">
                    {leadArticle.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time
                    dateTime={leadArticle.publishedDate}
                    className="font-mono tabular-nums"
                  >
                    {formatIndonesianDate(leadArticle.publishedDate)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span>{estimateReadMinutes(leadArticle.content)} menit baca</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold leading-[1.14] text-[#171614] mb-5">
                  {leadArticle.title}
                </h1>

                <p className="text-base text-[#57534E] leading-relaxed mb-6">
                  {leadArticle.summary}
                </p>
              </div>

              <div className="pt-6 border-t border-[#E4DFD7] flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-[#57534E]">
                  Diterbitkan oleh{' '}
                  <span className="font-medium text-[#171614]">
                    {leadArticle.authorName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenArticle(leadArticle)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3B6F] text-white text-sm font-medium rounded-lg hover:bg-[#132B52] transition-colors whitespace-nowrap cursor-pointer min-h-[44px]"
                >
                  Baca Selengkapnya
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        </section>
      ) : (
        <section className="bg-white border border-[#E4DFD7] rounded-2xl p-10 text-center">
          <h1 className="font-serif text-3xl text-[#171614] mb-2">
            Selamat Datang di Buletin SIB TOBURON
          </h1>
          <p className="text-sm text-[#57534E]">
            Belum ada berita yang diterbitkan saat ini. Admin dapat menambahkan
            berita melalui Panel Admin.
          </p>
        </section>
      )}

      {/* Tier 2: Secondary News Features */}
      {secondaryArticles.length > 0 && (
        <section aria-labelledby="heading-berita-lainnya" className="space-y-6">
          <div className="flex items-end justify-between gap-4 pb-4 border-b border-[#E4DFD7]">
            <div>
              <h2
                id="heading-berita-lainnya"
                className="font-serif text-2xl sm:text-3xl font-semibold text-[#171614]"
              >
                Warta & Berita Terkini
              </h2>
              <p className="text-sm text-[#57534E] mt-1">
                Informasi pelayanan, pengumuman jemaat, dan renungan mingguan
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('news')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B3B6F] hover:text-[#132B52] whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
            >
              Semua Berita
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {secondaryArticles.map((article) => (
              <article key={article.id} className="group flex flex-col">
                <button
                  type="button"
                  onClick={() => onOpenArticle(article)}
                  className="block overflow-hidden rounded-xl bg-[#EFECE7] aspect-[4/3] mb-4 cursor-pointer text-left"
                >
                  <SafeImage
                    src={article.imageUrl}
                    alt={article.title}
                    fallbackTitle={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </button>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E] mb-2">
                  <span className="font-semibold text-[#1B3B6F]">
                    {article.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time
                    dateTime={article.publishedDate}
                    className="font-mono tabular-nums"
                  >
                    {formatIndonesianDate(article.publishedDate)}
                  </time>
                </div>

                <h3 className="font-serif text-xl font-semibold text-[#171614] leading-snug mb-2 group-hover:text-[#1B3B6F] transition-colors">
                  <button
                    type="button"
                    onClick={() => onOpenArticle(article)}
                    className="text-left cursor-pointer"
                  >
                    {article.title}
                  </button>
                </h3>

                <p className="text-sm text-[#57534E] leading-relaxed line-clamp-3 mb-4 flex-1">
                  {article.summary}
                </p>

                <div className="text-xs text-[#57534E] pt-3 border-t border-[#E4DFD7]">
                  {article.authorName}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Tier 3: Weekly Schedule Strip */}
      <section aria-labelledby="heading-jadwal-pekan" className="space-y-6">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-[#E4DFD7]">
          <div>
            <h2
              id="heading-jadwal-pekan"
              className="font-serif text-2xl sm:text-3xl font-semibold text-[#171614]"
            >
              Jadwal Kegiatan Gereja
            </h2>
            <p className="text-sm text-[#57534E] mt-1">
              Kebaktian minggu, doa syafaat, sekolah minggu, dan persekutuan
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('schedules')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B3B6F] hover:text-[#132B52] whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
          >
            Jadwal Lengkap
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {upcomingSchedules.length > 0 ? (
          <div className="bg-white border border-[#E4DFD7] rounded-2xl divide-y divide-[#E4DFD7]">
            {upcomingSchedules.map((sched) => (
              <button
                key={sched.id}
                type="button"
                onClick={() => onOpenSchedule(sched)}
                className="w-full text-left p-5 sm:p-6 hover:bg-[#F9F8F6] transition-colors grid md:grid-cols-12 gap-3 md:gap-6 items-center cursor-pointer"
              >
                <div className="md:col-span-3 flex items-baseline md:flex-col gap-2 md:gap-0.5">
                  <span className="font-semibold text-[#1B3B6F] text-sm">
                    {sched.dayLabel}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-[#171614]">
                    {sched.startTime} – {sched.endTime}
                  </span>
                  <span className="text-xs text-[#57534E] font-mono tabular-nums">
                    {formatIndonesianDate(sched.eventDate)}
                  </span>
                </div>

                <div className="md:col-span-6">
                  <div className="text-xs text-[#57534E] mb-1">
                    <span>{sched.category}</span>
                    {sched.isRecurring && (
                      <>
                        <span aria-hidden="true" className="mx-1.5">
                          ·
                        </span>
                        <span>Rutin Mingguan</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#171614]">
                    {sched.title}
                  </h3>
                  <p className="text-sm text-[#57534E] line-clamp-1 mt-1">
                    {sched.description}
                  </p>
                </div>

                <div className="md:col-span-3 flex flex-col md:items-end gap-1 text-xs text-[#57534E]">
                  <span className="inline-flex items-center gap-1.5 text-[#171614] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#1B3B6F] shrink-0" />
                    <span className="truncate max-w-[220px]">{sched.location}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#57534E] shrink-0" />
                    <span className="truncate max-w-[220px]">
                      {sched.speakerOrLead}
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E4DFD7] rounded-2xl p-8 text-center text-sm text-[#57534E]">
            Belum ada jadwal kegiatan yang dipublikasikan.
          </div>
        )}
      </section>

      {/* Tier 4: Interactive Photo Gallery Showcase */}
      <section aria-labelledby="heading-galeri-sorotan" className="space-y-6">
        <div className="flex items-end justify-between gap-4 pb-4 border-b border-[#E4DFD7]">
          <div>
            <h2
              id="heading-galeri-sorotan"
              className="font-serif text-2xl sm:text-3xl font-semibold text-[#171614]"
            >
              Galeri Foto Jemaat
            </h2>
            <p className="text-sm text-[#57534E] mt-1">
              Momen kebersamaan ibadah, sekolah minggu, pemuda, dan pelayanan kasih
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('gallery')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B3B6F] hover:text-[#132B52] whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
          >
            Buka Galeri
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {featuredPhotos.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPhotos.map((photo, index) => (
              <figure key={photo.id} className="group">
                <button
                  type="button"
                  onClick={() => onOpenPhoto(photo)}
                  className="w-full block overflow-hidden rounded-xl bg-[#EFECE7] aspect-[4/3] cursor-pointer text-left"
                >
                  <SafeImage
                    src={photo.imageUrl}
                    alt={photo.title}
                    fallbackTitle={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </button>
                <figcaption className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#57534E]">
                    <span className="font-mono tabular-nums text-[#1B3B6F]">
                      Fig. {String(index + 1).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{photo.album}</span>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-[#171614] leading-snug">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-[#57534E] font-mono tabular-nums inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatIndonesianDate(photo.takenDate)}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E4DFD7] rounded-2xl p-8 text-center text-sm text-[#57534E]">
            Belum ada foto yang dipublikasikan di galeri.
          </div>
        )}
      </section>
    </div>
  );
}
