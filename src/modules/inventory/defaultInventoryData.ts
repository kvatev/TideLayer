import type {
  InventoryCategory,
  InventoryItem,
  InventoryLog,
  InventoryRoom,
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
      name: 'Кабинет 201 — Информационни технологии',
      building_or_floor: 'Корпус А, Етаж 2',
      responsible_person: 'инж. Георги Димитров',
    },
    {
      id: `${schoolId}-rm-stem`,
      school_id: schoolId,
      name: 'STEM Лаборатория — Роботика и Природни науки',
      building_or_floor: 'Корпус Б, Етаж 1',
      responsible_person: 'гл. учител Даниела Стоянова',
    },
    {
      id: `${schoolId}-rm-304`,
      school_id: schoolId,
      name: 'Кабинет 304 — Математика и Физика',
      building_or_floor: 'Корпус А, Етаж 3',
      responsible_person: 'ст. учител Петър Василев',
    },
    {
      id: `${schoolId}-rm-teachers`,
      school_id: schoolId,
      name: 'Учителска стая — Корпус А',
      building_or_floor: 'Корпус А, Етаж 1',
      responsible_person: 'Мария Георгиева (Домакин)',
    },
    {
      id: `${schoolId}-rm-gym`,
      school_id: schoolId,
      name: 'Физкултурен салон и спортна база',
      building_or_floor: 'Спортен корпус, Партер',
      responsible_person: 'Красимир Тодоров',
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

  const r201 = rooms.find((r) => r.name.includes('201'))?.id || null;
  const rStem = rooms.find((r) => r.name.includes('STEM'))?.id || null;
  const r304 = rooms.find((r) => r.name.includes('304'))?.id || null;
  const rTeachers = rooms.find((r) => r.name.includes('Учителска'))?.id || null;
  const rGym = rooms.find((r) => r.name.includes('Физкултурен'))?.id || null;

  return [
    {
      id: `${schoolId}-it-001`,
      school_id: schoolId,
      room_id: rStem,
      category_id: cDisp,
      name: 'Интерактивен тъч екран 75" 4K с вграден Android',
      inventory_code: 'INV-2026-0001',
      brand_or_model: 'Clevertouch Impact Plus 75',
      serial_number: 'CT-75-99281A',
      quantity: 1,
      condition: 'new',
      assigned_to: 'гл. учител Даниела Стоянова',
      purchase_date: '2025-09-10',
      warranty_until: '2028-09-10',
      purchase_price: 2450.0, // €
      notes: 'Монтиран на мобилна електрическа стойка с дистанционно',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: `${schoolId}-it-002`,
      school_id: schoolId,
      room_id: r201,
      category_id: cStem,
      name: 'Ученически компютърни конфигурации Core i5 / 16GB / 512GB SSD',
      inventory_code: 'INV-2026-0002',
      brand_or_model: 'Lenovo ThinkCentre M70q Tiny',
      serial_number: 'LNV-TC-33820X',
      quantity: 16,
      condition: 'good',
      assigned_to: 'инж. Георги Димитров',
      purchase_date: '2024-10-15',
      warranty_until: '2027-10-15',
      purchase_price: 680.0, // € per unit
      notes: 'Свързани в локална мрежа с Windows 11 Pro и Office',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
      id: `${schoolId}-it-003`,
      school_id: schoolId,
      room_id: rStem,
      category_id: cStem,
      name: '3D Принтер за прототипиране и моделиране',
      inventory_code: 'INV-2026-0003',
      brand_or_model: 'Bambu Lab X1 Carbon Combo',
      serial_number: 'BL-X1C-88412B',
      quantity: 1,
      condition: 'new',
      assigned_to: 'гл. учител Даниела Стоянова',
      purchase_date: '2025-11-01',
      warranty_until: '2027-11-01',
      purchase_price: 1599.0, // €
      notes: 'Включва 4-цветен AMS модул и камери за наблюдение',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: `${schoolId}-it-004`,
      school_id: schoolId,
      room_id: r304,
      category_id: cDisp,
      name: 'Мултимедиен ултракъсофокусен лазерен проектор',
      inventory_code: 'INV-2026-0004',
      brand_or_model: 'Epson EB-735Fi',
      serial_number: 'EP-EB735-44129',
      quantity: 1,
      condition: 'needs_repair',
      assigned_to: 'ст. учител Петър Василев',
      purchase_date: '2023-09-01',
      warranty_until: '2026-09-01',
      purchase_price: 1850.0, // €
      notes: 'Понякога премигва оптичният сензор за интерактивните писалки',
      created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: `${schoolId}-it-005`,
      school_id: schoolId,
      room_id: rStem,
      category_id: cLab,
      name: 'Комплект дигитални безжични сензори по физика и химия',
      inventory_code: 'INV-2026-0005',
      brand_or_model: 'Vernier Go Direct Science Pack',
      serial_number: 'VRN-GD-09214',
      quantity: 4,
      condition: 'good',
      assigned_to: 'гл. учител Даниела Стоянова',
      purchase_date: '2024-03-20',
      warranty_until: '2029-03-20',
      purchase_price: 490.0, // €
      notes: 'Включва сензори за температура, pH, налягане и волтметър',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
    {
      id: `${schoolId}-it-006`,
      school_id: schoolId,
      room_id: r201,
      category_id: cFurn,
      name: 'Ергономични регулируеми ученически столове',
      inventory_code: 'INV-2026-0006',
      brand_or_model: 'ErgoEdu Pro Blue',
      serial_number: '—',
      quantity: 32,
      condition: 'good',
      assigned_to: 'инж. Георги Димитров',
      purchase_date: '2024-09-01',
      warranty_until: '2027-09-01',
      purchase_price: 75.0, // €
      notes: 'Антистатично полимерно покритие с петлъчева метална основа',
      created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 100 * 86400000).toISOString(),
    },
    {
      id: `${schoolId}-it-007`,
      school_id: schoolId,
      room_id: rTeachers,
      category_id: cOffice,
      name: 'Многофункционално черно-бяло и цветно устройство A3/A4',
      inventory_code: 'INV-2026-0007',
      brand_or_model: 'Konica Minolta bizhub C250i',
      serial_number: 'KM-C250-109284',
      quantity: 1,
      condition: 'good',
      assigned_to: 'Мария Георгиева (Домакин)',
      purchase_date: '2023-11-15',
      warranty_until: '2026-11-15',
      purchase_price: 3200.0, // €
      notes: 'С мрежово сканиране към имейл и двустранен ADF фийдър',
      created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    },
    {
      id: `${schoolId}-it-008`,
      school_id: schoolId,
      room_id: rGym,
      category_id: cSports,
      name: 'Електронно табло за спортни състезания с дистанционно',
      inventory_code: 'INV-2026-0008',
      brand_or_model: 'Stramatel Multitop Portable',
      serial_number: 'STR-MT-20188',
      quantity: 1,
      condition: 'good',
      assigned_to: 'Красимир Тодоров',
      purchase_date: '2024-05-10',
      warranty_until: '2026-05-10',
      purchase_price: 1150.0, // €
      notes: 'За баскетбол, волейбол и хандбал с таймер и сирена',
      created_at: new Date(Date.now() - 110 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 110 * 86400000).toISOString(),
    },
  ];
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
