import {
  CHURCH_MEDIA_PRESETS,
  type ChurchSchedule,
  type GalleryPhoto,
  type NewsArticle,
  SCHEMA_LIMITS,
} from '../types/bulletin';

export const INITIAL_NEWS_ARTICLES: Omit<NewsArticle, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'warta-ibadah-syukur-november',
    title: 'Ibadah Syukur Akhir Tahun & Perjamuan Kudus Jemaat SIB TOBURON',
    summary:
      'Seluruh jemaat diundang hadir bersama keluarga dalam Ibadah Syukur dan Perjamuan Kudus hari Minggu ini di Gedung Utama SIB TOBURON, dilanjutkan dengan ramah tamah jemaat.',
    content:
      'Puji syukur kepada Tuhan atas penyertaan-Nya sepanjang tahun pelayanan ini bagi seluruh keluarga besar SIB TOBURON. Pada hari Minggu, 22 November 2026 pukul 08:30 WITA, kita akan melaksanakan Ibadah Syukur Bersama yang dirangkai dengan sakramen Perjamuan Kudus.\n\nPelayanan firman akan dibawakan oleh Pdt. Lukas Tingang dengan tema "Berakar dalam Kasih, Berbuah bagi Sesama" (Kolose 2:6-7). Tim Paduan Suara Gabungan Pemuda dan Kaum Ibu akan mempersembahkan pujian khusus pada sesi pembukaan dan persembahan syukur.\n\nJemaat diimbau hadir 15 menit sebelum ibadah dimulai untuk mempersiapkan hati dalam doa teduh. Bagi jemaat lansia yang memerlukan layanan antar-jemput di wilayah Toburon dan sekitarnya, silakan menghubungi koordinator diakonia masing-masing sektor sebelum hari Sabtu pukul 17:00.\n\nUsai ibadah, seluruh jemaat dipersilakan menikmati persekutuan ramah tamah di Balai Pertemuan Gereja. Kiranya sukacita dan damai sejahtera Kristus melingkupi setiap rumah tangga kita.',
    category: 'Warta Jemaat',
    imageUrl: CHURCH_MEDIA_PRESETS[0].url,
    authorName: 'Majelis & Sekretariat SIB TOBURON',
    authorUid: 'seed-admin',
    isFeatured: true,
    status: 'published',
    publishedDate: '2026-11-21',
  },
  {
    id: 'pelayanan-paduan-suara-adven',
    title: 'Latihan Gabungan Paduan Suara & Tim Musik Menyambut Masa Adven',
    summary:
      'Bidang Pujian dan Penyembahan membuka pendaftaran anggota baru untuk paduan suara gabungan serta latihan rutin setiap Kamis malam.',
    content:
      'Menyambut perayaan Masa Adven dan Natal SIB TOBURON tahun ini, Bidang Pujian dan Penyembahan mengundang seluruh jemaat — baik pemuda, kaum bapak, maupun kaum ibu — untuk mengambil bagian dalam Paduan Suara Gabungan.\n\nLatihan perdana akan berlangsung hari Kamis, 26 November 2026 pukul 19:00 di Ruang Ibadah Utama. Materi lagu mencakup pujian tradisional berbahasa Indonesia, Melayu, dan lagu pujian lokal Borneo yang diaransemen secara akustik dan vokal empat suara.\n\nTidak diperlukan pengalaman bernyanyi formal; yang utama adalah kerinduan melayani Tuhan dengan segenap hati. Partitur lagu dan rekaman panduan latihan akan dibagikan langsung oleh koordinator tim musik saat pertemuan pertama.',
    category: 'Pelayanan',
    imageUrl: CHURCH_MEDIA_PRESETS[1].url,
    authorName: 'Bidang Pujian & Penyembahan',
    authorUid: 'seed-admin',
    isFeatured: false,
    status: 'published',
    publishedDate: '2026-11-20',
  },
  {
    id: 'retret-pemuda-dataran-tinggi',
    title: 'Pendaftaran Retret Pemuda & Remaja "Terang di Tengah Generasi"',
    summary:
      'Persekutuan Pemuda SIB TOBURON akan mengadakan retret dua hari satu malam untuk pembinaan iman, kepemimpinan, dan kebersamaan generasi muda.',
    content:
      'Generasi muda SIB TOBURON dipanggil untuk bertumbuh dalam pengenalan akan firman Tuhan dan menjadi teladan dalam lingkungan sekolah, kampus, maupun tempat kerja. Oleh karena itu, Komisi Pemuda dan Remaja menyelenggarakan Retret Tahunan bertajuk "Terang di Tengah Generasi".\n\nKegiatan ini meliputi sesi pendalaman Alkitab interaktif, diskusi kelompok kecil di alam terbuka, malam penyembahan akustik, serta pelatihan pelayanan multimedia dan musik gereja.\n\nPendaftaran dibuka hingga 29 November 2026 di meja informasi gereja setiap selesai ibadah Minggu atau melalui koordinator pemuda sektor. Subsidi penuh tersedia bagi pelajar yang membutuhkan dukungan biaya.',
    category: 'Pengumuman',
    imageUrl: CHURCH_MEDIA_PRESETS[2].url,
    authorName: 'Komisi Pemuda & Remaja',
    authorUid: 'seed-admin',
    isFeatured: false,
    status: 'published',
    publishedDate: '2026-11-19',
  },
  {
    id: 'renungan-pekan-ketenangan-doa',
    title: 'Renungan Pekan Ini: Menemukan Damai di Tengah Kesibukan Harian',
    summary:
      'Refleksi singkat dari Mazmur 46:11 tentang pentingnya meluangkan waktu hening bersama Tuhan di awal hari sebelum memulai aktivitas.',
    content:
      '"Diamlah dan ketahuilah, bahwa Akulah Allah!" — Mazmur 46:11. Di tengah ritme pekerjaan, tanggung jawab keluarga, dan arus informasi yang tak pernah berhenti, hati kita sering kali terasa letih sebelum hari berakhir.\n\nAyat ini bukanlah ajakan untuk berhenti peduli, melainkan undangan untuk menaruh segala kekhawatiran kita di hadapan Tuhan yang memegang kendali atas hidup kita. Ketika kita menyediakan sepuluh menit yang tenang setiap pagi untuk membaca firman dan berdoa bersama keluarga, perspektif kita diperbarui.\n\nMari jadikan minggu ini sebagai langkah nyata membangun mezbah doa keluarga di rumah masing-masing. Tuhan setia menyertai langkah setiap jemaat SIB TOBURON.',
    category: 'Renungan',
    imageUrl: CHURCH_MEDIA_PRESETS[5].url,
    authorName: 'Pdt. Lukas Tingang',
    authorUid: 'seed-admin',
    isFeatured: false,
    status: 'published',
    publishedDate: '2026-11-18',
  },
];

export const INITIAL_SCHEDULES: Omit<ChurchSchedule, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'jadwal-ibadah-raya-minggu',
    title: 'Ibadah Raya Minggu & Perjamuan Kudus',
    category: 'Ibadah Raya',
    dayLabel: 'Minggu',
    eventDate: '2026-11-22',
    startTime: '08:30',
    endTime: '10:30',
    location: 'Gedung Ibadah Utama SIB TOBURON',
    speakerOrLead: 'Pdt. Lukas Tingang',
    description:
      'Ibadah raya mingguan seluruh jemaat disertai Perjamuan Kudus dan persembahan pujian Paduan Suara Gabungan.',
    isRecurring: true,
    status: 'published',
    authorUid: 'seed-admin',
  },
  {
    id: 'jadwal-sekolah-minggu',
    title: 'Sekolah Minggu & Kelas Kreatif Anak',
    category: 'Sekolah Minggu',
    dayLabel: 'Minggu',
    eventDate: '2026-11-22',
    startTime: '08:30',
    endTime: '10:00',
    location: 'Ruang Kelas Anak & Taman Baca',
    speakerOrLead: 'Ibu Martha & Tim Guru SM',
    description:
      'Cerita Alkitab bergambar, nyanyian pujian anak, dan aktivitas prakarya bertema ucapan syukur untuk usia 4–12 tahun.',
    isRecurring: true,
    status: 'published',
    authorUid: 'seed-admin',
  },
  {
    id: 'jadwal-doa-rabu-malam',
    title: 'Persekutuan Doa Syafaat & Pendalaman Alkitab',
    category: 'Doa & Pendalaman',
    dayLabel: 'Rabu',
    eventDate: '2026-11-25',
    startTime: '19:00',
    endTime: '20:30',
    location: 'Kapel Doa SIB TOBURON',
    speakerOrLead: 'Pnt. Daniel Banting',
    description:
      'Malam doa bersama mendoakan jemaat yang sakit, keluarga muda, pelayanan misi, serta pembahasan Kitab Kolose pasal 2.',
    isRecurring: true,
    status: 'published',
    authorUid: 'seed-admin',
  },
  {
    id: 'jadwal-latihan-musik-kamis',
    title: 'Latihan Gabungan Paduan Suara & Pemusik Adven',
    category: 'Ibadah Raya',
    dayLabel: 'Kamis',
    eventDate: '2026-11-26',
    startTime: '19:00',
    endTime: '21:00',
    location: 'Gedung Ibadah Utama SIB TOBURON',
    speakerOrLead: 'Sdr. Jonathan & Tim Pujian',
    description:
      'Persiapan pujian khusus dan aransemen vokal menyambut Ibadah Adven pertama serta perayaan Natal jemaat.',
    isRecurring: false,
    status: 'published',
    authorUid: 'seed-admin',
  },
  {
    id: 'jadwal-pemuda-sabtu-sore',
    title: 'Persekutuan Pemuda & Remaja (PMK)',
    category: 'Pemuda & Remaja',
    dayLabel: 'Sabtu',
    eventDate: '2026-11-28',
    startTime: '16:30',
    endTime: '18:30',
    location: 'Balai Pertemuan Pemuda',
    speakerOrLead: 'Sdr. Samuel & Sdri. Grace',
    description:
      'Pujian akustik, diskusi topik kehidupan remaja Kristen, dan persiapan teknis Retret Pemuda akhir tahun.',
    isRecurring: true,
    status: 'published',
    authorUid: 'seed-admin',
  },
  {
    id: 'jadwal-bakti-sosial-sabtu',
    title: 'Kunjungan Kasih & Pembagian Paket Sembako',
    category: 'Pelayanan Kasih',
    dayLabel: 'Sabtu',
    eventDate: '2026-11-28',
    startTime: '08:00',
    endTime: '11:30',
    location: 'Halaman Gereja & Kampung Toburon',
    speakerOrLead: 'Tim Diakonia SIB TOBURON',
    description:
      'Penyaluran 45 paket kebutuhan pokok dan kunjungan doa bagi warga lansia serta keluarga membutuhkan di sekitar Toburon.',
    isRecurring: false,
    status: 'published',
    authorUid: 'seed-admin',
  },
];

export const INITIAL_GALLERY_PHOTOS: Omit<GalleryPhoto, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'galeri-ibadah-pagi-sanctuary',
    title: 'Suasana Teduh Ibadah Minggu Pagi',
    caption:
      'Cahaya matahari pagi menyinari ruang ibadah utama SIB TOBURON saat jemaat bersama-sama mendengarkan pemberitaan firman Tuhan.',
    album: 'Ibadah Minggu',
    imageUrl: CHURCH_MEDIA_PRESETS[0].url,
    takenDate: '2026-11-15',
    photographer: 'Tim Multimedia SIB TOBURON',
    status: 'published',
    authorUid: 'seed-admin',
  },
  {
    id: 'galeri-paduan-suara-jemaat',
    title: 'Persembahan Pujian Paduan Suara Jemaat',
    caption:
      'Anggota paduan suara bersama pengiring gitar akustik mempersembahkan pujian syukur dalam kebaktian Minggu bersama.',
    album: 'Ibadah Minggu',
    imageUrl: CHURCH_MEDIA_PRESETS[1].url,
    takenDate: '2026-11-15',
    photographer: 'Sdr. Kevin L.',
    status: 'published',
    authorUid: 'seed-admin',
  },
  {
    id: 'galeri-persekutuan-pemuda-alam',
    title: 'Lingkar Pendalaman Alkitab Pemuda di Alam Terbuka',
    caption:
      'Kebersamaan pemuda SIB TOBURON dalam sesi berbagi kesaksian dan nyanyian pujian berlatar pegunungan pagi hari.',
    album: 'Persekutuan Pemuda',
    imageUrl: CHURCH_MEDIA_PRESETS[2].url,
    takenDate: '2026-11-08',
    photographer: 'Komisi Pemuda',
    status: 'published',
    authorUid: 'seed-admin',
  },
  {
    id: 'galeri-kreativitas-sekolah-minggu',
    title: 'Prakarya Syukur Anak-Anak Sekolah Minggu',
    caption:
      'Anak-anak dengan penuh sukacita mewarnai dan membuat karya kertas bertema ciptaan Tuhan bersama para guru Sekolah Minggu.',
    album: 'Sekolah Minggu',
    imageUrl: CHURCH_MEDIA_PRESETS[3].url,
    takenDate: '2026-11-15',
    photographer: 'Tim Guru Sekolah Minggu',
    status: 'published',
    authorUid: 'seed-admin',
  },
  {
    id: 'galeri-bakti-sosial-diakonia',
    title: 'Berbagi Keranjang Kasih Bersama Warga Kampung',
    caption:
      'Pelayanan Diakonia SIB TOBURON menyerahkan paket bahan pangan segar dan kebutuhan harian kepada warga sekitar dengan penuh keakraban.',
    album: 'Bakti Sosial',
    imageUrl: CHURCH_MEDIA_PRESETS[4].url,
    takenDate: '2026-11-07',
    photographer: 'Tim Diakonia',
    status: 'published',
    authorUid: 'seed-admin',
  },
  {
    id: 'galeri-malam-doa-lilin',
    title: 'Malam Doa Syafaat & Penyalaan Lilin Harapan',
    caption:
      'Jemaat berhimpun dalam keheningan doa malam, mengangkat syafaat bagi keluarga, gereja, dan kedamaian masyarakat.',
    album: 'Perayaan Khusus',
    imageUrl: CHURCH_MEDIA_PRESETS[5].url,
    takenDate: '2026-11-04',
    photographer: 'Tim Multimedia SIB TOBURON',
    status: 'published',
    authorUid: 'seed-admin',
  },
];

export function formatIndonesianDate(isoDate: string): string {
  if (!SCHEMA_LIMITS.patterns.date.test(isoDate)) return isoDate;
  const [y, m, d] = isoDate.split('-').map(Number);
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return `${d} ${months[(m - 1) % 12]} ${y}`;
}

export function estimateReadMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export function generateSafeDocId(prefix: string): string {
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'doc';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${cleanPrefix}-${Date.now()}-${rand}`;
}

export function clampString(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}
