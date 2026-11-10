import type {
  InventoryCategory,
  InventoryItem,
  InventoryLog,
  InventoryMovement,
  InventoryRoom,
  InventoryAuditSession,
  InventoryAuditItem,
} from './types';

export function getDefaultCategories(schoolId: string): InventoryCategory[] {
  return [
    {
      id: `${schoolId}-cat-stem`,
      school_id: schoolId,
      name: 'Компютърна и STEM техника',
      description: 'Лаптопи, настолни компютри, микроконтролери и 3D принтери',
    },
    {
      id: `${schoolId}-cat-displays`,
      school_id: schoolId,
      name: 'Интерактивни дисплеи и мултимедия',
      description: 'Тъч екрани 65-86", мултимедийни проектори и озвучаване',
    },
    {
      id: `${schoolId}-cat-furniture`,
      school_id: schoolId,
      name: 'Мебели и обзавеждане',
      description: 'Чинове, ергономични столове, шкафове и бели дъски',
    },
    {
      id: `${schoolId}-cat-lab`,
      school_id: schoolId,
      name: 'Лабораторно оборудване',
      description: 'Микроскопи, сензори Vernier, колби и демонстрационни китове',
    },
    {
      id: `${schoolId}-cat-sports`,
      school_id: schoolId,
      name: 'Спортни пособия',
      description: 'Топки, гимнастически уреди, шведски стени и матове',
    },
    {
      id: `${schoolId}-cat-office`,
      school_id: schoolId,
      name: 'Офис техника и администрация',
      description: 'Мултифункционални принтери, ламинатори и сейфове',
    },
  ];
}

export function getDefaultRooms(schoolId: string): InventoryRoom[] {
  return [
    {
      id: `${schoolId}-rm-201`,
      school_id: schoolId,
      room_number: '201',
      name: 'Кабинет 201 — Информационни технологии',
      room_type: 'it_lab',
      building: 'Корпус А',
      floor: 'Етаж 2',
      building_or_floor: 'Корпус А, Етаж 2',
      responsible_person: 'инж. Георги Димитров',
      description: 'Оборудван компютърен кабинет с 16 ученически работни места, гигабитова мрежа и интерактивен екран.',
      is_archived: false,
    },
    {
      id: `${schoolId}-rm-stem`,
      school_id: schoolId,
      room_number: 'STEM-01',
      name: 'STEM Център — Роботика и Природни науки',
      room_type: 'stem_lab',
      building: 'Корпус Б',
      floor: 'Етаж 1',
      building_or_floor: 'Корпус Б, Етаж 1',
      responsible_person: 'гл. учител Даниела Стоянова',
      description: 'Център по национална програма за роботика, 3D принтиране, природни науки и интердисциплинарно обучение.',
      is_archived: false,
    },
    {
      id: `${schoolId}-rm-304`,
      school_id: schoolId,
      room_number: '304',
      name: 'Кабинет 304 — Математика и Физика',
      room_type: 'classroom',
      building: 'Корпус А',
      floor: 'Етаж 3',
      building_or_floor: 'Корпус А, Етаж 3',
      responsible_person: 'ст. учител Петър Василев',
      description: 'Учебна зала по природно-математически цикъл с мултимедиен ултракъсофокусен проектор.',
      is_archived: false,
    },
    {
      id: `${schoolId}-rm-teachers`,
      school_id: schoolId,
      room_number: 'УС-1',
      name: 'Учителска стая — Корпус А',
      room_type: 'teacher_room',
      building: 'Корпус А',
      floor: 'Етаж 1',
      building_or_floor: 'Корпус А, Етаж 1',
      responsible_person: 'Мария Георгиева (Домакин)',
      description: 'Централна учителска стая с административни работни станции и централно многофункционално печатащо устройство.',
      is_archived: false,
    },
    {
      id: `${schoolId}-rm-gym`,
      school_id: schoolId,
      room_number: 'ФВС-01',
      name: 'Физкултурен салон и спортна база',
      room_type: 'gym',
      building: 'Спортен корпус',
      floor: 'Партер',
      building_or_floor: 'Спортен корпус, Партер',
      responsible_person: 'Красимир Тодоров',
      description: 'Основен физкултурен салон с електронно табло, гимнастически уреди, баскетболни кошове и волейболни мрежи.',
      is_archived: false,
    },
    {
      id: `${schoolId}-rm-storage`,
      school_id: schoolId,
      room_number: 'СКЛ-01',
      name: 'Централен технически склад и резерв',
      room_type: 'storage',
      building: 'Корпус А',
      floor: 'Сутерен',
      building_or_floor: 'Корпус А, Сутерен',
      responsible_person: 'Мария Георгиева (Домакин)',
      description: 'Складово помещение за резервни части, кабели, нови мебели и консумативи преди разпределение.',
      is_archived: false,
    },
  ];
}

export function getDefaultItems(
  schoolId: string,
  categories: InventoryCategory[],
  rooms: InventoryRoom[]
): InventoryItem[] {
  const cStem = categories.find((c) => c.name.includes('STEM'))?.id || null;
  const cDisp = categories.find((c) => c.name.includes('дисплеи'))?.id || null;
  const cFurn = categories.find((c) => c.name.includes('Мебели'))?.id || null;
  const cLab = categories.find((c) => c.name.includes('Лабораторно'))?.id || null;
  const cSports = categories.find((c) => c.name.includes('Спортни'))?.id || null;
  const cOffice = categories.find((c) => c.name.includes('Офис'))?.id || null;

  const r201 = rooms.find((r) => r.room_number === '201')?.id || null;
  const rStem = rooms.find((r) => r.room_number === 'STEM-01')?.id || null;
  const r304 = rooms.find((r) => r.room_number === '304')?.id || null;
  const rTeachers = rooms.find((r) => r.room_number === 'УС-1')?.id || null;
  const rGym = rooms.find((r) => r.room_number === 'ФВС-01')?.id || null;

  const now = Date.now();
  const dayMs = 86400000;

  // Format helper YYYY-MM-DD
  const toIsoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

  return [
    {
      id: `${schoolId}-it-001`,
      school_id: schoolId,
      room_id: rStem,
      category_id: cDisp,
      name: 'Интерактивен тъч екран 75" 4K с вграден Android',
      inventory_code: 'INV-2026-0001',
      tracking_type: 'individual',
      manufacturer: 'Clevertouch',
      model: 'Impact Plus 75 4K',
      brand_or_model: 'Clevertouch Impact Plus 75',
      serial_number: 'CT-75-99281A',
      quantity: 1,
      condition: 'new',
      assigned_to: 'гл. учител Даниела Стоянова',
      purchase_date: toIsoDate(now - 180 * dayMs),
      warranty_until: toIsoDate(now + 500 * dayMs),
      purchase_price: 2450.0, // €
      notes: 'Монтиран на мобилна електрическа стойка с дистанционно управление',
      description: 'Интерактивен дисплей от висок клас с 20-точково докосване, антирефлексно закалено стъкло и интегриран софтуер Lynx.',
      is_archived: false,
      is_written_off: false,
      created_at: new Date(now - 180 * dayMs).toISOString(),
      updated_at: new Date(now - 180 * dayMs).toISOString(),
    },
    {
      id: `${schoolId}-it-002`,
      school_id: schoolId,
      room_id: r201,
      category_id: cStem,
      name: 'Ученически компютърни конфигурации Core i5 / 16GB / 512GB SSD',
      inventory_code: 'INV-2026-0002',
      tracking_type: 'batch', // Batch item (16 pcs)
      manufacturer: 'Lenovo',
      model: 'ThinkCentre M70q Tiny Gen 4',
      brand_or_model: 'Lenovo ThinkCentre M70q Tiny',
      serial_number: 'LNV-BATCH-201-16',
      quantity: 16,
      condition: 'good',
      assigned_to: 'инж. Георги Димитров',
      purchase_date: toIsoDate(now - 300 * dayMs),
      warranty_until: toIsoDate(now + 400 * dayMs),
      purchase_price: 680.0, // € per unit
      notes: 'Свързани в локална мрежа с инсталиран Windows 11 Pro и Office пакет',
      description: 'Групова партида от 16 компютърни системи за работното пространство на учениците в каб. 201.',
      is_archived: false,
      is_written_off: false,
      created_at: new Date(now - 300 * dayMs).toISOString(),
      updated_at: new Date(now - 300 * dayMs).toISOString(),
    },
    {
      id: `${schoolId}-it-003`,
      school_id: schoolId,
      room_id: rStem,
      category_id: cStem,
      name: '3D Принтер за прототипиране и моделиране',
      inventory_code: 'INV-2026-0003',
      tracking_type: 'individual',
      manufacturer: 'Bambu Lab',
      model: 'X1 Carbon Combo (с AMS)',
      brand_or_model: 'Bambu Lab X1 Carbon Combo',
      serial_number: 'BL-X1C-88412B',
      quantity: 1,
      condition: 'new',
      assigned_to: 'гл. учител Даниела Стоянова',
      purchase_date: toIsoDate(now - 90 * dayMs),
      warranty_until: toIsoDate(now + 600 * dayMs),
      purchase_price: 1599.0, // €
      notes: 'Включва 4-цветен AMS модул и вътрешна камера за наблюдение',
      description: 'Професионален 3D принтер със затворена камера и AI детекция за изкривяване на слоевете.',
      is_archived: false,
      is_written_off: false,
      created_at: new Date(now - 90 * dayMs).toISOString(),
      updated_at: new Date(now - 90 * dayMs).toISOString(),
    },
    {
      id: `${schoolId}-it-004`,
      school_id: schoolId,
      room_id: r304,
      category_id: cDisp,
      name: 'Мултимедиен ултракъсофокусен лазерен проектор',
      inventory_code: 'INV-2026-0004',
      tracking_type: 'individual',
      manufacturer: 'Epson',
      model: 'EB-735Fi Interactive',
      brand_or_model: 'Epson EB-735Fi',
      serial_number: 'EP-EB735-44129',
      quantity: 1,
      condition: 'needs_repair',
      assigned_to: 'ст. учител Петър Василев',
      purchase_date: toIsoDate(now - 700 * dayMs),
      warranty_until: toIsoDate(now + 20 * dayMs), // Expiring in 20 days!
      purchase_price: 1850.0, // €
      notes: 'Премигва лазерният модул за интерактивните писалки; чака сервизен техник',
      description: 'Лазерен интерактивен проектор с Full HD резолюция и сензорна лента за пръсти и стилус.',
      is_archived: false,
      is_written_off: false,
      created_at: new Date(now - 700 * dayMs).toISOString(),
      updated_at: new Date(now - 5 * dayMs).toISOString(),
    },
    {
      id: `${schoolId}-it-005`,
      school_id: schoolId,
      room_id: rStem,
      category_id: cLab,
      name: 'Комплект дигитални безжични сензори по физика и химия',
      inventory_code: 'INV-2026-0005',
      tracking_type: 'batch', // Batch item (4 sets)
      manufacturer: 'Vernier',
      model: 'Go Direct Science Pack',
      brand_or_model: 'Vernier Go Direct Science Pack',
      serial_number: 'VRN-GD-09214',
      quantity: 4,
      condition: 'good',
      assigned_to: 'гл. учител Даниела Стоянова',
      purchase_date: toIsoDate(now - 400 * dayMs),
      warranty_until: toIsoDate(now + 800 * dayMs),
      purchase_price: 490.0, // €
      notes: 'Включва сензори за температура, pH, налягане, сила и безжичен волтметър',
      description: 'Лабораторни Bluetooth сензори за свързване към таблети и компютри.',
      is_archived: false,
      is_written_off: false,
      created_at: new Date(now - 400 * dayMs).toISOString(),
      updated_at: new Date(now - 400 * dayMs).toISOString(),
    },
    {
      id: `${schoolId}-it-006`,
      school_id: schoolId,
      room_id: r201,
      category_id: cFurn,
      name: 'Ергономични регулируеми ученически столове',
      inventory_code: 'INV-2026-0006',
      tracking_type: 'batch', // Batch item (32 pcs)
      manufacturer: 'ErgoEdu',
      model: 'Pro Blue Height-Adjustable',
      brand_or_model: 'ErgoEdu Pro Blue',
      serial_number: null,
      quantity: 32,
      condition: 'good',
      assigned_to: 'инж. Георги Димитров',
      purchase_date: toIsoDate(now - 500 * dayMs),
      warranty_until: toIsoDate(now + 200 * dayMs),
      purchase_price: 75.0, // € per unit
      notes: 'Антистатично полимерно покритие с петлъчева метална основа и колелца',
      description: 'Анатомични столове за компютърни кабинети с газово бутало за плавно регулиране на височината.',
      is_archived: false,
      is_written_off: false,
      created_at: new Date(now - 500 * dayMs).toISOString(),
      updated_at: new Date(now - 500 * dayMs).toISOString(),
    },
    {
      id: `${schoolId}-it-007`,
      school_id: schoolId,
      room_id: rTeachers,
      category_id: cOffice,
      name: 'Многофункционално черно-бяло и цветно устройство A3/A4',
      inventory_code: 'INV-2026-0007',
      tracking_type: 'individual',
      manufacturer: 'Konica Minolta',
      model: 'bizhub C250i',
      brand_or_model: 'Konica Minolta bizhub C250i',
      serial_number: 'KM-C250-109284',
      quantity: 1,
      condition: 'good',
      assigned_to: 'Мария Георгиева (Домакин)',
      purchase_date: toIsoDate(now - 600 * dayMs),
      warranty_until: toIsoDate(now + 100 * dayMs),
      purchase_price: 3200.0, // €
      notes: 'С мрежово сканиране към имейл, двустранен ADF фийдър и ПИН код достъп за учители',
      description: 'Мрежов копирен комбайн за учителската колегия със скорост 25 стр./мин.',
      is_archived: false,
      is_written_off: false,
      created_at: new Date(now - 600 * dayMs).toISOString(),
      updated_at: new Date(now - 600 * dayMs).toISOString(),
    },
    {
      id: `${schoolId}-it-008`,
      school_id: schoolId,
      room_id: rGym,
      category_id: cSports,
      name: 'Електронно табло за спортни състезания с дистанционно',
      inventory_code: 'INV-2026-0008',
      tracking_type: 'individual',
      manufacturer: 'Stramatel',
      model: 'Multitop Portable LED',
      brand_or_model: 'Stramatel Multitop Portable',
      serial_number: 'STR-MT-20188',
      quantity: 1,
      condition: 'good',
      assigned_to: 'Красимир Тодоров',
      purchase_date: toIsoDate(now - 450 * dayMs),
      warranty_until: toIsoDate(now - 30 * dayMs), // Warranty expired 30 days ago!
      purchase_price: 1150.0, // €
      notes: 'За баскетбол, волейбол и хандбал с таймер, период, точки и клаксон',
      description: 'Портативно спортно табло за физкултурния салон с батерийно и мрежово захранване.',
      is_archived: false,
      is_written_off: false,
      created_at: new Date(now - 450 * dayMs).toISOString(),
      updated_at: new Date(now - 450 * dayMs).toISOString(),
    },
  ];
}

export function getDefaultMovements(
  schoolId: string,
  items: InventoryItem[],
  rooms: InventoryRoom[]
): InventoryMovement[] {
  const item1 = items[0];
  const r201 = rooms.find((r) => r.room_number === '201');
  const rStem = rooms.find((r) => r.room_number === 'STEM-01');

  if (!item1 || !r201 || !rStem) return [];

  return [
    {
      id: `${schoolId}-mov-01`,
      school_id: schoolId,
      item_id: item1.id,
      item_name: item1.name,
      inventory_code: item1.inventory_code,
      from_room_id: r201.id,
      from_room_name: r201.name,
      to_room_id: rStem.id,
      to_room_name: rStem.name,
      from_mol: r201.responsible_person,
      to_mol: rStem.responsible_person,
      moved_by_name: 'инж. Радослав Петров (Директор)',
      movement_date: new Date(Date.now() - 45 * 86400000).toISOString(),
      reason: 'Пребазиране на тъч екрана в новата STEM зала с мобилна стойка',
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
  ];
}

export function getDefaultAudits(
  schoolId: string,
  rooms: InventoryRoom[],
  items: InventoryItem[]
): { audits: InventoryAuditSession[]; auditItems: InventoryAuditItem[] } {
  const auditId = `${schoolId}-audit-annual-2026`;
  const auditSession: InventoryAuditSession = {
    id: auditId,
    school_id: schoolId,
    title: 'Ежегодна есенна ревизия на ИКТ и училищно оборудване',
    order_number: 'РД-09-114/15.10.2026',
    scope: 'all',
    target_room_ids: rooms.map((r) => r.id),
    target_category_ids: [],
    committee_members: [
      'инж. Радослав Петров (Председател)',
      'Мария Георгиева (Домакин)',
      'инж. Георги Димитров (ИТ)',
    ],
    status: 'in_progress',
    started_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    completed_at: null,
    summary_notes: 'Проверка на инвентарните наличности, серийните номера и етикетите в кабинетите.',
    created_by_name: 'инж. Радослав Петров',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  };

  const auditItems: InventoryAuditItem[] = items.map((it, idx) => {
    const room = rooms.find((r) => r.id === it.room_id);
    let status: InventoryAuditItem['status'] = 'unverified';
    if (idx === 0 || idx === 1) status = 'present';
    if (idx === 3) status = 'damaged';

    return {
      id: `${auditId}-item-${it.id}`,
      school_id: schoolId,
      audit_id: auditId,
      item_id: it.id,
      item_name: it.name,
      inventory_code: it.inventory_code,
      expected_room_id: it.room_id,
      expected_room_name: room?.name || 'Неразпределен',
      found_room_id: it.room_id,
      status,
      notes: status === 'damaged' ? 'Премигване на лампа/сензор; подготвен за сервиз' : null,
      checked_by_name: status !== 'unverified' ? 'инж. Георги Димитров' : null,
      checked_at: status !== 'unverified' ? new Date(Date.now() - 3 * 86400000).toISOString() : null,
    };
  });

  return {
    audits: [auditSession],
    auditItems,
  };
}

export function getDefaultLogs(
  schoolId: string,
  items: InventoryItem[]
): InventoryLog[] {
  const item1 = items[0];
  const item4 = items[3];
  return [
    {
      id: `${schoolId}-log-01`,
      school_id: schoolId,
      item_id: item1?.id || null,
      item_name: item1?.name || 'Интерактивен дисплей 75"',
      actor_name: 'гл. учител Даниела Стоянова',
      action: 'Завеждане в инвентара',
      notes: 'Успешно приет и калибриран по национална програма',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: `${schoolId}-log-02`,
      school_id: schoolId,
      item_id: item4?.id || null,
      item_name: item4?.name || 'Мултимедиен проектор',
      actor_name: 'ст. учител Петър Василев',
      action: 'Маркиран за ремонт',
      notes: 'Премигване на лампа/сензор, изпратена заявка към техническа поддръжка',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];
}
