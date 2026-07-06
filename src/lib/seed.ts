import type { ChecklistKey, Order, StageKey, StageState } from "./types";

const CHECKLIST_KEYS: ChecklistKey[] = [
  "welcome_call_made",
  "permitting",
  "land_prep",
  "scheduling",
  "delivery_install",
];

const STAGES: StageKey[] = [
  "welcome_call",
  "land_prep_permitting",
  "ready_for_install",
  "scheduled",
];

function emptyChecklist(): Record<ChecklistKey, boolean> {
  return Object.fromEntries(
    CHECKLIST_KEYS.map((k) => [k, false]),
  ) as Record<ChecklistKey, boolean>;
}

function stagesFromCurrent(current: StageKey): Record<StageKey, StageState> {
  const idx = STAGES.indexOf(current);
  const out: Record<StageKey, StageState> = {} as Record<StageKey, StageState>;
  STAGES.forEach((s, i) => {
    if (i < idx) {
      out[s] = {
        status: "completed",
        updatedAt: "2026-06-25T10:00:00Z",
        updatedBy: "System (seed)",
      };
    } else if (i === idx) {
      out[s] = {
        status: "pending",
        updatedAt: "2026-07-01T10:00:00Z",
        updatedBy: "System (seed)",
      };
    } else {
      out[s] = { status: "pending" };
    }
  });
  return out;
}

function seedOrder(o: {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  buildingSize: string;
  buildingType: string;
  address: string;
  city: string;
  state: string;
  salesRep: string;
  manufacturer: Order["manufacturer"];
  stmDate: string;
  currentStage: StageKey;
  checklistOverrides?: Partial<Record<ChecklistKey, boolean>>;
  stageOverrides?: Partial<Record<StageKey, StageState>>;
}): Order {
  const stages = { ...stagesFromCurrent(o.currentStage), ...(o.stageOverrides ?? {}) };
  const checklist = { ...emptyChecklist(), ...(o.checklistOverrides ?? {}) };
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    buildingSize: o.buildingSize,
    buildingType: o.buildingType,
    address: o.address,
    city: o.city,
    state: o.state,
    salesRep: o.salesRep,
    manufacturer: o.manufacturer,
    stmDate: o.stmDate,
    currentStage: o.currentStage,
    stages,
    checklist,
    notes: [],
    emails: [],
  };
}

export const SEED_ORDERS: Order[] = [
  seedOrder({
    id: "ord_26849",
    orderNumber: "26849",
    customerName: "Joshua Jordan",
    customerEmail: "jjordan8586@gmail.com",
    customerPhone: "813-555-0142",
    buildingSize: "30x40x12",
    buildingType: "Vertical Roof Garage",
    address: "1421 Willow Bend Rd",
    city: "Ocala",
    state: "FL",
    salesRep: "Bill Alexander",
    manufacturer: "TBS",
    stmDate: "2026-06-28",
    currentStage: "welcome_call",
  }),
  seedOrder({
    id: "ord_26848",
    orderNumber: "26848",
    customerName: "Joe Smalley",
    customerEmail: "joes@airworkshc.com",
    customerPhone: "352-555-0198",
    buildingSize: "24x36x10",
    buildingType: "A-Frame Barn",
    address: "88 Piney Creek Ln",
    city: "Gainesville",
    state: "FL",
    salesRep: "Tucker Fine",
    manufacturer: "American Steel",
    stmDate: "2026-06-27",
    currentStage: "welcome_call",
    stageOverrides: {
      welcome_call: {
        status: "waiting",
        updatedAt: "2026-07-01T14:00:00Z",
        updatedBy: "Jordan Pace",
        note: "Left voicemail — customer said they'd call back Wednesday.",
      },
    },
  }),
  seedOrder({
    id: "ord_26847",
    orderNumber: "26847",
    customerName: "Covenant Builders LLC (Herbert)",
    customerEmail: "cbuilders316@gmail.com",
    customerPhone: "912-555-0110",
    buildingSize: "40x60x14",
    buildingType: "Commercial Workshop",
    address: "412 Industrial Pkwy",
    city: "Waycross",
    state: "GA",
    salesRep: "Tyler Hughes",
    manufacturer: "American Steel",
    stmDate: "2026-06-25",
    currentStage: "land_prep_permitting",
    checklistOverrides: { welcome_call_made: true },
  }),
  seedOrder({
    id: "ord_26846",
    orderNumber: "26846",
    customerName: "Craig Hellberg",
    customerEmail: "clhellberg87@yahoo.com",
    customerPhone: "704-555-0165",
    buildingSize: "20x26x9",
    buildingType: "Carport",
    address: "9 Redbud Ct",
    city: "Charlotte",
    state: "NC",
    salesRep: "Liliana Arasimowicz",
    manufacturer: "American Steel",
    stmDate: "2026-06-24",
    currentStage: "land_prep_permitting",
    checklistOverrides: { welcome_call_made: true },
    stageOverrides: {
      land_prep_permitting: {
        status: "waiting",
        updatedAt: "2026-06-28T16:00:00Z",
        updatedBy: "Jordan Pace",
        note: "Customer working with county on setback variance — check back next week.",
      },
    },
  }),
  seedOrder({
    id: "ord_26845",
    orderNumber: "26845",
    customerName: "Donald Clements",
    customerEmail: "clementsdonald592@gmail.com",
    customerPhone: "859-555-0133",
    buildingSize: "24x30x10",
    buildingType: "Garage",
    address: "77 Rockhouse Hollow",
    city: "Somerset",
    state: "KY",
    salesRep: "Gabriel DeAlba",
    manufacturer: "SBS",
    stmDate: "2026-06-20",
    currentStage: "ready_for_install",
    checklistOverrides: {
      welcome_call_made: true,
      permitting: true,
      land_prep: true,
    },
  }),
  seedOrder({
    id: "ord_26844",
    orderNumber: "26844",
    customerName: "Phil & Karen Gates",
    customerEmail: "coolpooch@gmail.com",
    customerPhone: "254-555-0188",
    buildingSize: "36x50x14",
    buildingType: "RV Cover w/ Workshop",
    address: "203 Rio Vista Dr",
    city: "Waco",
    state: "TX",
    salesRep: "Gabriel DeAlba",
    manufacturer: "American Steel",
    stmDate: "2026-06-15",
    currentStage: "ready_for_install",
    checklistOverrides: {
      welcome_call_made: true,
      permitting: true,
      land_prep: true,
    },
    stageOverrides: {
      ready_for_install: {
        status: "waiting",
        updatedAt: "2026-06-30T11:00:00Z",
        updatedBy: "Jordan Pace",
        note: "Waiting on manufacturer route confirmation for Central TX.",
      },
    },
  }),
  seedOrder({
    id: "ord_26839",
    orderNumber: "26839",
    customerName: "Kyle Bremer",
    customerEmail: "kbremer@example.com",
    customerPhone: "605-555-0177",
    buildingSize: "30x40x12",
    buildingType: "Barn w/ Lean-to",
    address: "512 County Rd 14",
    city: "Sioux Falls",
    state: "SD",
    salesRep: "Tyler Hughes",
    manufacturer: "Best Choice",
    stmDate: "2026-06-05",
    currentStage: "scheduled",
    checklistOverrides: {
      welcome_call_made: true,
      permitting: true,
      land_prep: true,
      scheduling: true,
    },
    stageOverrides: {
      scheduled: {
        status: "pending",
        updatedAt: "2026-07-02T15:00:00Z",
        updatedBy: "Jordan Pace",
        note: "Delivery window confirmed for 2026-07-14 through 2026-07-18.",
      },
    },
  }),
  seedOrder({
    id: "ord_26828",
    orderNumber: "26828",
    customerName: "Quentin Hargrove",
    customerEmail: "qhargrove@example.com",
    customerPhone: "918-555-0129",
    buildingSize: "50x80x16",
    buildingType: "Commercial Storage",
    address: "8800 W Industrial Blvd",
    city: "Tulsa",
    state: "OK",
    salesRep: "Tucker Fine",
    manufacturer: "Safeguard",
    stmDate: "2026-06-01",
    currentStage: "scheduled",
    checklistOverrides: {
      welcome_call_made: true,
      permitting: true,
      land_prep: true,
      scheduling: true,
      delivery_install: true,
    },
    stageOverrides: {
      scheduled: {
        status: "completed",
        updatedAt: "2026-07-03T09:00:00Z",
        updatedBy: "Jordan Pace",
        note: "Building delivered + install complete. Customer sending photos.",
      },
    },
  }),
  seedOrder({
    id: "ord_26852",
    orderNumber: "26852",
    customerName: "Troy D. Pope",
    customerEmail: "twonails@yahoo.com",
    customerPhone: "813-555-0121",
    buildingSize: "40x60x12",
    buildingType: "Warehouse",
    address: "17 Ranchland Way",
    city: "Plant City",
    state: "FL",
    salesRep: "Alyssa Chase",
    manufacturer: "Safeguard",
    stmDate: "2026-07-01",
    currentStage: "welcome_call",
  }),
  seedOrder({
    id: "ord_26851",
    orderNumber: "26851",
    customerName: "Nick Vailas",
    customerEmail: "nvailas@bedfordsurgcal.com",
    customerPhone: "603-555-0164",
    buildingSize: "30x48x11",
    buildingType: "Aircraft Hangar",
    address: "2 Skyline Airfield Rd",
    city: "Bedford",
    state: "NH",
    salesRep: "Reed Hunt",
    manufacturer: "Best Choice",
    stmDate: "2026-06-30",
    currentStage: "welcome_call",
  }),
  seedOrder({
    id: "ord_26850",
    orderNumber: "26850",
    customerName: "Paul & Connie Woolsey",
    customerEmail: "paulwoolsey3352@gmail.com",
    customerPhone: "417-555-0139",
    buildingSize: "24x30x10",
    buildingType: "Garage",
    address: "35 Oak Ridge Trl",
    city: "Springfield",
    state: "MO",
    salesRep: "Salita Bengochea",
    manufacturer: "Eagle",
    stmDate: "2026-06-30",
    currentStage: "land_prep_permitting",
    checklistOverrides: { welcome_call_made: true },
  }),
  seedOrder({
    id: "ord_26843",
    orderNumber: "26843",
    customerName: "Marcus Hollander",
    customerEmail: "m.hollander@example.com",
    customerPhone: "480-555-0145",
    buildingSize: "20x21x8",
    buildingType: "Carport",
    address: "614 Desert Vista Ave",
    city: "Mesa",
    state: "AZ",
    salesRep: "Tucker Fine",
    manufacturer: "Safeguard",
    stmDate: "2026-06-22",
    currentStage: "ready_for_install",
    checklistOverrides: {
      welcome_call_made: true,
      permitting: true,
      land_prep: true,
    },
  }),
];
