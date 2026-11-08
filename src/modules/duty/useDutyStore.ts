import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, type SchoolRecord } from '../../lib/supabase';
import {
  DAYS,
  DAY_NAME_TO_WEEKDAY,
  DAY_TO_NUMBER,
  NUMBER_TO_DAY,
  createDefaultDutySettings,
  formatPeriodLabel,
  getCurrentPeriod,
  isValidUuid,
  makeUuid,
  parsePeriodLabel,
  type CellTeacher,
  type DBPeriod,
  type DutyAppSettings,
  type DutyAssignment,
  type DutyBroadcast,
  type DutyLocation,
  type SchoolPeriod,
  type SchoolStage,
  type Teacher,
  type UnavailabilityEntry,
  type Weekday,
} from './types';
import {
  OFFICIAL_PRIMARY_TEACHERS,
  getOfficialDefaultAssignments,
  getOfficialDefaultTeachers,
} from './defaultScheduleData';

export interface DutyToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface FullDutyBackup {
  version: number;
  exportedAt: string;
  schoolSlug: string;
  schoolName: string;
  periods: DBPeriod[];
  teachers: Teacher[];
  locations: DutyLocation[];
  assignments: DutyAssignment[];
  unavailabilities: UnavailabilityEntry[];
  broadcasts: DutyBroadcast[];
  settings: DutyAppSettings;
}

interface LocalDutySnapshot {
  periods: DBPeriod[];
  teachers: Teacher[];
  locations: DutyLocation[];
  assignments: DutyAssignment[];
  unavailabilities: UnavailabilityEntry[];
  broadcasts: DutyBroadcast[];
  settings: Partial<DutyAppSettings>;
  dismissedBroadcastIds: string[];
  hasInitialized?: boolean;
}

interface DbTeacherRow {
  id: string;
  school_id: string;
  full_name: string;
  stage: 'primary' | 'upper' | 'both';
  max_duties_per_week: number | null;
  is_active: boolean | null;
}

interface DbLocationRow {
  id: string;
  school_id: string;
  name: string;
  floor_or_zone: string | null;
  stage: 'primary' | 'upper' | 'both';
  required_teachers: number | null;
  sort_order: number | null;
}

interface DbAssignmentRow {
  id: string;
  school_id: string;
  period_label: string;
  day_of_week: number;
  location_id: string;
  teacher_id: string;
  shift_number: number | null;
  note: string | null;
}

interface DbUnavailabilityRow {
  id: string;
  school_id: string;
  teacher_id: string;
  day_of_week: number | null;
  unavailable_date: string | null;
  reason: string | null;
}

interface DbSettingsRow {
  id: string;
  school_id: string;
  current_school_year: string | null;
  current_term: string | null;
  tip_text: string | null;
  footer_note: string | null;
}

interface DbBroadcastRow {
  id: string;
  school_id: string;
  title: string | null;
  message: string;
  priority: 'info' | 'warning' | 'urgent' | null;
  is_active: boolean | null;
  created_at: string;
}

const WEEKDAY_TO_NUMBER: Record<Weekday, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 1,
  sunday: 1,
};

const NUMBER_TO_WEEKDAY: Record<number, Weekday> = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
};

function dbStageToUi(dbStage: string | null | undefined): SchoolStage {
  return dbStage === 'primary' ? 'primary' : 'secondary';
}

function uiStageToDb(uiStage: SchoolStage): 'primary' | 'upper' {
  return uiStage === 'primary' ? 'primary' : 'upper';
}

function encodeShiftForDb(shift: string | number | null | undefined): number | null {
  if (shift === null || shift === undefined) return null;
  const normalized = String(shift).replace(/\s+/g, '').trim();
  if (!normalized) return null;
  if (normalized === '1,2') return 12;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function decodeShiftFromDb(shift: number | null | undefined): string | null {
  if (shift === null || shift === undefined) return null;
  if (shift === 12) return '1, 2';
  return String(shift);
}

function buildDefaultLocations(schoolId: string, settings: DutyAppSettings): DutyLocation[] {
  return [
    {
      id: makeUuid(),
      school_id: schoolId,
      name: settings.location_5,
      floor_or_zone: 'Етаж 0',
      stage: 'secondary',
      required_teachers: 2,
      sort_order: 1,
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      name: settings.location_1,
      floor_or_zone: 'Етаж 3',
      stage: 'secondary',
      required_teachers: 4,
      sort_order: 2,
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      name: settings.location_2,
      floor_or_zone: 'Етаж 4',
      stage: 'secondary',
      required_teachers: 4,
      sort_order: 3,
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      name: settings.location_3,
      floor_or_zone: 'Стол / Музика',
      stage: 'secondary',
      required_teachers: 3,
      sort_order: 4,
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      name: settings.location_4,
      floor_or_zone: 'Западен вход',
      stage: 'secondary',
      required_teachers: 3,
      sort_order: 5,
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      name: settings.primary_location_1,
      floor_or_zone: 'Параден вход',
      stage: 'primary',
      required_teachers: 1,
      sort_order: 1,
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      name: settings.primary_location_2,
      floor_or_zone: 'Етаж 1',
      stage: 'primary',
      required_teachers: 1,
      sort_order: 2,
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      name: settings.primary_location_3,
      floor_or_zone: 'Етаж 2',
      stage: 'primary',
      required_teachers: 1,
      sort_order: 3,
    },
  ];
}

function buildStarterTeachers(schoolId: string): Teacher[] {
  const secondaryNames = [
    'Иван Петров',
    'Мария Георгиева',
    'Елена Стоянова',
    'Николай Димитров',
    'Светослава Николова',
    'Георги Василев',
  ];
  const primaryNames = [
    'Анелия Желева',
    'Биляна Тодорова',
    'Десислава Стоянова',
  ];
  return [
    ...secondaryNames.map((name) => ({
      id: makeUuid(),
      name,
      stage: 'secondary' as const,
      periodId: schoolId,
    })),
    ...primaryNames.map((name) => ({
      id: makeUuid(),
      name,
      stage: 'primary' as const,
      periodId: schoolId,
    })),
  ];
}

function readLocalSnapshot(schoolId: string): LocalDutySnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`tl_duty_saas_v2_${schoolId}`);
    if (!raw) return null;
    return JSON.parse(raw) as LocalDutySnapshot;
  } catch {
    return null;
  }
}

function writeLocalSnapshot(schoolId: string, snap: LocalDutySnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`tl_duty_saas_v2_${schoolId}`, JSON.stringify(snap));
  } catch {
    // ignore storage quota errors
  }
}

export function useDutyStore(school: SchoolRecord) {
  const schoolId = school.id;

  const baseSettings = useMemo(
    () =>
      createDefaultDutySettings(
        school.name,
        school.city,
        school.logo_url,
        school.contact_person,
        school.contact_email
      ),
    [school.name, school.city, school.logo_url, school.contact_person, school.contact_email]
  );

  const [isLoading, setIsLoading] = useState(true);
  const [usingSupabase, setUsingSupabase] = useState(false);

  const [currentPeriod, setCurrentPeriod] = useState<SchoolPeriod>(getCurrentPeriod);
  const [currentStage, setCurrentStage] = useState<SchoolStage>('secondary');

  const [periods, setPeriods] = useState<DBPeriod[]>(() => {
    const def = getCurrentPeriod();
    return [{ id: formatPeriodLabel(def), year: def.year, term: def.term }];
  });
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [allLocations, setAllLocations] = useState<DutyLocation[]>([]);
  const [allAssignments, setAllAssignments] = useState<DutyAssignment[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<UnavailabilityEntry[]>([]);
  const [broadcasts, setBroadcasts] = useState<DutyBroadcast[]>([]);
  const [dismissedBroadcastIds, setDismissedBroadcastIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<DutyAppSettings>(baseSettings);
  const [toasts, setToasts] = useState<DutyToast[]>([]);

  const pushToast = useCallback(
    (type: DutyToast['type'], message: string) => {
      const id = makeUuid();
      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Persist snapshot helper
  const saveLocalMirror = useCallback(
    (patch: Partial<LocalDutySnapshot>) => {
      const prev = readLocalSnapshot(schoolId) ?? {
        periods: [],
        teachers: [],
        locations: [],
        assignments: [],
        unavailabilities: [],
        broadcasts: [],
        settings: {},
        dismissedBroadcastIds: [],
        hasInitialized: true,
      };
      writeLocalSnapshot(schoolId, { ...prev, ...patch, hasInitialized: true });
    },
    [schoolId]
  );

  // Initial load from Supabase with multi-tenant filtering (eq school_id) + local fallback
  useEffect(() => {
    let active = true;
    const defaultPeriod = getCurrentPeriod();

    const loadAll = async () => {
      const localSnap = readLocalSnapshot(schoolId);

      const [tRes, lRes, aRes, uRes, sRes, bRes] = await Promise.all([
        supabase.from('duty_teachers').select('*').eq('school_id', schoolId).order('full_name'),
        supabase
          .from('duty_locations')
          .select('*')
          .eq('school_id', schoolId)
          .order('sort_order', { ascending: true }),
        supabase.from('duty_assignments').select('*').eq('school_id', schoolId),
        supabase.from('duty_unavailability').select('*').eq('school_id', schoolId),
        supabase.from('duty_settings').select('*').eq('school_id', schoolId).maybeSingle(),
        supabase
          .from('duty_broadcasts')
          .select('*')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false }),
      ]);

      if (!active) return;

      const supabaseReady =
        !tRes.error && !lRes.error && !aRes.error && !uRes.error && !sRes.error && !bRes.error;

      if (supabaseReady) {
        setUsingSupabase(true);
        const dbTeachers = (tRes.data || []) as DbTeacherRow[];
        const dbLocations = (lRes.data || []) as DbLocationRow[];
        const dbAssignments = (aRes.data || []) as DbAssignmentRow[];
        const dbUnavails = (uRes.data || []) as DbUnavailabilityRow[];
        const dbSettings = (sRes.data || null) as DbSettingsRow | null;
        const dbBroadcasts = (bRes.data || []) as DbBroadcastRow[];

        // Merge dynamic school branding + DB settings + any local extended PDF settings
        const mergedSettings: DutyAppSettings = {
          ...baseSettings,
          ...(localSnap?.settings || {}),
          ...(dbSettings?.tip_text ? { tip_text: dbSettings.tip_text } : {}),
          ...(dbSettings?.footer_note ? { footer_note: dbSettings.footer_note } : {}),
          // Always ensure live school logo if local didn't explicitly upload a replacement
          logo_url: localSnap?.settings?.logo_url ?? school.logo_url ?? '',
        };

        let mappedLocations: DutyLocation[] = dbLocations.map((loc, idx) => ({
          id: loc.id,
          school_id: loc.school_id,
          name: loc.name,
          floor_or_zone: loc.floor_or_zone,
          stage: dbStageToUi(loc.stage),
          required_teachers: loc.required_teachers ?? 1,
          sort_order: loc.sort_order ?? idx + 1,
        }));

        // First-ever bootstrap for a fresh school in Supabase: create default duty_locations + settings
        if (mappedLocations.length === 0) {
          const seededLocs = buildDefaultLocations(schoolId, mergedSettings);
          const { data: insertedLocs, error: insLocErr } = await supabase
            .from('duty_locations')
            .insert(
              seededLocs.map((l) => ({
                id: l.id,
                school_id: schoolId,
                name: l.name,
                floor_or_zone: l.floor_or_zone,
                stage: uiStageToDb(l.stage),
                required_teachers: l.required_teachers,
                sort_order: l.sort_order,
              }))
            )
            .select('*');

          if (!insLocErr && insertedLocs) {
            mappedLocations = (insertedLocs as DbLocationRow[]).map((loc, idx) => ({
              id: loc.id,
              school_id: loc.school_id,
              name: loc.name,
              floor_or_zone: loc.floor_or_zone,
              stage: dbStageToUi(loc.stage),
              required_teachers: loc.required_teachers ?? 1,
              sort_order: loc.sort_order ?? idx + 1,
            }));
          } else {
            mappedLocations = seededLocs;
          }
        }

        // Map location names onto settings so Settings modal stays in sync
        const secLocs = mappedLocations
          .filter((l) => l.stage === 'secondary')
          .sort((a, b) => a.sort_order - b.sort_order);
        const priLocs = mappedLocations
          .filter((l) => l.stage === 'primary')
          .sort((a, b) => a.sort_order - b.sort_order);
        if (secLocs[0]) mergedSettings.location_5 = secLocs[0].name;
        if (secLocs[1]) mergedSettings.location_1 = secLocs[1].name;
        if (secLocs[2]) mergedSettings.location_2 = secLocs[2].name;
        if (secLocs[3]) mergedSettings.location_3 = secLocs[3].name;
        if (secLocs[4]) mergedSettings.location_4 = secLocs[4].name;
        if (priLocs[0]) mergedSettings.primary_location_1 = priLocs[0].name;
        if (priLocs[1]) mergedSettings.primary_location_2 = priLocs[1].name;
        if (priLocs[2]) mergedSettings.primary_location_3 = priLocs[2].name;

        let mappedTeachers: Teacher[] = dbTeachers
          .filter((t) => t.is_active !== false)
          .map((t) => ({
            id: t.id,
            name: t.full_name,
            stage: dbStageToUi(t.stage),
            periodId: schoolId,
          }));

        // If first boot in Supabase with zero teachers & not yet initialized locally, insert starter teachers
        if (mappedTeachers.length === 0 && !localSnap?.hasInitialized) {
          const starter = buildStarterTeachers(schoolId);
          const { data: insertedTeachers } = await supabase
            .from('duty_teachers')
            .insert(
              starter.map((t) => ({
                id: t.id,
                school_id: schoolId,
                full_name: t.name,
                stage: uiStageToDb(t.stage || 'secondary'),
                max_duties_per_week: 2,
                is_active: true,
              }))
            )
            .select('*');
          if (insertedTeachers) {
            mappedTeachers = (insertedTeachers as DbTeacherRow[]).map((t) => ({
              id: t.id,
              name: t.full_name,
              stage: dbStageToUi(t.stage),
              periodId: schoolId,
            }));
          }
        }

        const locById = new Map(mappedLocations.map((l) => [l.id, l]));

        const mappedAssignments: DutyAssignment[] = dbAssignments
          .map((a) => {
            const loc = locById.get(a.location_id);
            if (!loc) return null;
            return {
              id: a.id,
              teacherId: a.teacher_id,
              day: NUMBER_TO_DAY[a.day_of_week] || 'Понеделник',
              location: loc.name,
              shiftNumber: decodeShiftFromDb(a.shift_number),
              stage: loc.stage,
              note: a.note,
              periodId: a.period_label,
            } as DutyAssignment;
          })
          .filter((x): x is DutyAssignment => x !== null);

        const mappedUnavails: UnavailabilityEntry[] = dbUnavails.map((u) => ({
          id: u.id,
          teacher_id: u.teacher_id,
          weekday: u.day_of_week ? NUMBER_TO_WEEKDAY[u.day_of_week] ?? null : null,
          specific_date: u.unavailable_date,
          note: u.reason,
        }));

        const mappedBroadcasts: DutyBroadcast[] = dbBroadcasts
          .filter((b) => b.is_active !== false)
          .map((b) => ({
            id: b.id,
            title: b.title,
            message: b.message,
            priority: (b.priority as DutyBroadcast['priority']) || 'info',
            is_active: b.is_active ?? true,
            created_at: b.created_at,
          }));

        // Build period list from settings, assignments, and local saved periods
        const activePeriodFromSettings: SchoolPeriod =
          dbSettings?.current_school_year && dbSettings?.current_term
            ? {
                year: dbSettings.current_school_year,
                term: dbSettings.current_term.includes('II') ? 2 : 1,
              }
            : defaultPeriod;

        const periodMap = new Map<string, DBPeriod>();
        const addP = (p: SchoolPeriod) => {
          const lbl = formatPeriodLabel(p);
          periodMap.set(lbl, { id: lbl, year: p.year, term: p.term });
        };
        addP(defaultPeriod);
        addP(activePeriodFromSettings);
        for (const p of localSnap?.periods || []) {
          addP({ year: p.year, term: p.term });
        }
        for (const a of dbAssignments) {
          const parsed = parsePeriodLabel(a.period_label);
          if (parsed) addP(parsed);
        }

        const sortedPeriods = Array.from(periodMap.values()).sort((a, b) =>
          b.year !== a.year ? b.year.localeCompare(a.year) : a.term - b.term
        );

        if (!active) return;
        setSettings(mergedSettings);
        setAllLocations(mappedLocations);
        setAllTeachers(mappedTeachers);
        setAllAssignments(mappedAssignments);
        setUnavailabilities(mappedUnavails);
        setBroadcasts(mappedBroadcasts);
        setDismissedBroadcastIds(localSnap?.dismissedBroadcastIds || []);
        setPeriods(sortedPeriods);
        setCurrentPeriod(activePeriodFromSettings);
        writeLocalSnapshot(schoolId, {
          periods: sortedPeriods,
          teachers: mappedTeachers,
          locations: mappedLocations,
          assignments: mappedAssignments,
          unavailabilities: mappedUnavails,
          broadcasts: mappedBroadcasts,
          settings: mergedSettings,
          dismissedBroadcastIds: localSnap?.dismissedBroadcastIds || [],
          hasInitialized: true,
        });
        setIsLoading(false);
        return;
      }

      // Local fallback mode (tables not executed yet or offline)
      setUsingSupabase(false);
      if (localSnap && localSnap.hasInitialized) {
        const mergedSettings = { ...baseSettings, ...(localSnap.settings || {}) };
        setSettings(mergedSettings);
        setPeriods(
          localSnap.periods.length
            ? localSnap.periods
            : [{ id: formatPeriodLabel(defaultPeriod), year: defaultPeriod.year, term: defaultPeriod.term }]
        );
        setAllLocations(
          localSnap.locations.length
            ? localSnap.locations
            : buildDefaultLocations(schoolId, mergedSettings)
        );
        setAllTeachers(localSnap.teachers || []);
        setAllAssignments(localSnap.assignments || []);
        setUnavailabilities(localSnap.unavailabilities || []);
        setBroadcasts(localSnap.broadcasts || []);
        setDismissedBroadcastIds(localSnap.dismissedBroadcastIds || []);
        setIsLoading(false);
        return;
      }

      // First boot in fallback mode
      const seededLocs = buildDefaultLocations(schoolId, baseSettings);
      const seededTeachers = buildStarterTeachers(schoolId);
      const seededPeriods: DBPeriod[] = [
        { id: formatPeriodLabel(defaultPeriod), year: defaultPeriod.year, term: defaultPeriod.term },
      ];
      setSettings(baseSettings);
      setAllLocations(seededLocs);
      setAllTeachers(seededTeachers);
      setAllAssignments([]);
      setUnavailabilities([]);
      setBroadcasts([]);
      setDismissedBroadcastIds([]);
      setPeriods(seededPeriods);
      writeLocalSnapshot(schoolId, {
        periods: seededPeriods,
        teachers: seededTeachers,
        locations: seededLocs,
        assignments: [],
        unavailabilities: [],
        broadcasts: [],
        settings: baseSettings,
        dismissedBroadcastIds: [],
        hasInitialized: true,
      });
      setIsLoading(false);
    };

    void loadAll();
    return () => {
      active = false;
    };
  }, [schoolId, baseSettings, school.logo_url]);

  const currentPeriodLabel = useMemo(
    () => formatPeriodLabel(currentPeriod),
    [currentPeriod]
  );

  // Filtered by current educational stage & current period
  const teachers = useMemo(
    () => allTeachers.filter((t) => (t.stage || 'secondary') === currentStage),
    [allTeachers, currentStage]
  );

  const stageLocations = useMemo(
    () =>
      allLocations
        .filter((l) => l.stage === currentStage)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allLocations, currentStage]
  );

  const locationNames = useMemo(
    () => stageLocations.map((l) => l.name),
    [stageLocations]
  );

  const assignments = useMemo(
    () =>
      allAssignments.filter(
        (a) =>
          (a.periodId || currentPeriodLabel) === currentPeriodLabel &&
          (a.stage || 'secondary') === currentStage
      ),
    [allAssignments, currentPeriodLabel, currentStage]
  );

  const teacherAssignmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of teachers) counts[t.id] = 0;
    const seen = new Set<string>();
    for (const a of assignments) {
      const k = `${a.teacherId}-${a.day}-${a.location}`;
      if (!seen.has(k)) {
        seen.add(k);
        if (counts[a.teacherId] !== undefined) counts[a.teacherId]++;
      }
    }
    return counts;
  }, [teachers, assignments]);

  const getAssignmentsForCell = useCallback(
    (day: string, location: string): CellTeacher[] => {
      const cellItems = assignments.filter((a) => a.day === day && a.location === location);
      const seen = new Set<string>();
      const out: CellTeacher[] = [];
      for (const item of cellItems) {
        if (seen.has(item.teacherId)) continue;
        seen.add(item.teacherId);
        const teacher = teachers.find((t) => t.id === item.teacherId);
        if (teacher) {
          out.push({
            ...teacher,
            shiftNumber: item.shiftNumber ?? null,
            note: item.note ?? null,
          });
        }
      }
      return out;
    },
    [assignments, teachers]
  );

  const getTeacherDayCount = useCallback(
    (teacherId: string, day: string): number => {
      return assignments.filter((a) => a.teacherId === teacherId && a.day === day).length;
    },
    [assignments]
  );

  // Unavailability helpers
  const getTeacherUnavailabilities = useCallback(
    (teacherId: string) => unavailabilities.filter((u) => u.teacher_id === teacherId),
    [unavailabilities]
  );

  const isTeacherUnavailable = useCallback(
    (teacherId: string, dayNameBg: string): UnavailabilityEntry | null => {
      const wd = DAY_NAME_TO_WEEKDAY[dayNameBg];
      if (!wd) return null;
      return unavailabilities.find((u) => u.teacher_id === teacherId && u.weekday === wd) || null;
    },
    [unavailabilities]
  );

  const addWeekdayUnavailability = useCallback(
    async (teacherId: string, weekday: Weekday, note?: string): Promise<boolean> => {
      const exists = unavailabilities.find(
        (u) => u.teacher_id === teacherId && u.weekday === weekday
      );
      if (exists) return true;

      const entry: UnavailabilityEntry = {
        id: makeUuid(),
        teacher_id: teacherId,
        weekday,
        specific_date: null,
        note: note?.trim() || null,
      };
      const next = [...unavailabilities, entry];
      setUnavailabilities(next);
      saveLocalMirror({ unavailabilities: next });

      if (usingSupabase && isValidUuid(teacherId)) {
        await supabase.from('duty_unavailability').insert({
          id: entry.id,
          school_id: schoolId,
          teacher_id: teacherId,
          day_of_week: WEEKDAY_TO_NUMBER[weekday],
          unavailable_date: null,
          reason: entry.note,
        });
      }
      return true;
    },
    [schoolId, unavailabilities, usingSupabase, saveLocalMirror]
  );

  const addDateUnavailability = useCallback(
    async (teacherId: string, isoDate: string, note?: string): Promise<boolean> => {
      const exists = unavailabilities.find(
        (u) => u.teacher_id === teacherId && u.specific_date === isoDate
      );
      if (exists) return true;

      const entry: UnavailabilityEntry = {
        id: makeUuid(),
        teacher_id: teacherId,
        weekday: null,
        specific_date: isoDate,
        note: note?.trim() || null,
      };
      const next = [...unavailabilities, entry];
      setUnavailabilities(next);
      saveLocalMirror({ unavailabilities: next });

      if (usingSupabase && isValidUuid(teacherId)) {
        await supabase.from('duty_unavailability').insert({
          id: entry.id,
          school_id: schoolId,
          teacher_id: teacherId,
          day_of_week: null,
          unavailable_date: isoDate,
          reason: entry.note,
        });
      }
      return true;
    },
    [schoolId, unavailabilities, usingSupabase, saveLocalMirror]
  );

  const removeUnavailability = useCallback(
    async (id: string): Promise<boolean> => {
      const next = unavailabilities.filter((u) => u.id !== id);
      setUnavailabilities(next);
      saveLocalMirror({ unavailabilities: next });

      if (usingSupabase && isValidUuid(id)) {
        await supabase
          .from('duty_unavailability')
          .delete()
          .eq('id', id)
          .eq('school_id', schoolId);
      }
      return true;
    },
    [schoolId, unavailabilities, usingSupabase, saveLocalMirror]
  );

  // Teacher CRUD
  const addTeacher = useCallback(
    async (name: string): Promise<boolean> => {
      const clean = name.trim();
      if (!clean) return false;
      const dup = allTeachers.some(
        (t) =>
          (t.stage || 'secondary') === currentStage &&
          t.name.toLowerCase() === clean.toLowerCase()
      );
      if (dup) return false;

      const created: Teacher = {
        id: makeUuid(),
        name: clean,
        stage: currentStage,
        periodId: schoolId,
      };
      const next = [...allTeachers, created];
      setAllTeachers(next);
      saveLocalMirror({ teachers: next });

      if (usingSupabase) {
        await supabase.from('duty_teachers').insert({
          id: created.id,
          school_id: schoolId,
          full_name: created.name,
          stage: uiStageToDb(currentStage),
          max_duties_per_week: 2,
          is_active: true,
        });
      }
      return true;
    },
    [allTeachers, currentStage, schoolId, usingSupabase, saveLocalMirror]
  );

  const renameTeacher = useCallback(
    async (teacherId: string, newName: string): Promise<boolean> => {
      const clean = newName.trim();
      if (!clean) return false;
      const dup = allTeachers.some(
        (t) =>
          t.id !== teacherId &&
          (t.stage || 'secondary') === currentStage &&
          t.name.toLowerCase() === clean.toLowerCase()
      );
      if (dup) return false;

      const next = allTeachers.map((t) => (t.id === teacherId ? { ...t, name: clean } : t));
      setAllTeachers(next);
      saveLocalMirror({ teachers: next });

      if (usingSupabase && isValidUuid(teacherId)) {
        await supabase
          .from('duty_teachers')
          .update({ full_name: clean })
          .eq('id', teacherId)
          .eq('school_id', schoolId);
      }
      return true;
    },
    [allTeachers, currentStage, schoolId, usingSupabase, saveLocalMirror]
  );

  const removeTeacher = useCallback(
    async (teacherId: string): Promise<void> => {
      const nextTeachers = allTeachers.filter((t) => t.id !== teacherId);
      const nextAssignments = allAssignments.filter((a) => a.teacherId !== teacherId);
      const nextUnavail = unavailabilities.filter((u) => u.teacher_id !== teacherId);

      setAllTeachers(nextTeachers);
      setAllAssignments(nextAssignments);
      setUnavailabilities(nextUnavail);
      saveLocalMirror({
        teachers: nextTeachers,
        assignments: nextAssignments,
        unavailabilities: nextUnavail,
      });

      if (usingSupabase && isValidUuid(teacherId)) {
        await supabase
          .from('duty_teachers')
          .delete()
          .eq('id', teacherId)
          .eq('school_id', schoolId);
      }
    },
    [allTeachers, allAssignments, unavailabilities, schoolId, usingSupabase, saveLocalMirror]
  );

  // Assignment mutations
  const assignTeacher = useCallback(
    async (
      teacherId: string,
      day: string,
      locationName: string,
      shiftNumber: string | number | null = null,
      note: string | null = null
    ): Promise<boolean> => {
      const dup = allAssignments.some(
        (a) =>
          (a.periodId || currentPeriodLabel) === currentPeriodLabel &&
          (a.stage || 'secondary') === currentStage &&
          a.teacherId === teacherId &&
          a.day === day &&
          a.location === locationName
      );
      if (dup) return false;

      const cleanNote = note && note.trim() ? note.trim() : null;
      const cleanShift =
        shiftNumber !== null && shiftNumber !== undefined && String(shiftNumber).trim() !== ''
          ? String(shiftNumber).trim()
          : null;

      const locObj = stageLocations.find((l) => l.name === locationName) || stageLocations[0];
      const newItem: DutyAssignment = {
        id: makeUuid(),
        teacherId,
        day,
        location: locationName,
        shiftNumber: cleanShift,
        stage: currentStage,
        note: cleanNote,
        periodId: currentPeriodLabel,
      };

      const next = [...allAssignments, newItem];
      setAllAssignments(next);
      saveLocalMirror({ assignments: next });

      if (usingSupabase && locObj && isValidUuid(locObj.id) && isValidUuid(teacherId)) {
        await supabase.from('duty_assignments').insert({
          id: newItem.id,
          school_id: schoolId,
          period_label: currentPeriodLabel,
          day_of_week: DAY_TO_NUMBER[day] || 1,
          location_id: locObj.id,
          teacher_id: teacherId,
          shift_number: encodeShiftForDb(cleanShift),
          note: cleanNote,
        });
      }
      return true;
    },
    [
      allAssignments,
      currentPeriodLabel,
      currentStage,
      stageLocations,
      schoolId,
      usingSupabase,
      saveLocalMirror,
    ]
  );

  const unassignTeacher = useCallback(
    async (teacherId: string, day: string, locationName: string) => {
      const target = allAssignments.find(
        (a) =>
          (a.periodId || currentPeriodLabel) === currentPeriodLabel &&
          (a.stage || 'secondary') === currentStage &&
          a.teacherId === teacherId &&
          a.day === day &&
          a.location === locationName
      );

      const next = allAssignments.filter(
        (a) =>
          !(
            (a.periodId || currentPeriodLabel) === currentPeriodLabel &&
            (a.stage || 'secondary') === currentStage &&
            a.teacherId === teacherId &&
            a.day === day &&
            a.location === locationName
          )
      );
      setAllAssignments(next);
      saveLocalMirror({ assignments: next });

      if (usingSupabase && target?.id && isValidUuid(target.id)) {
        await supabase
          .from('duty_assignments')
          .delete()
          .eq('id', target.id)
          .eq('school_id', schoolId);
      }
    },
    [allAssignments, currentPeriodLabel, currentStage, schoolId, usingSupabase, saveLocalMirror]
  );

  const moveTeacher = useCallback(
    async (
      teacherId: string,
      fromDay: string,
      fromLocation: string,
      toDay: string,
      toLocation: string
    ) => {
      const alreadyAtDest = allAssignments.some(
        (a) =>
          (a.periodId || currentPeriodLabel) === currentPeriodLabel &&
          (a.stage || 'secondary') === currentStage &&
          a.teacherId === teacherId &&
          a.day === toDay &&
          a.location === toLocation
      );
      if (alreadyAtDest) return;

      const sourceItem = allAssignments.find(
        (a) =>
          (a.periodId || currentPeriodLabel) === currentPeriodLabel &&
          (a.stage || 'secondary') === currentStage &&
          a.teacherId === teacherId &&
          a.day === fromDay &&
          a.location === fromLocation
      );
      if (!sourceItem) return;

      const destLoc = stageLocations.find((l) => l.name === toLocation);
      const next = allAssignments.map((a) =>
        a === sourceItem ? { ...a, day: toDay, location: toLocation } : a
      );
      setAllAssignments(next);
      saveLocalMirror({ assignments: next });

      if (usingSupabase && sourceItem.id && isValidUuid(sourceItem.id) && destLoc) {
        await supabase
          .from('duty_assignments')
          .update({
            day_of_week: DAY_TO_NUMBER[toDay] || 1,
            location_id: destLoc.id,
          })
          .eq('id', sourceItem.id)
          .eq('school_id', schoolId);
      }
    },
    [
      allAssignments,
      currentPeriodLabel,
      currentStage,
      stageLocations,
      schoolId,
      usingSupabase,
      saveLocalMirror,
    ]
  );

  const updateShiftNumber = useCallback(
    async (
      teacherId: string,
      day: string,
      locationName: string,
      shiftNumber: string | number | null
    ) => {
      const cleanShift =
        shiftNumber !== null && shiftNumber !== undefined && String(shiftNumber).trim() !== ''
          ? String(shiftNumber).trim()
          : null;

      const target = allAssignments.find(
        (a) =>
          (a.periodId || currentPeriodLabel) === currentPeriodLabel &&
          (a.stage || 'secondary') === currentStage &&
          a.teacherId === teacherId &&
          a.day === day &&
          a.location === locationName
      );

      const next = allAssignments.map((a) =>
        a === target ? { ...a, shiftNumber: cleanShift } : a
      );
      setAllAssignments(next);
      saveLocalMirror({ assignments: next });

      if (usingSupabase && target?.id && isValidUuid(target.id)) {
        await supabase
          .from('duty_assignments')
          .update({ shift_number: encodeShiftForDb(cleanShift) })
          .eq('id', target.id)
          .eq('school_id', schoolId);
      }
    },
    [allAssignments, currentPeriodLabel, currentStage, schoolId, usingSupabase, saveLocalMirror]
  );

  const updateAssignmentNote = useCallback(
    async (teacherId: string, day: string, locationName: string, note: string | null) => {
      const cleanNote = note && note.trim() ? note.trim() : null;
      const target = allAssignments.find(
        (a) =>
          (a.periodId || currentPeriodLabel) === currentPeriodLabel &&
          (a.stage || 'secondary') === currentStage &&
          a.teacherId === teacherId &&
          a.day === day &&
          a.location === locationName
      );

      const next = allAssignments.map((a) => (a === target ? { ...a, note: cleanNote } : a));
      setAllAssignments(next);
      saveLocalMirror({ assignments: next });

      if (usingSupabase && target?.id && isValidUuid(target.id)) {
        await supabase
          .from('duty_assignments')
          .update({ note: cleanNote })
          .eq('id', target.id)
          .eq('school_id', schoolId);
      }
    },
    [allAssignments, currentPeriodLabel, currentStage, schoolId, usingSupabase, saveLocalMirror]
  );

  const clearSchedule = useCallback(async (): Promise<boolean> => {
    const idsToDelete = assignments.map((a) => a.id).filter((id): id is string => !!id);
    const remaining = allAssignments.filter(
      (a) =>
        !(
          (a.periodId || currentPeriodLabel) === currentPeriodLabel &&
          (a.stage || 'secondary') === currentStage
        )
    );
    setAllAssignments(remaining);
    saveLocalMirror({ assignments: remaining });

    if (usingSupabase && idsToDelete.length > 0) {
      await supabase
        .from('duty_assignments')
        .delete()
        .in('id', idsToDelete)
        .eq('school_id', schoolId);
    }

    const stageLabel =
      currentStage === 'primary'
        ? 'начален етап (I–IV клас)'
        : 'прогимназиален/гимназиален етап (V–XII клас)';
    pushToast('success', `Всички дежурства за ${stageLabel} бяха изчистени.`);
    return true;
  }, [
    assignments,
    allAssignments,
    currentPeriodLabel,
    currentStage,
    schoolId,
    usingSupabase,
    saveLocalMirror,
    pushToast,
  ]);

  const autoArrangeTeachers = useCallback(async () => {
    if (teachers.length === 0 || stageLocations.length === 0) {
      pushToast('error', 'Няма учители или локации за разпределяне.');
      return;
    }

    const unavailSet = new Set<string>();
    for (const u of unavailabilities) {
      if (u.weekday) unavailSet.add(`${u.teacher_id}-${u.weekday}`);
    }

    const slots: Array<{ day: string; location: DutyLocation }> = [];
    for (const day of DAYS) {
      for (const loc of stageLocations) {
        const needed = Math.max(1, loc.required_teachers || 1);
        for (let i = 0; i < needed; i++) {
          slots.push({ day, location: loc });
        }
      }
    }

    // Balanced fairness: track teacher weekly count + avoid same-day repeats + avoid unavailability
    const teacherLoad = new Map<string, number>();
    for (const t of teachers) teacherLoad.set(t.id, 0);

    const shuffledSlots = [...slots].sort(() => Math.random() - 0.5);
    const shuffledTeachers = [...teachers].sort(() => Math.random() - 0.5);

    const createdAssignments: DutyAssignment[] = [];
    const sameCellPairs = new Set<string>();
    const sameDayPairs = new Set<string>();

    for (const slot of shuffledSlots) {
      const wdKey = DAY_NAME_TO_WEEKDAY[slot.day];

      // Sort candidate teachers by least duties so distribution stays balanced
      const candidates = [...shuffledTeachers].sort(
        (a, b) => (teacherLoad.get(a.id) ?? 0) - (teacherLoad.get(b.id) ?? 0)
      );

      // Pass 1: available, not on same day, not in same cell
      let chosen = candidates.find(
        (t) =>
          !sameCellPairs.has(`${t.id}-${slot.day}-${slot.location.name}`) &&
          !sameDayPairs.has(`${t.id}-${slot.day}`) &&
          !(wdKey && unavailSet.has(`${t.id}-${wdKey}`))
      );

      // Pass 2: available, not in same cell
      if (!chosen) {
        chosen = candidates.find(
          (t) =>
            !sameCellPairs.has(`${t.id}-${slot.day}-${slot.location.name}`) &&
            !(wdKey && unavailSet.has(`${t.id}-${wdKey}`))
        );
      }

      // Pass 3: any not in same cell
      if (!chosen) {
        chosen = candidates.find(
          (t) => !sameCellPairs.has(`${t.id}-${slot.day}-${slot.location.name}`)
        );
      }

      if (chosen) {
        sameCellPairs.add(`${chosen.id}-${slot.day}-${slot.location.name}`);
        sameDayPairs.add(`${chosen.id}-${slot.day}`);
        teacherLoad.set(chosen.id, (teacherLoad.get(chosen.id) ?? 0) + 1);
        createdAssignments.push({
          id: makeUuid(),
          teacherId: chosen.id,
          day: slot.day,
          location: slot.location.name,
          shiftNumber: null,
          stage: currentStage,
          note: null,
          periodId: currentPeriodLabel,
        });
      }
    }

    const oldIdsToDelete = assignments.map((a) => a.id).filter((id): id is string => !!id);
    const otherAssignments = allAssignments.filter(
      (a) =>
        !(
          (a.periodId || currentPeriodLabel) === currentPeriodLabel &&
          (a.stage || 'secondary') === currentStage
        )
    );
    const merged = [...otherAssignments, ...createdAssignments];
    setAllAssignments(merged);
    saveLocalMirror({ assignments: merged });

    if (usingSupabase) {
      if (oldIdsToDelete.length > 0) {
        await supabase
          .from('duty_assignments')
          .delete()
          .in('id', oldIdsToDelete)
          .eq('school_id', schoolId);
      }
      const locNameToId = new Map(stageLocations.map((l) => [l.name, l.id]));
      const dbRows = createdAssignments
        .map((a) => {
          const locId = locNameToId.get(a.location);
          if (!locId) return null;
          return {
            id: a.id,
            school_id: schoolId,
            period_label: currentPeriodLabel,
            day_of_week: DAY_TO_NUMBER[a.day] || 1,
            location_id: locId,
            teacher_id: a.teacherId,
            shift_number: null,
            note: null,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
      if (dbRows.length > 0) {
        await supabase.from('duty_assignments').insert(dbRows);
      }
    }

    pushToast('success', 'Учителите са разпределени равномерно спрямо достъпността!');
  }, [
    teachers,
    stageLocations,
    unavailabilities,
    assignments,
    allAssignments,
    currentPeriodLabel,
    currentStage,
    schoolId,
    usingSupabase,
    saveLocalMirror,
    pushToast,
  ]);

  // Period actions
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(periods.map((p) => p.year)));
    return years.sort().reverse();
  }, [periods]);

  const getTermsForYear = useCallback(
    (year: string) =>
      periods
        .filter((p) => p.year === year)
        .map((p) => p.term)
        .sort(),
    [periods]
  );

  const changePeriod = useCallback(
    async (nextPeriod: SchoolPeriod) => {
      setCurrentPeriod(nextPeriod);
      if (usingSupabase) {
        await supabase.from('duty_settings').upsert(
          {
            school_id: schoolId,
            current_school_year: nextPeriod.year,
            current_term: nextPeriod.term === 1 ? 'I срок' : 'II срок',
            tip_text: settings.tip_text,
            footer_note: settings.footer_note,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'school_id' }
        );
      }
    },
    [schoolId, settings.footer_note, settings.tip_text, usingSupabase]
  );

  const addPeriod = useCallback(
    async (year: string, term: 1 | 2): Promise<boolean> => {
      const cleanYear = year.trim();
      const label = formatPeriodLabel({ year: cleanYear, term });
      if (periods.some((p) => p.id === label)) {
        pushToast('error', 'Този период вече съществува.');
        return false;
      }
      const next = [...periods, { id: label, year: cleanYear, term }].sort((a, b) =>
        b.year !== a.year ? b.year.localeCompare(a.year) : a.term - b.term
      );
      setPeriods(next);
      setCurrentPeriod({ year: cleanYear, term });
      saveLocalMirror({ periods: next });
      pushToast('success', `Добавен период: ${label}`);
      return true;
    },
    [periods, saveLocalMirror, pushToast]
  );

  const deletePeriod = useCallback(
    async (year: string, term: 1 | 2): Promise<boolean> => {
      const label = formatPeriodLabel({ year, term });
      if (periods.length <= 1) {
        pushToast('error', 'Не може да изтриете единствения останал период.');
        return false;
      }

      const nextPeriods = periods.filter((p) => p.id !== label);
      const nextAssignments = allAssignments.filter((a) => a.periodId !== label);
      setPeriods(nextPeriods);
      setAllAssignments(nextAssignments);
      saveLocalMirror({ periods: nextPeriods, assignments: nextAssignments });

      if (usingSupabase) {
        await supabase
          .from('duty_assignments')
          .delete()
          .eq('school_id', schoolId)
          .eq('period_label', label);
      }

      if (currentPeriod.year === year && currentPeriod.term === term && nextPeriods[0]) {
        setCurrentPeriod({ year: nextPeriods[0].year, term: nextPeriods[0].term });
      }
      pushToast('success', `Изтрит период: ${label}`);
      return true;
    },
    [
      periods,
      allAssignments,
      currentPeriod,
      schoolId,
      usingSupabase,
      saveLocalMirror,
      pushToast,
    ]
  );

  const copyAssignmentsFromPeriod = useCallback(
    async (sourceYear: string, sourceTerm: 1 | 2): Promise<boolean> => {
      const sourceLabel = formatPeriodLabel({ year: sourceYear, term: sourceTerm });
      const sourceItems = allAssignments.filter(
        (a) => a.periodId === sourceLabel && (a.stage || 'secondary') === currentStage
      );
      if (sourceItems.length === 0) {
        pushToast('info', 'Няма записани дежурства за този етап в избрания период.');
        return false;
      }

      const existingKeys = new Set(
        assignments.map((a) => `${a.teacherId}-${a.day}-${a.location}`)
      );

      const copies: DutyAssignment[] = [];
      for (const item of sourceItems) {
        const key = `${item.teacherId}-${item.day}-${item.location}`;
        if (existingKeys.has(key)) continue;
        existingKeys.add(key);
        copies.push({
          ...item,
          id: makeUuid(),
          periodId: currentPeriodLabel,
        });
      }

      if (copies.length === 0) {
        pushToast('info', 'Всички дежурства от избрания период вече присъстват тук.');
        return true;
      }

      const next = [...allAssignments, ...copies];
      setAllAssignments(next);
      saveLocalMirror({ assignments: next });

      if (usingSupabase) {
        const locByName = new Map(stageLocations.map((l) => [l.name, l.id]));
        const dbRows = copies
          .map((c) => {
            const locId = locByName.get(c.location);
            if (!locId) return null;
            return {
              id: c.id,
              school_id: schoolId,
              period_label: currentPeriodLabel,
              day_of_week: DAY_TO_NUMBER[c.day] || 1,
              location_id: locId,
              teacher_id: c.teacherId,
              shift_number: encodeShiftForDb(c.shiftNumber),
              note: c.note ?? null,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);
        if (dbRows.length > 0) {
          await supabase.from('duty_assignments').insert(dbRows);
        }
      }

      pushToast('success', `Копирани ${copies.length} дежурства от ${sourceLabel}.`);
      return true;
    },
    [
      allAssignments,
      assignments,
      currentPeriodLabel,
      currentStage,
      stageLocations,
      schoolId,
      usingSupabase,
      saveLocalMirror,
      pushToast,
    ]
  );

  // Settings & location names synchronization
  const updateMultipleSettings = useCallback(
    async (updates: Partial<DutyAppSettings>): Promise<boolean> => {
      const nextSettings = { ...settings, ...updates };
      setSettings(nextSettings);

      // Check if any location labels changed and update location rows + assignment location references
      const renamePairs: Array<{ stage: SchoolStage; sortOrder: number; nextName: string }> = [
        { stage: 'secondary', sortOrder: 1, nextName: nextSettings.location_5 },
        { stage: 'secondary', sortOrder: 2, nextName: nextSettings.location_1 },
        { stage: 'secondary', sortOrder: 3, nextName: nextSettings.location_2 },
        { stage: 'secondary', sortOrder: 4, nextName: nextSettings.location_3 },
        { stage: 'secondary', sortOrder: 5, nextName: nextSettings.location_4 },
        { stage: 'primary', sortOrder: 1, nextName: nextSettings.primary_location_1 },
        { stage: 'primary', sortOrder: 2, nextName: nextSettings.primary_location_2 },
        { stage: 'primary', sortOrder: 3, nextName: nextSettings.primary_location_3 },
      ];

      let updatedLocations = [...allLocations];
      let updatedAssignments = [...allAssignments];
      let locationsChanged = false;

      for (const pair of renamePairs) {
        const cleanName = pair.nextName.trim();
        if (!cleanName) continue;
        const locIdx = updatedLocations.findIndex(
          (l) => l.stage === pair.stage && l.sort_order === pair.sortOrder
        );
        if (locIdx >= 0) {
          const oldName = updatedLocations[locIdx].name;
          if (oldName !== cleanName) {
            locationsChanged = true;
            const locId = updatedLocations[locIdx].id;
            updatedLocations[locIdx] = { ...updatedLocations[locIdx], name: cleanName };
            updatedAssignments = updatedAssignments.map((a) =>
              (a.stage || 'secondary') === pair.stage && a.location === oldName
                ? { ...a, location: cleanName }
                : a
            );
            if (usingSupabase && isValidUuid(locId)) {
              await supabase
                .from('duty_locations')
                .update({ name: cleanName })
                .eq('id', locId)
                .eq('school_id', schoolId);
            }
          }
        }
      }

      if (locationsChanged) {
        setAllLocations(updatedLocations);
        setAllAssignments(updatedAssignments);
      }

      saveLocalMirror({
        settings: nextSettings,
        locations: updatedLocations,
        assignments: updatedAssignments,
      });

      if (usingSupabase) {
        await supabase.from('duty_settings').upsert(
          {
            school_id: schoolId,
            current_school_year: currentPeriod.year,
            current_term: currentPeriod.term === 1 ? 'I срок' : 'II срок',
            tip_text: nextSettings.tip_text,
            footer_note: nextSettings.footer_note,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'school_id' }
        );
      }

      pushToast('success', 'Настройките са запазени.');
      return true;
    },
    [
      settings,
      allLocations,
      allAssignments,
      currentPeriod,
      schoolId,
      usingSupabase,
      saveLocalMirror,
      pushToast,
    ]
  );

  // Broadcasts
  const addBroadcast = useCallback(
    async (
      message: string,
      priority: DutyBroadcast['priority'],
      title?: string
    ): Promise<boolean> => {
      const clean = message.trim();
      if (!clean) return false;
      const item: DutyBroadcast = {
        id: makeUuid(),
        title: title?.trim() || null,
        message: clean,
        priority,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      const next = [item, ...broadcasts];
      setBroadcasts(next);
      saveLocalMirror({ broadcasts: next });

      if (usingSupabase) {
        await supabase.from('duty_broadcasts').insert({
          id: item.id,
          school_id: schoolId,
          title: item.title,
          message: item.message,
          priority: item.priority,
          is_active: true,
        });
      }
      pushToast('success', 'Съобщението е публикувано.');
      return true;
    },
    [broadcasts, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  const deleteBroadcast = useCallback(
    async (id: string) => {
      const next = broadcasts.filter((b) => b.id !== id);
      setBroadcasts(next);
      saveLocalMirror({ broadcasts: next });
      if (usingSupabase && isValidUuid(id)) {
        await supabase
          .from('duty_broadcasts')
          .delete()
          .eq('id', id)
          .eq('school_id', schoolId);
      }
      pushToast('success', 'Съобщението е изтрито.');
    },
    [broadcasts, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  const dismissBroadcast = useCallback(
    (id: string) => {
      if (dismissedBroadcastIds.includes(id)) return;
      const next = [...dismissedBroadcastIds, id];
      setDismissedBroadcastIds(next);
      saveLocalMirror({ dismissedBroadcastIds: next });
    },
    [dismissedBroadcastIds, saveLocalMirror]
  );

  // Backup Export / Import / Official Sample Template
  const exportBackup = useCallback((): FullDutyBackup => {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      schoolSlug: school.slug,
      schoolName: school.name,
      periods,
      teachers: allTeachers,
      locations: allLocations,
      assignments: allAssignments,
      unavailabilities,
      broadcasts,
      settings,
    };
  }, [
    school.slug,
    school.name,
    periods,
    allTeachers,
    allLocations,
    allAssignments,
    unavailabilities,
    broadcasts,
    settings,
  ]);

  const importBackup = useCallback(
    async (backup: FullDutyBackup): Promise<boolean> => {
      if (!backup || !Array.isArray(backup.teachers) || !Array.isArray(backup.assignments)) {
        pushToast('error', 'Невалиден формат на архивния файл.');
        return false;
      }

      const nextPeriods = backup.periods?.length ? backup.periods : periods;
      const nextLocations = backup.locations?.length ? backup.locations : allLocations;
      const nextTeachers = backup.teachers;
      const nextAssignments = backup.assignments;
      const nextUnavail = backup.unavailabilities || [];
      const nextBroadcasts = backup.broadcasts || broadcasts;
      const nextSettings = { ...settings, ...(backup.settings || {}) };

      setPeriods(nextPeriods);
      setAllLocations(nextLocations);
      setAllTeachers(nextTeachers);
      setAllAssignments(nextAssignments);
      setUnavailabilities(nextUnavail);
      setBroadcasts(nextBroadcasts);
      setSettings(nextSettings);

      saveLocalMirror({
        periods: nextPeriods,
        locations: nextLocations,
        teachers: nextTeachers,
        assignments: nextAssignments,
        unavailabilities: nextUnavail,
        broadcasts: nextBroadcasts,
        settings: nextSettings,
      });

      pushToast('success', 'Архивът беше възстановен успешно.');
      return true;
    },
    [periods, allLocations, broadcasts, settings, saveLocalMirror, pushToast]
  );

  const loadSampleTemplate = useCallback(async () => {
    const sampleSecondary = getOfficialDefaultTeachers(schoolId);
    const samplePrimary = OFFICIAL_PRIMARY_TEACHERS.map((t) => ({
      ...t,
      periodId: schoolId,
    }));
    const legacyIdMap = new Map<string, string>();
    const newTeachers: Teacher[] = [];

    for (const t of [...sampleSecondary, ...samplePrimary]) {
      const uuid = makeUuid();
      legacyIdMap.set(t.id, uuid);
      newTeachers.push({
        id: uuid,
        name: t.name,
        stage: t.stage,
        periodId: schoolId,
      });
    }

    const legacyAssignments = getOfficialDefaultAssignments(currentPeriodLabel);
    const locLookup = new Map<string, DutyLocation>();
    for (const loc of allLocations) {
      locLookup.set(`${loc.stage}:${loc.name}`, loc);
    }

    const newAssignments: DutyAssignment[] = legacyAssignments
      .map((a) => {
        const mappedTeacherId = legacyIdMap.get(a.teacherId);
        if (!mappedTeacherId) return null;
        return {
          id: makeUuid(),
          teacherId: mappedTeacherId,
          day: a.day,
          location: a.location,
          shiftNumber: a.shiftNumber ?? null,
          stage: a.stage || 'secondary',
          note: a.note ?? null,
          periodId: currentPeriodLabel,
        } as DutyAssignment;
      })
      .filter((x): x is DutyAssignment => x !== null);

    setAllTeachers(newTeachers);
    setAllAssignments(newAssignments);
    saveLocalMirror({
      teachers: newTeachers,
      assignments: newAssignments,
    });

    if (usingSupabase) {
      await supabase.from('duty_assignments').delete().eq('school_id', schoolId);
      await supabase.from('duty_teachers').delete().eq('school_id', schoolId);

      await supabase.from('duty_teachers').insert(
        newTeachers.map((t) => ({
          id: t.id,
          school_id: schoolId,
          full_name: t.name,
          stage: uiStageToDb(t.stage || 'secondary'),
          max_duties_per_week: 2,
          is_active: true,
        }))
      );

      const secDefaultByIdx = allLocations.filter((l) => l.stage === 'secondary');
      const dbRows = newAssignments
        .map((a) => {
          const exactLoc =
            allLocations.find(
              (l) => (a.stage || 'secondary') === l.stage && l.name === a.location
            ) || secDefaultByIdx[0];
          if (!exactLoc) return null;
          return {
            id: a.id,
            school_id: schoolId,
            period_label: currentPeriodLabel,
            day_of_week: DAY_TO_NUMBER[a.day] || 1,
            location_id: exactLoc.id,
            teacher_id: a.teacherId,
            shift_number: encodeShiftForDb(a.shiftNumber),
            note: a.note ?? null,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      if (dbRows.length > 0) {
        await supabase.from('duty_assignments').insert(dbRows);
      }
    }

    pushToast(
      'success',
      `Зареден е примерен шаблон с ${newTeachers.length} учители и ${newAssignments.length} дежурства.`
    );
  }, [schoolId, currentPeriodLabel, allLocations, usingSupabase, saveLocalMirror, pushToast]);

  const resetToEmpty = useCallback(async () => {
    const freshLocations = buildDefaultLocations(schoolId, baseSettings);
    setAllTeachers([]);
    setAllAssignments([]);
    setUnavailabilities([]);
    setAllLocations(freshLocations);
    setSettings(baseSettings);

    saveLocalMirror({
      teachers: [],
      assignments: [],
      unavailabilities: [],
      locations: freshLocations,
      settings: baseSettings,
    });

    if (usingSupabase) {
      await supabase.from('duty_assignments').delete().eq('school_id', schoolId);
      await supabase.from('duty_unavailability').delete().eq('school_id', schoolId);
      await supabase.from('duty_teachers').delete().eq('school_id', schoolId);
    }

    pushToast('info', 'Графикът и списъкът с учители за училището са нулирани.');
  }, [schoolId, baseSettings, usingSupabase, saveLocalMirror, pushToast]);

  return {
    isLoading,
    usingSupabase,
    toasts,
    pushToast,
    dismissToast,

    currentPeriod,
    currentPeriodLabel,
    changePeriod,
    periods,
    availableYears,
    getTermsForYear,
    addPeriod,
    deletePeriod,
    copyAssignmentsFromPeriod,

    currentStage,
    changeStage: setCurrentStage,

    teachers,
    allTeachers,
    stageLocations,
    locationNames,
    assignments,
    teacherAssignmentCounts,
    getAssignmentsForCell,
    getTeacherDayCount,

    addTeacher,
    renameTeacher,
    removeTeacher,
    assignTeacher,
    unassignTeacher,
    moveTeacher,
    updateShiftNumber,
    updateAssignmentNote,
    autoArrangeTeachers,
    clearSchedule,

    unavailabilities,
    isTeacherUnavailable,
    getTeacherUnavailabilities,
    addWeekdayUnavailability,
    addDateUnavailability,
    removeUnavailability,

    settings,
    updateMultipleSettings,

    broadcasts,
    dismissedBroadcastIds,
    addBroadcast,
    deleteBroadcast,
    dismissBroadcast,

    exportBackup,
    importBackup,
    loadSampleTemplate,
    resetToEmpty,
  };
}

