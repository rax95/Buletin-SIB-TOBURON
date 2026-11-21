import { useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  Clock,
  Copy,
  MapPin,
  Repeat,
  User,
  X,
} from 'lucide-react';
import { useBulletin } from '../context/BulletinContext';
import { formatIndonesianDate } from '../data/seedBulletin';
import {
  DAY_LABELS,
  SCHEDULE_CATEGORIES,
  type ChurchSchedule,
  type ScheduleCategory,
} from '../types/bulletin';

interface ScheduleViewProps {
  selectedSchedule: ChurchSchedule | null;
  onSelectSchedule: (schedule: ChurchSchedule | null) => void;
}

export function ScheduleView({
  selectedSchedule,
  onSelectSchedule,
}: ScheduleViewProps) {
  const { schedules } = useBulletin();
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | ScheduleCategory>(
    'Semua',
  );
  const [dayFilter, setDayFilter] = useState<'Semua' | string>('Semua');

  const publishedSchedules = useMemo(
    () => schedules.filter((item) => item.status === 'published'),
    [schedules],
  );

  const availableDays = useMemo(() => {
    const present = new Set(publishedSchedules.map((s) => s.dayLabel));
    return DAY_LABELS.filter((d) => present.has(d));
  }, [publishedSchedules]);

  const filteredSchedules = useMemo(() => {
    return publishedSchedules.filter((item) => {
      if (categoryFilter !== 'Semua' && item.category !== categoryFilter) {
        return false;
      }
      if (dayFilter !== 'Semua' && item.dayLabel !== dayFilter) {
        return false;
      }
      return true;
    });
  }, [publishedSchedules, categoryFilter, dayFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Masthead */}
      <div className="pb-6 border-b border-[#E4DFD7]">
        <p className="text-xs font-medium tracking-wider uppercase text-[#1B3B6F] mb-2">
          Agenda Pelayanan & Persekutuan
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#171614]">
          Jadwal Kegiatan SIB TOBURON
        </h1>
        <p className="text-sm sm:text-base text-[#57534E] mt-2 max-w-2xl">
          Jadwal ibadah raya, doa syafaat, sekolah minggu, persekutuan pemuda,
          dan kegiatan pelayanan kasih yang diperbarui langsung oleh pengurus.
        </p>
      </div>

      {/* Category & Day Filter Bars */}
      <div className="space-y-4">
        <div
          role="tablist"
          aria-label="Filter kategori jadwal"
          className="flex flex-wrap items-center gap-2"
        >
          {(['Semua', ...SCHEDULE_CATEGORIES] as const).map((cat) => {
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

        {availableDays.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs font-medium text-[#57534E] mr-1">
              Hari:
            </span>
            {(['Semua', ...availableDays] as const).map((day) => {
              const active = dayFilter === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setDayFilter(day)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[36px] ${
                    active
                      ? 'bg-[#EFECE7] text-[#171614] border border-[#1B3B6F]'
                      : 'text-[#57534E] hover:text-[#171614] hover:bg-[#EFECE7]/60'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Chronological Schedule Cards */}
      {filteredSchedules.length === 0 ? (
        <div className="bg-white border border-[#E4DFD7] rounded-2xl p-12 text-center">
          <h2 className="font-serif text-xl font-semibold text-[#171614] mb-2">
            Belum ada jadwal untuk filter ini
          </h2>
          <p className="text-sm text-[#57534E]">
            Pilih kategori atau hari lain untuk melihat kegiatan jemaat lainnya.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredSchedules.map((sched) => (
            <button
              key={sched.id}
              type="button"
              onClick={() => onSelectSchedule(sched)}
              className="text-left bg-white border border-[#E4DFD7] hover:border-[#1B3B6F] rounded-2xl p-6 transition-colors flex flex-col justify-between gap-5 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1B3B6F]">
                      {sched.category}
                    </span>
                    {sched.isRecurring && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          Rutin
                        </span>
                      </>
                    )}
                  </div>
                  <span className="font-mono tabular-nums text-[#171614] font-medium">
                    {sched.dayLabel}, {formatIndonesianDate(sched.eventDate)}
                  </span>
                </div>

                <h2 className="font-serif text-2xl font-semibold text-[#171614] leading-snug">
                  {sched.title}
                </h2>

                <p className="text-sm text-[#57534E] leading-relaxed line-clamp-2">
                  {sched.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4DFD7] grid sm:grid-cols-2 gap-3 text-xs text-[#57534E]">
                <div className="flex items-center gap-2 text-[#171614] font-mono tabular-nums font-medium">
                  <Clock className="w-4 h-4 text-[#1B3B6F] shrink-0" />
                  <span>
                    {sched.startTime} – {sched.endTime} WITA
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1B3B6F] shrink-0" />
                  <span className="truncate">{sched.location}</span>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#57534E] shrink-0" />
                  <span>Pelayan / Koordinator: {sched.speakerOrLead}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedSchedule && (
        <ScheduleModal
          schedule={selectedSchedule}
          onClose={() => onSelectSchedule(null)}
        />
      )}
    </div>
  );
}

export function ScheduleModal({
  schedule,
  onClose,
}: {
  schedule: ChurchSchedule;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyReminder = async () => {
    const text = [
      `Jadwal SIB TOBURON: ${schedule.title}`,
      `Hari/Tanggal: ${schedule.dayLabel}, ${formatIndonesianDate(schedule.eventDate)}`,
      `Waktu: ${schedule.startTime} – ${schedule.endTime} WITA`,
      `Lokasi: ${schedule.location}`,
      `Pelayan/Koordinator: ${schedule.speakerOrLead}`,
      `Keterangan: ${schedule.description}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
      className="fixed inset-0 z-50 bg-[#171614]/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#F9F8F6] w-full max-w-xl rounded-2xl border border-[#E4DFD7] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-white border-b border-[#E4DFD7] flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-[#1B3B6F]">
            {schedule.category}
            {schedule.isRecurring ? ' · Rutin Mingguan' : ''}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail jadwal"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#57534E] hover:text-[#171614] hover:bg-[#EFECE7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <h2
            id="schedule-modal-title"
            className="font-serif text-2xl sm:text-3xl font-semibold text-[#171614]"
          >
            {schedule.title}
          </h2>

          <dl className="divide-y divide-[#E4DFD7] border-y border-[#E4DFD7] text-sm">
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-[#57534E] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1B3B6F]" />
                Tanggal
              </dt>
              <dd className="col-span-2 font-medium text-[#171614] font-mono tabular-nums">
                {schedule.dayLabel}, {formatIndonesianDate(schedule.eventDate)}
              </dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-[#57534E] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1B3B6F]" />
                Waktu
              </dt>
              <dd className="col-span-2 font-medium text-[#171614] font-mono tabular-nums">
                {schedule.startTime} – {schedule.endTime} WITA
              </dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-[#57534E] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1B3B6F]" />
                Lokasi
              </dt>
              <dd className="col-span-2 font-medium text-[#171614]">
                {schedule.location}
              </dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-[#57534E] flex items-center gap-2">
                <User className="w-4 h-4 text-[#1B3B6F]" />
                Pelayan
              </dt>
              <dd className="col-span-2 font-medium text-[#171614]">
                {schedule.speakerOrLead}
              </dd>
            </div>
          </dl>

          <p className="text-sm sm:text-base text-[#171614] leading-relaxed">
            {schedule.description}
          </p>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopyReminder}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3B6F] text-white text-sm font-medium rounded-lg hover:bg-[#132B52] transition-colors cursor-pointer min-h-[44px]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Info Jadwal Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Salin untuk Dibagikan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
