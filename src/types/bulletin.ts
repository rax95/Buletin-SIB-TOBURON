import type { Timestamp } from 'firebase/firestore';

export type TabKey = 'home' | 'news' | 'schedules' | 'gallery' | 'admin';

export type PublishStatus = 'published' | 'draft';

export type NewsCategory = 'Warta Jemaat' | 'Pengumuman' | 'Pelayanan' | 'Renungan';

export type ScheduleCategory =
  | 'Ibadah Raya'
  | 'Doa & Pendalaman'
  | 'Pemuda & Remaja'
  | 'Sekolah Minggu'
  | 'Pelayanan Kasih';

export type GalleryAlbum =
  | 'Ibadah Minggu'
  | 'Persekutuan Pemuda'
  | 'Sekolah Minggu'
  | 'Bakti Sosial'
  | 'Perayaan Khusus';

export const NEWS_CATEGORIES: NewsCategory[] = [
  'Warta Jemaat',
  'Pengumuman',
  'Pelayanan',
  'Renungan',
];

export const SCHEDULE_CATEGORIES: ScheduleCategory[] = [
  'Ibadah Raya',
  'Doa & Pendalaman',
  'Pemuda & Remaja',
  'Sekolah Minggu',
  'Pelayanan Kasih',
];

export const GALLERY_ALBUMS: GalleryAlbum[] = [
  'Ibadah Minggu',
  'Persekutuan Pemuda',
  'Sekolah Minggu',
  'Bakti Sosial',
  'Perayaan Khusus',
];

export const DAY_LABELS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  imageUrl: string;
  authorName: string;
  authorUid: string;
  isFeatured: boolean;
  status: PublishStatus;
  publishedDate: string; // YYYY-MM-DD
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface ChurchSchedule {
  id: string;
  title: string;
  category: ScheduleCategory;
  dayLabel: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  speakerOrLead: string;
  description: string;
  isRecurring: boolean;
  status: PublishStatus;
  authorUid: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  album: GalleryAlbum;
  imageUrl: string;
  takenDate: string; // YYYY-MM-DD
  photographer: string;
  status: PublishStatus;
  authorUid: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface AdminRecord {
  id: string; // adminUid
  displayName: string;
  role: 'admin';
  addedByUid: string;
  createdAt?: Timestamp | null;
}

// Validation constants mirrored verbatim from firebase-blueprint.json
export const SCHEMA_LIMITS = {
  news: {
    titleMin: 3,
    titleMax: 140,
    summaryMin: 10,
    summaryMax: 320,
    contentMin: 20,
    contentMax: 8000,
    authorNameMin: 2,
    authorNameMax: 80,
    imageUrlMax: 1000,
  },
  schedule: {
    titleMin: 3,
    titleMax: 120,
    dayLabelMin: 3,
    dayLabelMax: 30,
    locationMin: 2,
    locationMax: 120,
    speakerMin: 2,
    speakerMax: 100,
    descriptionMin: 5,
    descriptionMax: 1000,
  },
  gallery: {
    titleMin: 3,
    titleMax: 120,
    captionMin: 5,
    captionMax: 500,
    photographerMin: 2,
    photographerMax: 80,
    imageUrlMax: 1000,
  },
  admin: {
    displayNameMin: 2,
    displayNameMax: 80,
  },
  patterns: {
    id: /^[a-zA-Z0-9_-]+$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    time: /^\d{2}:\d{2}$/,
    imageUrl: /^(\/src\/assets\/images\/|https:\/\/).+$/,
  },
} as const;

export const CHURCH_MEDIA_PRESETS = [
  {
    label: 'Gedung Ibadah Utama SIB TOBURON',
    url: '/src/assets/images/hero_sanctuary_worship_1795257467656.jpg',
  },
  {
    label: 'Paduan Suara & Tim Pujian',
    url: '/src/assets/images/news_fellowship_choir_1795257464041.jpg',
  },
  {
    label: 'Retret Pemuda Dataran Tinggi',
    url: '/src/assets/images/news_youth_retreat_1795257452346.jpg',
  },
  {
    label: 'Kelas Kreatif Sekolah Minggu',
    url: '/src/assets/images/gallery_sunday_school_1795257452393.jpg',
  },
  {
    label: 'Pelayanan Bakti Sosial & Kasih',
    url: '/src/assets/images/gallery_charity_outreach_1795257468310.jpg',
  },
  {
    label: 'Malam Doa & Penyembahan Lilin',
    url: '/src/assets/images/gallery_candlelight_prayer_1795257436442.jpg',
  },
] as const;

export const BOOTSTRAPPED_ADMIN_EMAIL = 'raxxon47@gmail.com';
