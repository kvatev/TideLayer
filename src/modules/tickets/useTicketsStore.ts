import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  supabase,
  ROLE_LABELS,
  type SchoolRecord,
  type SchoolUserRecord,
  type SchoolPortalSession,
} from '../../lib/supabase';
import {
  isValidUuid,
  makeUuid,
  type ChannelMessage,
  type DocumentFileType,
  type SchoolTicket,
  type TaskDocumentAttachment,
  type TicketAnnouncement,
  type TicketAuditLog,
  type TicketChannel,
  type TicketDepartment,
  type TicketMessage,
  type TicketOrder,
  type TicketPriority,
  type TicketStatus,
} from './types';
import type { ToastMessage } from '../shared/ModulePrimitives';

interface LocalTicketsSnapshot {
  departments: TicketDepartment[];
  tickets: SchoolTicket[];
  messages: TicketMessage[];
  orders: TicketOrder[];
  channels: TicketChannel[];
  channelMessages: ChannelMessage[];
  announcements: TicketAnnouncement[];
  auditLogs: TicketAuditLog[];
  attachments?: TaskDocumentAttachment[];
  hasInitialized?: boolean;
}

function buildStarterTicketsData(schoolId: string, schoolUsers: SchoolUserRecord[]): LocalTicketsSnapshot {
  const now = new Date();
  const dept1Id = makeUuid();
  const dept2Id = makeUuid();
  const dept3Id = makeUuid();
  const dept4Id = makeUuid();

  const departments: TicketDepartment[] = [
    {
      id: dept1Id,
      school_id: schoolId,
      name: 'Ръководство и Педагогически съвет',
      description: 'Заповеди на директора, годишни тематични планове и решения на ПС',
      created_at: now.toISOString(),
    },
    {
      id: dept2Id,
      school_id: schoolId,
      name: 'Учебна дейност и Класни ръководители',
      description: 'Графици за контролни работи, отсъствия, дневници и квалификация',
      created_at: now.toISOString(),
    },
    {
      id: dept3Id,
      school_id: schoolId,
      name: 'Администрация, ЗАС и Човешки ресурси',
      description: 'Справки, трудови досиета, GDPR декларации и материални заявки',
      created_at: now.toISOString(),
    },
    {
      id: dept4Id,
      school_id: schoolId,
      name: 'ИТ инфраструктура и Техническа поддръжка',
      description: 'Компютърни кабинети, мрежи, електронни дневници и периферия',
      created_at: now.toISOString(),
    },
  ];

  const directorUser = schoolUsers.find((u) => u.role === 'director' || u.role === 'school_admin') || schoolUsers[0];
  const deputyUser = schoolUsers.find((u) => u.role === 'deputy_director') || schoolUsers[1] || schoolUsers[0];
  const adminUser = schoolUsers.find((u) => u.role === 'administration') || schoolUsers[2] || schoolUsers[0];
  const teacherUser = schoolUsers.find((u) => u.role === 'teacher') || schoolUsers[3] || schoolUsers[0];

  const validCreatorId = directorUser ? directorUser.id : null;
  const creatorName = directorUser ? directorUser.full_name : 'Директор';

  const tk1Id = makeUuid();
  const tk2Id = makeUuid();
  const tk3Id = makeUuid();
  const tk4Id = makeUuid();

  const inFiveDays = new Date(Date.now() + 86400000 * 5).toISOString();
  const inTwoDays = new Date(Date.now() + 86400000 * 2).toISOString();
  const pastThreeDays = new Date(Date.now() - 86400000 * 3).toISOString();

  const tickets: SchoolTicket[] = [
    {
      id: tk1Id,
      school_id: schoolId,
      department_id: dept1Id,
      created_by_user_id: directorUser ? directorUser.id : null,
      assigned_to_user_id: null,
      assigned_role_target: 'all_teachers',
      due_date: inFiveDays,
      title: 'Предаване на Годишен тематичен план и график за контролни работи (I срок)',
      description: 'Колеги, моля всички учители и класни ръководители да попълнят и качат своите годишни тематични планове по приложения утвърден образец от МОН до указания краен срок.',
      room_or_location: 'Учителска стая / Дигитален портал',
      priority: 'high',
      status: 'in_progress',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: tk2Id,
      school_id: schoolId,
      department_id: dept2Id,
      created_by_user_id: deputyUser ? deputyUser.id : null,
      assigned_to_user_id: null,
      assigned_role_target: 'all_teachers',
      due_date: inTwoDays,
      title: 'Месечна справка за отсъствия и неизвинени часове към МОН',
      description: 'Изисква се въвеждане на обобщените данни за отсъствията за изминалия месец по паралелки с цел предаване на доклад към Регионалното управление на образованието.',
      room_or_location: 'Канцелария / Дигитален кабинет',
      priority: 'urgent',
      status: 'open',
      created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    },
    {
      id: tk3Id,
      school_id: schoolId,
      department_id: dept3Id,
      created_by_user_id: adminUser ? adminUser.id : null,
      assigned_to_user_id: teacherUser ? teacherUser.id : null,
      due_date: pastThreeDays,
      title: 'Заверка на трудови досиета, декларации за квалификация и GDPR',
      description: 'Счетоводството и ЗАС събират подписани декларации за придобити професионално-квалификационни степени (ПКС) и декларации за защита на личните данни.',
      room_or_location: 'Кабинет ЗАС (Етаж 1)',
      priority: 'medium',
      status: 'resolved',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: tk4Id,
      school_id: schoolId,
      department_id: dept4Id,
      created_by_user_id: teacherUser ? teacherUser.id : null,
      assigned_to_user_id: null,
      title: 'Инсталиране на софтуерни симулации за STEM кабинет 302',
      description: 'Необходимо е инсталиране на актуализирани софтуерни пакети за физика и химия на интерактивния дисплей и 15-те работни станции.',
      room_or_location: 'STEM Кабинет 302',
      priority: 'low',
      status: 'closed',
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  const attachments: TaskDocumentAttachment[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk1Id,
      file_name: 'Годишен_тематичен_план_образец_2026.docx',
      file_size_bytes: 245760,
      file_type: 'word',
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      file_url: '#',
      uploaded_by_user_id: directorUser?.id || null,
      uploaded_by_name: directorUser?.full_name || 'д-р Валентина Каменова',
      uploaded_by_role: 'Директор',
      uploaded_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk1Id,
      file_name: 'График_класни_и_контролни_работи.xlsx',
      file_size_bytes: 184320,
      file_type: 'excel',
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      file_url: '#',
      uploaded_by_user_id: directorUser?.id || null,
      uploaded_by_name: directorUser?.full_name || 'д-р Валентина Каменова',
      uploaded_by_role: 'Директор',
      uploaded_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk1Id,
      file_name: 'Заповед_РД_09_Учебен_план_2026.pdf',
      file_size_bytes: 532480,
      file_type: 'pdf',
      mime_type: 'application/pdf',
      file_url: '#',
      uploaded_by_user_id: directorUser?.id || null,
      uploaded_by_name: directorUser?.full_name || 'д-р Валентина Каменова',
      uploaded_by_role: 'Директор',
      uploaded_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk1Id,
      file_name: 'Презентация_Педагогически_съвет.pptx',
      file_size_bytes: 3614720,
      file_type: 'powerpoint',
      mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      file_url: '#',
      uploaded_by_user_id: deputyUser?.id || null,
      uploaded_by_name: deputyUser?.full_name || 'Мария Тодорова',
      uploaded_by_role: 'Зам.-директор УД',
      uploaded_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk2Id,
      file_name: 'Таблица_отсъствия_по_паралелки.xlsx',
      file_size_bytes: 98304,
      file_type: 'excel',
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      file_url: '#',
      uploaded_by_user_id: deputyUser?.id || null,
      uploaded_by_name: deputyUser?.full_name || 'Мария Тодорова',
      uploaded_by_role: 'Зам.-директор УД',
      uploaded_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk2Id,
      file_name: 'Инструкция_за_попълване_на_отсъствия.pdf',
      file_size_bytes: 317440,
      file_type: 'pdf',
      mime_type: 'application/pdf',
      file_url: '#',
      uploaded_by_user_id: deputyUser?.id || null,
      uploaded_by_name: deputyUser?.full_name || 'Мария Тодорова',
      uploaded_by_role: 'Зам.-директор УД',
      uploaded_at: new Date(Date.now() - 3600000 * 13).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk3Id,
      file_name: 'Декларация_придобита_ПКС_образец.docx',
      file_size_bytes: 122880,
      file_type: 'word',
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      file_url: '#',
      uploaded_by_user_id: adminUser?.id || null,
      uploaded_by_name: adminUser?.full_name || 'Силвия Николова',
      uploaded_by_role: 'ЗАС / Администрация',
      uploaded_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk3Id,
      file_name: 'Формуляр_съгласие_GDPR_персонал.pdf',
      file_size_bytes: 194560,
      file_type: 'pdf',
      mime_type: 'application/pdf',
      file_url: '#',
      uploaded_by_user_id: adminUser?.id || null,
      uploaded_by_name: adminUser?.full_name || 'Силвия Николова',
      uploaded_by_role: 'ЗАС / Администрация',
      uploaded_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ];

  const messages: TicketMessage[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      ticket_id: tk1Id,
      sender_user_id: validCreatorId,
      sender_name: creatorName,
      message: 'Заявката е регистрирана. Моля техникът да прегледа USB кабела за калибрация на тъча.',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      ticket_id: tk2Id,
      sender_user_id: validCreatorId,
      sender_name: 'Техник ИТ',
      message: 'Заявена е нова тонер касета от ИТ координатора. Очаквана доставка до петък.',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ];

  const orders: TicketOrder[] = [];

  const channels: TicketChannel[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      name: 'Общи технически въпроси',
      channel_type: 'general',
      is_active: true,
      created_at: now.toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      name: 'STEM Оборудване и софтуер',
      channel_type: 'stem',
      is_active: true,
      created_at: now.toISOString(),
    },
  ];

  const channelMessages: ChannelMessage[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      channel_id: channels[0].id,
      sender_name: creatorName,
      sender_role: directorUser?.role || 'director',
      content: 'Добре дошли в училищната система за задачи и документи на TideLayer!',
      created_at: now.toISOString(),
    },
  ];

  const announcements: TicketAnnouncement[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      title: 'График за качване на планове и документи за новия срок',
      content: 'Всички преподаватели могат да предават своите годишни планове и отчети през системата. Разменените файлове се пазят в 1-годишния архив.',
      is_pinned: true,
      created_at: now.toISOString(),
    },
  ];

  const auditLogs: TicketAuditLog[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      ticket_id: tk1Id,
      actor_name: creatorName,
      action: 'Възложена задача',
      details: { title: tickets[0].title, priority: 'high' },
      created_at: tickets[0].created_at,
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      ticket_id: tk2Id,
      actor_name: creatorName,
      action: 'Възложена задача',
      details: { title: tickets[1].title, priority: 'urgent' },
      created_at: tickets[1].created_at,
    },
  ];

  return {
    departments,
    tickets,
    messages,
    orders,
    channels,
    channelMessages,
    announcements,
    auditLogs,
    attachments,
    hasInitialized: true,
  };
}

function readLocalSnapshot(schoolId: string): LocalTicketsSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`tl_tickets_saas_v2_${schoolId}`);
    if (!raw) return null;
    return JSON.parse(raw) as LocalTicketsSnapshot;
  } catch {
    return null;
  }
}

function writeLocalSnapshot(schoolId: string, snap: LocalTicketsSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`tl_tickets_saas_v2_${schoolId}`, JSON.stringify(snap));
  } catch {
    // ignore quota error
  }
}

export function useTicketsStore(
  school: SchoolRecord,
  session: SchoolPortalSession,
  schoolUsers: SchoolUserRecord[]
) {
  const schoolId = school.id;

  const [isLoading, setIsLoading] = useState(true);
  const [usingSupabase, setUsingSupabase] = useState(false);

  const [departments, setDepartments] = useState<TicketDepartment[]>([]);
  const [tickets, setTickets] = useState<SchoolTicket[]>([]);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [channels, setChannels] = useState<TicketChannel[]>([]);
  const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>([]);
  const [announcements, setAnnouncements] = useState<TicketAnnouncement[]>([]);
  const [auditLogs, setAuditLogs] = useState<TicketAuditLog[]>([]);
  const [attachments, setAttachments] = useState<TaskDocumentAttachment[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = makeUuid();
    setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const saveLocalMirror = useCallback(
    (patch: Partial<LocalTicketsSnapshot>) => {
      const prev = readLocalSnapshot(schoolId) ?? {
        departments: [],
        tickets: [],
        messages: [],
        orders: [],
        channels: [],
        channelMessages: [],
        announcements: [],
        auditLogs: [],
        attachments: [],
        hasInitialized: true,
      };
      writeLocalSnapshot(schoolId, { ...prev, ...patch, hasInitialized: true });
    },
    [schoolId]
  );

  // Initial fetch from Supabase by school_id + fallback
  useEffect(() => {
    let active = true;

    const loadAll = async () => {
      const localSnap = readLocalSnapshot(schoolId);

      const [dRes, tRes, mRes, oRes, cRes, aRes, lRes, attRes] = await Promise.all([
        supabase.from('ticket_departments').select('*').eq('school_id', schoolId).order('name'),
        supabase
          .from('tickets')
          .select('*')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false }),
        supabase.from('ticket_messages').select('*').eq('school_id', schoolId).order('created_at', { ascending: true }),
        supabase
          .from('ticket_orders')
          .select('*')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false }),
        supabase.from('ticket_channels').select('*').eq('school_id', schoolId).order('created_at', { ascending: true }),
        supabase
          .from('ticket_announcements')
          .select('*')
          .eq('school_id', schoolId)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('ticket_audit_logs')
          .select('*')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('task_document_attachments')
          .select('*')
          .eq('school_id', schoolId)
          .order('uploaded_at', { ascending: false }),
      ]);

      if (!active) return;

      const supabaseReady =
        !dRes.error && !tRes.error && !mRes.error && !oRes.error && !cRes.error && !aRes.error && !lRes.error;

      if (supabaseReady) {
        setUsingSupabase(true);
        let dbDepts = (dRes.data || []) as TicketDepartment[];
        let dbTickets = (tRes.data || []) as SchoolTicket[];
        let dbMessages = (mRes.data || []) as TicketMessage[];
        let dbOrders = (oRes.data || []) as TicketOrder[];
        let dbChannels = (cRes.data || []) as TicketChannel[];
        let dbAnnouncements = (aRes.data || []) as TicketAnnouncement[];
        let dbLogs = (lRes.data || []) as TicketAuditLog[];
        let dbAttachments = (!attRes.error && attRes.data ? attRes.data : []) as TaskDocumentAttachment[];

        // If fresh school in Supabase with zero departments and zero tickets, bootstrap starter data
        if (dbDepts.length === 0 && dbTickets.length === 0 && !localSnap?.hasInitialized) {
          const starter = buildStarterTicketsData(schoolId, schoolUsers);
          await Promise.all([
            supabase.from('ticket_departments').insert(starter.departments),
            supabase.from('tickets').insert(
              starter.tickets.map((t) => ({
                id: t.id,
                school_id: schoolId,
                department_id: t.department_id,
                created_by_user_id: t.created_by_user_id,
                assigned_to_user_id: t.assigned_to_user_id,
                assigned_role_target: t.assigned_role_target || null,
                due_date: t.due_date || null,
                title: t.title,
                description: t.description,
                room_or_location: t.room_or_location,
                priority: t.priority,
                status: t.status,
              }))
            ),
            supabase.from('ticket_messages').insert(starter.messages),
            supabase.from('ticket_orders').insert(starter.orders),
            supabase.from('ticket_channels').insert(starter.channels),
            supabase.from('ticket_announcements').insert(starter.announcements),
            supabase.from('ticket_audit_logs').insert(starter.auditLogs),
            starter.attachments && starter.attachments.length > 0
              ? supabase.from('task_document_attachments').insert(starter.attachments)
              : Promise.resolve(),
          ]);

          dbDepts = starter.departments;
          dbTickets = starter.tickets;
          dbMessages = starter.messages;
          dbOrders = starter.orders;
          dbChannels = starter.channels;
          dbAnnouncements = starter.announcements;
          dbLogs = starter.auditLogs;
          dbAttachments = starter.attachments || [];
        }

        if (!active) return;
        setDepartments(dbDepts);
        setTickets(dbTickets);
        setMessages(dbMessages);
        setOrders(dbOrders);
        setChannels(dbChannels);
        setChannelMessages(localSnap?.channelMessages || []);
        setAnnouncements(dbAnnouncements);
        setAuditLogs(dbLogs);
        setAttachments(dbAttachments.length > 0 ? dbAttachments : (localSnap?.attachments || []));
        writeLocalSnapshot(schoolId, {
          departments: dbDepts,
          tickets: dbTickets,
          messages: dbMessages,
          orders: dbOrders,
          channels: dbChannels,
          channelMessages: localSnap?.channelMessages || [],
          announcements: dbAnnouncements,
          auditLogs: dbLogs,
          attachments: dbAttachments.length > 0 ? dbAttachments : (localSnap?.attachments || []),
          hasInitialized: true,
        });
        setIsLoading(false);
        return;
      }

      // Local fallback mode
      setUsingSupabase(false);
      if (localSnap && localSnap.hasInitialized) {
        setDepartments(localSnap.departments || []);
        setTickets(localSnap.tickets || []);
        setMessages(localSnap.messages || []);
        setOrders(localSnap.orders || []);
        setChannels(localSnap.channels || []);
        setChannelMessages(localSnap.channelMessages || []);
        setAnnouncements(localSnap.announcements || []);
        setAuditLogs(localSnap.auditLogs || []);
        setAttachments(localSnap.attachments || []);
        setIsLoading(false);
        return;
      }

      const starter = buildStarterTicketsData(schoolId, schoolUsers);
      setDepartments(starter.departments);
      setTickets(starter.tickets);
      setMessages(starter.messages);
      setOrders(starter.orders);
      setChannels(starter.channels);
      setChannelMessages(starter.channelMessages);
      setAnnouncements(starter.announcements);
      setAuditLogs(starter.auditLogs);
      setAttachments(starter.attachments || []);
      writeLocalSnapshot(schoolId, starter);
      setIsLoading(false);
    };

    void loadAll();
    return () => {
      active = false;
    };
  }, [schoolId, schoolUsers]);

  // Maps for quick lookups
  const departmentMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d.name])),
    [departments]
  );

  const userMap = useMemo(
    () => new Map(schoolUsers.map((u) => [u.id, u.full_name])),
    [schoolUsers]
  );

  const userRoleMap = useMemo(
    () => new Map(schoolUsers.map((u) => [u.id, u.role])),
    [schoolUsers]
  );

  // Enriched tickets
  const enrichedTickets = useMemo(() => {
    return tickets.map((t) => {
      const msgCount = messages.filter((m) => m.ticket_id === t.id).length;
      const taskAttachments = attachments.filter((a) => a.task_id === t.id);
      const creatorRole = t.created_by_user_id ? userRoleMap.get(t.created_by_user_id) : undefined;
      const assigneeRole = t.assigned_to_user_id ? userRoleMap.get(t.assigned_to_user_id) : undefined;

      let assigneeLabel = 'Неразпределена';
      if (t.assigned_role_target) {
        if (t.assigned_role_target === 'all_teachers') assigneeLabel = 'Всички учители';
        else if (t.assigned_role_target === 'all_administration') assigneeLabel = 'Всички в администрацията';
        else if (t.assigned_role_target === 'all_staff') assigneeLabel = 'Целия персонал';
        else assigneeLabel = t.assigned_role_target;
      } else if (t.assigned_to_user_id) {
        assigneeLabel = userMap.get(t.assigned_to_user_id) || 'Служител';
      }

      return {
        ...t,
        department_name: t.department_id ? departmentMap.get(t.department_id) || 'Общо направление' : 'Общо направление',
        creator_name: t.created_by_user_id
          ? userMap.get(t.created_by_user_id) || 'Потребител'
          : session.isSuperAdminPreview
            ? 'Главен Администратор'
            : 'Потребител',
        creator_role: creatorRole ? ROLE_LABELS[creatorRole] || creatorRole : undefined,
        assignee_name: assigneeLabel,
        assignee_role: assigneeRole ? ROLE_LABELS[assigneeRole] || assigneeRole : undefined,
        messages_count: msgCount,
        attachments_count: taskAttachments.length,
        attachments: taskAttachments,
      };
    });
  }, [tickets, messages, attachments, departmentMap, userMap, userRoleMap, session.isSuperAdminPreview]);

  // All documents for 365-day history
  const allDocuments = useMemo(() => {
    return [...attachments].sort(
      (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
  }, [attachments]);

  // Record audit log helper
  const addAuditLog = useCallback(
    async (action: string, ticketId: string | null = null, details: Record<string, unknown> | null = null) => {
      const logItem: TicketAuditLog = {
        id: makeUuid(),
        school_id: schoolId,
        ticket_id: ticketId,
        actor_name: session.fullName,
        action,
        details,
        created_at: new Date().toISOString(),
      };
      const next = [logItem, ...auditLogs];
      setAuditLogs(next);
      saveLocalMirror({ auditLogs: next });

      if (usingSupabase) {
        await supabase.from('ticket_audit_logs').insert({
          id: logItem.id,
          school_id: schoolId,
          ticket_id: isValidUuid(ticketId) ? ticketId : null,
          actor_name: logItem.actor_name,
          action: logItem.action,
          details: logItem.details,
        });
      }
    },
    [schoolId, session.fullName, auditLogs, usingSupabase, saveLocalMirror]
  );

  // Ticket CRUD
  const createTicket = useCallback(
    async (input: {
      title: string;
      description: string;
      room_or_location?: string;
      department_id?: string | null;
      priority: TicketPriority;
      assigned_to_user_id?: string | null;
      assigned_role_target?: string | null;
      assigned_user_ids?: string[];
      due_date?: string | null;
      attachments?: {
        file_name: string;
        file_size_bytes: number;
        file_type: DocumentFileType;
        mime_type: string;
        file_url: string;
      }[];
    }): Promise<SchoolTicket> => {
      const now = new Date().toISOString();
      const validCreatorId: string | null = isValidUuid(session.userId) ? session.userId : null;
      const validAssigneeId: string | null =
        input.assigned_to_user_id && isValidUuid(input.assigned_to_user_id) ? input.assigned_to_user_id : null;
      const validDeptId: string | null =
        input.department_id && isValidUuid(input.department_id) ? input.department_id : null;

      const newTicket: SchoolTicket = {
        id: makeUuid(),
        school_id: schoolId,
        department_id: validDeptId,
        created_by_user_id: validCreatorId,
        assigned_to_user_id: validAssigneeId,
        assigned_role_target: input.assigned_role_target || null,
        assigned_user_ids: input.assigned_user_ids || [],
        due_date: input.due_date || null,
        title: input.title.trim(),
        description: input.description.trim(),
        room_or_location: input.room_or_location?.trim() || null,
        priority: input.priority,
        status: 'open',
        created_at: now,
        updated_at: now,
      };

      const newAttachments: TaskDocumentAttachment[] = (input.attachments || []).map((att) => ({
        id: makeUuid(),
        school_id: schoolId,
        task_id: newTicket.id,
        file_name: att.file_name,
        file_size_bytes: att.file_size_bytes,
        file_type: att.file_type,
        mime_type: att.mime_type,
        file_url: att.file_url,
        uploaded_by_user_id: validCreatorId,
        uploaded_by_name: session.fullName,
        uploaded_by_role: session.role ? ROLE_LABELS[session.role] || session.role : 'Служител',
        uploaded_at: now,
      }));

      const nextTickets = [newTicket, ...tickets];
      const nextAttachments = [...newAttachments, ...attachments];

      setTickets(nextTickets);
      if (newAttachments.length > 0) {
        setAttachments(nextAttachments);
      }
      saveLocalMirror({ tickets: nextTickets, attachments: nextAttachments });

      if (usingSupabase) {
        await supabase.from('tickets').insert({
          id: newTicket.id,
          school_id: schoolId,
          department_id: newTicket.department_id,
          created_by_user_id: newTicket.created_by_user_id,
          assigned_to_user_id: newTicket.assigned_to_user_id,
          assigned_role_target: newTicket.assigned_role_target,
          due_date: newTicket.due_date,
          title: newTicket.title,
          description: newTicket.description,
          room_or_location: newTicket.room_or_location,
          priority: newTicket.priority,
          status: newTicket.status,
        });

        if (newAttachments.length > 0) {
          await supabase.from('task_document_attachments').insert(
            newAttachments.map((a) => ({
              id: a.id,
              school_id: schoolId,
              task_id: a.task_id,
              file_name: a.file_name,
              file_size_bytes: a.file_size_bytes,
              file_type: a.file_type,
              mime_type: a.mime_type,
              file_url: a.file_url,
              uploaded_by_user_id: a.uploaded_by_user_id,
              uploaded_by_name: a.uploaded_by_name,
              uploaded_by_role: a.uploaded_by_role,
              uploaded_at: a.uploaded_at,
            }))
          );
        }
      }

      await addAuditLog(`Създадена нова задача: ${newTicket.title}`, newTicket.id, {
        title: newTicket.title,
        priority: newTicket.priority,
        attachments_count: newAttachments.length,
      });

      pushToast('success', 'Задачата е възложена успешно!');
      return newTicket;
    },
    [schoolId, session, tickets, attachments, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const addAttachmentToTask = useCallback(
    async (
      taskId: string,
      doc: {
        file_name: string;
        file_size_bytes: number;
        file_type: DocumentFileType;
        mime_type: string;
        file_url: string;
      }
    ): Promise<TaskDocumentAttachment> => {
      const now = new Date().toISOString();
      const validUserId = isValidUuid(session.userId) ? session.userId : null;
      const item: TaskDocumentAttachment = {
        id: makeUuid(),
        school_id: schoolId,
        task_id: taskId,
        file_name: doc.file_name,
        file_size_bytes: doc.file_size_bytes,
        file_type: doc.file_type,
        mime_type: doc.mime_type,
        file_url: doc.file_url,
        uploaded_by_user_id: validUserId,
        uploaded_by_name: session.fullName,
        uploaded_by_role: session.role ? ROLE_LABELS[session.role] || session.role : 'Служител',
        uploaded_at: now,
      };

      const next = [item, ...attachments];
      setAttachments(next);
      saveLocalMirror({ attachments: next });

      if (usingSupabase) {
        await supabase.from('task_document_attachments').insert({
          id: item.id,
          school_id: schoolId,
          task_id: item.task_id,
          file_name: item.file_name,
          file_size_bytes: item.file_size_bytes,
          file_type: item.file_type,
          mime_type: item.mime_type,
          file_url: item.file_url,
          uploaded_by_user_id: item.uploaded_by_user_id,
          uploaded_by_name: item.uploaded_by_name,
          uploaded_by_role: item.uploaded_by_role,
          uploaded_at: item.uploaded_at,
        });
      }

      await addAuditLog(`Прикачен документ „${item.file_name}“`, taskId);
      pushToast('success', `Документът „${item.file_name}“ е прикачен.`);
      return item;
    },
    [schoolId, session, attachments, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const deleteAttachment = useCallback(
    async (attachmentId: string) => {
      const doc = attachments.find((a) => a.id === attachmentId);
      const next = attachments.filter((a) => a.id !== attachmentId);
      setAttachments(next);
      saveLocalMirror({ attachments: next });

      if (usingSupabase && isValidUuid(attachmentId)) {
        await supabase
          .from('task_document_attachments')
          .delete()
          .eq('id', attachmentId)
          .eq('school_id', schoolId);
      }

      if (doc) {
        await addAuditLog(`Премахнат документ: ${doc.file_name}`, doc.task_id);
      }
      pushToast('info', 'Документът е премахнат.');
    },
    [attachments, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const updateTicketStatus = useCallback(
    async (ticketId: string, status: TicketStatus) => {
      const now = new Date().toISOString();
      const next = tickets.map((t) => (t.id === ticketId ? { ...t, status, updated_at: now } : t));
      setTickets(next);
      saveLocalMirror({ tickets: next });

      if (usingSupabase && isValidUuid(ticketId)) {
        await supabase
          .from('tickets')
          .update({ status, updated_at: now })
          .eq('id', ticketId)
          .eq('school_id', schoolId);
      }

      await addAuditLog(`Сменен статус на „${status}“`, ticketId, { status });
      pushToast('success', `Статусът е обновен.`);
    },
    [tickets, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const updateTicketPriority = useCallback(
    async (ticketId: string, priority: TicketPriority) => {
      const now = new Date().toISOString();
      const next = tickets.map((t) => (t.id === ticketId ? { ...t, priority, updated_at: now } : t));
      setTickets(next);
      saveLocalMirror({ tickets: next });

      if (usingSupabase && isValidUuid(ticketId)) {
        await supabase
          .from('tickets')
          .update({ priority, updated_at: now })
          .eq('id', ticketId)
          .eq('school_id', schoolId);
      }

      await addAuditLog(`Сменен приоритет на „${priority}“`, ticketId, { priority });
      pushToast('info', 'Приоритетът е обновен.');
    },
    [tickets, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const updateTicketAssignee = useCallback(
    async (ticketId: string, assigneeUserId: string | null) => {
      const validAssigneeId = isValidUuid(assigneeUserId) ? assigneeUserId : null;
      const now = new Date().toISOString();
      const next = tickets.map((t) =>
        t.id === ticketId ? { ...t, assigned_to_user_id: validAssigneeId, updated_at: now } : t
      );
      setTickets(next);
      saveLocalMirror({ tickets: next });

      if (usingSupabase && isValidUuid(ticketId)) {
        await supabase
          .from('tickets')
          .update({ assigned_to_user_id: validAssigneeId, updated_at: now })
          .eq('id', ticketId)
          .eq('school_id', schoolId);
      }

      const assigneeName = validAssigneeId ? userMap.get(validAssigneeId) || 'Служител' : 'Няма';
      await addAuditLog(`Заявката е разпределена към ${assigneeName}`, ticketId, {
        assigned_to_user_id: validAssigneeId,
      });
      pushToast('success', `Отговорникът е обновен: ${assigneeName}`);
    },
    [tickets, schoolId, usingSupabase, userMap, saveLocalMirror, addAuditLog, pushToast]
  );

  const editTicket = useCallback(
    async (
      ticketId: string,
      patch: {
        title: string;
        description: string;
        room_or_location?: string | null;
        department_id?: string | null;
      }
    ) => {
      const validDeptId: string | null =
        patch.department_id && isValidUuid(patch.department_id) ? patch.department_id : null;
      const now = new Date().toISOString();
      const next = tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              title: patch.title.trim(),
              description: patch.description.trim(),
              room_or_location: patch.room_or_location?.trim() || null,
              department_id: validDeptId,
              updated_at: now,
            }
          : t
      );
      setTickets(next);
      saveLocalMirror({ tickets: next });

      if (usingSupabase && isValidUuid(ticketId)) {
        await supabase
          .from('tickets')
          .update({
            title: patch.title.trim(),
            description: patch.description.trim(),
            room_or_location: patch.room_or_location?.trim() || null,
            department_id: validDeptId,
            updated_at: now,
          })
          .eq('id', ticketId)
          .eq('school_id', schoolId);
      }

      await addAuditLog('Редактирани детайли на заявка', ticketId, { title: patch.title });
      pushToast('success', 'Заявката е обновена.');
    },
    [tickets, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const deleteTicket = useCallback(
    async (ticketId: string) => {
      const target = tickets.find((t) => t.id === ticketId);
      const nextTickets = tickets.filter((t) => t.id !== ticketId);
      const nextMessages = messages.filter((m) => m.ticket_id !== ticketId);
      const nextOrders = orders.filter((o) => o.ticket_id !== ticketId);

      setTickets(nextTickets);
      setMessages(nextMessages);
      setOrders(nextOrders);
      saveLocalMirror({
        tickets: nextTickets,
        messages: nextMessages,
        orders: nextOrders,
      });

      if (usingSupabase && isValidUuid(ticketId)) {
        await supabase.from('tickets').delete().eq('id', ticketId).eq('school_id', schoolId);
      }

      await addAuditLog(`Изтрита заявка „${target?.title || ticketId}“`, null, {
        deletedTicketId: ticketId,
      });
      pushToast('info', 'Заявката беше изтрита.');
    },
    [tickets, messages, orders, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  // Message Thread
  const sendMessage = useCallback(
    async (ticketId: string, messageText: string) => {
      const clean = messageText.trim();
      if (!clean) return;

      const validSenderId = isValidUuid(session.userId) ? session.userId : null;
      const item: TicketMessage = {
        id: makeUuid(),
        school_id: schoolId,
        ticket_id: ticketId,
        sender_user_id: validSenderId,
        sender_name: session.fullName,
        message: clean,
        created_at: new Date().toISOString(),
      };

      const next = [...messages, item];
      setMessages(next);
      saveLocalMirror({ messages: next });

      if (usingSupabase && isValidUuid(ticketId)) {
        await supabase.from('ticket_messages').insert({
          id: item.id,
          school_id: schoolId,
          ticket_id: ticketId,
          sender_user_id: item.sender_user_id,
          sender_name: item.sender_name,
          message: item.message,
        });
      }

      await addAuditLog('Добавен коментар към заявка', ticketId, { messagePreview: clean.slice(0, 60) });
      pushToast('success', 'Съобщението е изпратено.');
    },
    [messages, schoolId, session.fullName, session.userId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  // Channels & Channel Messages
  const createChannel = useCallback(
    async (name: string, channelType: string = 'general') => {
      const clean = name.trim();
      if (!clean) return;

      const item: TicketChannel = {
        id: makeUuid(),
        school_id: schoolId,
        name: clean,
        channel_type: channelType,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const next = [...channels, item];
      setChannels(next);
      saveLocalMirror({ channels: next });

      if (usingSupabase) {
        await supabase.from('ticket_channels').insert({
          id: item.id,
          school_id: schoolId,
          name: item.name,
          channel_type: item.channel_type,
          is_active: true,
        });
      }

      await addAuditLog(`Създаден канал „${clean}“`, null, { channelName: clean });
      pushToast('success', `Каналът „${clean}“ е създаден.`);
    },
    [channels, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const toggleChannelActive = useCallback(
    async (channelId: string, isActive: boolean) => {
      const next = channels.map((c) => (c.id === channelId ? { ...c, is_active: isActive } : c));
      setChannels(next);
      saveLocalMirror({ channels: next });

      if (usingSupabase && isValidUuid(channelId)) {
        await supabase
          .from('ticket_channels')
          .update({ is_active: isActive })
          .eq('id', channelId)
          .eq('school_id', schoolId);
      }
    },
    [channels, schoolId, usingSupabase, saveLocalMirror]
  );

  const deleteChannel = useCallback(
    async (channelId: string) => {
      const nextChannels = channels.filter((c) => c.id !== channelId);
      const nextMsgs = channelMessages.filter((m) => m.channel_id !== channelId);
      setChannels(nextChannels);
      setChannelMessages(nextMsgs);
      saveLocalMirror({ channels: nextChannels, channelMessages: nextMsgs });

      if (usingSupabase && isValidUuid(channelId)) {
        await supabase.from('ticket_channels').delete().eq('id', channelId).eq('school_id', schoolId);
      }

      await addAuditLog('Изтрит комуникационен канал', null, { channelId });
      pushToast('info', 'Каналът е изтрит.');
    },
    [channels, channelMessages, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const sendChannelMessage = useCallback(
    (channelId: string, content: string) => {
      const clean = content.trim();
      if (!clean) return;

      const item: ChannelMessage = {
        id: makeUuid(),
        school_id: schoolId,
        channel_id: channelId,
        sender_name: session.fullName,
        sender_role: session.role,
        content: clean,
        created_at: new Date().toISOString(),
      };

      const next = [...channelMessages, item];
      setChannelMessages(next);
      saveLocalMirror({ channelMessages: next });
    },
    [channelMessages, schoolId, session.fullName, session.role, saveLocalMirror]
  );

  // Announcements CRUD
  const createAnnouncement = useCallback(
    async (title: string, content: string, isPinned: boolean = false) => {
      const cleanTitle = title.trim();
      const cleanContent = content.trim();
      if (!cleanTitle || !cleanContent) return;

      const item: TicketAnnouncement = {
        id: makeUuid(),
        school_id: schoolId,
        title: cleanTitle,
        content: cleanContent,
        is_pinned: isPinned,
        created_at: new Date().toISOString(),
      };

      const next = [item, ...announcements].sort((a, b) =>
        a.is_pinned === b.is_pinned ? 0 : a.is_pinned ? -1 : 1
      );
      setAnnouncements(next);
      saveLocalMirror({ announcements: next });

      if (usingSupabase) {
        await supabase.from('ticket_announcements').insert({
          id: item.id,
          school_id: schoolId,
          title: item.title,
          content: item.content,
          is_pinned: item.is_pinned,
        });
      }

      await addAuditLog(`Публикувано съобщение „${cleanTitle}“`, null, { title: cleanTitle });
      pushToast('success', 'Съобщението е публикувано.');
    },
    [announcements, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const togglePinAnnouncement = useCallback(
    async (id: string, isPinned: boolean) => {
      const next = announcements
        .map((a) => (a.id === id ? { ...a, is_pinned: isPinned } : a))
        .sort((a, b) => (a.is_pinned === b.is_pinned ? 0 : a.is_pinned ? -1 : 1));
      setAnnouncements(next);
      saveLocalMirror({ announcements: next });

      if (usingSupabase && isValidUuid(id)) {
        await supabase
          .from('ticket_announcements')
          .update({ is_pinned: isPinned })
          .eq('id', id)
          .eq('school_id', schoolId);
      }
    },
    [announcements, schoolId, usingSupabase, saveLocalMirror]
  );

  const deleteAnnouncement = useCallback(
    async (id: string) => {
      const next = announcements.filter((a) => a.id !== id);
      setAnnouncements(next);
      saveLocalMirror({ announcements: next });

      if (usingSupabase && isValidUuid(id)) {
        await supabase.from('ticket_announcements').delete().eq('id', id).eq('school_id', schoolId);
      }

      await addAuditLog('Изтрито съобщение', null, { id });
      pushToast('info', 'Съобщението е изтрито.');
    },
    [announcements, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  // Departments CRUD
  const createDepartment = useCallback(
    async (name: string, description?: string, color?: string, manager_name?: string) => {
      const cleanName = name.trim();
      if (!cleanName) return;

      const dept: TicketDepartment = {
        id: makeUuid(),
        school_id: schoolId,
        name: cleanName,
        description: description?.trim() || null,
        color: color?.trim() || 'blue',
        manager_name: manager_name?.trim() || null,
        created_at: new Date().toISOString(),
      };

      const next = [...departments, dept];
      setDepartments(next);
      saveLocalMirror({ departments: next });

      if (usingSupabase) {
        await supabase.from('ticket_departments').insert({
          id: dept.id,
          school_id: schoolId,
          name: dept.name,
          description: dept.description,
        });
      }

      await addAuditLog(`Създаден отдел „${cleanName}“`, null, { deptName: cleanName });
      pushToast('success', `Отделът „${cleanName}“ е създаден.`);
    },
    [departments, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const updateDepartment = useCallback(
    async (id: string, name: string, description?: string, color?: string, manager_name?: string) => {
      const cleanName = name.trim();
      if (!cleanName) return;

      const next = departments.map((d) =>
        d.id === id
          ? {
              ...d,
              name: cleanName,
              description: description?.trim() || null,
              color: color !== undefined ? color : d.color,
              manager_name: manager_name !== undefined ? manager_name?.trim() || null : d.manager_name,
            }
          : d
      );
      setDepartments(next);
      saveLocalMirror({ departments: next });

      if (usingSupabase && isValidUuid(id)) {
        await supabase
          .from('ticket_departments')
          .update({ name: cleanName, description: description?.trim() || null })
          .eq('id', id)
          .eq('school_id', schoolId);
      }

      await addAuditLog(`Редактиран отдел „${cleanName}“`, null, { id, cleanName });
      pushToast('success', 'Отделът е обновен.');
    },
    [departments, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const deleteDepartment = useCallback(
    async (id: string): Promise<boolean> => {
      const linkedTicketsCount = tickets.filter((t) => t.department_id === id).length;
      if (linkedTicketsCount > 0) {
        pushToast(
          'error',
          `Този отдел не може да се изтрие, защото съдържа ${linkedTicketsCount} свързани заявки.`
        );
        return false;
      }

      const next = departments.filter((d) => d.id !== id);
      setDepartments(next);
      saveLocalMirror({ departments: next });

      if (usingSupabase && isValidUuid(id)) {
        await supabase.from('ticket_departments').delete().eq('id', id).eq('school_id', schoolId);
      }

      await addAuditLog('Изтрит отдел', null, { id });
      pushToast('info', 'Отделът е изтрит.');
      return true;
    },
    [tickets, departments, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  // Audit Logs Management
  const deleteAuditLog = useCallback(
    async (id: string) => {
      const next = auditLogs.filter((l) => l.id !== id);
      setAuditLogs(next);
      saveLocalMirror({ auditLogs: next });

      if (usingSupabase && isValidUuid(id)) {
        await supabase.from('ticket_audit_logs').delete().eq('id', id).eq('school_id', schoolId);
      }
    },
    [auditLogs, schoolId, usingSupabase, saveLocalMirror]
  );

  const clearAuditLogs = useCallback(async () => {
    setAuditLogs([]);
    saveLocalMirror({ auditLogs: [] });

    if (usingSupabase) {
      await supabase.from('ticket_audit_logs').delete().eq('school_id', schoolId);
    }
    pushToast('info', 'Журналът с действия беше изчистен.');
  }, [schoolId, usingSupabase, saveLocalMirror, pushToast]);

  // CSV Export for Excel/Numbers
  const exportTicketsCsv = useCallback(() => {
    const headers = [
      'ID',
      'Заглавие',
      'Отдел',
      'Помещение/Кабинет',
      'Приоритет',
      'Статус',
      'Създател',
      'Отговорник',
      'Дата на създаване',
    ];

    const rows = enrichedTickets.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.department_name || '').replace(/"/g, '""')}"`,
      `"${(t.room_or_location || '').replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      `"${(t.creator_name || '').replace(/"/g, '""')}"`,
      `"${(t.assignee_name || '').replace(/"/g, '""')}"`,
      new Date(t.created_at).toLocaleString('bg-BG'),
    ]);

    // Prepend UTF-8 BOM so Excel opens Bulgarian Cyrillic characters properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-report-${school.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    pushToast('success', 'Справката е експортирана в CSV.');
  }, [enrichedTickets, school.slug, pushToast]);

  return {
    isLoading,
    usingSupabase,
    toasts,
    pushToast,
    dismissToast,

    departments,
    tickets: enrichedTickets,
    messages,
    channels,
    channelMessages,
    announcements,
    auditLogs,
    attachments: allDocuments,
    allDocuments,

    createTicket,
    updateTicketStatus,
    updateTicketPriority,
    updateTicketAssignee,
    editTicket,
    deleteTicket,
    addAttachmentToTask,
    deleteAttachment,

    sendMessage,

    createChannel,
    toggleChannelActive,
    deleteChannel,
    sendChannelMessage,

    createAnnouncement,
    togglePinAnnouncement,
    deleteAnnouncement,

    createDepartment,
    updateDepartment,
    deleteDepartment,

    deleteAuditLog,
    clearAuditLogs,
    exportTicketsCsv,
  };
}
