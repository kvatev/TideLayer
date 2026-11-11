import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  supabase,
  ROLE_LABELS,
  deactivateSchoolUser,
  reactivateSchoolUser,
  type SchoolRecord,
  type SchoolUserRecord,
  type SchoolPortalSession,
} from '../../lib/supabase';
import {
  isValidUuid,
  makeUuid,
  normalizeTaskStatus,
  type ChannelMessage,
  type DepartmentMembership,
  type DocumentFileType,
  type DocumentRegisterItem,
  type InAppNotification,
  type NotificationType,
  type RegisterDocType,
  type SchoolTicket,
  type TaskActivityAction,
  type TaskActivityLog,
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
  departmentMemberships?: DepartmentMembership[];
  tickets: SchoolTicket[];
  messages: TicketMessage[];
  orders: TicketOrder[];
  channels: TicketChannel[];
  channelMessages: ChannelMessage[];
  announcements: TicketAnnouncement[];
  auditLogs: TicketAuditLog[];
  attachments?: TaskDocumentAttachment[];
  taskActivityLogs?: TaskActivityLog[];
  documentRegister?: DocumentRegisterItem[];
  notifications?: InAppNotification[];
  hasInitialized?: boolean;
}

export function generateNextTaskCode(existingTickets: SchoolTicket[]): string {
  let maxNum = 1000;
  for (const t of existingTickets) {
    if (t.code) {
      const m = t.code.match(/^TSK-(\d+)$/i);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    }
  }
  return `TSK-${maxNum + 1}`;
}

export function generateNextRegNumber(
  existingDocs: DocumentRegisterItem[],
  type: RegisterDocType,
  year: number = new Date().getFullYear()
): string {
  const prefix = type === 'incoming' ? 'ВХ' : type === 'outgoing' ? 'ИЗХ' : 'ВЪТР';
  const regex = new RegExp(`^${prefix}-(\\d+)/${year}$`);
  let maxNum = 100;
  for (const doc of existingDocs) {
    const match = doc.reg_number.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  return `${prefix}-${maxNum + 1}/${year}`;
}

function buildStarterTicketsData(
  schoolId: string,
  schoolUsers: SchoolUserRecord[]
): LocalTicketsSnapshot {
  const now = new Date();
  const year = now.getFullYear();

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

  const directorUser =
    schoolUsers.find((u) => u.role === 'director' || u.role === 'school_admin') || schoolUsers[0];
  const deputyUser =
    schoolUsers.find((u) => u.role === 'deputy_director') || schoolUsers[1] || schoolUsers[0];
  const adminUser =
    schoolUsers.find((u) => u.role === 'administration') || schoolUsers[2] || schoolUsers[0];
  const teacherUser =
    schoolUsers.find((u) => u.role === 'teacher' && u.is_active !== false) || schoolUsers[3] || schoolUsers[0];
  const formerUser =
    schoolUsers.find((u) => u.is_active === false) || {
      id: 'usr-former-1',
      school_id: schoolId,
      auth_user_id: null,
      email: 'dimitar.ivanov@petkanov.bg',
      password_hash: 'school123',
      pin_code: '9999',
      full_name: 'Димитър Иванов (Бивш учител по физика)',
      role: 'teacher' as const,
      allowed_modules: ['duty' as const, 'tickets' as const],
      is_active: false,
      created_at: new Date(Date.now() - 86400000 * 200).toISOString(),
    };

  const validCreatorId = directorUser ? directorUser.id : null;

  // Department memberships (с пълна история и интервали от дати)
  const departmentMemberships: DepartmentMembership[] = [];
  if (directorUser) {
    departmentMemberships.push({
      id: makeUuid(),
      school_id: schoolId,
      department_id: dept1Id,
      user_id: directorUser.id,
      is_lead: true,
      is_active: true,
      started_at: new Date(Date.now() - 86400000 * 365).toISOString(),
      ended_at: null,
      created_at: now.toISOString(),
      user_name: directorUser.full_name,
      user_role: directorUser.role,
      department_name: 'Ръководство и Педагогически съвет',
    });
  }
  if (deputyUser) {
    departmentMemberships.push(
      {
        id: makeUuid(),
        school_id: schoolId,
        department_id: dept1Id,
        user_id: deputyUser.id,
        is_lead: false,
        is_active: true,
        started_at: new Date(Date.now() - 86400000 * 365).toISOString(),
        ended_at: null,
        created_at: now.toISOString(),
        user_name: deputyUser.full_name,
        user_role: deputyUser.role,
        department_name: 'Ръководство и Педагогически съвет',
      },
      {
        id: makeUuid(),
        school_id: schoolId,
        department_id: dept2Id,
        user_id: deputyUser.id,
        is_lead: true,
        is_active: true,
        started_at: new Date(Date.now() - 86400000 * 365).toISOString(),
        ended_at: null,
        created_at: now.toISOString(),
        user_name: deputyUser.full_name,
        user_role: deputyUser.role,
        department_name: 'Учебна дейност и Класни ръководители',
      }
    );
  }
  if (teacherUser) {
    // Текущо активно членство
    departmentMemberships.push({
      id: makeUuid(),
      school_id: schoolId,
      department_id: dept2Id,
      user_id: teacherUser.id,
      is_lead: false,
      is_active: true,
      started_at: new Date(Date.now() - 86400000 * 120).toISOString(),
      ended_at: null,
      created_at: now.toISOString(),
      user_name: teacherUser.full_name,
      user_role: teacherUser.role,
      department_name: 'Учебна дейност и Класни ръководители',
    });
    // Историческо приключило членство (преди преместването от Администрация)
    departmentMemberships.push({
      id: makeUuid(),
      school_id: schoolId,
      department_id: dept3Id,
      user_id: teacherUser.id,
      is_lead: false,
      is_active: false,
      started_at: new Date(Date.now() - 86400000 * 300).toISOString(),
      ended_at: new Date(Date.now() - 86400000 * 121).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 300).toISOString(),
      user_name: teacherUser.full_name,
      user_role: teacherUser.role,
      department_name: 'Администрация, ЗАС и Човешки ресурси',
    });
  }
  if (adminUser) {
    departmentMemberships.push(
      {
        id: makeUuid(),
        school_id: schoolId,
        department_id: dept3Id,
        user_id: adminUser.id,
        is_lead: true,
        is_active: true,
        started_at: new Date(Date.now() - 86400000 * 365).toISOString(),
        ended_at: null,
        created_at: now.toISOString(),
        user_name: adminUser.full_name,
        user_role: adminUser.role,
        department_name: 'Администрация, ЗАС и Човешки ресурси',
      },
      {
        id: makeUuid(),
        school_id: schoolId,
        department_id: dept4Id,
        user_id: adminUser.id,
        is_lead: true,
        is_active: true,
        started_at: new Date(Date.now() - 86400000 * 365).toISOString(),
        ended_at: null,
        created_at: now.toISOString(),
        user_name: adminUser.full_name,
        user_role: adminUser.role,
        department_name: 'ИТ инфраструктура и Техническа поддръжка',
      }
    );
  }
  if (formerUser) {
    // Историческо приключило членство на напуснал служител
    departmentMemberships.push({
      id: makeUuid(),
      school_id: schoolId,
      department_id: dept2Id,
      user_id: formerUser.id,
      is_lead: false,
      is_active: false,
      started_at: new Date(Date.now() - 86400000 * 400).toISOString(),
      ended_at: new Date(Date.now() - 86400000 * 45).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 400).toISOString(),
      user_name: formerUser.full_name,
      user_role: formerUser.role,
      department_name: 'Учебна дейност и Класни ръководители',
    });
  }

  const tk1Id = makeUuid();
  const tk2Id = makeUuid();
  const tk3Id = makeUuid();
  const tk4Id = makeUuid();
  const tk5Id = makeUuid();

  const inFiveDays = new Date(Date.now() + 86400000 * 5).toISOString();
  const inTwoDays = new Date(Date.now() + 86400000 * 2).toISOString();
  const pastThreeDays = new Date(Date.now() - 86400000 * 3).toISOString();

  const tickets: SchoolTicket[] = [
    {
      id: tk1Id,
      school_id: schoolId,
      code: 'TSK-1001',
      department_id: dept1Id,
      created_by_user_id: validCreatorId,
      primary_assignee_id: deputyUser ? deputyUser.id : null,
      assigned_to_user_id: deputyUser ? deputyUser.id : null,
      assigned_user_ids: teacherUser ? [teacherUser.id] : [],
      assigned_role_target: 'all_teachers',
      due_date: inFiveDays,
      title: 'Предаване на Годишен тематичен план и график за контролни работи (I срок)',
      description:
        'Колеги, моля всички учители и класни ръководители да попълнят и качат своите годишни тематични планове по приложения утвърден образец от МОН до указания краен срок.',
      room_or_location: 'Учителска стая / Дигитален портал',
      priority: 'high',
      status: 'in_progress',
      is_recurring: false,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: tk2Id,
      school_id: schoolId,
      code: 'TSK-1002',
      department_id: dept2Id,
      created_by_user_id: deputyUser ? deputyUser.id : null,
      primary_assignee_id: teacherUser ? teacherUser.id : null,
      assigned_to_user_id: teacherUser ? teacherUser.id : null,
      assigned_role_target: 'all_teachers',
      due_date: inTwoDays,
      title: 'Месечна справка за отсъствия и неизвинени часове към МОН',
      description:
        'Изисква се въвеждане на обобщените данни за отсъствията за изминалия месец по паралелки с цел предаване на доклад към Регионалното управление на образованието.',
      room_or_location: 'Канцелария / Дигитален кабинет',
      priority: 'urgent',
      status: 'new',
      is_recurring: true,
      recurrence_interval: 'monthly',
      recurrence_next_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
      recurrence_is_active: true,
      created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    },
    {
      id: tk3Id,
      school_id: schoolId,
      code: 'TSK-1003',
      department_id: dept3Id,
      created_by_user_id: adminUser ? adminUser.id : null,
      primary_assignee_id: teacherUser ? teacherUser.id : null,
      assigned_to_user_id: teacherUser ? teacherUser.id : null,
      due_date: pastThreeDays,
      title: 'Заверка на трудови досиета, декларации за квалификация и GDPR',
      description:
        'Счетоводството и ЗАС събират подписани декларации за придобити професионално-квалификационни степени (ПКС) и декларации за защита на личните данни.',
      room_or_location: 'Кабинет ЗАС (Етаж 1)',
      priority: 'medium',
      status: 'awaiting_approval',
      is_recurring: false,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: tk4Id,
      school_id: schoolId,
      code: 'TSK-1004',
      department_id: dept4Id,
      created_by_user_id: teacherUser ? teacherUser.id : null,
      primary_assignee_id: adminUser ? adminUser.id : null,
      assigned_to_user_id: adminUser ? adminUser.id : null,
      title: 'Инсталиране на софтуерни симулации за STEM кабинет 302',
      description:
        'Необходимо е инсталиране на актуализирани софтуерни пакети за физика и химия на интерактивния дисплей и 15-те работни станции.',
      room_or_location: 'STEM Кабинет 302',
      priority: 'low',
      status: 'completed',
      completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      approved_by_user_id: directorUser ? directorUser.id : null,
      is_recurring: false,
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: tk5Id,
      school_id: schoolId,
      code: 'TSK-1005',
      department_id: dept2Id,
      created_by_user_id: validCreatorId,
      primary_assignee_id: formerUser.id,
      assigned_to_user_id: formerUser.id,
      assigned_user_ids: teacherUser ? [teacherUser.id] : [],
      due_date: inTwoDays,
      title: 'Годишна инвентаризация и калибриране на уредите в кабинет 208',
      description:
        'Във връзка с предстоящото оценяване е необходимо да се изготви протокол за техническата изправност на лабораторните уреди по физика и астрономия.',
      room_or_location: 'Лаборатория 208',
      priority: 'high',
      status: 'in_progress',
      is_recurring: false,
      created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 50).toISOString(),
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
  ];

  // Document Register Starter Entries (Workflow B)
  const documentRegister: DocumentRegisterItem[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      reg_number: `ВХ-101/${year}`,
      reg_date: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
      doc_type: 'incoming',
      title: 'Указания от МОН относно провеждането на Национално външно оценяване (НВО)',
      sender: 'Министерство на образованието и науката (МОН)',
      recipient: null,
      department_id: dept1Id,
      responsible_user_id: directorUser ? directorUser.id : null,
      file_name: 'Ukazaniya_MON_NVO_2026.pdf',
      file_url: '#',
      file_size_bytes: 654320,
      file_type: 'pdf',
      mime_type: 'application/pdf',
      linked_task_id: tk1Id,
      is_archived: false,
      notes: 'Свързано със задача за подготовка на графиците за I срок.',
      created_by_user_id: directorUser ? directorUser.id : null,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      reg_number: `ИЗХ-42/${year}`,
      reg_date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
      doc_type: 'outgoing',
      title: 'Заявка за осигуряване на безплатни учебници и учебни комплекти',
      sender: null,
      recipient: 'Регионално управление на образованието (РУО)',
      department_id: dept3Id,
      responsible_user_id: adminUser ? adminUser.id : null,
      file_name: 'Zayavka_Uchebnitsi_RUO.xlsx',
      file_url: '#',
      file_size_bytes: 142000,
      file_type: 'excel',
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      linked_task_id: null,
      is_archived: false,
      notes: 'Изпратено официално по електронен път с КЕП.',
      created_by_user_id: adminUser ? adminUser.id : null,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      reg_number: `ВЪТР-15/${year}`,
      reg_date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
      doc_type: 'internal',
      title: 'Заповед № РД-09-114 за определяне на комисия за инвентаризация на ДМА и МЗ',
      sender: 'Директор на училището',
      recipient: 'Членовете на комисията по инвентаризация',
      department_id: dept1Id,
      responsible_user_id: directorUser ? directorUser.id : null,
      file_name: 'Zapoved_RD09_114_Inventarizatsiya.pdf',
      file_url: '#',
      file_size_bytes: 388000,
      file_type: 'pdf',
      mime_type: 'application/pdf',
      linked_task_id: null,
      is_archived: false,
      notes: 'Вътрешна заповед в изпълнение на Закона за счетоводството.',
      created_by_user_id: directorUser ? directorUser.id : null,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      reg_number: `ВХ-102/${year}`,
      reg_date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
      doc_type: 'incoming',
      title: 'Предложение от Училищното настоятелство за спортен празник и турнир по волейбол',
      sender: 'Училищно настоятелство "Христо Ботев"',
      recipient: null,
      department_id: dept2Id,
      responsible_user_id: deputyUser ? deputyUser.id : null,
      file_name: 'Predlozhenie_Nastoyatelstvo_Turnir.pdf',
      file_url: '#',
      file_size_bytes: 295000,
      file_type: 'pdf',
      mime_type: 'application/pdf',
      linked_task_id: null,
      is_archived: false,
      notes: 'Предложение за организиране на патронен турнир през ноември.',
      created_by_user_id: deputyUser ? deputyUser.id : null,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  // In-App Notifications
  const notifications: InAppNotification[] = [];
  if (deputyUser) {
    notifications.push({
      id: makeUuid(),
      school_id: schoolId,
      user_id: deputyUser.id,
      type: 'task_assigned',
      title: 'Възложена задача: Предаване на Годишен план',
      message: 'Директорът ви възложи задача "Предаване на Годишен тематичен план".',
      task_id: tk1Id,
      document_id: null,
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    });
  }
  if (teacherUser) {
    notifications.push({
      id: makeUuid(),
      school_id: schoolId,
      user_id: teacherUser.id,
      type: 'deadline_approaching',
      title: 'Приближаващ краен срок',
      message: 'Остават по-малко от 48 часа за задача "Месечна справка за отсъствия".',
      task_id: tk2Id,
      document_id: null,
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    });
  }

  // Task Activity Logs
  const taskActivityLogs: TaskActivityLog[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk1Id,
      actor_user_id: directorUser?.id || null,
      actor_name: directorUser?.full_name || 'Директор',
      action: 'created',
      details: 'Създадена задача TSK-1001',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk1Id,
      actor_user_id: deputyUser?.id || null,
      actor_name: deputyUser?.full_name || 'Зам.-директор',
      action: 'started',
      details: 'Започната работа по задачата',
      previous_value: 'new',
      new_value: 'in_progress',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk3Id,
      actor_user_id: teacherUser?.id || null,
      actor_name: teacherUser?.full_name || 'Учител',
      action: 'submitted_for_approval',
      details: 'Предадена за одобрение от ръководството',
      previous_value: 'in_progress',
      new_value: 'awaiting_approval',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk4Id,
      actor_user_id: directorUser?.id || null,
      actor_name: directorUser?.full_name || 'Директор',
      action: 'approved',
      details: 'Одобрена и финализирана от Директора',
      previous_value: 'awaiting_approval',
      new_value: 'completed',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      task_id: tk5Id,
      actor_user_id: directorUser?.id || null,
      actor_name: directorUser?.full_name || 'д-р Валентина Каменова',
      actor_role: 'director',
      actor_department_name: 'Ръководство и Педагогически съвет',
      action: 'created',
      entity_type: 'task',
      entity_id: tk5Id,
      details: `Създадена задача TSK-1005. Главен отговорник: ${formerUser.full_name}`,
      new_value: formerUser.full_name,
      created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
  ];

  const messages: TicketMessage[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      ticket_id: tk1Id,
      sender_user_id: directorUser?.id || null,
      sender_name: directorUser?.full_name || 'д-р Валентина Каменова',
      message:
        'Колеги, качил съм образеца за 2026 г. Моля да спазвате формата при изготвяне на тематичните планове.',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      ticket_id: tk1Id,
      sender_user_id: deputyUser?.id || null,
      sender_name: deputyUser?.full_name || 'Мария Тодорова',
      message:
        'Прието. Започваме събирането на плановете от методическите обединения в срок.',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];

  const orders: TicketOrder[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      ticket_id: tk4Id,
      item_name: 'Лицензи за образователен софтуер STEM симулации (15 работни места)',
      quantity: 15,
      estimated_price: 450,
      status: 'approved',
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
  ];

  const channels: TicketChannel[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      name: 'Общ педагогически канал',
      channel_type: 'general',
      is_active: true,
      created_at: now.toISOString(),
    },
    {
      id: makeUuid(),
      school_id: schoolId,
      name: 'Методическо обединение по Природни науки',
      channel_type: 'department',
      is_active: true,
      created_at: now.toISOString(),
    },
  ];

  const channelMessages: ChannelMessage[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      channel_id: channels[0].id,
      sender_name: directorUser?.full_name || 'Директор',
      sender_role: 'Директор',
      content:
        'Добре дошли в обновения модул за управление на задачи и документи на училището. Всички графици и официални формуляри се разпределят тук.',
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
  ];

  const announcements: TicketAnnouncement[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      title: 'Заповед за откриване на новата учебна сесия и задължителни инструктажи',
      content:
        'Напомняме на целия педагогически и непедагогически персонал да подпише протоколите за проведен начален инструктаж по безопасност и трудова хигиена в канцеларията на ЗАС.',
      is_pinned: true,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  const auditLogs: TicketAuditLog[] = [
    {
      id: makeUuid(),
      school_id: schoolId,
      ticket_id: tk1Id,
      actor_name: directorUser?.full_name || 'Директор',
      action: 'Създадена задача TSK-1001: Годишен тематичен план',
      details: { code: 'TSK-1001' },
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
  ];

  return {
    departments,
    departmentMemberships,
    tickets,
    messages,
    orders,
    channels,
    channelMessages,
    announcements,
    auditLogs,
    attachments,
    taskActivityLogs,
    documentRegister,
    notifications,
    hasInitialized: true,
  };
}

function readLocalSnapshot(schoolId: string): LocalTicketsSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`tl_tickets_saas_v2_${schoolId}`);
    return raw ? JSON.parse(raw) : null;
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
  const [departmentMemberships, setDepartmentMemberships] = useState<DepartmentMembership[]>([]);
  const [tickets, setTickets] = useState<SchoolTicket[]>([]);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [channels, setChannels] = useState<TicketChannel[]>([]);
  const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>([]);
  const [announcements, setAnnouncements] = useState<TicketAnnouncement[]>([]);
  const [auditLogs, setAuditLogs] = useState<TicketAuditLog[]>([]);
  const [attachments, setAttachments] = useState<TaskDocumentAttachment[]>([]);
  const [taskActivityLogs, setTaskActivityLogs] = useState<TaskActivityLog[]>([]);
  const [documentRegister, setDocumentRegister] = useState<DocumentRegisterItem[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
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
        departmentMemberships: [],
        tickets: [],
        messages: [],
        orders: [],
        channels: [],
        channelMessages: [],
        announcements: [],
        auditLogs: [],
        attachments: [],
        taskActivityLogs: [],
        documentRegister: [],
        notifications: [],
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

      const [dRes, tRes, mRes, oRes, cRes, aRes, lRes, attRes, memRes, actRes, docRes, notifRes] =
        await Promise.all([
          supabase.from('ticket_departments').select('*').eq('school_id', schoolId).order('name'),
          supabase
            .from('tickets')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false }),
          supabase
            .from('ticket_messages')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: true }),
          supabase
            .from('ticket_orders')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false }),
          supabase
            .from('ticket_channels')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: true }),
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
          supabase.from('department_memberships').select('*').eq('school_id', schoolId),
          supabase
            .from('task_activity_logs')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false }),
          supabase
            .from('document_register')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false }),
          supabase
            .from('in_app_notifications')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false })
            .limit(50),
        ]);

      if (!active) return;

      const supabaseReady =
        !dRes.error &&
        !tRes.error &&
        !mRes.error &&
        !oRes.error &&
        !cRes.error &&
        !aRes.error &&
        !lRes.error;

      if (supabaseReady) {
        setUsingSupabase(true);
        let dbDepts = (dRes.data || []) as TicketDepartment[];
        let dbTickets = (tRes.data || []) as SchoolTicket[];
        let dbMessages = (mRes.data || []) as TicketMessage[];
        let dbOrders = (oRes.data || []) as TicketOrder[];
        let dbChannels = (cRes.data || []) as TicketChannel[];
        let dbAnnouncements = (aRes.data || []) as TicketAnnouncement[];
        let dbLogs = (lRes.data || []) as TicketAuditLog[];
        let dbAttachments = (!attRes.error && attRes.data
          ? attRes.data
          : []) as TaskDocumentAttachment[];
        let dbMemberships = (!memRes.error && memRes.data
          ? memRes.data
          : []) as DepartmentMembership[];
        let dbActivityLogs = (!actRes.error && actRes.data
          ? actRes.data
          : []) as TaskActivityLog[];
        let dbDocRegister = (!docRes.error && docRes.data
          ? docRes.data
          : []) as DocumentRegisterItem[];
        let dbNotifications = (!notifRes.error && notifRes.data
          ? notifRes.data
          : []) as InAppNotification[];

        // If fresh school in Supabase with zero departments and zero tickets, bootstrap starter data
        if (dbDepts.length === 0 && dbTickets.length === 0 && !localSnap?.hasInitialized) {
          const starter = buildStarterTicketsData(schoolId, schoolUsers);
          await Promise.all([
            supabase.from('ticket_departments').insert(starter.departments),
            supabase.from('tickets').insert(
              starter.tickets.map((t) => ({
                id: t.id,
                school_id: schoolId,
                code: t.code,
                department_id: t.department_id,
                created_by_user_id: t.created_by_user_id,
                primary_assignee_id: t.primary_assignee_id,
                assigned_to_user_id: t.assigned_to_user_id,
                assigned_role_target: t.assigned_role_target || null,
                assigned_user_ids: t.assigned_user_ids || [],
                due_date: t.due_date || null,
                title: t.title,
                description: t.description,
                room_or_location: t.room_or_location,
                priority: t.priority,
                status: t.status,
                is_recurring: t.is_recurring || false,
                recurrence_interval: t.recurrence_interval || null,
                recurrence_next_date: t.recurrence_next_date || null,
                recurrence_is_active: t.recurrence_is_active ?? true,
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
            starter.departmentMemberships && starter.departmentMemberships.length > 0
              ? supabase.from('department_memberships').insert(
                  starter.departmentMemberships.map((m) => ({
                    id: m.id,
                    school_id: schoolId,
                    department_id: m.department_id,
                    user_id: m.user_id,
                    is_lead: m.is_lead || false,
                  }))
                )
              : Promise.resolve(),
            starter.documentRegister && starter.documentRegister.length > 0
              ? supabase.from('document_register').insert(starter.documentRegister)
              : Promise.resolve(),
            starter.notifications && starter.notifications.length > 0
              ? supabase.from('in_app_notifications').insert(starter.notifications)
              : Promise.resolve(),
            starter.taskActivityLogs && starter.taskActivityLogs.length > 0
              ? supabase.from('task_activity_logs').insert(starter.taskActivityLogs)
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
          dbMemberships = starter.departmentMemberships || [];
          dbActivityLogs = starter.taskActivityLogs || [];
          dbDocRegister = starter.documentRegister || [];
          dbNotifications = starter.notifications || [];
        }

        if (!active) return;
        setDepartments(dbDepts);
        setDepartmentMemberships(
          dbMemberships.length > 0 ? dbMemberships : localSnap?.departmentMemberships || []
        );
        setTickets(dbTickets);
        setMessages(dbMessages);
        setOrders(dbOrders);
        setChannels(dbChannels);
        setChannelMessages(localSnap?.channelMessages || []);
        setAnnouncements(dbAnnouncements);
        setAuditLogs(dbLogs);
        setAttachments(dbAttachments.length > 0 ? dbAttachments : localSnap?.attachments || []);
        setTaskActivityLogs(
          dbActivityLogs.length > 0 ? dbActivityLogs : localSnap?.taskActivityLogs || []
        );
        setDocumentRegister(
          dbDocRegister.length > 0 ? dbDocRegister : localSnap?.documentRegister || []
        );
        setNotifications(
          dbNotifications.length > 0 ? dbNotifications : localSnap?.notifications || []
        );

        writeLocalSnapshot(schoolId, {
          departments: dbDepts,
          departmentMemberships:
            dbMemberships.length > 0 ? dbMemberships : localSnap?.departmentMemberships || [],
          tickets: dbTickets,
          messages: dbMessages,
          orders: dbOrders,
          channels: dbChannels,
          channelMessages: localSnap?.channelMessages || [],
          announcements: dbAnnouncements,
          auditLogs: dbLogs,
          attachments: dbAttachments.length > 0 ? dbAttachments : localSnap?.attachments || [],
          taskActivityLogs:
            dbActivityLogs.length > 0 ? dbActivityLogs : localSnap?.taskActivityLogs || [],
          documentRegister:
            dbDocRegister.length > 0 ? dbDocRegister : localSnap?.documentRegister || [],
          notifications:
            dbNotifications.length > 0 ? dbNotifications : localSnap?.notifications || [],
          hasInitialized: true,
        });
        setIsLoading(false);
        return;
      }

      // Local fallback mode
      setUsingSupabase(false);
      if (localSnap && localSnap.hasInitialized) {
        setDepartments(localSnap.departments || []);
        setDepartmentMemberships(localSnap.departmentMemberships || []);
        setTickets(localSnap.tickets || []);
        setMessages(localSnap.messages || []);
        setOrders(localSnap.orders || []);
        setChannels(localSnap.channels || []);
        setChannelMessages(localSnap.channelMessages || []);
        setAnnouncements(localSnap.announcements || []);
        setAuditLogs(localSnap.auditLogs || []);
        setAttachments(localSnap.attachments || []);
        setTaskActivityLogs(localSnap.taskActivityLogs || []);
        setDocumentRegister(localSnap.documentRegister || []);
        setNotifications(localSnap.notifications || []);
        setIsLoading(false);
        return;
      }

      // Fresh local bootstrap
      const starter = buildStarterTicketsData(schoolId, schoolUsers);
      setDepartments(starter.departments);
      setDepartmentMemberships(starter.departmentMemberships || []);
      setTickets(starter.tickets);
      setMessages(starter.messages);
      setOrders(starter.orders);
      setChannels(starter.channels);
      setChannelMessages(starter.channelMessages);
      setAnnouncements(starter.announcements);
      setAuditLogs(starter.auditLogs);
      setAttachments(starter.attachments || []);
      setTaskActivityLogs(starter.taskActivityLogs || []);
      setDocumentRegister(starter.documentRegister || []);
      setNotifications(starter.notifications || []);
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

  const userIsActiveMap = useMemo(
    () => new Map(schoolUsers.map((u) => [u.id, u.is_active !== false])),
    [schoolUsers]
  );

  // Enriched department memberships (с начални/крайни дати и активен флаг)
  const enrichedMemberships = useMemo(() => {
    return departmentMemberships.map((m) => {
      const u = schoolUsers.find((user) => user.id === m.user_id);
      const d = departments.find((dept) => dept.id === m.department_id);
      return {
        ...m,
        user_name: u?.full_name || m.user_name || 'Служител',
        user_role: u?.role || m.user_role || 'Служител',
        user_is_active: u ? u.is_active !== false : (m.user_is_active ?? true),
        department_name: d?.name || m.department_name || 'Направление',
        is_active: m.is_active !== false,
        started_at: m.started_at || m.created_at,
      };
    });
  }, [departmentMemberships, schoolUsers, departments]);

  // Current user's active department IDs
  const currentUserDepartmentIds = useMemo(() => {
    return departmentMemberships
      .filter((m) => m.user_id === session.userId && m.is_active !== false)
      .map((m) => m.department_id);
  }, [departmentMemberships, session.userId]);

  // Enriched tickets
  const enrichedTickets = useMemo(() => {
    return tickets.map((t, idx) => {
      const msgCount = messages.filter((m) => m.ticket_id === t.id).length;
      const taskAttachments = attachments.filter((a) => a.task_id === t.id);
      const logs = taskActivityLogs.filter((l) => l.task_id === t.id);
      const creatorRole = t.created_by_user_id ? userRoleMap.get(t.created_by_user_id) : undefined;
      const assigneeRole = t.assigned_to_user_id ? userRoleMap.get(t.assigned_to_user_id) : undefined;

      const primaryId = t.primary_assignee_id || t.assigned_to_user_id || null;
      const primaryAssigneeUser = primaryId ? schoolUsers.find((u) => u.id === primaryId) : undefined;
      const primaryIsActive = primaryId ? (userIsActiveMap.get(primaryId) ?? true) : true;
      const normStatus = normalizeTaskStatus(t.status);
      const hasInactiveAssignee = Boolean(
        primaryId &&
        !primaryIsActive &&
        normStatus !== 'completed'
      );

      let assigneeLabel = 'Неразпределена';
      if (t.assigned_role_target) {
        if (t.assigned_role_target === 'all_teachers') assigneeLabel = 'Всички учители';
        else if (t.assigned_role_target === 'all_administration')
          assigneeLabel = 'Всички в администрацията';
        else if (t.assigned_role_target === 'all_staff') assigneeLabel = 'Целия персонал';
        else assigneeLabel = t.assigned_role_target;
      } else if (primaryAssigneeUser) {
        assigneeLabel = primaryAssigneeUser.full_name;
      } else if (primaryId) {
        assigneeLabel = userMap.get(primaryId) || 'Служител';
      }

      const additionalAssignees = (t.assigned_user_ids || []).map((id) => {
        const u = schoolUsers.find((user) => user.id === id);
        return {
          id,
          name: u?.full_name || userMap.get(id) || 'Служител',
          role: u?.role
            ? ROLE_LABELS[u.role] || u.role
            : userRoleMap.get(id)
              ? ROLE_LABELS[userRoleMap.get(id)!] || userRoleMap.get(id)!
              : 'Служител',
          is_active: userIsActiveMap.get(id) ?? true,
        };
      });

      const guaranteedCode = t.code || `TSK-${1000 + idx + 1}`;

      return {
        ...t,
        code: guaranteedCode,
        department_name: t.department_id
          ? departmentMap.get(t.department_id) || 'Общо направление'
          : 'Общо направление',
        creator_name: t.created_by_user_id
          ? userMap.get(t.created_by_user_id) || 'Потребител'
          : session.isSuperAdminPreview
            ? 'Главен Администратор'
            : 'Потребител',
        creator_role: creatorRole ? ROLE_LABELS[creatorRole] || creatorRole : undefined,
        assignee_name: assigneeLabel,
        assignee_role: assigneeRole ? ROLE_LABELS[assigneeRole] || assigneeRole : undefined,
        primary_assignee_name: primaryAssigneeUser?.full_name || (primaryId ? userMap.get(primaryId) : undefined),
        primary_assignee_role: primaryAssigneeUser?.role
          ? ROLE_LABELS[primaryAssigneeUser.role] || primaryAssigneeUser.role
          : assigneeRole
            ? ROLE_LABELS[assigneeRole] || assigneeRole
            : undefined,
        primary_assignee_is_active: primaryIsActive,
        has_inactive_assignee: hasInactiveAssignee,
        additional_assignees: additionalAssignees,
        approved_by_name: t.approved_by_user_id ? userMap.get(t.approved_by_user_id) : undefined,
        messages_count: msgCount,
        attachments_count: taskAttachments.length,
        attachments: taskAttachments,
        activity_logs: logs,
      };
    });
  }, [
    tickets,
    messages,
    attachments,
    taskActivityLogs,
    departmentMap,
    userMap,
    userRoleMap,
    userIsActiveMap,
    schoolUsers,
    session.isSuperAdminPreview,
  ]);

  // All documents for 365-day history
  const allDocuments = useMemo(() => {
    return [...attachments].sort(
      (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
  }, [attachments]);

  // Unread notifications count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  // Record audit log helper
  const addAuditLog = useCallback(
    async (
      action: string,
      ticketId: string | null = null,
      details: Record<string, unknown> | null = null
    ) => {
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

  // Log task activity (с пълен snapshot на актьора, ролята, отдела и причината)
  const logTaskActivity = useCallback(
    async (
      taskId: string,
      action: TaskActivityAction,
      details?: string,
      previousValue?: string,
      newValue?: string,
      reason?: string | null
    ) => {
      const activeDept = departmentMemberships.find(
        (m) => m.user_id === session.userId && m.is_active !== false
      );
      const newLog: TaskActivityLog = {
        id: makeUuid(),
        school_id: schoolId,
        task_id: taskId,
        user_id: isValidUuid(session.userId) ? session.userId : null,
        user_name: session.fullName,
        actor_user_id: isValidUuid(session.userId) ? session.userId : null,
        actor_name: session.fullName,
        actor_role: session.role ? ROLE_LABELS[session.role] || session.role : 'Служител',
        actor_department_name: activeDept?.department_name || 'Общо ръководство',
        action,
        entity_type: 'task',
        entity_id: taskId,
        details: details || null,
        notes: details || null,
        previous_value: previousValue || null,
        new_value: newValue || null,
        reason: reason || null,
        created_at: new Date().toISOString(),
      };
      const next = [newLog, ...taskActivityLogs];
      setTaskActivityLogs(next);
      saveLocalMirror({ taskActivityLogs: next });

      if (usingSupabase) {
        await supabase.from('task_activity_logs').insert(newLog);
      }
      return newLog;
    },
    [
      schoolId,
      session.userId,
      session.fullName,
      session.role,
      departmentMemberships,
      taskActivityLogs,
      usingSupabase,
      saveLocalMirror,
    ]
  );

  // In-app Notifications
  const createNotification = useCallback(
    async (input: {
      user_id: string;
      type: NotificationType;
      title: string;
      message: string;
      task_id?: string;
      document_id?: string;
    }) => {
      const newNotif: InAppNotification = {
        id: makeUuid(),
        school_id: schoolId,
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        message: input.message,
        task_id: input.task_id || null,
        document_id: input.document_id || null,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      const next = [newNotif, ...notifications];
      setNotifications(next);
      saveLocalMirror({ notifications: next });

      if (usingSupabase) {
        await supabase.from('in_app_notifications').insert(newNotif);
      }
    },
    [schoolId, notifications, usingSupabase, saveLocalMirror]
  );

  const markNotificationAsRead = useCallback(
    async (id: string) => {
      const next = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      setNotifications(next);
      saveLocalMirror({ notifications: next });

      if (usingSupabase) {
        await supabase
          .from('in_app_notifications')
          .update({ is_read: true })
          .eq('id', id)
          ;
      }
    },
    [notifications, usingSupabase, saveLocalMirror]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    const next = notifications.map((n) => ({ ...n, is_read: true }));
    setNotifications(next);
    saveLocalMirror({ notifications: next });

    if (usingSupabase) {
      await supabase
        .from('in_app_notifications')
        .update({ is_read: true })
        .eq('school_id', schoolId)
        ;
    }
    pushToast('info', 'Всички известия са маркирани като прочетени.');
  }, [notifications, schoolId, usingSupabase, saveLocalMirror, pushToast]);

  const deleteNotification = useCallback(
    async (id: string) => {
      const next = notifications.filter((n) => n.id !== id);
      setNotifications(next);
      saveLocalMirror({ notifications: next });

      if (usingSupabase) {
        await supabase
          .from('in_app_notifications')
          .delete()
          .eq('id', id)
          ;
      }
    },
    [notifications, usingSupabase, saveLocalMirror]
  );

  // Access Control & Permission Helpers
  const isDirectorOrAdmin =
    session.isSuperAdminPreview ||
    session.role === 'director' ||
    session.role === 'school_admin';

  const canUserAccessTask = useCallback(
    (task: SchoolTicket): boolean => {
      if (isDirectorOrAdmin) return true;
      if (session.role === 'observer') return true; // read-only access
      if (task.primary_assignee_id === session.userId || task.assigned_to_user_id === session.userId)
        return true;
      if (task.created_by_user_id === session.userId) return true;
      if (task.assigned_user_ids?.includes(session.userId)) return true;
      if (task.department_id && currentUserDepartmentIds.includes(task.department_id)) return true;
      if (task.assigned_role_target === 'all_staff') return true;
      if (task.assigned_role_target === 'all_teachers' && session.role === 'teacher') return true;
      if (
        task.assigned_role_target === 'all_administration' &&
        (session.role === 'administration' || session.role === 'staff')
      )
        return true;
      return false;
    },
    [isDirectorOrAdmin, session.role, session.userId, currentUserDepartmentIds]
  );

  const canUserManageTask = useCallback(
    (task: SchoolTicket): boolean => {
      if (isDirectorOrAdmin) return true;
      if (session.role === 'observer') return false;
      if (task.department_id && currentUserDepartmentIds.includes(task.department_id)) {
        const isLead = departmentMemberships.some(
          (m) =>
            m.department_id === task.department_id && m.user_id === session.userId && m.is_lead
        );
        if (isLead || session.role === 'department_manager') return true;
      }
      return false;
    },
    [isDirectorOrAdmin, session.role, session.userId, currentUserDepartmentIds, departmentMemberships]
  );

  const canUserApproveTask = useCallback(
    (task: SchoolTicket): boolean => {
      if (isDirectorOrAdmin) return true;
      if (
        session.role === 'department_manager' &&
        task.department_id &&
        currentUserDepartmentIds.includes(task.department_id)
      )
        return true;
      const isLead =
        task.department_id &&
        departmentMemberships.some(
          (m) =>
            m.department_id === task.department_id && m.user_id === session.userId && m.is_lead
        );
      return !!isLead;
    },
    [isDirectorOrAdmin, session.role, session.userId, currentUserDepartmentIds, departmentMemberships]
  );

  const canUserAccessDocument = useCallback(
    (doc: DocumentRegisterItem): boolean => {
      if (isDirectorOrAdmin) return true;
      if (session.role === 'observer') return true;
      if (doc.responsible_user_id === session.userId) return true;
      if (doc.created_by_user_id === session.userId) return true;
      if (doc.department_id && currentUserDepartmentIds.includes(doc.department_id)) return true;
      return false;
    },
    [isDirectorOrAdmin, session.role, session.userId, currentUserDepartmentIds]
  );

  // Task Creation (Задължителен главен отговорник с валидация за активен статус)
  const createTicket = useCallback(
    async (input: {
      title: string;
      description: string;
      room_or_location?: string;
      department_id?: string | null;
      priority: TicketPriority;
      primary_assignee_id?: string | null;
      assigned_to_user_id?: string | null;
      assigned_role_target?: string | null;
      assigned_user_ids?: string[];
      due_date?: string | null;
      is_recurring?: boolean;
      recurrence_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
      recurrence_next_date?: string | null;
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
      const primaryAssignee =
        input.primary_assignee_id || input.assigned_to_user_id;

      if (!primaryAssignee) {
        pushToast('error', 'Всяка задача трябва да има задължително посочен главен отговорник.');
        throw new Error('Липсва задължителен главен отговорник по задачата.');
      }

      const primaryUser = schoolUsers.find((u) => u.id === primaryAssignee);
      if (primaryUser && primaryUser.is_active === false) {
        pushToast('error', 'Избраният служител е деактивиран/напуснал и не може да бъде главен отговорник.');
        throw new Error('Избраният отговорник е деактивиран/напуснал служител.');
      }

      const validAssigneeId: string | null =
        primaryAssignee && isValidUuid(primaryAssignee) ? primaryAssignee : null;
      const validDeptId: string | null =
        input.department_id && isValidUuid(input.department_id) ? input.department_id : null;

      const code = generateNextTaskCode(tickets);

      const newTicket: SchoolTicket = {
        id: makeUuid(),
        school_id: schoolId,
        code,
        department_id: validDeptId,
        created_by_user_id: validCreatorId,
        primary_assignee_id: validAssigneeId,
        assigned_to_user_id: validAssigneeId,
        assigned_role_target: input.assigned_role_target || null,
        assigned_user_ids: input.assigned_user_ids || [],
        due_date: input.due_date || null,
        title: input.title.trim(),
        description: input.description.trim(),
        room_or_location: input.room_or_location?.trim() || null,
        priority: input.priority,
        status: 'new',
        is_recurring: input.is_recurring || false,
        recurrence_interval: input.recurrence_interval || null,
        recurrence_next_date: input.recurrence_next_date || null,
        recurrence_is_active: input.is_recurring ? true : false,
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
          code: newTicket.code,
          department_id: newTicket.department_id,
          created_by_user_id: newTicket.created_by_user_id,
          primary_assignee_id: newTicket.primary_assignee_id,
          assigned_to_user_id: newTicket.assigned_to_user_id,
          assigned_role_target: newTicket.assigned_role_target,
          assigned_user_ids: newTicket.assigned_user_ids,
          due_date: newTicket.due_date,
          title: newTicket.title,
          description: newTicket.description,
          room_or_location: newTicket.room_or_location,
          priority: newTicket.priority,
          status: newTicket.status,
          is_recurring: newTicket.is_recurring,
          recurrence_interval: newTicket.recurrence_interval,
          recurrence_next_date: newTicket.recurrence_next_date,
          recurrence_is_active: newTicket.recurrence_is_active,
        });

        if (newAttachments.length > 0) {
          await supabase.from('task_document_attachments').insert(newAttachments);
        }
      }

      await logTaskActivity(
        newTicket.id,
        'created',
        `Създадена задача ${newTicket.code}: ${newTicket.title}. Главен отговорник: ${primaryUser?.full_name || primaryAssignee}`,
        undefined,
        primaryUser?.full_name || primaryAssignee
      );
      await addAuditLog(`Създадена нова задача: ${newTicket.title}`, newTicket.id, {
        code: newTicket.code,
        title: newTicket.title,
        priority: newTicket.priority,
        primary_assignee: primaryUser?.full_name || primaryAssignee,
      });

      // Notify primary assigned user
      if (validAssigneeId && validAssigneeId !== session.userId) {
        await createNotification({
          user_id: validAssigneeId,
          type: 'task_assigned',
          title: `Възложена ви е нова задача (${newTicket.code})`,
          message: `${session.fullName} ви възложи като главен отговорник задача: "${newTicket.title}".`,
          task_id: newTicket.id,
        });
      }

      // Notify additional participants
      if (input.assigned_user_ids && input.assigned_user_ids.length > 0) {
        for (const addId of input.assigned_user_ids) {
          if (addId && addId !== validAssigneeId && addId !== session.userId) {
            await createNotification({
              user_id: addId,
              type: 'task_assigned',
              title: `Включени сте в задача (${newTicket.code})`,
              message: `${session.fullName} ви включи като допълнителен участник в задача: "${newTicket.title}".`,
              task_id: newTicket.id,
            });
          }
        }
      }

      pushToast('success', `Задачата ${newTicket.code} е възложена успешно!`);
      return newTicket;
    },
    [
      schoolId,
      session,
      tickets,
      attachments,
      schoolUsers,
      usingSupabase,
      saveLocalMirror,
      addAuditLog,
      logTaskActivity,
      createNotification,
      pushToast,
    ]
  );

  // Task Lifecycle: Start Work
  const startWork = useCallback(
    async (taskId: string) => {
      const t = tickets.find((item) => item.id === taskId);
      if (!t) return;
      const nowIso = new Date().toISOString();
      const updatedTickets = tickets.map((item) =>
        item.id === taskId ? { ...item, status: 'in_progress' as const, updated_at: nowIso } : item
      );
      setTickets(updatedTickets);
      saveLocalMirror({ tickets: updatedTickets });

      if (usingSupabase && isValidUuid(taskId)) {
        await supabase
          .from('tickets')
          .update({ status: 'in_progress', updated_at: nowIso })
          .eq('id', taskId)
          .eq('school_id', schoolId)
          ;
      }

      await logTaskActivity(taskId, 'started', 'Започната работа по задачата', t.status, 'in_progress');
      await addAuditLog(`Започната работа по задача: ${t.title}`, taskId);
      pushToast('info', 'Статусът на задачата е променен на "В процес".');
    },
    [tickets, schoolId, usingSupabase, saveLocalMirror, logTaskActivity, addAuditLog, pushToast]
  );

  // Task Lifecycle: Submit for Approval
  const submitForApproval = useCallback(
    async (taskId: string) => {
      const t = tickets.find((item) => item.id === taskId);
      if (!t) return;
      const nowIso = new Date().toISOString();
      const updatedTickets = tickets.map((item) =>
        item.id === taskId
          ? { ...item, status: 'awaiting_approval' as const, updated_at: nowIso }
          : item
      );
      setTickets(updatedTickets);
      saveLocalMirror({ tickets: updatedTickets });

      if (usingSupabase && isValidUuid(taskId)) {
        await supabase
          .from('tickets')
          .update({ status: 'awaiting_approval', updated_at: nowIso })
          .eq('id', taskId)
          .eq('school_id', schoolId)
          ;
      }

      await logTaskActivity(
        taskId,
        'submitted_for_approval',
        'Предадена за одобрение от ръководството',
        t.status,
        'awaiting_approval'
      );
      await addAuditLog(`Предадена за одобрение: ${t.title}`, taskId);

      // Notify creator or director
      const targetUserId =
        t.created_by_user_id || schoolUsers.find((u) => u.role === 'director')?.id;
      if (targetUserId && targetUserId !== session.userId) {
        await createNotification({
          user_id: targetUserId,
          type: 'task_submitted_for_approval',
          title: `Задача очаква одобрение (${t.code || 'TSK'})`,
          message: `${session.fullName} предаде задача "${t.title}" за финално одобрение.`,
          task_id: taskId,
        });
      }

      pushToast('info', 'Задачата е предадена за финално одобрение.');
    },
    [
      tickets,
      schoolId,
      schoolUsers,
      session.userId,
      session.fullName,
      usingSupabase,
      saveLocalMirror,
      logTaskActivity,
      addAuditLog,
      createNotification,
      pushToast,
    ]
  );

  // Task Lifecycle: Approve Completion
  const approveTask = useCallback(
    async (taskId: string) => {
      const t = tickets.find((item) => item.id === taskId);
      if (!t) return;
      const nowIso = new Date().toISOString();
      const updatedTickets = tickets.map((item) =>
        item.id === taskId
          ? {
              ...item,
              status: 'completed' as const,
              completed_at: nowIso,
              approved_by_user_id: session.userId || null,
              return_reason: null,
              updated_at: nowIso,
            }
          : item
      );
      setTickets(updatedTickets);
      saveLocalMirror({ tickets: updatedTickets });

      if (usingSupabase && isValidUuid(taskId)) {
        await supabase
          .from('tickets')
          .update({
            status: 'completed',
            completed_at: nowIso,
            approved_by_user_id: session.userId || null,
            return_reason: null,
            updated_at: nowIso,
          })
          .eq('id', taskId)
          .eq('school_id', schoolId)
          ;
      }

      await logTaskActivity(
        taskId,
        'approved',
        `Одобрена от ${session.fullName}`,
        t.status,
        'completed'
      );
      await addAuditLog(`Одобрена задача: ${t.title}`, taskId);

      // Notify primary assignee
      const assigneeId = t.primary_assignee_id || t.assigned_to_user_id;
      if (assigneeId && assigneeId !== session.userId) {
        await createNotification({
          user_id: assigneeId,
          type: 'task_approved',
          title: `Задачата ви е одобрена! (${t.code || 'TSK'})`,
          message: `Ръководството одобри изпълнението на задача "${t.title}".`,
          task_id: taskId,
        });
      }

      pushToast('success', 'Задачата е успешно одобрена и приключена.');
    },
    [
      tickets,
      schoolId,
      session.userId,
      session.fullName,
      usingSupabase,
      saveLocalMirror,
      logTaskActivity,
      addAuditLog,
      createNotification,
      pushToast,
    ]
  );

  // Task Lifecycle: Return for Correction
  const returnForCorrection = useCallback(
    async (taskId: string, reason: string): Promise<boolean> => {
      const trimmedReason = reason.trim();
      if (!trimmedReason) {
        pushToast('error', 'Моля, посочете задължителна причина за връщане на задачата.');
        return false;
      }
      const t = tickets.find((item) => item.id === taskId);
      if (!t) return false;
      const nowIso = new Date().toISOString();
      const updatedTickets = tickets.map((item) =>
        item.id === taskId
          ? {
              ...item,
              status: 'in_progress' as const,
              return_reason: trimmedReason,
              updated_at: nowIso,
            }
          : item
      );
      setTickets(updatedTickets);
      saveLocalMirror({ tickets: updatedTickets });

      if (usingSupabase && isValidUuid(taskId)) {
        await supabase
          .from('tickets')
          .update({
            status: 'in_progress',
            return_reason: trimmedReason,
            updated_at: nowIso,
          })
          .eq('id', taskId)
          .eq('school_id', schoolId)
          ;
      }

      await logTaskActivity(
        taskId,
        'returned_for_correction',
        `Върната за корекция: ${trimmedReason}`,
        t.status,
        'in_progress'
      );
      await addAuditLog(`Върната за корекция: ${t.title}. Причина: ${trimmedReason}`, taskId);

      // Notify primary assignee
      const assigneeId = t.primary_assignee_id || t.assigned_to_user_id;
      if (assigneeId && assigneeId !== session.userId) {
        await createNotification({
          user_id: assigneeId,
          type: 'task_returned',
          title: `Задача върната за корекция (${t.code || 'TSK'})`,
          message: `Задача "${t.title}" беше върната от ${session.fullName}. Забележки: ${trimmedReason}`,
          task_id: taskId,
        });
      }

      pushToast('warning', 'Задачата е върната за корекция с посочените указания.');
      return true;
    },
    [
      tickets,
      schoolId,
      session.userId,
      session.fullName,
      usingSupabase,
      saveLocalMirror,
      logTaskActivity,
      addAuditLog,
      createNotification,
      pushToast,
    ]
  );

  // Update Task Deadline
  const updateTaskDeadline = useCallback(
    async (taskId: string, newDueDate: string | null) => {
      const t = tickets.find((item) => item.id === taskId);
      if (!t) return;
      const nowIso = new Date().toISOString();
      const updatedTickets = tickets.map((item) =>
        item.id === taskId ? { ...item, due_date: newDueDate, updated_at: nowIso } : item
      );
      setTickets(updatedTickets);
      saveLocalMirror({ tickets: updatedTickets });

      if (usingSupabase && isValidUuid(taskId)) {
        await supabase
          .from('tickets')
          .update({ due_date: newDueDate, updated_at: nowIso })
          .eq('id', taskId)
          .eq('school_id', schoolId)
          ;
      }

      await logTaskActivity(
        taskId,
        'deadline_changed',
        `Краен срок променен на: ${newDueDate ? new Date(newDueDate).toLocaleString('bg-BG') : 'Няма'}`,
        t.due_date || 'Няма',
        newDueDate || 'Няма'
      );
      await addAuditLog(`Променен краен срок на задача: ${t.title}`, taskId);

      const assigneeId = t.primary_assignee_id || t.assigned_to_user_id;
      if (assigneeId && assigneeId !== session.userId) {
        await createNotification({
          user_id: assigneeId,
          type: 'deadline_changed',
          title: `Променен краен срок (${t.code || 'TSK'})`,
          message: `Крайният срок на задача "${t.title}" беше променен от ${session.fullName}.`,
          task_id: taskId,
        });
      }

      pushToast('info', 'Крайният срок е обновен успешно.');
    },
    [
      tickets,
      schoolId,
      session.userId,
      session.fullName,
      usingSupabase,
      saveLocalMirror,
      logTaskActivity,
      addAuditLog,
      createNotification,
      pushToast,
    ]
  );

  // Reassign Task (Официално преразпределяне с одит, предишен и нов отговорник, причина и нотификации)
  const reassignTask = useCallback(
    async (
      taskId: string,
      primaryAssigneeId: string | null,
      additionalAssigneeIds: string[] = [],
      reason?: string
    ) => {
      const t = tickets.find((item) => item.id === taskId);
      if (!t) return;

      if (!primaryAssigneeId) {
        pushToast('error', 'Всяка задача трябва да има задължително определен главен отговорник.');
        return;
      }

      const targetUser = schoolUsers.find((u) => u.id === primaryAssigneeId);
      if (targetUser && targetUser.is_active === false) {
        pushToast('error', 'Избраният отговорник е неактивен/напуснал служител. Изберете активен колега.');
        return;
      }

      const prevAssigneeId = t.primary_assignee_id || t.assigned_to_user_id || null;
      const prevAssigneeUser = prevAssigneeId ? schoolUsers.find((u) => u.id === prevAssigneeId) : undefined;
      const prevAssigneeName = prevAssigneeUser?.full_name || (prevAssigneeId ? userMap.get(prevAssigneeId) : null) || 'Неразпределена';
      const newAssigneeName = targetUser?.full_name || userMap.get(primaryAssigneeId) || 'Служител';

      const nowIso = new Date().toISOString();
      const validPrimaryId = isValidUuid(primaryAssigneeId) ? primaryAssigneeId : null;

      const updatedTickets = tickets.map((item) =>
        item.id === taskId
          ? {
              ...item,
              primary_assignee_id: validPrimaryId,
              assigned_to_user_id: validPrimaryId,
              assigned_user_ids: additionalAssigneeIds,
              updated_at: nowIso,
            }
          : item
      );
      setTickets(updatedTickets);
      saveLocalMirror({ tickets: updatedTickets });

      if (usingSupabase && isValidUuid(taskId)) {
        await supabase
          .from('tickets')
          .update({
            primary_assignee_id: validPrimaryId,
            assigned_to_user_id: validPrimaryId,
            assigned_user_ids: additionalAssigneeIds,
            updated_at: nowIso,
          })
          .eq('id', taskId)
          .eq('school_id', schoolId);
      }

      const reasonClean = reason?.trim() || null;
      const reasonSuffix = reasonClean ? ` Причина: ${reasonClean}` : '';

      await logTaskActivity(
        taskId,
        'reassigned',
        `Преразпределена от „${prevAssigneeName}“ към „${newAssigneeName}“.${reasonSuffix}`,
        prevAssigneeName,
        newAssigneeName,
        reasonClean
      );

      await addAuditLog(
        `Преразпределена задача ${t.code || ''} ${t.title} от ${prevAssigneeName} към ${newAssigneeName}`,
        taskId,
        {
          previous_assignee: prevAssigneeName,
          new_assignee: newAssigneeName,
          reason: reasonClean,
        }
      );

      // Notify new responsible employee
      if (validPrimaryId && validPrimaryId !== session.userId) {
        await createNotification({
          user_id: validPrimaryId,
          type: 'task_assigned',
          title: `Възложена ви е задача (${t.code || 'TSK'})`,
          message: `${session.fullName} ви определи като главен отговорник за задача "${t.title}".${reasonSuffix}`,
          task_id: taskId,
        });
      }

      // Notify previous responsible employee if active and distinct
      if (
        prevAssigneeId &&
        prevAssigneeId !== validPrimaryId &&
        prevAssigneeId !== session.userId &&
        prevAssigneeUser?.is_active !== false
      ) {
        await createNotification({
          user_id: prevAssigneeId,
          type: 'task_status_changed',
          title: `Преразпределена задача (${t.code || 'TSK'})`,
          message: `Отговорността за задача "${t.title}" беше прехвърлена на ${newAssigneeName} от ${session.fullName}.${reasonSuffix}`,
          task_id: taskId,
        });
      }

      pushToast('success', `Отговорникът е успешно променен на: ${newAssigneeName}`);
    },
    [
      tickets,
      schoolId,
      userMap,
      schoolUsers,
      session.userId,
      session.fullName,
      usingSupabase,
      saveLocalMirror,
      logTaskActivity,
      addAuditLog,
      createNotification,
      pushToast,
    ]
  );

  // Archive Task (Защита на историята, архивиране без изтриване)
  const archiveTask = useCallback(
    async (taskId: string) => {
      const t = tickets.find((item) => item.id === taskId);
      if (!t) return;
      const nowIso = new Date().toISOString();
      const updatedTickets = tickets.map((item) =>
        item.id === taskId
          ? {
              ...item,
              is_archived: true,
              archived_at: nowIso,
              archived_by_user_id: isValidUuid(session.userId) ? session.userId : null,
              archived_by_name: session.fullName,
              updated_at: nowIso,
            }
          : item
      );
      setTickets(updatedTickets);
      saveLocalMirror({ tickets: updatedTickets });

      if (usingSupabase && isValidUuid(taskId)) {
        await supabase
          .from('tickets')
          .update({
            is_archived: true,
            archived_at: nowIso,
            archived_by_user_id: isValidUuid(session.userId) ? session.userId : null,
            archived_by_name: session.fullName,
            updated_at: nowIso,
          })
          .eq('id', taskId)
          .eq('school_id', schoolId);
      }

      await logTaskActivity(taskId, 'archived', `Задачата е архивирана от ${session.fullName}`);
      await addAuditLog(`Архивирана задача: ${t.code || ''} ${t.title}`, taskId);
      pushToast('info', 'Задачата е преместена в архива. Всички документи и хронология се пазят.');
    },
    [
      tickets,
      schoolId,
      session.userId,
      session.fullName,
      usingSupabase,
      saveLocalMirror,
      logTaskActivity,
      addAuditLog,
      pushToast,
    ]
  );

  // Restore Task
  const restoreTask = useCallback(
    async (taskId: string) => {
      const t = tickets.find((item) => item.id === taskId);
      if (!t) return;
      const nowIso = new Date().toISOString();
      const updatedTickets = tickets.map((item) =>
        item.id === taskId
          ? {
              ...item,
              is_archived: false,
              archived_at: null,
              archived_by_user_id: null,
              archived_by_name: null,
              updated_at: nowIso,
            }
          : item
      );
      setTickets(updatedTickets);
      saveLocalMirror({ tickets: updatedTickets });

      if (usingSupabase && isValidUuid(taskId)) {
        await supabase
          .from('tickets')
          .update({
            is_archived: false,
            archived_at: null,
            archived_by_user_id: null,
            archived_by_name: null,
            updated_at: nowIso,
          })
          .eq('id', taskId)
          .eq('school_id', schoolId);
      }

      await logTaskActivity(taskId, 'restored', `Задачата е възстановена от архива от ${session.fullName}`);
      await addAuditLog(`Възстановена задача: ${t.code || ''} ${t.title}`, taskId);
      pushToast('success', 'Задачата е успешно възстановена от архива.');
    },
    [
      tickets,
      schoolId,
      session.fullName,
      usingSupabase,
      saveLocalMirror,
      logTaskActivity,
      addAuditLog,
      pushToast,
    ]
  );

  // Toggle Recurrence
  const toggleRecurrence = useCallback(
    async (taskId: string, isActive: boolean) => {
      const nowIso = new Date().toISOString();
      const updatedTickets = tickets.map((t) =>
        t.id === taskId ? { ...t, recurrence_is_active: isActive, updated_at: nowIso } : t
      );
      setTickets(updatedTickets);
      saveLocalMirror({ tickets: updatedTickets });

      if (usingSupabase && isValidUuid(taskId)) {
        await supabase
          .from('tickets')
          .update({ recurrence_is_active: isActive, updated_at: nowIso })
          .eq('id', taskId)
          .eq('school_id', schoolId)
          ;
      }

      pushToast('info', isActive ? 'Периодичността е активирана.' : 'Периодичността е паузирана.');
    },
    [tickets, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  // Process Recurring Tasks (automatic generation of next instances)
  const processRecurringTasks = useCallback(async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const tasksToRecur = tickets.filter(
      (t) =>
        t.is_recurring &&
        t.recurrence_is_active &&
        t.recurrence_next_date &&
        t.recurrence_next_date <= todayStr
    );

    if (tasksToRecur.length === 0) return 0;

    const newInstances: SchoolTicket[] = [];
    const updatedOriginals = [...tickets];

    for (const orig of tasksToRecur) {
      const nextCode = generateNextTaskCode([...updatedOriginals, ...newInstances]);
      const nextDate = new Date(orig.recurrence_next_date!);
      let nextRecurrenceDate: Date;
      switch (orig.recurrence_interval) {
        case 'daily':
          nextRecurrenceDate = new Date(nextDate.getTime() + 86400000);
          break;
        case 'weekly':
          nextRecurrenceDate = new Date(nextDate.getTime() + 86400000 * 7);
          break;
        case 'monthly': {
          const mDate = new Date(nextDate);
          mDate.setMonth(mDate.getMonth() + 1);
          nextRecurrenceDate = mDate;
          break;
        }
        case 'yearly': {
          const yDate = new Date(nextDate);
          yDate.setFullYear(yDate.getFullYear() + 1);
          nextRecurrenceDate = yDate;
          break;
        }
        default:
          nextRecurrenceDate = new Date(nextDate.getTime() + 86400000 * 7);
      }

      const newInst: SchoolTicket = {
        id: makeUuid(),
        school_id: schoolId,
        code: nextCode,
        department_id: orig.department_id,
        created_by_user_id: orig.created_by_user_id,
        primary_assignee_id: orig.primary_assignee_id,
        assigned_to_user_id: orig.assigned_to_user_id,
        assigned_role_target: orig.assigned_role_target,
        assigned_user_ids: orig.assigned_user_ids || [],
        due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
        title: `${orig.title} (Периодично)`,
        description: orig.description,
        room_or_location: orig.room_or_location,
        priority: orig.priority,
        status: 'new',
        is_recurring: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      newInstances.push(newInst);

      const origIdx = updatedOriginals.findIndex((item) => item.id === orig.id);
      if (origIdx >= 0) {
        updatedOriginals[origIdx] = {
          ...updatedOriginals[origIdx],
          recurrence_next_date: nextRecurrenceDate.toISOString().slice(0, 10),
        };
      }
    }

    const finalTickets = [...newInstances, ...updatedOriginals];
    setTickets(finalTickets);
    saveLocalMirror({ tickets: finalTickets });

    if (usingSupabase) {
      for (const inst of newInstances) {
        await supabase.from('tickets').insert(inst);
      }
      for (const orig of tasksToRecur) {
        const updated = updatedOriginals.find((t) => t.id === orig.id);
        if (updated) {
          await supabase
            .from('tickets')
            .update({ recurrence_next_date: updated.recurrence_next_date })
            .eq('id', orig.id)
            ;
        }
      }
    }

    pushToast('info', `Генерирани са ${newInstances.length} нови периодични задачи.`);
    return newInstances.length;
  }, [tickets, schoolId, usingSupabase, saveLocalMirror, pushToast]);

  // Document Register: Register Document
  const registerDocument = useCallback(
    async (input: {
      doc_type: RegisterDocType;
      reg_number?: string;
      reg_date?: string;
      title: string;
      sender?: string;
      recipient?: string;
      department_id?: string | null;
      responsible_user_id?: string | null;
      file_name?: string;
      file_url?: string;
      file_size_bytes?: number;
      file_type?: DocumentFileType;
      mime_type?: string;
      linked_task_id?: string | null;
      notes?: string;
    }): Promise<DocumentRegisterItem> => {
      const regNumber =
        input.reg_number?.trim() ||
        generateNextRegNumber(documentRegister, input.doc_type);

      const newDoc: DocumentRegisterItem = {
        id: makeUuid(),
        school_id: schoolId,
        reg_number: regNumber,
        reg_date: input.reg_date || new Date().toISOString().slice(0, 10),
        doc_type: input.doc_type,
        title: input.title.trim(),
        sender: input.sender?.trim() || null,
        recipient: input.recipient?.trim() || null,
        department_id: input.department_id || null,
        responsible_user_id: input.responsible_user_id || null,
        file_name: input.file_name || null,
        file_url: input.file_url || null,
        file_size_bytes: input.file_size_bytes || 0,
        file_type: input.file_type || null,
        mime_type: input.mime_type || null,
        linked_task_id: input.linked_task_id || null,
        is_archived: false,
        notes: input.notes?.trim() || null,
        created_by_user_id: isValidUuid(session.userId) ? session.userId : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const next = [newDoc, ...documentRegister];
      setDocumentRegister(next);
      saveLocalMirror({ documentRegister: next });

      if (usingSupabase) {
        await supabase.from('document_register').insert(newDoc);
      }

      await addAuditLog(`Регистриран документ: ${newDoc.reg_number} - ${newDoc.title}`, newDoc.linked_task_id, {
        reg_number: newDoc.reg_number,
        doc_type: newDoc.doc_type,
      });

      if (input.responsible_user_id && input.responsible_user_id !== session.userId) {
        await createNotification({
          user_id: input.responsible_user_id,
          type: 'document_registered',
          title: `Нов документ в деловодния регистър (${newDoc.reg_number})`,
          message: `Във вашето направление е регистриран документ: "${newDoc.title}".`,
          document_id: newDoc.id,
          task_id: newDoc.linked_task_id || undefined,
        });
      }

      pushToast('success', `Документът ${newDoc.reg_number} е регистриран успешно.`);
      return newDoc;
    },
    [
      documentRegister,
      schoolId,
      session.userId,
      usingSupabase,
      saveLocalMirror,
      addAuditLog,
      createNotification,
      pushToast,
    ]
  );

  // Document Register: Update Document
  const updateRegisterDocument = useCallback(
    async (
      id: string,
      patch: Partial<{
        title: string;
        sender: string | null;
        recipient: string | null;
        department_id: string | null;
        responsible_user_id: string | null;
        linked_task_id: string | null;
        notes: string | null;
        reg_date: string;
      }>
    ) => {
      const nowIso = new Date().toISOString();
      const next = documentRegister.map((d) => (d.id === id ? { ...d, ...patch, updated_at: nowIso } : d));
      setDocumentRegister(next);
      saveLocalMirror({ documentRegister: next });

      if (usingSupabase && isValidUuid(id)) {
        await supabase
          .from('document_register')
          .update({ ...patch, updated_at: nowIso })
          .eq('id', id)
          .eq('school_id', schoolId)
          ;
      }

      pushToast('success', 'Документът е обновен.');
    },
    [documentRegister, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  // Document Register: Delete Document
  const deleteRegisterDocument = useCallback(
    async (id: string) => {
      const doc = documentRegister.find((d) => d.id === id);
      const next = documentRegister.filter((d) => d.id !== id);
      setDocumentRegister(next);
      saveLocalMirror({ documentRegister: next });

      if (usingSupabase && isValidUuid(id)) {
        await supabase
          .from('document_register')
          .delete()
          .eq('id', id)
          .eq('school_id', schoolId)
          ;
      }

      if (doc) {
        await addAuditLog(`Изтрит документ от регистъра: ${doc.reg_number}`);
      }
      pushToast('info', 'Документът е изтрит от регистъра.');
    },
    [documentRegister, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  // Document Register: Toggle Archive
  const toggleArchiveRegisterDocument = useCallback(
    async (id: string, isArchived: boolean) => {
      const nowIso = new Date().toISOString();
      const next = documentRegister.map((d) =>
        d.id === id ? { ...d, is_archived: isArchived, updated_at: nowIso } : d
      );
      setDocumentRegister(next);
      saveLocalMirror({ documentRegister: next });

      if (usingSupabase && isValidUuid(id)) {
        await supabase
          .from('document_register')
          .update({ is_archived: isArchived, updated_at: nowIso })
          .eq('id', id)
          .eq('school_id', schoolId)
          ;
      }

      pushToast('info', isArchived ? 'Документът е архивиран.' : 'Документът е възстановен от архива.');
    },
    [documentRegister, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  // Document Register: Link Document to Task
  const linkRegisterDocumentToTask = useCallback(
    async (docId: string, taskId: string | null) => {
      const nowIso = new Date().toISOString();
      const next = documentRegister.map((d) =>
        d.id === docId ? { ...d, linked_task_id: taskId, updated_at: nowIso } : d
      );
      setDocumentRegister(next);
      saveLocalMirror({ documentRegister: next });

      if (usingSupabase && isValidUuid(docId)) {
        await supabase
          .from('document_register')
          .update({ linked_task_id: taskId, updated_at: nowIso })
          .eq('id', docId)
          .eq('school_id', schoolId)
          ;
      }

      pushToast('success', taskId ? 'Документът е свързан със задачата.' : 'Връзката със задачата е премахната.');
    },
    [documentRegister, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  // Document Register: Export CSV
  const exportDocumentRegisterCsv = useCallback(() => {
    const headers = [
      'Регистрационен номер',
      'Дата',
      'Вид документ',
      'Относно / Заглавие',
      'Подател / Кореспондент',
      'Получател',
      'Направление',
      'Отговорник',
      'Статус',
      'Бележки',
    ];

    const rows = documentRegister.map((doc) => {
      const typeLabel =
        doc.doc_type === 'incoming' ? 'Входящ' : doc.doc_type === 'outgoing' ? 'Изходящ' : 'Вътрешен';
      const deptName = doc.department_id ? departmentMap.get(doc.department_id) || '' : '';
      const respName = doc.responsible_user_id ? userMap.get(doc.responsible_user_id) || '' : '';
      const statusLabel = doc.is_archived ? 'Архивиран' : 'Действащ';

      return [
        `"${doc.reg_number}"`,
        `"${doc.reg_date}"`,
        `"${typeLabel}"`,
        `"${(doc.title || '').replace(/"/g, '""')}"`,
        `"${(doc.sender || '').replace(/"/g, '""')}"`,
        `"${(doc.recipient || '').replace(/"/g, '""')}"`,
        `"${deptName.replace(/"/g, '""')}"`,
        `"${respName.replace(/"/g, '""')}"`,
        `"${statusLabel}"`,
        `"${(doc.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delovoden-registar-${school.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    pushToast('success', 'Деловодният регистър е експортиран в CSV.');
  }, [documentRegister, departmentMap, userMap, school.slug, pushToast]);

  // Department Memberships: Add Member (със запис на started_at и активен статус)
  const addDepartmentMember = useCallback(
    async (departmentId: string, userId: string, isLead: boolean = false) => {
      const exists = departmentMemberships.some(
        (m) => m.department_id === departmentId && m.user_id === userId && m.is_active !== false
      );
      if (exists) {
        pushToast('warning', 'Този служител вече има активно членство към това направление.');
        return;
      }

      const targetUser = schoolUsers.find((u) => u.id === userId);
      const targetDept = departments.find((d) => d.id === departmentId);
      const nowIso = new Date().toISOString();

      const newMembership: DepartmentMembership = {
        id: makeUuid(),
        school_id: schoolId,
        department_id: departmentId,
        user_id: userId,
        is_lead: isLead,
        is_active: true,
        started_at: nowIso,
        ended_at: null,
        created_at: nowIso,
        user_name: targetUser?.full_name,
        user_role: targetUser?.role,
        department_name: targetDept?.name,
      };

      const next = [...departmentMemberships, newMembership];
      setDepartmentMemberships(next);
      saveLocalMirror({ departmentMemberships: next });

      if (usingSupabase) {
        await supabase
          .from('department_memberships')
          .insert({
            id: newMembership.id,
            school_id: schoolId,
            department_id: newMembership.department_id,
            user_id: newMembership.user_id,
            is_lead: newMembership.is_lead,
            is_active: true,
            started_at: nowIso,
          });
      }

      await addAuditLog(
        `Зачислен служител ${targetUser?.full_name || userId} към ${targetDept?.name || departmentId}`,
        null,
        { is_lead: isLead, started_at: nowIso }
      );
      pushToast('success', 'Служителят е зачислен към направлението.');
    },
    [
      departmentMemberships,
      schoolUsers,
      departments,
      schoolId,
      usingSupabase,
      saveLocalMirror,
      addAuditLog,
      pushToast,
    ]
  );

  // Department Memberships: Move Member (Приключва старото членство с ended_at и създава ново с started_at)
  const moveDepartmentMember = useCallback(
    async (membershipId: string, newDeptId: string, isLead: boolean = false) => {
      const mem = departmentMemberships.find((m) => m.id === membershipId);
      if (!mem) return;
      const targetDept = departments.find((d) => d.id === newDeptId);
      if (!targetDept) return;

      const nowIso = new Date().toISOString();
      const oldDept = departments.find((d) => d.id === mem.department_id);

      // Приключване на старото активно членство
      const updatedPrev: DepartmentMembership = {
        ...mem,
        is_active: false,
        ended_at: nowIso,
      };

      // Създаване на ново активно членство в новото направление
      const newMembership: DepartmentMembership = {
        id: makeUuid(),
        school_id: schoolId,
        department_id: newDeptId,
        user_id: mem.user_id,
        is_lead: isLead,
        is_active: true,
        started_at: nowIso,
        ended_at: null,
        created_at: nowIso,
        user_name: mem.user_name,
        user_role: mem.user_role,
        department_name: targetDept.name,
      };

      const next = departmentMemberships.map((m) => (m.id === membershipId ? updatedPrev : m)).concat(newMembership);
      setDepartmentMemberships(next);
      saveLocalMirror({ departmentMemberships: next });

      if (usingSupabase) {
        if (isValidUuid(membershipId)) {
          await supabase
            .from('department_memberships')
            .update({ is_active: false, ended_at: nowIso })
            .eq('id', membershipId)
            .eq('school_id', schoolId);
        }
        await supabase.from('department_memberships').insert({
          id: newMembership.id,
          school_id: schoolId,
          department_id: newMembership.department_id,
          user_id: newMembership.user_id,
          is_lead: newMembership.is_lead,
          is_active: true,
          started_at: nowIso,
        });
      }

      await addAuditLog(
        `Преместен служител ${mem.user_name || mem.user_id} от ${oldDept?.name || mem.department_id} в ${targetDept.name}`,
        null,
        { old_dept: oldDept?.name, new_dept: targetDept.name, date: nowIso }
      );
      pushToast('success', `Служителят е преместен в „${targetDept.name}“ с пълна хронология.`);
    },
    [departmentMemberships, departments, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  // Department Memberships: Remove Member (Soft-end: запазва хронологията с ended_at)
  const removeDepartmentMember = useCallback(
    async (membershipId: string) => {
      const mem = departmentMemberships.find((m) => m.id === membershipId);
      if (!mem) return;
      const nowIso = new Date().toISOString();

      const next = departmentMemberships.map((m) =>
        m.id === membershipId ? { ...m, is_active: false, ended_at: nowIso } : m
      );
      setDepartmentMemberships(next);
      saveLocalMirror({ departmentMemberships: next });

      if (usingSupabase && isValidUuid(membershipId)) {
        await supabase
          .from('department_memberships')
          .update({ is_active: false, ended_at: nowIso })
          .eq('id', membershipId)
          .eq('school_id', schoolId);
      }

      if (mem) {
        await addAuditLog(`Прекратено активно членство в направление: ${mem.department_name || mem.id}`);
      }
      pushToast('info', 'Активното членство в направлението е прекратено (запазено в историята).');
    },
    [departmentMemberships, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  // Department Memberships: Toggle Lead
  const toggleDepartmentMemberLead = useCallback(
    async (membershipId: string, isLead: boolean) => {
      const next = departmentMemberships.map((m) =>
        m.id === membershipId ? { ...m, is_lead: isLead } : m
      );
      setDepartmentMemberships(next);
      saveLocalMirror({ departmentMemberships: next });

      if (usingSupabase && isValidUuid(membershipId)) {
        await supabase
          .from('department_memberships')
          .update({ is_lead: isLead })
          .eq('id', membershipId)
          .eq('school_id', schoolId);
      }
      pushToast(
        'success',
        isLead ? 'Зададен като отговорник на направлението.' : 'Премахнат статут на ръководител.'
      );
    },
    [departmentMemberships, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  // Attachments
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

      if (usingSupabase && isValidUuid(taskId)) {
        await supabase.from('task_document_attachments').insert({
          id: item.id,
          school_id: schoolId,
          task_id: taskId,
          file_name: item.file_name,
          file_size_bytes: item.file_size_bytes,
          file_type: item.file_type,
          mime_type: item.mime_type,
          file_url: item.file_url,
          uploaded_by_user_id: item.uploaded_by_user_id,
          uploaded_by_name: item.uploaded_by_name,
          uploaded_by_role: item.uploaded_by_role,
        });
      }

      await logTaskActivity(taskId, 'attachment_added', `Прикачен файл: ${item.file_name}`);
      await addAuditLog(`Прикачен документ към задача: ${item.file_name}`, taskId, {
        file_name: item.file_name,
        file_size_bytes: item.file_size_bytes,
      });

      pushToast('success', `Документът „${item.file_name}“ е прикачен.`);
      return item;
    },
    [
      schoolId,
      session,
      attachments,
      usingSupabase,
      saveLocalMirror,
      logTaskActivity,
      addAuditLog,
      pushToast,
    ]
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

  // Status & Priority updates
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

      await logTaskActivity(ticketId, 'status_changed', `Статусът е променен на „${status}“`);
      await addAuditLog(`Сменен статус на „${status}“`, ticketId, { status });
      pushToast('success', `Статусът е обновен.`);
    },
    [tickets, schoolId, usingSupabase, saveLocalMirror, logTaskActivity, addAuditLog, pushToast]
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

      await logTaskActivity(ticketId, 'priority_changed', `Приоритетът е променен на „${priority}“`);
      await addAuditLog(`Сменен приоритет на „${priority}“`, ticketId, { priority });
      pushToast('info', 'Приоритетът е обновен.');
    },
    [tickets, schoolId, usingSupabase, saveLocalMirror, logTaskActivity, addAuditLog, pushToast]
  );

  const updateTicketAssignee = useCallback(
    async (ticketId: string, assigneeUserId: string | null) => {
      const validAssigneeId = isValidUuid(assigneeUserId) ? assigneeUserId : null;
      const now = new Date().toISOString();
      const next = tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              primary_assignee_id: validAssigneeId,
              assigned_to_user_id: validAssigneeId,
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
            primary_assignee_id: validAssigneeId,
            assigned_to_user_id: validAssigneeId,
            updated_at: now,
          })
          .eq('id', ticketId)
          .eq('school_id', schoolId);
      }

      const assigneeName = validAssigneeId ? userMap.get(validAssigneeId) || 'Служител' : 'Няма';
      await logTaskActivity(ticketId, 'reassigned', `Разпределена към ${assigneeName}`);
      await addAuditLog(`Задачата е разпределена към ${assigneeName}`, ticketId, {
        assigned_to_user_id: validAssigneeId,
      });
      pushToast('success', `Отговорникът е обновен: ${assigneeName}`);
    },
    [
      tickets,
      schoolId,
      usingSupabase,
      userMap,
      saveLocalMirror,
      logTaskActivity,
      addAuditLog,
      pushToast,
    ]
  );

  const editTicket = useCallback(
    async (
      ticketId: string,
      patch: {
        title: string;
        description: string;
        room_or_location?: string | null;
        department_id?: string | null;
        due_date?: string | null;
        priority?: TicketPriority;
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
              due_date: patch.due_date !== undefined ? patch.due_date : t.due_date,
              priority: patch.priority !== undefined ? patch.priority : t.priority,
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
            due_date: patch.due_date !== undefined ? patch.due_date : undefined,
            priority: patch.priority !== undefined ? patch.priority : undefined,
            updated_at: now,
          })
          .eq('id', ticketId)
          .eq('school_id', schoolId);
      }

      await logTaskActivity(ticketId, 'edited', 'Редактирани детайли на задачата');
      await addAuditLog('Редактирани детайли на задача', ticketId, { title: patch.title });
      pushToast('success', 'Задачата е обновена.');
    },
    [tickets, schoolId, usingSupabase, saveLocalMirror, logTaskActivity, addAuditLog, pushToast]
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
        await Promise.all([
          supabase.from('tickets').delete().eq('id', ticketId).eq('school_id', schoolId),
          supabase.from('ticket_messages').delete().eq('ticket_id', ticketId).eq('school_id', schoolId),
          supabase.from('ticket_orders').delete().eq('ticket_id', ticketId).eq('school_id', schoolId),
          supabase
            .from('task_document_attachments')
            .delete()
            .eq('task_id', ticketId)
            .eq('school_id', schoolId),
        ]);
      }

      if (target) {
        await addAuditLog(`Изтрита задача: ${target.title}`, null, {
          title: target.title,
          code: target.code,
        });
      }
      pushToast('info', 'Задачата е изтрита успешно.');
    },
    [tickets, messages, orders, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  // Message / Comment Thread
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

      await logTaskActivity(ticketId, 'comment_added', `Коментар: ${clean.slice(0, 60)}`);
      await addAuditLog('Добавен коментар към задача', ticketId, {
        messagePreview: clean.slice(0, 60),
      });

      // Notify task assignee or creator
      const currentTask = tickets.find((t) => t.id === ticketId);
      if (currentTask) {
        const notifyTargetId =
          currentTask.primary_assignee_id && currentTask.primary_assignee_id !== session.userId
            ? currentTask.primary_assignee_id
            : currentTask.created_by_user_id && currentTask.created_by_user_id !== session.userId
              ? currentTask.created_by_user_id
              : null;

        if (notifyTargetId) {
          await createNotification({
            user_id: notifyTargetId,
            type: 'comment_added',
            title: `Нов коментар към задача (${currentTask.code || 'TSK'})`,
            message: `${session.fullName}: "${clean.slice(0, 80)}"`,
            task_id: ticketId,
          });
        }
      }

      pushToast('success', 'Съобщението е изпратено.');
    },
    [
      messages,
      tickets,
      schoolId,
      session.fullName,
      session.userId,
      usingSupabase,
      saveLocalMirror,
      logTaskActivity,
      addAuditLog,
      createNotification,
      pushToast,
    ]
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
        await supabase.from('ticket_channels').insert(item);
      }

      await addAuditLog(`Създаден комуникационен канал: ${clean}`, null, { name: clean });
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
      pushToast('info', isActive ? 'Каналът е активиран.' : 'Каналът е архивиран.');
    },
    [channels, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  const deleteChannel = useCallback(
    async (channelId: string) => {
      const target = channels.find((c) => c.id === channelId);
      const nextChannels = channels.filter((c) => c.id !== channelId);
      const nextMessages = channelMessages.filter((m) => m.channel_id !== channelId);

      setChannels(nextChannels);
      setChannelMessages(nextMessages);
      saveLocalMirror({ channels: nextChannels, channelMessages: nextMessages });

      if (usingSupabase && isValidUuid(channelId)) {
        await supabase
          .from('ticket_channels')
          .delete()
          .eq('id', channelId)
          .eq('school_id', schoolId);
      }

      if (target) {
        await addAuditLog(`Изтрит канал: ${target.name}`);
      }
      pushToast('info', 'Каналът е изтрит.');
    },
    [channels, channelMessages, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const sendChannelMessage = useCallback(
    async (channelId: string, messageText: string) => {
      const clean = messageText.trim();
      if (!clean) return;

      const validSenderId = isValidUuid(session.userId) ? session.userId : null;
      const item: ChannelMessage = {
        id: makeUuid(),
        school_id: schoolId,
        channel_id: channelId,
        sender_name: session.fullName,
        sender_role: session.role ? ROLE_LABELS[session.role] || session.role : 'Служител',
        content: clean,
        created_at: new Date().toISOString(),
      };

      const next = [...channelMessages, item];
      setChannelMessages(next);
      saveLocalMirror({ channelMessages: next });
      pushToast('success', 'Съобщението е изпратено в канала.');
    },
    [channelMessages, schoolId, session, saveLocalMirror, pushToast]
  );

  // Announcements
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

      const next = [item, ...announcements];
      setAnnouncements(next);
      saveLocalMirror({ announcements: next });

      if (usingSupabase) {
        await supabase.from('ticket_announcements').insert(item);
      }

      await addAuditLog(`Публикувано официално съобщение: ${cleanTitle}`, null, {
        title: cleanTitle,
        isPinned,
      });
      pushToast('success', 'Съобщението е публикувано.');
    },
    [announcements, schoolId, session, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const togglePinAnnouncement = useCallback(
    async (announcementId: string, isPinned: boolean) => {
      const next = announcements.map((a) =>
        a.id === announcementId ? { ...a, is_pinned: isPinned } : a
      );
      setAnnouncements(next);
      saveLocalMirror({ announcements: next });

      if (usingSupabase && isValidUuid(announcementId)) {
        await supabase
          .from('ticket_announcements')
          .update({ is_pinned: isPinned })
          .eq('id', announcementId)
          .eq('school_id', schoolId);
      }
      pushToast('info', isPinned ? 'Съобщението е закачено.' : 'Съобщението е откачено.');
    },
    [announcements, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  const deleteAnnouncement = useCallback(
    async (announcementId: string) => {
      const next = announcements.filter((a) => a.id !== announcementId);
      setAnnouncements(next);
      saveLocalMirror({ announcements: next });

      if (usingSupabase && isValidUuid(announcementId)) {
        await supabase
          .from('ticket_announcements')
          .delete()
          .eq('id', announcementId)
          .eq('school_id', schoolId);
      }
      pushToast('info', 'Съобщението е премахнато.');
    },
    [announcements, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  // Departments CRUD
  const createDepartment = useCallback(
    async (name: string, description?: string, color?: string, managerName?: string) => {
      const clean = name.trim();
      if (!clean) return;

      const item: TicketDepartment = {
        id: makeUuid(),
        school_id: schoolId,
        name: clean,
        description: description?.trim() || null,
        color: color || 'blue',
        manager_name: managerName?.trim() || null,
        created_at: new Date().toISOString(),
      };

      const next = [...departments, item];
      setDepartments(next);
      saveLocalMirror({ departments: next });

      if (usingSupabase) {
        await supabase.from('ticket_departments').insert(item);
      }

      await addAuditLog(`Създадено направление: ${clean}`, null, { name: clean });
      pushToast('success', `Направлението „${clean}“ е създадено.`);
    },
    [departments, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const updateDepartment = useCallback(
    async (
      id: string,
      name: string,
      description?: string,
      color?: string,
      managerName?: string
    ) => {
      const clean = name.trim();
      if (!clean) return;

      const next = departments.map((d) =>
        d.id === id
          ? {
              ...d,
              name: clean,
              description: description?.trim() || null,
              color: color || d.color,
              manager_name: managerName?.trim() || null,
            }
          : d
      );
      setDepartments(next);
      saveLocalMirror({ departments: next });

      if (usingSupabase && isValidUuid(id)) {
        await supabase
          .from('ticket_departments')
          .update({
            name: clean,
            description: description?.trim() || null,
            color: color || 'blue',
            manager_name: managerName?.trim() || null,
          })
          .eq('id', id)
          .eq('school_id', schoolId);
      }

      await addAuditLog(`Обновено направление: ${clean}`, null, { name: clean });
      pushToast('success', `Направлението „${clean}“ е обновено.`);
    },
    [departments, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  const deleteDepartment = useCallback(
    async (id: string): Promise<boolean> => {
      const hasTickets = tickets.some((t) => t.department_id === id);
      if (hasTickets) {
        pushToast('error', 'Направлението не може да бъде изтрито, защото съдържа активни задачи.');
        return false;
      }

      const dept = departments.find((d) => d.id === id);
      const next = departments.filter((d) => d.id !== id);
      setDepartments(next);
      saveLocalMirror({ departments: next });

      if (usingSupabase && isValidUuid(id)) {
        await supabase
          .from('ticket_departments')
          .delete()
          .eq('id', id)
          .eq('school_id', schoolId);
      }

      if (dept) {
        await addAuditLog(`Изтрито направление: ${dept.name}`);
      }
      pushToast('info', 'Направлението е изтрито.');
      return true;
    },
    [tickets, departments, schoolId, usingSupabase, saveLocalMirror, addAuditLog, pushToast]
  );

  // Safe Employee Deactivation (Soft Deactivation - запазва история, авторство и членства)
  const deactivateEmployee = useCallback(
    async (userId: string, reason?: string) => {
      await deactivateSchoolUser(userId, reason);
      const nowIso = new Date().toISOString();
      const nextMemberships = departmentMemberships.map((m) =>
        m.user_id === userId && m.is_active !== false
          ? { ...m, is_active: false, ended_at: nowIso }
          : m
      );
      setDepartmentMemberships(nextMemberships);
      saveLocalMirror({ departmentMemberships: nextMemberships });

      const targetUser = schoolUsers.find((u) => u.id === userId);
      await addAuditLog(
        `Деактивиран служител: ${targetUser?.full_name || userId}. Причина: ${reason || 'Няма посочена'}`,
        null,
        { user_id: userId, reason: reason || null }
      );
      pushToast('warning', `Служителят ${targetUser?.full_name || ''} е деактивиран.`);
    },
    [departmentMemberships, schoolUsers, saveLocalMirror, addAuditLog, pushToast]
  );

  const reactivateEmployee = useCallback(
    async (userId: string) => {
      await reactivateSchoolUser(userId);
      const targetUser = schoolUsers.find((u) => u.id === userId);
      await addAuditLog(`Възстановен служител: ${targetUser?.full_name || userId}`, null, { user_id: userId });
      pushToast('success', `Акаунтът на ${targetUser?.full_name || ''} е отново активен.`);
    },
    [schoolUsers, addAuditLog, pushToast]
  );

  // Administrative Journal CRUD (Защитен достъп - само за системни директори/администратори)
  const deleteAuditLog = useCallback(
    async (logId: string) => {
      if (!isDirectorOrAdmin) {
        pushToast('error', 'Само ръководители на училището имат административни права над одитния журнал.');
        return;
      }
      const next = auditLogs.filter((l) => l.id !== logId);
      setAuditLogs(next);
      saveLocalMirror({ auditLogs: next });

      if (usingSupabase && isValidUuid(logId)) {
        await supabase
          .from('ticket_audit_logs')
          .delete()
          .eq('id', logId)
          .eq('school_id', schoolId);
      }
      pushToast('info', 'Записът от журнала е изтрит.');
    },
    [isDirectorOrAdmin, auditLogs, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  const clearAuditLogs = useCallback(async () => {
    if (!isDirectorOrAdmin) {
      pushToast('error', 'Само ръководители на училището имат права за изчистване на одитния журнал.');
      return;
    }
    setAuditLogs([]);
    saveLocalMirror({ auditLogs: [] });

    if (usingSupabase) {
      await supabase.from('ticket_audit_logs').delete().eq('school_id', schoolId);
    }
    pushToast('info', 'Журналът на събитията е изчистен.');
  }, [isDirectorOrAdmin, schoolId, usingSupabase, saveLocalMirror, pushToast]);

  // Export Tasks to CSV
  const exportTicketsCsv = useCallback(() => {
    const headers = [
      'Код',
      'Заглавие',
      'Направление',
      'Локация / Кабинет',
      'Приоритет',
      'Статус',
      'Създател',
      'Главен Отговорник',
      'Статус на отговорника',
      'Краен срок',
      'Дата на създаване',
    ];

    const rows = enrichedTickets.map((t) => [
      t.code || t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.department_name || '').replace(/"/g, '""')}"`,
      `"${(t.room_or_location || '').replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      `"${(t.creator_name || '').replace(/"/g, '""')}"`,
      `"${(t.primary_assignee_name || t.assignee_name || '').replace(/"/g, '""')}"`,
      t.primary_assignee_is_active === false ? 'Неактивен/Напуснал' : 'Активен',
      t.due_date ? new Date(t.due_date).toLocaleDateString('bg-BG') : 'Няма',
      new Date(t.created_at).toLocaleString('bg-BG'),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-report-${school.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    pushToast('success', 'Справката за задачите е експортирана в CSV.');
  }, [enrichedTickets, school.slug, pushToast]);

  return {
    isLoading,
    usingSupabase,
    toasts,
    pushToast,
    dismissToast,

    departments,
    departmentMemberships: enrichedMemberships,
    currentUserDepartmentIds,
    tickets: enrichedTickets,
    messages,
    orders,
    channels,
    channelMessages,
    announcements,
    auditLogs,
    attachments: allDocuments,
    allDocuments,
    taskActivityLogs,
    documentRegister,
    notifications,
    unreadNotificationsCount,

    // Access control helpers
    isDirectorOrAdmin,
    canUserAccessTask,
    canUserManageTask,
    canUserApproveTask,
    canUserAccessDocument,

    // Task workflow
    createTicket,
    startWork,
    submitForApproval,
    approveTask,
    returnForCorrection,
    updateTicketStatus,
    updateTicketPriority,
    updateTicketAssignee,
    updateTaskDeadline,
    reassignTask,
    archiveTask,
    restoreTask,
    editTicket,
    deleteTicket,
    toggleRecurrence,
    processRecurringTasks,
    logTaskActivity,
    addAttachmentToTask,
    deleteAttachment,

    // Employee management (soft deactivation/reactivation)
    deactivateEmployee,
    reactivateEmployee,

    // Messages
    sendMessage,

    // Document Register
    registerDocument,
    updateRegisterDocument,
    deleteRegisterDocument,
    toggleArchiveRegisterDocument,
    linkRegisterDocumentToTask,
    exportDocumentRegisterCsv,

    // Department Memberships
    addDepartmentMember,
    moveDepartmentMember,
    removeDepartmentMember,
    toggleDepartmentMemberLead,

    // In-App Notifications
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,

    // Channels & Announcements
    createChannel,
    toggleChannelActive,
    deleteChannel,
    sendChannelMessage,
    createAnnouncement,
    togglePinAnnouncement,
    deleteAnnouncement,

    // Departments CRUD
    createDepartment,
    updateDepartment,
    deleteDepartment,

    // Audit logs & Export
    deleteAuditLog,
    clearAuditLogs,
    exportTicketsCsv,
  };
}
