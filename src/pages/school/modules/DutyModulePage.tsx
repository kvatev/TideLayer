import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useSchoolPortal } from '../../../components/layout/schoolPortalContext';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';

interface DutyTeacher {
  id: string;
  full_name: string;
  max_duties_per_week: number;
}

interface DutyLocation {
  id: string;
  name: string;
  floor_or_zone: string;
}

interface DutyAssignment {
  id: string;
  day_of_week: number;
  location_id: string;
  teacher_id: string;
}

const DAYS = [
  { num: 1, label: 'Понеделник' },
  { num: 2, label: 'Вторник' },
  { num: 3, label: 'Сряда' },
  { num: 4, label: 'Четвъртък' },
  { num: 5, label: 'Петък' },
];

export function DutyModulePage() {
  const { bundle } = useSchoolPortal();
  const schoolId = bundle.school.id;
  const storageKey = `tl_duty_module_${schoolId}`;

  const [teachers, setTeachers] = useState<DutyTeacher[]>([]);
  const [locations, setLocations] = useState<DutyLocation[]>([]);
  const [assignments, setAssignments] = useState<DutyAssignment[]>([]);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newLocationName, setNewLocationName] = useState('');

  useEffect(() => {
    const loadDutyData = async () => {
      const [tRes, lRes, aRes] = await Promise.all([
        supabase.from('duty_teachers').select('*').eq('school_id', schoolId),
        supabase.from('duty_locations').select('*').eq('school_id', schoolId).order('sort_order', { ascending: true }),
        supabase.from('duty_assignments').select('*').eq('school_id', schoolId),
      ]);

      if (!tRes.error && !lRes.error && !aRes.error && (tRes.data?.length || lRes.data?.length)) {
        setTeachers(tRes.data as DutyTeacher[]);
        setLocations(lRes.data as DutyLocation[]);
        setAssignments(aRes.data as DutyAssignment[]);
        return;
      }

      // Fallback / initial seed per school
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setTeachers(parsed.teachers || []);
          setLocations(parsed.locations || []);
          setAssignments(parsed.assignments || []);
          return;
        } catch {
          // ignore
        }
      }

      const defaultTeachers: DutyTeacher[] = [
        { id: 't-1', full_name: 'Иван Петров', max_duties_per_week: 2 },
        { id: 't-2', full_name: 'Мария Георгиева', max_duties_per_week: 2 },
        { id: 't-3', full_name: 'Елена Стоянова', max_duties_per_week: 2 },
        { id: 't-4', full_name: 'Николай Димитров', max_duties_per_week: 2 },
        { id: 't-5', full_name: 'Светослава Николова', max_duties_per_week: 2 },
      ];
      const defaultLocations: DutyLocation[] = [
        { id: 'l-1', name: 'Дежурен на I-ви етаж', floor_or_zone: 'Етаж 1' },
        { id: 'l-2', name: 'Дежурен на II-ри етаж', floor_or_zone: 'Етаж 2' },
        { id: 'l-3', name: 'Главен вход / Фоайе', floor_or_zone: 'Партер' },
      ];
      const defaultAssignments: DutyAssignment[] = [
        { id: 'a-1', day_of_week: 1, location_id: 'l-1', teacher_id: 't-1' },
        { id: 'a-2', day_of_week: 1, location_id: 'l-2', teacher_id: 't-2' },
        { id: 'a-3', day_of_week: 2, location_id: 'l-1', teacher_id: 't-3' },
      ];
      setTeachers(defaultTeachers);
      setLocations(defaultLocations);
      setAssignments(defaultAssignments);
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          teachers: defaultTeachers,
          locations: defaultLocations,
          assignments: defaultAssignments,
        })
      );
    };

    void loadDutyData();
  }, [schoolId, storageKey]);

  const persistLocal = (
    nextTeachers: DutyTeacher[],
    nextLocations: DutyLocation[],
    nextAssignments: DutyAssignment[]
  ) => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        teachers: nextTeachers,
        locations: nextLocations,
        assignments: nextAssignments,
      })
    );
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;
    const item: DutyTeacher = {
      id: `t-${Date.now()}`,
      full_name: newTeacherName.trim(),
      max_duties_per_week: 2,
    };
    const next = [...teachers, item];
    setTeachers(next);
    persistLocal(next, locations, assignments);
    setNewTeacherName('');
    await supabase.from('duty_teachers').insert({
      school_id: schoolId,
      full_name: item.full_name,
      max_duties_per_week: 2,
    });
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;
    const item: DutyLocation = {
      id: `l-${Date.now()}`,
      name: newLocationName.trim(),
      floor_or_zone: 'Основен корпус',
    };
    const next = [...locations, item];
    setLocations(next);
    persistLocal(teachers, next, assignments);
    setNewLocationName('');
    await supabase.from('duty_locations').insert({
      school_id: schoolId,
      name: item.name,
      floor_or_zone: item.floor_or_zone,
    });
  };

  const handleAssignTeacher = async (day: number, locationId: string, teacherId: string) => {
    if (!teacherId) return;
    if (
      assignments.some(
        (a) => a.day_of_week === day && a.location_id === locationId && a.teacher_id === teacherId
      )
    ) {
      return;
    }
    const item: DutyAssignment = {
      id: `a-${Date.now()}`,
      day_of_week: day,
      location_id: locationId,
      teacher_id: teacherId,
    };
    const next = [...assignments, item];
    setAssignments(next);
    persistLocal(teachers, locations, next);
  };

  const handleRemoveAssignment = (id: string) => {
    const next = assignments.filter((a) => a.id !== id);
    setAssignments(next);
    persistLocal(teachers, locations, next);
  };

  const handleAutoDistribute = () => {
    if (teachers.length === 0 || locations.length === 0) return;
    const next: DutyAssignment[] = [];
    let tIdx = 0;
    for (const d of DAYS) {
      for (const loc of locations) {
        const teacher = teachers[tIdx % teachers.length];
        next.push({
          id: `auto-${d.num}-${loc.id}`,
          day_of_week: d.num,
          location_id: loc.id,
          teacher_id: teacher.id,
        });
        tIdx++;
      }
    }
    setAssignments(next);
    persistLocal(teachers, locations, next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Link to={`/school/${bundle.school.slug}`} className="hover:underline">
              Табло на училището
            </Link>
            <span>/</span>
            <span>График за дежурства</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1">
            График за дежурства — {bundle.school.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-0">
            Учебна 2026/2027 г. • Управление на дежурните учители и постове по дни от седмицата
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleAutoDistribute}>
            <Icon name="Sparkles" size={15} className="mr-1.5" />
            Автоматично разпределение
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAssignments([]);
              persistLocal(teachers, locations, []);
            }}
          >
            Изчисти графика
          </Button>
        </div>
      </div>

      {/* Main Layout: Teachers Sidebar + Weekly Schedule Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Teachers & Locations Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-navy-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-heading font-bold flex items-center gap-2">
                <Icon name="Users" size={16} />
                Учители ({teachers.length})
              </span>
            </div>

            <div className="p-4 space-y-3">
              <form onSubmit={handleAddTeacher} className="flex gap-2">
                <input
                  type="text"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="Добави учител..."
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
                >
                  +
                </button>
              </form>

              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {teachers.map((t) => {
                  const count = assignments.filter((a) => a.teacher_id === t.id).length;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-blue-50/70 border border-blue-200/70 text-xs sm:text-sm font-medium text-navy-900"
                    >
                      <span className="truncate">{t.full_name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold shrink-0">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="text-sm font-heading font-bold text-navy-900">
              Дежурни постове ({locations.length})
            </div>
            <form onSubmit={handleAddLocation} className="flex gap-2">
              <input
                type="text"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                placeholder="Нов пост / етаж..."
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shrink-0"
              >
                +
              </button>
            </form>
          </div>
        </aside>

        {/* Weekly Schedule Table */}
        <section className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-navy-900 text-white text-xs sm:text-sm">
                  <th className="py-3.5 px-4 font-heading font-semibold w-36">
                    Ден от седмицата
                  </th>
                  {locations.map((loc) => (
                    <th key={loc.id} className="py-3.5 px-4 font-heading font-semibold border-l border-navy-800">
                      {loc.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {DAYS.map((day) => (
                  <tr key={day.num} className="hover:bg-slate-50/70 align-top">
                    <td className="py-4 px-4 font-heading font-bold text-navy-900 bg-slate-50/50">
                      {day.label}
                    </td>
                    {locations.map((loc) => {
                      const cellAssignments = assignments.filter(
                        (a) => a.day_of_week === day.num && a.location_id === loc.id
                      );
                      return (
                        <td key={loc.id} className="py-3.5 px-4 border-l border-slate-200 space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {cellAssignments.map((a) => {
                              const teacher = teachers.find((t) => t.id === a.teacher_id);
                              if (!teacher) return null;
                              return (
                                <span
                                  key={a.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium"
                                >
                                  <span>{teacher.full_name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAssignment(a.id)}
                                    className="opacity-80 hover:opacity-100"
                                    title="Премахни"
                                  >
                                    ✕
                                  </button>
                                </span>
                              );
                            })}
                          </div>

                          <select
                            value=""
                            onChange={(e) => handleAssignTeacher(day.num, loc.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 text-xs text-slate-600 bg-white hover:border-blue-400 focus:outline-none"
                          >
                            <option value="">+ Добави дежурен...</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.full_name}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
