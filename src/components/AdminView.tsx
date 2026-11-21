import React, { useState } from 'react';
import {
  Calendar,
  Check,
  Database,
  Edit3,
  Eye,
  EyeOff,
  Images,
  LogIn,
  LogOut,
  Newspaper,
  Plus,
  Shield,
  Star,
  Trash2,
  UserPlus,
} from 'lucide-react';
import {
  useBulletin,
  type NewsInput,
  type PhotoInput,
  type ScheduleInput,
} from '../context/BulletinContext';
import { formatIndonesianDate } from '../data/seedBulletin';
import {
  CHURCH_MEDIA_PRESETS,
  DAY_LABELS,
  GALLERY_ALBUMS,
  NEWS_CATEGORIES,
  SCHEDULE_CATEGORIES,
  SCHEMA_LIMITS,
  type ChurchSchedule,
  type GalleryPhoto,
  type NewsArticle,
} from '../types/bulletin';
import { SafeImage } from './SafeImage';

type AdminSubTab = 'news' | 'schedules' | 'gallery' | 'admins';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_NEWS_FORM: NewsInput = {
  title: '',
  summary: '',
  content: '',
  category: 'Warta Jemaat',
  imageUrl: CHURCH_MEDIA_PRESETS[0].url,
  authorName: 'Sekretariat SIB TOBURON',
  isFeatured: false,
  status: 'published',
  publishedDate: todayIso(),
};

const DEFAULT_SCHEDULE_FORM: ScheduleInput = {
  title: '',
  category: 'Ibadah Raya',
  dayLabel: 'Minggu',
  eventDate: todayIso(),
  startTime: '08:30',
  endTime: '10:30',
  location: 'Gedung Ibadah Utama SIB TOBURON',
  speakerOrLead: '',
  description: '',
  isRecurring: true,
  status: 'published',
};

const DEFAULT_PHOTO_FORM: PhotoInput = {
  title: '',
  caption: '',
  album: 'Ibadah Minggu',
  imageUrl: CHURCH_MEDIA_PRESETS[0].url,
  takenDate: todayIso(),
  photographer: 'Tim Multimedia SIB TOBURON',
  status: 'published',
};

export function AdminView() {
  const {
    user,
    authReady,
    isAdmin,
    isBootstrappedAdmin,
    usingStarterPreview,
    news,
    schedules,
    gallery,
    admins,
    signInWithGoogle,
    signOutAdmin,
    saveNews,
    toggleNewsStatus,
    toggleNewsFeatured,
    deleteNews,
    saveSchedule,
    toggleScheduleStatus,
    deleteSchedule,
    savePhoto,
    togglePhotoStatus,
    deletePhoto,
    addAdminRecord,
    removeAdminRecord,
    seedInitialDataToCloud,
  } = useBulletin();

  const [subTab, setSubTab] = useState<AdminSubTab>('news');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Form states
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState<NewsInput>(DEFAULT_NEWS_FORM);

  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] =
    useState<ScheduleInput>(DEFAULT_SCHEDULE_FORM);

  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [photoForm, setPhotoForm] = useState<PhotoInput>(DEFAULT_PHOTO_FORM);

  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  const flash = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    window.setTimeout(() => setFeedback(null), 5000);
  };

  const handleSignIn = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      flash(
        'error',
        err instanceof Error ? err.message : 'Gagal masuk dengan akun Google.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSeedCloud = async () => {
    setBusy(true);
    try {
      await seedInitialDataToCloud();
      flash(
        'success',
        'Seluruh berita, jadwal, dan galeri awal kini aktif di Cloud dan tersinkronisasi real-time.',
      );
    } catch (err) {
      flash(
        'error',
        err instanceof Error ? err.message : 'Gagal memuat data awal.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveNews(newsForm, editingNewsId || undefined);
      flash(
        'success',
        editingNewsId
          ? 'Berita diperbarui dan langsung tampil di seluruh perangkat jemaat.'
          : 'Berita baru diterbitkan secara real-time.',
      );
      setEditingNewsId(null);
      setNewsForm({ ...DEFAULT_NEWS_FORM, publishedDate: todayIso() });
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Gagal menyimpan berita.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveSchedule(scheduleForm, editingScheduleId || undefined);
      flash(
        'success',
        editingScheduleId
          ? 'Jadwal diperbarui secara otomatis di perangkat jemaat.'
          : 'Jadwal kegiatan baru berhasil ditambahkan.',
      );
      setEditingScheduleId(null);
      setScheduleForm({ ...DEFAULT_SCHEDULE_FORM, eventDate: todayIso() });
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Gagal menyimpan jadwal.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await savePhoto(photoForm, editingPhotoId || undefined);
      flash(
        'success',
        editingPhotoId
          ? 'Detail foto galeri berhasil diperbarui.'
          : 'Foto baru berhasil ditambahkan ke galeri jemaat.',
      );
      setEditingPhotoId(null);
      setPhotoForm({ ...DEFAULT_PHOTO_FORM, takenDate: todayIso() });
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Gagal menyimpan foto.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addAdminRecord(newAdminUid, newAdminName);
      setNewAdminUid('');
      setNewAdminName('');
      flash('success', 'Pengurus admin baru berhasil diberi otorisasi.');
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Gagal menambahkan admin.');
    } finally {
      setBusy(false);
    }
  };

  const startEditNews = (item: NewsArticle) => {
    setEditingNewsId(usingStarterPreview ? null : item.id);
    setNewsForm({
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      imageUrl: item.imageUrl,
      authorName: item.authorName,
      isFeatured: item.isFeatured,
      status: item.status,
      publishedDate: item.publishedDate,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditSchedule = (item: ChurchSchedule) => {
    setEditingScheduleId(usingStarterPreview ? null : item.id);
    setScheduleForm({
      title: item.title,
      category: item.category,
      dayLabel: item.dayLabel,
      eventDate: item.eventDate,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      speakerOrLead: item.speakerOrLead,
      description: item.description,
      isRecurring: item.isRecurring,
      status: item.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditPhoto = (item: GalleryPhoto) => {
    setEditingPhotoId(usingStarterPreview ? null : item.id);
    setPhotoForm({
      title: item.title,
      caption: item.caption,
      album: item.album,
      imageUrl: item.imageUrl,
      takenDate: item.takenDate,
      photographer: item.photographer,
      status: item.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!authReady) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-[#57534E]">
        Memeriksa sesi autentikasi...
      </div>
    );
  }

  // Gate 1: Not signed in
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="bg-white border border-[#E4DFD7] rounded-2xl p-8 sm:p-10 space-y-6">
          <div className="w-12 h-12 rounded-xl bg-[#1B3B6F]/10 text-[#1B3B6F] flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-semibold text-[#171614]">
              Panel Admin Buletin
            </h1>
            <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
              Masuk menggunakan akun Google pengurus SIB TOBURON yang terdaftar
              untuk menambah, mengubah, atau menerbitkan berita, jadwal kegiatan,
              dan galeri foto secara real-time ke seluruh perangkat jemaat.
            </p>
          </div>

          {feedback && (
            <div
              role="alert"
              className="p-4 rounded-xl text-sm bg-red-50 text-red-900 border border-red-200"
            >
              {feedback.text}
            </div>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={handleSignIn}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#1B3B6F] hover:bg-[#132B52] disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer min-h-[48px]"
          >
            <LogIn className="w-4 h-4" />
            {busy ? 'Menghubungkan ke Google...' : 'Masuk dengan Akun Google'}
          </button>
        </div>
      </div>
    );
  }

  // Gate 2: Signed in but not an authorized admin
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="bg-white border border-[#E4DFD7] rounded-2xl p-8 sm:p-10 space-y-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#171614]">
            Akses Khusus Pengurus Admin
          </h1>
          <p className="text-sm text-[#57534E] leading-relaxed">
            Anda masuk sebagai{' '}
            <strong className="text-[#171614]">{user.email}</strong>. Akun ini
            belum terdaftar sebagai pengelola Buletin SIB TOBURON. Jika Anda
            adalah pengurus gereja, serahkan UID berikut kepada admin utama
            untuk otorisasi:
          </p>
          <div className="p-3.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-xl font-mono text-xs text-[#171614] break-all">
            {user.uid}
          </div>
          <button
            type="button"
            onClick={() => void signOutAdmin()}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#E4DFD7] hover:bg-[#EFECE7] text-sm font-medium text-[#171614] rounded-lg transition-colors cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Keluar Akun
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Header */}
      <div className="pb-6 border-b border-[#E4DFD7] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-[#1B3B6F] mb-1">
            Manajemen Konten Real-Time
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#171614]">
            Panel Admin SIB TOBURON
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Masuk sebagai{' '}
            <strong className="text-[#171614]">
              {user.displayName || user.email}
            </strong>{' '}
            · Setiap perubahan langsung muncul di perangkat jemaat tanpa muat ulang.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void signOutAdmin()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E4DFD7] hover:border-[#171614] text-sm font-medium text-[#171614] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          Keluar Admin
        </button>
      </div>

      {/* Starter Seed Banner when Cloud Database is Empty */}
      {usingStarterPreview && (
        <div className="bg-white border border-[#1B3B6F]/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-semibold text-[#171614]">
              Aktifkan Data Awal Buletin di Cloud
            </h2>
            <p className="text-sm text-[#57534E]">
              Database cloud masih kosong sehingga jemaat melihat edisi contoh
              bawaan. Klik tombol di samping untuk menyimpan edisi awal ke
              Firestore agar Anda dapat langsung mengedit atau menghapusnya
              secara real-time.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={handleSeedCloud}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1B3B6F] hover:bg-[#132B52] disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[46px]"
          >
            <Database className="w-4 h-4" />
            {busy ? 'Menyimpan...' : 'Muat Data Awal ke Cloud'}
          </button>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-xl text-sm flex items-center gap-2.5 border ${
            feedback.type === 'success'
              ? 'bg-[#1B3B6F]/5 border-[#1B3B6F]/25 text-[#1B3B6F]'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div
        role="tablist"
        aria-label="Bagian manajemen konten"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'news'}
          onClick={() => setSubTab('news')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px] ${
            subTab === 'news'
              ? 'bg-[#1B3B6F] text-white'
              : 'bg-white border border-[#E4DFD7] text-[#57534E] hover:text-[#171614]'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          Berita ({news.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'schedules'}
          onClick={() => setSubTab('schedules')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px] ${
            subTab === 'schedules'
              ? 'bg-[#1B3B6F] text-white'
              : 'bg-white border border-[#E4DFD7] text-[#57534E] hover:text-[#171614]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Jadwal ({schedules.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'gallery'}
          onClick={() => setSubTab('gallery')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px] ${
            subTab === 'gallery'
              ? 'bg-[#1B3B6F] text-white'
              : 'bg-white border border-[#E4DFD7] text-[#57534E] hover:text-[#171614]'
          }`}
        >
          <Images className="w-4 h-4" />
          Galeri ({gallery.length})
        </button>

        {isBootstrappedAdmin && (
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'admins'}
            onClick={() => setSubTab('admins')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px] ${
              subTab === 'admins'
                ? 'bg-[#1B3B6F] text-white'
                : 'bg-white border border-[#E4DFD7] text-[#57534E] hover:text-[#171614]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Pengurus Admin ({admins.length})
          </button>
        )}
      </div>

      {/* TAB 1: NEWS MANAGEMENT */}
      {subTab === 'news' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSubmitNews}
            className="lg:col-span-5 bg-white border border-[#E4DFD7] rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E4DFD7]">
              <h2 className="font-serif text-xl font-semibold text-[#171614]">
                {editingNewsId ? 'Edit Berita' : 'Tambah Berita Baru'}
              </h2>
              {editingNewsId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNewsId(null);
                    setNewsForm({ ...DEFAULT_NEWS_FORM, publishedDate: todayIso() });
                  }}
                  className="text-xs font-medium text-[#57534E] hover:text-[#171614] cursor-pointer"
                >
                  Batal Edit
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Judul Berita
              </label>
              <input
                type="text"
                required
                minLength={SCHEMA_LIMITS.news.titleMin}
                maxLength={SCHEMA_LIMITS.news.titleMax}
                value={newsForm.title}
                onChange={(e) =>
                  setNewsForm({ ...newsForm, title: e.target.value })
                }
                placeholder="Contoh: Ibadah Syukur Awal Bulan Jemaat"
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm focus:outline-none focus:border-[#1B3B6F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171614]">
                  Kategori
                </label>
                <select
                  value={newsForm.category}
                  onChange={(e) =>
                    setNewsForm({
                      ...newsForm,
                      category: e.target.value as NewsInput['category'],
                    })
                  }
                  className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm focus:outline-none focus:border-[#1B3B6F]"
                >
                  {NEWS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171614]">
                  Tanggal Terbit
                </label>
                <input
                  type="date"
                  required
                  value={newsForm.publishedDate}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, publishedDate: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm font-mono focus:outline-none focus:border-[#1B3B6F]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Penerbit / Bidang Pelayanan
              </label>
              <input
                type="text"
                required
                minLength={SCHEMA_LIMITS.news.authorNameMin}
                maxLength={SCHEMA_LIMITS.news.authorNameMax}
                value={newsForm.authorName}
                onChange={(e) =>
                  setNewsForm({ ...newsForm, authorName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm focus:outline-none focus:border-[#1B3B6F]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Ringkasan Singkat ({newsForm.summary.length}/
                {SCHEMA_LIMITS.news.summaryMax})
              </label>
              <textarea
                required
                rows={2}
                minLength={SCHEMA_LIMITS.news.summaryMin}
                maxLength={SCHEMA_LIMITS.news.summaryMax}
                value={newsForm.summary}
                onChange={(e) =>
                  setNewsForm({ ...newsForm, summary: e.target.value })
                }
                placeholder="Ringkasan satu atau dua kalimat untuk kartu berita dan layar TV..."
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm focus:outline-none focus:border-[#1B3B6F]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Isi Berita Lengkap
              </label>
              <textarea
                required
                rows={5}
                minLength={SCHEMA_LIMITS.news.contentMin}
                maxLength={SCHEMA_LIMITS.news.contentMax}
                value={newsForm.content}
                onChange={(e) =>
                  setNewsForm({ ...newsForm, content: e.target.value })
                }
                placeholder="Tulis isi lengkap pengumuman atau renungan jemaat. Pisahkan paragraf dengan baris kosong."
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm focus:outline-none focus:border-[#1B3B6F]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#171614]">
                Gambar Ilustrasi (Pilih Koleksi Gereja atau URL HTTPS)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CHURCH_MEDIA_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() =>
                      setNewsForm({ ...newsForm, imageUrl: preset.url })
                    }
                    className={`rounded-lg overflow-hidden aspect-[4/3] border-2 transition-opacity cursor-pointer ${
                      newsForm.imageUrl === preset.url
                        ? 'border-[#1B3B6F] opacity-100'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    title={preset.label}
                  >
                    <SafeImage
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={newsForm.imageUrl}
                onChange={(e) =>
                  setNewsForm({ ...newsForm, imageUrl: e.target.value })
                }
                placeholder="https://... atau pilih foto di atas"
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-xs font-mono focus:outline-none focus:border-[#1B3B6F]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#171614] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsForm.isFeatured}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#1B3B6F]"
                />
                Jadikan Berita Utama
              </label>

              <select
                value={newsForm.status}
                onChange={(e) =>
                  setNewsForm({
                    ...newsForm,
                    status: e.target.value as NewsInput['status'],
                  })
                }
                aria-label="Status publikasi"
                className="px-3 py-1.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-xs font-medium"
              >
                <option value="published">Terbitkan Langsung</option>
                <option value="draft">Simpan sebagai Draf</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1B3B6F] hover:bg-[#132B52] disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer min-h-[46px]"
            >
              <Plus className="w-4 h-4" />
              {busy
                ? 'Menyimpan...'
                : editingNewsId
                  ? 'Simpan Perubahan Berita'
                  : 'Terbitkan Berita Sekarang'}
            </button>
          </form>

          {/* Existing News List */}
          <div className="lg:col-span-7 bg-white border border-[#E4DFD7] rounded-2xl divide-y divide-[#E4DFD7]">
            <div className="p-5 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-[#171614]">
                Daftar Berita ({news.length})
              </h2>
              <span className="text-xs text-[#57534E]">
                {usingStarterPreview ? 'Pratinjau Bawaan' : 'Tersinkronisasi Cloud'}
              </span>
            </div>

            {news.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-[#EFECE7] shrink-0">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
                      <span className="font-semibold text-[#1B3B6F]">
                        {item.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatIndonesianDate(item.publishedDate)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          item.status === 'published'
                            ? 'text-[#14532D] font-medium'
                            : 'text-[#8C692B] font-medium'
                        }
                      >
                        {item.status === 'published' ? 'Terbit' : 'Draf'}
                      </span>
                      {item.isFeatured && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-[#171614]">Utama</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-serif text-base font-semibold text-[#171614] truncate">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditNews(item)}
                    aria-label={`Edit ${item.title}`}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4DFD7] hover:border-[#1B3B6F] text-[#171614] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {!usingStarterPreview && (
                    <>
                      <button
                        type="button"
                        onClick={() => void toggleNewsFeatured(item)}
                        aria-label="Ubah status berita utama"
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4DFD7] hover:border-[#1B3B6F] cursor-pointer ${
                          item.isFeatured
                            ? 'text-[#8C692B] bg-[#EFECE7]'
                            : 'text-[#57534E]'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleNewsStatus(item)}
                        aria-label="Ubah status terbit"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4DFD7] hover:border-[#1B3B6F] text-[#57534E] cursor-pointer"
                      >
                        {item.status === 'published' ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteNews(item.id)}
                        aria-label={`Hapus ${item.title}`}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4DFD7] hover:border-red-600 text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULES MANAGEMENT */}
      {subTab === 'schedules' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSubmitSchedule}
            className="lg:col-span-5 bg-white border border-[#E4DFD7] rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E4DFD7]">
              <h2 className="font-serif text-xl font-semibold text-[#171614]">
                {editingScheduleId ? 'Edit Jadwal' : 'Tambah Jadwal Kegiatan'}
              </h2>
              {editingScheduleId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingScheduleId(null);
                    setScheduleForm({
                      ...DEFAULT_SCHEDULE_FORM,
                      eventDate: todayIso(),
                    });
                  }}
                  className="text-xs font-medium text-[#57534E] hover:text-[#171614] cursor-pointer"
                >
                  Batal Edit
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Nama Kegiatan
              </label>
              <input
                type="text"
                required
                minLength={SCHEMA_LIMITS.schedule.titleMin}
                maxLength={SCHEMA_LIMITS.schedule.titleMax}
                value={scheduleForm.title}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, title: e.target.value })
                }
                placeholder="Contoh: Ibadah Doa Syafaat Jemaat"
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm focus:outline-none focus:border-[#1B3B6F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171614]">
                  Kategori
                </label>
                <select
                  value={scheduleForm.category}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      category: e.target.value as ScheduleInput['category'],
                    })
                  }
                  className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm"
                >
                  {SCHEDULE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171614]">
                  Hari
                </label>
                <select
                  value={scheduleForm.dayLabel}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, dayLabel: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm"
                >
                  {DAY_LABELS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171614]">
                  Tanggal
                </label>
                <input
                  type="date"
                  required
                  value={scheduleForm.eventDate}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, eventDate: e.target.value })
                  }
                  className="w-full px-2.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171614]">
                  Mulai
                </label>
                <input
                  type="time"
                  required
                  value={scheduleForm.startTime}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, startTime: e.target.value })
                  }
                  className="w-full px-2.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171614]">
                  Selesai
                </label>
                <input
                  type="time"
                  required
                  value={scheduleForm.endTime}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, endTime: e.target.value })
                  }
                  className="w-full px-2.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Lokasi
              </label>
              <input
                type="text"
                required
                minLength={SCHEMA_LIMITS.schedule.locationMin}
                maxLength={SCHEMA_LIMITS.schedule.locationMax}
                value={scheduleForm.location}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, location: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Pengkhotbah / Koordinator
              </label>
              <input
                type="text"
                required
                minLength={SCHEMA_LIMITS.schedule.speakerMin}
                maxLength={SCHEMA_LIMITS.schedule.speakerMax}
                value={scheduleForm.speakerOrLead}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    speakerOrLead: e.target.value,
                  })
                }
                placeholder="Contoh: Pdt. Lukas Tingang"
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Keterangan Kegiatan
              </label>
              <textarea
                required
                rows={3}
                minLength={SCHEMA_LIMITS.schedule.descriptionMin}
                maxLength={SCHEMA_LIMITS.schedule.descriptionMax}
                value={scheduleForm.description}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    description: e.target.value,
                  })
                }
                placeholder="Informasi singkat persiapan dan catatan untuk jemaat..."
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#171614] cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleForm.isRecurring}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      isRecurring: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-[#1B3B6F]"
                />
                Kegiatan Rutin Mingguan
              </label>

              <select
                value={scheduleForm.status}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    status: e.target.value as ScheduleInput['status'],
                  })
                }
                aria-label="Status publikasi jadwal"
                className="px-3 py-1.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-xs font-medium"
              >
                <option value="published">Terbitkan Langsung</option>
                <option value="draft">Simpan sebagai Draf</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1B3B6F] hover:bg-[#132B52] disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer min-h-[46px]"
            >
              <Plus className="w-4 h-4" />
              {busy
                ? 'Menyimpan...'
                : editingScheduleId
                  ? 'Simpan Perubahan Jadwal'
                  : 'Tambahkan ke Jadwal'}
            </button>
          </form>

          {/* Existing Schedules List */}
          <div className="lg:col-span-7 bg-white border border-[#E4DFD7] rounded-2xl divide-y divide-[#E4DFD7]">
            <div className="p-5 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-[#171614]">
                Daftar Jadwal ({schedules.length})
              </h2>
              <span className="text-xs text-[#57534E]">
                {usingStarterPreview ? 'Pratinjau Bawaan' : 'Tersinkronisasi Cloud'}
              </span>
            </div>

            {schedules.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
                    <span className="font-semibold text-[#1B3B6F]">
                      {item.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-[#171614]">
                      {item.dayLabel}, {item.startTime}–{item.endTime}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        item.status === 'published'
                          ? 'text-[#14532D] font-medium'
                          : 'text-[#8C692B] font-medium'
                      }
                    >
                      {item.status === 'published' ? 'Terbit' : 'Draf'}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-[#171614] truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#57534E] truncate">
                    {item.location} · {item.speakerOrLead}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditSchedule(item)}
                    aria-label={`Edit ${item.title}`}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4DFD7] hover:border-[#1B3B6F] text-[#171614] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {!usingStarterPreview && (
                    <>
                      <button
                        type="button"
                        onClick={() => void toggleScheduleStatus(item)}
                        aria-label="Ubah status terbit jadwal"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4DFD7] hover:border-[#1B3B6F] text-[#57534E] cursor-pointer"
                      >
                        {item.status === 'published' ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteSchedule(item.id)}
                        aria-label={`Hapus ${item.title}`}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4DFD7] hover:border-red-600 text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GALLERY MANAGEMENT */}
      {subTab === 'gallery' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSubmitPhoto}
            className="lg:col-span-5 bg-white border border-[#E4DFD7] rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E4DFD7]">
              <h2 className="font-serif text-xl font-semibold text-[#171614]">
                {editingPhotoId ? 'Edit Foto Galeri' : 'Tambah Foto Galeri'}
              </h2>
              {editingPhotoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPhotoId(null);
                    setPhotoForm({ ...DEFAULT_PHOTO_FORM, takenDate: todayIso() });
                  }}
                  className="text-xs font-medium text-[#57534E] hover:text-[#171614] cursor-pointer"
                >
                  Batal Edit
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Judul Foto
              </label>
              <input
                type="text"
                required
                minLength={SCHEMA_LIMITS.gallery.titleMin}
                maxLength={SCHEMA_LIMITS.gallery.titleMax}
                value={photoForm.title}
                onChange={(e) =>
                  setPhotoForm({ ...photoForm, title: e.target.value })
                }
                placeholder="Contoh: Kebersamaan Ibadah Minggu Pagi"
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171614]">
                  Album
                </label>
                <select
                  value={photoForm.album}
                  onChange={(e) =>
                    setPhotoForm({
                      ...photoForm,
                      album: e.target.value as PhotoInput['album'],
                    })
                  }
                  className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm"
                >
                  {GALLERY_ALBUMS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#171614]">
                  Tanggal Foto
                </label>
                <input
                  type="date"
                  required
                  value={photoForm.takenDate}
                  onChange={(e) =>
                    setPhotoForm({ ...photoForm, takenDate: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Fotografer / Tim Dokumentasi
              </label>
              <input
                type="text"
                required
                minLength={SCHEMA_LIMITS.gallery.photographerMin}
                maxLength={SCHEMA_LIMITS.gallery.photographerMax}
                value={photoForm.photographer}
                onChange={(e) =>
                  setPhotoForm({ ...photoForm, photographer: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Keterangan / Cerita Foto
              </label>
              <textarea
                required
                rows={3}
                minLength={SCHEMA_LIMITS.gallery.captionMin}
                maxLength={SCHEMA_LIMITS.gallery.captionMax}
                value={photoForm.caption}
                onChange={(e) =>
                  setPhotoForm({ ...photoForm, caption: e.target.value })
                }
                placeholder="Ceritakan momen dalam foto ini..."
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#171614]">
                Pilih Gambar Bawaan atau Masukkan URL HTTPS
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CHURCH_MEDIA_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() =>
                      setPhotoForm({ ...photoForm, imageUrl: preset.url })
                    }
                    className={`rounded-lg overflow-hidden aspect-[4/3] border-2 transition-opacity cursor-pointer ${
                      photoForm.imageUrl === preset.url
                        ? 'border-[#1B3B6F] opacity-100'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    title={preset.label}
                  >
                    <SafeImage
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={photoForm.imageUrl}
                onChange={(e) =>
                  setPhotoForm({ ...photoForm, imageUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end">
              <select
                value={photoForm.status}
                onChange={(e) =>
                  setPhotoForm({
                    ...photoForm,
                    status: e.target.value as PhotoInput['status'],
                  })
                }
                aria-label="Status publikasi foto"
                className="px-3 py-1.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-xs font-medium"
              >
                <option value="published">Terbitkan Langsung</option>
                <option value="draft">Simpan sebagai Draf</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1B3B6F] hover:bg-[#132B52] disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer min-h-[46px]"
            >
              <Plus className="w-4 h-4" />
              {busy
                ? 'Menyimpan...'
                : editingPhotoId
                  ? 'Simpan Perubahan Foto'
                  : 'Tambahkan ke Galeri'}
            </button>
          </form>

          {/* Existing Gallery List */}
          <div className="lg:col-span-7 bg-white border border-[#E4DFD7] rounded-2xl divide-y divide-[#E4DFD7]">
            <div className="p-5 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-[#171614]">
                Daftar Foto ({gallery.length})
              </h2>
              <span className="text-xs text-[#57534E]">
                {usingStarterPreview ? 'Pratinjau Bawaan' : 'Tersinkronisasi Cloud'}
              </span>
            </div>

            {gallery.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-[#EFECE7] shrink-0">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
                      <span className="font-semibold text-[#1B3B6F]">
                        {item.album}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatIndonesianDate(item.takenDate)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          item.status === 'published'
                            ? 'text-[#14532D] font-medium'
                            : 'text-[#8C692B] font-medium'
                        }
                      >
                        {item.status === 'published' ? 'Terbit' : 'Draf'}
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-semibold text-[#171614] truncate">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditPhoto(item)}
                    aria-label={`Edit ${item.title}`}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4DFD7] hover:border-[#1B3B6F] text-[#171614] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {!usingStarterPreview && (
                    <>
                      <button
                        type="button"
                        onClick={() => void togglePhotoStatus(item)}
                        aria-label="Ubah status terbit foto"
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4DFD7] hover:border-[#1B3B6F] text-[#57534E] cursor-pointer"
                      >
                        {item.status === 'published' ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deletePhoto(item.id)}
                        aria-label={`Hapus ${item.title}`}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4DFD7] hover:border-red-600 text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DELEGATED ADMINS (Bootstrapped Admin Only) */}
      {subTab === 'admins' && isBootstrappedAdmin && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleAddAdmin}
            className="lg:col-span-5 bg-white border border-[#E4DFD7] rounded-2xl p-6 space-y-4"
          >
            <h2 className="font-serif text-xl font-semibold text-[#171614]">
              Tambah Pengurus Admin
            </h2>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Masukkan UID Firebase milik pengurus gereja yang sudah mencoba
              masuk di Panel Admin untuk memberikan hak kelola konten buletin.
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                UID Pengurus
              </label>
              <input
                type="text"
                required
                value={newAdminUid}
                onChange={(e) => setNewAdminUid(e.target.value)}
                placeholder="Contoh: xYz123AbC..."
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#171614]">
                Nama Pengurus / Bidang
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Contoh: Sekretariat Multimedia"
                className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E4DFD7] rounded-lg text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1B3B6F] hover:bg-[#132B52] text-white text-sm font-medium rounded-xl transition-colors cursor-pointer min-h-[46px]"
            >
              <UserPlus className="w-4 h-4" />
              Berikan Hak Admin
            </button>
          </form>

          <div className="lg:col-span-7 bg-white border border-[#E4DFD7] rounded-2xl divide-y divide-[#E4DFD7]">
            <div className="p-5">
              <h2 className="font-serif text-lg font-semibold text-[#171614]">
                Daftar Pengurus Admin Terdaftar
              </h2>
            </div>
            {admins.length === 0 ? (
              <div className="p-6 text-sm text-[#57534E]">
                Belum ada admin tambahan selain akun admin utama Anda.
              </div>
            ) : (
              admins.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-[#171614]">
                      {rec.displayName}
                    </div>
                    <div className="font-mono text-xs text-[#57534E] truncate">
                      {rec.id}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeAdminRecord(rec.id)}
                    aria-label={`Cabut akses ${rec.displayName}`}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4DFD7] hover:border-red-600 text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
