import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  SCHEMA_LIMITS,
  type AdminRecord,
  type ChurchSchedule,
  type GalleryPhoto,
  type NewsArticle,
  type PublishStatus,
} from '../types/bulletin';
import {
  clampString,
  generateSafeDocId,
  INITIAL_GALLERY_PHOTOS,
  INITIAL_NEWS_ARTICLES,
  INITIAL_SCHEDULES,
} from '../data/seedBulletin';

export type NewsInput = Omit<
  NewsArticle,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>;

export type ScheduleInput = Omit<
  ChurchSchedule,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>;

export type PhotoInput = Omit<
  GalleryPhoto,
  'id' | 'authorUid' | 'createdAt' | 'updatedAt'
>;

interface BulletinContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  isBootstrappedAdmin: boolean;
  isLoadingData: boolean;
  usingStarterPreview: boolean;
  news: NewsArticle[];
  schedules: ChurchSchedule[];
  gallery: GalleryPhoto[];
  admins: AdminRecord[];
  realtimeNotice: string | null;
  clearRealtimeNotice: () => void;
  signInWithGoogle: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
  saveNews: (input: NewsInput, existingId?: string) => Promise<void>;
  toggleNewsStatus: (item: NewsArticle) => Promise<void>;
  toggleNewsFeatured: (item: NewsArticle) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  saveSchedule: (input: ScheduleInput, existingId?: string) => Promise<void>;
  toggleScheduleStatus: (item: ChurchSchedule) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  savePhoto: (input: PhotoInput, existingId?: string) => Promise<void>;
  togglePhotoStatus: (item: GalleryPhoto) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  addAdminRecord: (uid: string, displayName: string) => Promise<void>;
  removeAdminRecord: (uid: string) => Promise<void>;
  seedInitialDataToCloud: () => Promise<void>;
}

const BulletinContext = createContext<BulletinContextValue | null>(null);

function sortNews(items: NewsArticle[]): NewsArticle[] {
  return [...items].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return b.publishedDate.localeCompare(a.publishedDate);
  });
}

function sortSchedules(items: ChurchSchedule[]): ChurchSchedule[] {
  return [...items].sort((a, b) => {
    const dateDiff = a.eventDate.localeCompare(b.eventDate);
    if (dateDiff !== 0) return dateDiff;
    return a.startTime.localeCompare(b.startTime);
  });
}

function sortGallery(items: GalleryPhoto[]): GalleryPhoto[] {
  return [...items].sort((a, b) => b.takenDate.localeCompare(a.takenDate));
}

export function BulletinProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isDelegatedAdmin, setIsDelegatedAdmin] = useState(false);

  const [cloudNews, setCloudNews] = useState<NewsArticle[]>([]);
  const [cloudSchedules, setCloudSchedules] = useState<ChurchSchedule[]>([]);
  const [cloudGallery, setCloudGallery] = useState<GalleryPhoto[]>([]);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);

  const [newsLoaded, setNewsLoaded] = useState(false);
  const [schedulesLoaded, setSchedulesLoaded] = useState(false);
  const [galleryLoaded, setGalleryLoaded] = useState(false);

  const [realtimeNotice, setRealtimeNotice] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const newsInitRef = useRef(false);
  const schedulesInitRef = useRef(false);
  const galleryInitRef = useRef(false);
  const noticeTimerRef = useRef<number | null>(null);

  if (fatalError) {
    throw fatalError;
  }

  const showNotice = useCallback((message: string) => {
    setRealtimeNotice(message);
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setRealtimeNotice(null);
    }, 4500);
  }, []);

  const clearRealtimeNotice = useCallback(() => {
    setRealtimeNotice(null);
  }, []);

  const isBootstrappedAdmin = Boolean(
    user &&
      user.emailVerified &&
      user.email &&
      user.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL,
  );

  const isAdmin = isBootstrappedAdmin || isDelegatedAdmin;

  // Auth listener + delegated admin lookup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser && nextUser.emailVerified) {
        const emailMatch =
          nextUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL;
        if (emailMatch) {
          setIsDelegatedAdmin(false);
          setAuthReady(true);
          return;
        }
        try {
          const adminDoc = await getDoc(doc(db, 'admins', nextUser.uid));
          setIsDelegatedAdmin(adminDoc.exists());
        } catch (error) {
          console.warn('Admin role check skipped:', error);
          setIsDelegatedAdmin(false);
        }
      } else {
        setIsDelegatedAdmin(false);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore subscriptions for news, schedules, gallery
  useEffect(() => {
    if (!authReady) return;

    newsInitRef.current = false;
    schedulesInitRef.current = false;
    galleryInitRef.current = false;

    const unsubscribers: Array<() => void> = [];

    if (isBootstrappedAdmin) {
      unsubscribers.push(
        onSnapshot(
          collection(db, 'news'),
          (snapshot) => {
            const list = snapshot.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as NewsArticle,
            );
            setCloudNews(sortNews(list));
            setNewsLoaded(true);
            if (newsInitRef.current && snapshot.docChanges().length > 0) {
              showNotice('Berita jemaat diperbarui secara otomatis.');
            }
            newsInitRef.current = true;
          },
          (error) => {
            try {
              handleFirestoreError(error, OperationType.LIST, 'news');
            } catch (e) {
              setFatalError(e as Error);
            }
          },
        ),
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'schedules'),
          (snapshot) => {
            const list = snapshot.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as ChurchSchedule,
            );
            setCloudSchedules(sortSchedules(list));
            setSchedulesLoaded(true);
            if (schedulesInitRef.current && snapshot.docChanges().length > 0) {
              showNotice('Jadwal kegiatan diperbarui secara otomatis.');
            }
            schedulesInitRef.current = true;
          },
          (error) => {
            try {
              handleFirestoreError(error, OperationType.LIST, 'schedules');
            } catch (e) {
              setFatalError(e as Error);
            }
          },
        ),
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'gallery'),
          (snapshot) => {
            const list = snapshot.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as GalleryPhoto,
            );
            setCloudGallery(sortGallery(list));
            setGalleryLoaded(true);
            if (galleryInitRef.current && snapshot.docChanges().length > 0) {
              showNotice('Galeri foto diperbarui secara otomatis.');
            }
            galleryInitRef.current = true;
          },
          (error) => {
            try {
              handleFirestoreError(error, OperationType.LIST, 'gallery');
            } catch (e) {
              setFatalError(e as Error);
            }
          },
        ),
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'admins'),
          (snapshot) => {
            const list = snapshot.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as AdminRecord,
            );
            setAdmins(list);
          },
          (error) => {
            try {
              handleFirestoreError(error, OperationType.LIST, 'admins');
            } catch (e) {
              setFatalError(e as Error);
            }
          },
        ),
      );
    } else {
      // Congregation or delegated admin: subscribe to published documents in real time
      const publishedNewsRef = query(
        collection(db, 'news'),
        where('status', '==', 'published'),
      );
      const publishedSchedulesRef = query(
        collection(db, 'schedules'),
        where('status', '==', 'published'),
      );
      const publishedGalleryRef = query(
        collection(db, 'gallery'),
        where('status', '==', 'published'),
      );

      let pubNews: NewsArticle[] = [];
      let ownNews: NewsArticle[] = [];
      let pubSchedules: ChurchSchedule[] = [];
      let ownSchedules: ChurchSchedule[] = [];
      let pubGallery: GalleryPhoto[] = [];
      let ownGallery: GalleryPhoto[] = [];

      const mergeById = <T extends { id: string }>(a: T[], b: T[]): T[] => {
        const map = new Map<string, T>();
        a.forEach((item) => map.set(item.id, item));
        b.forEach((item) => map.set(item.id, item));
        return Array.from(map.values());
      };

      unsubscribers.push(
        onSnapshot(
          publishedNewsRef,
          (snapshot) => {
            pubNews = snapshot.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as NewsArticle,
            );
            setCloudNews(sortNews(mergeById(pubNews, ownNews)));
            setNewsLoaded(true);
            if (newsInitRef.current && snapshot.docChanges().length > 0) {
              showNotice('Berita terbaru SIB TOBURON baru saja diperbarui.');
            }
            newsInitRef.current = true;
          },
          (error) => {
            try {
              handleFirestoreError(error, OperationType.LIST, 'news');
            } catch (e) {
              setFatalError(e as Error);
            }
          },
        ),
      );

      unsubscribers.push(
        onSnapshot(
          publishedSchedulesRef,
          (snapshot) => {
            pubSchedules = snapshot.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as ChurchSchedule,
            );
            setCloudSchedules(sortSchedules(mergeById(pubSchedules, ownSchedules)));
            setSchedulesLoaded(true);
            if (schedulesInitRef.current && snapshot.docChanges().length > 0) {
              showNotice('Jadwal kegiatan gereja baru saja diperbarui.');
            }
            schedulesInitRef.current = true;
          },
          (error) => {
            try {
              handleFirestoreError(error, OperationType.LIST, 'schedules');
            } catch (e) {
              setFatalError(e as Error);
            }
          },
        ),
      );

      unsubscribers.push(
        onSnapshot(
          publishedGalleryRef,
          (snapshot) => {
            pubGallery = snapshot.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as GalleryPhoto,
            );
            setCloudGallery(sortGallery(mergeById(pubGallery, ownGallery)));
            setGalleryLoaded(true);
            if (galleryInitRef.current && snapshot.docChanges().length > 0) {
              showNotice('Galeri foto jemaat baru saja diperbarui.');
            }
            galleryInitRef.current = true;
          },
          (error) => {
            try {
              handleFirestoreError(error, OperationType.LIST, 'gallery');
            } catch (e) {
              setFatalError(e as Error);
            }
          },
        ),
      );

      if (isDelegatedAdmin && user) {
        unsubscribers.push(
          onSnapshot(
            query(collection(db, 'news'), where('authorUid', '==', user.uid)),
            (snapshot) => {
              ownNews = snapshot.docs.map(
                (d) => ({ id: d.id, ...d.data() }) as NewsArticle,
              );
              setCloudNews(sortNews(mergeById(pubNews, ownNews)));
            },
            (error) => {
              try {
                handleFirestoreError(error, OperationType.LIST, 'news');
              } catch (e) {
                setFatalError(e as Error);
              }
            },
          ),
        );
        unsubscribers.push(
          onSnapshot(
            query(collection(db, 'schedules'), where('authorUid', '==', user.uid)),
            (snapshot) => {
              ownSchedules = snapshot.docs.map(
                (d) => ({ id: d.id, ...d.data() }) as ChurchSchedule,
              );
              setCloudSchedules(sortSchedules(mergeById(pubSchedules, ownSchedules)));
            },
            (error) => {
              try {
                handleFirestoreError(error, OperationType.LIST, 'schedules');
              } catch (e) {
                setFatalError(e as Error);
              }
            },
          ),
        );
        unsubscribers.push(
          onSnapshot(
            query(collection(db, 'gallery'), where('authorUid', '==', user.uid)),
            (snapshot) => {
              ownGallery = snapshot.docs.map(
                (d) => ({ id: d.id, ...d.data() }) as GalleryPhoto,
              );
              setCloudGallery(sortGallery(mergeById(pubGallery, ownGallery)));
            },
            (error) => {
              try {
                handleFirestoreError(error, OperationType.LIST, 'gallery');
              } catch (e) {
                setFatalError(e as Error);
              }
            },
          ),
        );
      }
      setAdmins([]);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [authReady, isBootstrappedAdmin, isDelegatedAdmin, user, showNotice]);

  const isLoadingData = !authReady || !newsLoaded || !schedulesLoaded || !galleryLoaded;

  const hasAnyCloudData =
    cloudNews.length > 0 || cloudSchedules.length > 0 || cloudGallery.length > 0;

  const usingStarterPreview = !isLoadingData && !hasAnyCloudData;

  const news = useMemo<NewsArticle[]>(() => {
    if (usingStarterPreview) {
      return sortNews(INITIAL_NEWS_ARTICLES as NewsArticle[]);
    }
    return cloudNews;
  }, [usingStarterPreview, cloudNews]);

  const schedules = useMemo<ChurchSchedule[]>(() => {
    if (usingStarterPreview) {
      return sortSchedules(INITIAL_SCHEDULES as ChurchSchedule[]);
    }
    return cloudSchedules;
  }, [usingStarterPreview, cloudSchedules]);

  const gallery = useMemo<GalleryPhoto[]>(() => {
    if (usingStarterPreview) {
      return sortGallery(INITIAL_GALLERY_PHOTOS as GalleryPhoto[]);
    }
    return cloudGallery;
  }, [usingStarterPreview, cloudGallery]);

  // Auth actions
  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOutAdmin = useCallback(async () => {
    await signOut(auth);
  }, []);

  // Defensive sanitization & validation synchronized with firebase-blueprint.json
  const saveNews = useCallback(
    async (input: NewsInput, existingId?: string) => {
      if (!user || !isAdmin) {
        throw new Error('Hanya admin terverifikasi yang dapat menyimpan berita.');
      }

      const sanitized = {
        title: clampString(input.title, SCHEMA_LIMITS.news.titleMax),
        summary: clampString(input.summary, SCHEMA_LIMITS.news.summaryMax),
        content: clampString(input.content, SCHEMA_LIMITS.news.contentMax),
        category: input.category,
        imageUrl: clampString(input.imageUrl, SCHEMA_LIMITS.news.imageUrlMax),
        authorName: clampString(
          input.authorName,
          SCHEMA_LIMITS.news.authorNameMax,
        ),
        isFeatured: Boolean(input.isFeatured),
        status: input.status,
        publishedDate: input.publishedDate.trim(),
      };

      if (sanitized.title.length < SCHEMA_LIMITS.news.titleMin) {
        throw new Error('Judul berita minimal 3 karakter.');
      }
      if (sanitized.summary.length < SCHEMA_LIMITS.news.summaryMin) {
        throw new Error('Ringkasan berita minimal 10 karakter.');
      }
      if (sanitized.content.length < SCHEMA_LIMITS.news.contentMin) {
        throw new Error('Isi berita minimal 20 karakter.');
      }
      if (!SCHEMA_LIMITS.patterns.imageUrl.test(sanitized.imageUrl)) {
        throw new Error('URL gambar harus diawali https:// atau pilih gambar bawaan.');
      }
      if (!SCHEMA_LIMITS.patterns.date.test(sanitized.publishedDate)) {
        throw new Error('Format tanggal terbit harus YYYY-MM-DD.');
      }

      const targetId = existingId || generateSafeDocId('news');
      const docRef = doc(db, 'news', targetId);
      const path = `news/${targetId}`;

      try {
        if (existingId) {
          await updateDoc(docRef, {
            ...sanitized,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(docRef, {
            ...sanitized,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(
          error,
          existingId ? OperationType.UPDATE : OperationType.CREATE,
          path,
        );
      }
    },
    [user, isAdmin],
  );

  const toggleNewsStatus = useCallback(
    async (item: NewsArticle) => {
      if (!user || !isAdmin) return;
      const nextStatus: PublishStatus =
        item.status === 'published' ? 'draft' : 'published';
      const path = `news/${item.id}`;
      try {
        await updateDoc(doc(db, 'news', item.id), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [user, isAdmin],
  );

  const toggleNewsFeatured = useCallback(
    async (item: NewsArticle) => {
      if (!user || !isAdmin) return;
      const path = `news/${item.id}`;
      try {
        await updateDoc(doc(db, 'news', item.id), {
          isFeatured: !item.isFeatured,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [user, isAdmin],
  );

  const deleteNews = useCallback(
    async (id: string) => {
      if (!user || !isAdmin) return;
      const path = `news/${id}`;
      try {
        await deleteDoc(doc(db, 'news', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user, isAdmin],
  );

  const saveSchedule = useCallback(
    async (input: ScheduleInput, existingId?: string) => {
      if (!user || !isAdmin) {
        throw new Error('Hanya admin terverifikasi yang dapat menyimpan jadwal.');
      }

      const sanitized = {
        title: clampString(input.title, SCHEMA_LIMITS.schedule.titleMax),
        category: input.category,
        dayLabel: clampString(input.dayLabel, SCHEMA_LIMITS.schedule.dayLabelMax),
        eventDate: input.eventDate.trim(),
        startTime: input.startTime.trim(),
        endTime: input.endTime.trim(),
        location: clampString(input.location, SCHEMA_LIMITS.schedule.locationMax),
        speakerOrLead: clampString(
          input.speakerOrLead,
          SCHEMA_LIMITS.schedule.speakerMax,
        ),
        description: clampString(
          input.description,
          SCHEMA_LIMITS.schedule.descriptionMax,
        ),
        isRecurring: Boolean(input.isRecurring),
        status: input.status,
      };

      if (sanitized.title.length < SCHEMA_LIMITS.schedule.titleMin) {
        throw new Error('Nama kegiatan minimal 3 karakter.');
      }
      if (!SCHEMA_LIMITS.patterns.date.test(sanitized.eventDate)) {
        throw new Error('Format tanggal kegiatan harus YYYY-MM-DD.');
      }
      if (
        !SCHEMA_LIMITS.patterns.time.test(sanitized.startTime) ||
        !SCHEMA_LIMITS.patterns.time.test(sanitized.endTime)
      ) {
        throw new Error('Format waktu mulai & selesai harus HH:mm.');
      }
      if (sanitized.description.length < SCHEMA_LIMITS.schedule.descriptionMin) {
        throw new Error('Keterangan kegiatan minimal 5 karakter.');
      }

      const targetId = existingId || generateSafeDocId('sched');
      const docRef = doc(db, 'schedules', targetId);
      const path = `schedules/${targetId}`;

      try {
        if (existingId) {
          await updateDoc(docRef, {
            ...sanitized,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(docRef, {
            ...sanitized,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(
          error,
          existingId ? OperationType.UPDATE : OperationType.CREATE,
          path,
        );
      }
    },
    [user, isAdmin],
  );

  const toggleScheduleStatus = useCallback(
    async (item: ChurchSchedule) => {
      if (!user || !isAdmin) return;
      const nextStatus: PublishStatus =
        item.status === 'published' ? 'draft' : 'published';
      const path = `schedules/${item.id}`;
      try {
        await updateDoc(doc(db, 'schedules', item.id), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [user, isAdmin],
  );

  const deleteSchedule = useCallback(
    async (id: string) => {
      if (!user || !isAdmin) return;
      const path = `schedules/${id}`;
      try {
        await deleteDoc(doc(db, 'schedules', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user, isAdmin],
  );

  const savePhoto = useCallback(
    async (input: PhotoInput, existingId?: string) => {
      if (!user || !isAdmin) {
        throw new Error('Hanya admin terverifikasi yang dapat menyimpan foto.');
      }

      const sanitized = {
        title: clampString(input.title, SCHEMA_LIMITS.gallery.titleMax),
        caption: clampString(input.caption, SCHEMA_LIMITS.gallery.captionMax),
        album: input.album,
        imageUrl: clampString(input.imageUrl, SCHEMA_LIMITS.gallery.imageUrlMax),
        takenDate: input.takenDate.trim(),
        photographer: clampString(
          input.photographer,
          SCHEMA_LIMITS.gallery.photographerMax,
        ),
        status: input.status,
      };

      if (sanitized.title.length < SCHEMA_LIMITS.gallery.titleMin) {
        throw new Error('Judul foto minimal 3 karakter.');
      }
      if (sanitized.caption.length < SCHEMA_LIMITS.gallery.captionMin) {
        throw new Error('Keterangan foto minimal 5 karakter.');
      }
      if (!SCHEMA_LIMITS.patterns.imageUrl.test(sanitized.imageUrl)) {
        throw new Error('URL foto harus diawali https:// atau pilih gambar bawaan.');
      }
      if (!SCHEMA_LIMITS.patterns.date.test(sanitized.takenDate)) {
        throw new Error('Format tanggal foto harus YYYY-MM-DD.');
      }

      const targetId = existingId || generateSafeDocId('photo');
      const docRef = doc(db, 'gallery', targetId);
      const path = `gallery/${targetId}`;

      try {
        if (existingId) {
          await updateDoc(docRef, {
            ...sanitized,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(docRef, {
            ...sanitized,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(
          error,
          existingId ? OperationType.UPDATE : OperationType.CREATE,
          path,
        );
      }
    },
    [user, isAdmin],
  );

  const togglePhotoStatus = useCallback(
    async (item: GalleryPhoto) => {
      if (!user || !isAdmin) return;
      const nextStatus: PublishStatus =
        item.status === 'published' ? 'draft' : 'published';
      const path = `gallery/${item.id}`;
      try {
        await updateDoc(doc(db, 'gallery', item.id), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [user, isAdmin],
  );

  const deletePhoto = useCallback(
    async (id: string) => {
      if (!user || !isAdmin) return;
      const path = `gallery/${id}`;
      try {
        await deleteDoc(doc(db, 'gallery', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user, isAdmin],
  );

  const addAdminRecord = useCallback(
    async (uid: string, displayName: string) => {
      if (!user || !isAdmin) return;
      const cleanUid = uid.trim();
      const cleanName = clampString(displayName, SCHEMA_LIMITS.admin.displayNameMax);
      if (!SCHEMA_LIMITS.patterns.id.test(cleanUid)) {
        throw new Error('Format UID tidak valid (hanya huruf, angka, - dan _).');
      }
      if (cleanName.length < SCHEMA_LIMITS.admin.displayNameMin) {
        throw new Error('Nama pengurus minimal 2 karakter.');
      }
      const path = `admins/${cleanUid}`;
      try {
        await setDoc(doc(db, 'admins', cleanUid), {
          displayName: cleanName,
          role: 'admin',
          addedByUid: user.uid,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [user, isAdmin],
  );

  const removeAdminRecord = useCallback(
    async (uid: string) => {
      if (!user || !isAdmin) return;
      const path = `admins/${uid}`;
      try {
        await deleteDoc(doc(db, 'admins', uid));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user, isAdmin],
  );

  const seedInitialDataToCloud = useCallback(async () => {
    if (!user || !isAdmin) {
      throw new Error('Silakan masuk sebagai admin terlebih dahulu.');
    }
    const batch = writeBatch(db);

    for (const article of INITIAL_NEWS_ARTICLES) {
      const { id, ...rest } = article;
      batch.set(doc(db, 'news', id), {
        ...rest,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const sched of INITIAL_SCHEDULES) {
      const { id, ...rest } = sched;
      batch.set(doc(db, 'schedules', id), {
        ...rest,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const photo of INITIAL_GALLERY_PHOTOS) {
      const { id, ...rest } = photo;
      batch.set(doc(db, 'gallery', id), {
        ...rest,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    try {
      await batch.commit();
      showNotice('Data awal Buletin SIB TOBURON berhasil dimuat ke Cloud.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch/seed');
    }
  }, [user, isAdmin, showNotice]);

  const value = useMemo<BulletinContextValue>(
    () => ({
      user,
      authReady,
      isAdmin,
      isBootstrappedAdmin,
      isLoadingData,
      usingStarterPreview,
      news,
      schedules,
      gallery,
      admins,
      realtimeNotice,
      clearRealtimeNotice,
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
    }),
    [
      user,
      authReady,
      isAdmin,
      isBootstrappedAdmin,
      isLoadingData,
      usingStarterPreview,
      news,
      schedules,
      gallery,
      admins,
      realtimeNotice,
      clearRealtimeNotice,
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
    ],
  );

  return (
    <BulletinContext.Provider value={value}>
      {children}
    </BulletinContext.Provider>
  );
}

export function useBulletin(): BulletinContextValue {
  const ctx = useContext(BulletinContext);
  if (!ctx) {
    throw new Error('useBulletin must be used inside BulletinProvider');
  }
  return ctx;
}
