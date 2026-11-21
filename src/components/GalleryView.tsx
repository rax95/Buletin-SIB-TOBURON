import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useBulletin } from '../context/BulletinContext';
import { formatIndonesianDate } from '../data/seedBulletin';
import {
  GALLERY_ALBUMS,
  type GalleryAlbum,
  type GalleryPhoto,
} from '../types/bulletin';
import { SafeImage } from './SafeImage';

interface GalleryViewProps {
  selectedPhoto: GalleryPhoto | null;
  onSelectPhoto: (photo: GalleryPhoto | null) => void;
}

export function GalleryView({
  selectedPhoto,
  onSelectPhoto,
}: GalleryViewProps) {
  const { gallery } = useBulletin();
  const [albumFilter, setAlbumFilter] = useState<'Semua' | GalleryAlbum>(
    'Semua',
  );

  const publishedPhotos = useMemo(
    () => gallery.filter((item) => item.status === 'published'),
    [gallery],
  );

  const filteredPhotos = useMemo(() => {
    if (albumFilter === 'Semua') return publishedPhotos;
    return publishedPhotos.filter((item) => item.album === albumFilter);
  }, [publishedPhotos, albumFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Masthead */}
      <div className="pb-6 border-b border-[#E4DFD7] flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-[#1B3B6F] mb-2">
            Arsip Visual & Dokumentasi
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#171614]">
            Galeri Foto Interaktif
          </h1>
          <p className="text-sm sm:text-base text-[#57534E] mt-2 max-w-2xl">
            Klik foto mana pun untuk membuka tampilan layar penuh, memperbesar
            gambar, atau memutar tayangan slide interaktif.
          </p>
        </div>

        {filteredPhotos.length > 0 && (
          <button
            type="button"
            onClick={() => onSelectPhoto(filteredPhotos[0])}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1B3B6F] text-white text-sm font-medium rounded-lg hover:bg-[#132B52] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
          >
            <Play className="w-4 h-4" />
            Putar Tayangan Slide
          </button>
        )}
      </div>

      {/* Album Filter Buttons */}
      <div
        role="tablist"
        aria-label="Filter album foto"
        className="flex flex-wrap items-center gap-2"
      >
        {(['Semua', ...GALLERY_ALBUMS] as const).map((album) => {
          const active = albumFilter === album;
          return (
            <button
              key={album}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setAlbumFilter(album)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px] ${
                active
                  ? 'bg-[#1B3B6F] text-white'
                  : 'bg-white border border-[#E4DFD7] text-[#57534E] hover:text-[#171614] hover:border-[#C9C2B6]'
              }`}
            >
              {album}
            </button>
          );
        })}
      </div>

      {/* Editorial Photography Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white border border-[#E4DFD7] rounded-2xl p-12 text-center">
          <h2 className="font-serif text-xl font-semibold text-[#171614] mb-2">
            Belum ada foto di album ini
          </h2>
          <p className="text-sm text-[#57534E]">
            Pilih album lain untuk melihat dokumentasi kegiatan SIB TOBURON.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPhotos.map((photo, index) => (
            <figure key={photo.id} className="group flex flex-col">
              <button
                type="button"
                onClick={() => onSelectPhoto(photo)}
                className="block overflow-hidden rounded-xl bg-[#EFECE7] aspect-[4/3] cursor-pointer text-left"
              >
                <SafeImage
                  src={photo.imageUrl}
                  alt={photo.title}
                  fallbackTitle={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </button>

              <figcaption className="mt-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-[#57534E]">
                  <span className="font-mono tabular-nums text-[#1B3B6F] font-medium">
                    Fig. {String(index + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{photo.album}</span>
                  <span aria-hidden="true">·</span>
                  <time
                    dateTime={photo.takenDate}
                    className="font-mono tabular-nums"
                  >
                    {formatIndonesianDate(photo.takenDate)}
                  </time>
                </div>

                <h2 className="font-serif text-lg font-semibold text-[#171614] leading-snug group-hover:text-[#1B3B6F] transition-colors">
                  <button
                    type="button"
                    onClick={() => onSelectPhoto(photo)}
                    className="text-left cursor-pointer"
                  >
                    {photo.title}
                  </button>
                </h2>

                <p className="text-sm text-[#57534E] leading-relaxed line-clamp-2">
                  {photo.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <PhotoLightbox
          photos={filteredPhotos.length > 0 ? filteredPhotos : publishedPhotos}
          activePhoto={selectedPhoto}
          onChangePhoto={onSelectPhoto}
          onClose={() => onSelectPhoto(null)}
        />
      )}
    </div>
  );
}

export function PhotoLightbox({
  photos,
  activePhoto,
  onChangePhoto,
  onClose,
}: {
  photos: GalleryPhoto[];
  activePhoto: GalleryPhoto;
  onChangePhoto: (photo: GalleryPhoto) => void;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const currentIndex = useMemo(
    () => Math.max(0, photos.findIndex((p) => p.id === activePhoto.id)),
    [photos, activePhoto.id],
  );

  const goPrev = useCallback(() => {
    if (photos.length <= 1) return;
    const prevIdx = (currentIndex - 1 + photos.length) % photos.length;
    setZoomed(false);
    onChangePhoto(photos[prevIdx]);
  }, [photos, currentIndex, onChangePhoto]);

  const goNext = useCallback(() => {
    if (photos.length <= 1) return;
    const nextIdx = (currentIndex + 1) % photos.length;
    setZoomed(false);
    onChangePhoto(photos[nextIdx]);
  }, [photos, currentIndex, onChangePhoto]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === ' ') {
        e.preventDefault();
        setAutoPlay((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    if (!autoPlay || photos.length <= 1) return;
    const id = window.setInterval(goNext, 4500);
    return () => window.clearInterval(id);
  }, [autoPlay, goNext, photos.length]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau foto: ${activePhoto.title}`}
      className="fixed inset-0 z-50 bg-[#0F1115]/95 backdrop-blur-md text-white flex flex-col"
    >
      {/* Top Bar */}
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4 border-b border-white/10">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80 min-w-0">
          <span className="font-mono tabular-nums">
            {currentIndex + 1} / {photos.length}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{activePhoto.album}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAutoPlay((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer min-h-[40px]"
          >
            {autoPlay ? (
              <>
                <Pause className="w-4 h-4" />
                Jeda Slide
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Slide Otomatis
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? 'Perkecil foto' : 'Perbesar foto'}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            {zoomed ? (
              <ZoomOut className="w-5 h-5" />
            ) : (
              <ZoomIn className="w-5 h-5" />
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup galeri"
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        {photos.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Foto sebelumnya"
            className="absolute left-3 sm:left-6 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="max-w-5xl w-full h-full flex items-center justify-center overflow-auto">
          <SafeImage
            src={activePhoto.imageUrl}
            alt={activePhoto.title}
            fallbackTitle={activePhoto.title}
            className={`rounded-xl object-contain transition-transform duration-300 ${
              zoomed
                ? 'scale-150 cursor-zoom-out max-h-[75vh]'
                : 'max-h-[68vh] w-auto cursor-zoom-in'
            }`}
          />
        </div>

        {photos.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Foto berikutnya"
            className="absolute right-3 sm:right-6 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption & Thumbnail Strip */}
      <div className="px-4 sm:px-8 py-5 border-t border-white/10 bg-black/40">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h3 className="font-serif text-lg sm:text-xl font-semibold text-white">
              {activePhoto.title}
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">
              {activePhoto.caption}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 pt-1">
              <span className="inline-flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                {activePhoto.photographer}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {formatIndonesianDate(activePhoto.takenDate)}
              </span>
            </div>
          </div>

          {photos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {photos.map((thumb) => {
                const isActive = thumb.id === activePhoto.id;
                return (
                  <button
                    key={thumb.id}
                    type="button"
                    onClick={() => {
                      setZoomed(false);
                      onChangePhoto(thumb);
                    }}
                    className={`w-14 h-10 rounded-md overflow-hidden shrink-0 border-2 transition-opacity cursor-pointer ${
                      isActive
                        ? 'border-white opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <SafeImage
                      src={thumb.imageUrl}
                      alt={thumb.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
