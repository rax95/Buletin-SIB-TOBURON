import { useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, Search, X } from 'lucide-react';
import { useBulletin } from '../context/BulletinContext';
import {
  estimateReadMinutes,
  formatIndonesianDate,
} from '../data/seedBulletin';
import {
  NEWS_CATEGORIES,
  type NewsArticle,
  type NewsCategory,
} from '../types/bulletin';
import { SafeImage } from './SafeImage';

interface NewsViewProps {
  selectedArticle: NewsArticle | null;
  onSelectArticle: (article: NewsArticle | null) => void;
}

export function NewsView({ selectedArticle, onSelectArticle }: NewsViewProps) {
  const { news } = useBulletin();
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | NewsCategory>(
    'Semua',
  );
  const [searchQuery, setSearchQuery] = useState('');

  const publishedNews = useMemo(
    () => news.filter((item) => item.status === 'published'),
    [news],
  );

  const filteredNews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publishedNews.filter((item) => {
      if (categoryFilter !== 'Semua' && item.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.authorName.toLowerCase().includes(q)
      );
    });
  }, [publishedNews, categoryFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Page Masthead */}
      <div className="pb-6 border-b border-[#E4DFD7] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-[#1B3B6F] mb-2">
            Warta & Pengumuman Resmi
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#171614]">
            Berita Terkini SIB TOBURON
          </h1>
          <p className="text-sm sm:text-base text-[#57534E] mt-2 max-w-2xl">
            Informasi pelayanan gereja, pengumuman jemaat, dan renungan mingguan
            yang tersinkronisasi secara real-time.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search
            className="w-4 h-4 text-[#57534E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul atau isi berita..."
            aria-label="Cari berita"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4DFD7] rounded-xl text-sm text-[#171614] placeholder:text-[#78716C] focus:outline-none focus:border-[#1B3B6F] min-h-[44px]"
          />
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div
        role="tablist"
        aria-label="Filter kategori berita"
        className="flex flex-wrap items-center gap-2"
      >
        {(['Semua', ...NEWS_CATEGORIES] as const).map((cat) => {
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px] ${
                active
                  ? 'bg-[#1B3B6F] text-white'
                  : 'bg-white border border-[#E4DFD7] text-[#57534E] hover:text-[#171614] hover:border-[#C9C2B6]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* News Grid */}
      {filteredNews.length === 0 ? (
        <div className="bg-white border border-[#E4DFD7] rounded-2xl p-12 text-center">
          <h2 className="font-serif text-xl font-semibold text-[#171614] mb-2">
            Tidak ada berita yang cocok
          </h2>
          <p className="text-sm text-[#57534E]">
            Coba ubah kata kunci pencarian atau pilih kategori berita lainnya.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((article) => (
            <article
              key={article.id}
              className="group bg-white border border-[#E4DFD7] rounded-2xl overflow-hidden flex flex-col transition-colors hover:border-[#C9C2B6]"
            >
              <button
                type="button"
                onClick={() => onSelectArticle(article)}
                className="block aspect-[4/3] bg-[#EFECE7] overflow-hidden cursor-pointer text-left"
              >
                <SafeImage
                  src={article.imageUrl}
                  alt={article.title}
                  fallbackTitle={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E] mb-3">
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
                  <span aria-hidden="true">·</span>
                  <span>{estimateReadMinutes(article.content)} mnt</span>
                </div>

                <h2 className="font-serif text-xl font-semibold text-[#171614] leading-snug mb-3 group-hover:text-[#1B3B6F] transition-colors">
                  <button
                    type="button"
                    onClick={() => onSelectArticle(article)}
                    className="text-left cursor-pointer"
                  >
                    {article.title}
                  </button>
                </h2>

                <p className="text-sm text-[#57534E] leading-relaxed line-clamp-3 mb-5 flex-1">
                  {article.summary}
                </p>

                <div className="pt-4 border-t border-[#E4DFD7] flex items-center justify-between gap-3">
                  <span className="text-xs text-[#57534E] truncate">
                    {article.authorName}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectArticle(article)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#1B3B6F] hover:text-[#132B52] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Baca
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Editorial Reading Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => onSelectArticle(null)}
        />
      )}
    </div>
  );
}

export function ArticleModal({
  article,
  onClose,
}: {
  article: NewsArticle;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyShare = async () => {
    const shareText = `${article.title}\n\n${article.summary}\n\n— Buletin SIB TOBURON (${formatIndonesianDate(article.publishedDate)})`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const paragraphs = article.content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
      className="fixed inset-0 z-50 bg-[#171614]/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#F9F8F6] w-full max-w-3xl sm:rounded-2xl border border-[#E4DFD7] max-h-screen sm:max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[#F9F8F6]/95 backdrop-blur-md px-6 py-4 border-b border-[#E4DFD7] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#57534E] truncate">
            <span className="font-semibold text-[#1B3B6F]">
              {article.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {formatIndonesianDate(article.publishedDate)}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#171614] bg-white border border-[#E4DFD7] hover:border-[#1B3B6F] rounded-lg transition-colors cursor-pointer min-h-[38px]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1B3B6F]" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin Ringkasan
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup berita"
              className="w-10 h-10 flex items-center justify-center rounded-lg text-[#57534E] hover:text-[#171614] hover:bg-[#EFECE7] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <article className="px-6 sm:px-10 py-8 space-y-6">
          <header className="space-y-4">
            <h2
              id="article-modal-title"
              className="font-serif text-2xl sm:text-4xl font-semibold text-[#171614] leading-tight"
            >
              {article.title}
            </h2>
            <p className="text-base sm:text-lg text-[#57534E] leading-relaxed">
              {article.summary}
            </p>
            <div className="text-xs text-[#57534E] pt-2 border-t border-[#E4DFD7]">
              Oleh <strong className="text-[#171614]">{article.authorName}</strong>{' '}
              · {estimateReadMinutes(article.content)} menit waktu baca
            </div>
          </header>

          <figure className="overflow-hidden rounded-xl bg-[#EFECE7]">
            <SafeImage
              src={article.imageUrl}
              alt={article.title}
              fallbackTitle={article.title}
              className="w-full max-h-[420px] object-cover"
            />
          </figure>

          <div className="max-w-2xl mx-auto space-y-5 text-base text-[#171614] leading-[1.8]">
            {paragraphs.map((paragraph, idx) => (
              <p
                key={idx}
                className={idx === 0 ? 'editorial-dropcap' : undefined}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
