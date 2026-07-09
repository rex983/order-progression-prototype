import type {
  ChecklistKey,
  EmailLogEntry,
  Order,
  OrderNote,
  StageKey,
  StageState,
} from "./types";

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
        updatedBy: "Jordan Pace",
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
  notes?: OrderNote[];
  emails?: EmailLogEntry[];
  permitType?: string;
  foundationType?: string;
  landPrepStatus?: string;
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
    notes: o.notes ?? [],
    emails: o.emails ?? [],
    permitType: o.permitType,
    foundationType: o.foundationType,
    landPrepStatus: o.landPrepStatus,
  };
}

// Compact email-log builder for seed history.
function mail(
  id: string,
  templateKey: string,
  subject: string,
  to: string,
  sentAt: string,
  triggeredBy: string,
  body: string,
): EmailLogEntry {
  return { id, templateKey, subject, to, sentAt, triggeredBy, body };
}

function note(id: string, author: string, createdAt: string, body: string): OrderNote {
  return { id, author, createdAt, body };
}

export const SEED_ORDERS: Order[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // WELCOME CALL — freshly out of STM
  // ───────────────────────────────────────────────────────────────────────────
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
    stmDate: "2026-07-04",
    currentStage: "welcome_call",
    emails: [
      mail(
        "eml_26852_1",
        "welcome_call_pending",
        "Welcome to the family, Troy!",
        "twonails@yahoo.com",
        "2026-07-04T09:15:00Z",
        "welcome_call → pending (by System — STM handoff)",
        "Congratulations Troy D. Pope,\n\nThank you for taking the first step on your new building. You are now 1 step closer to having your custom designed building delivered and installed.\n\nOrder number — 26852",
      ),
    ],
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
    stmDate: "2026-07-03",
    currentStage: "welcome_call",
  }),
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
    stmDate: "2026-07-02",
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
    stmDate: "2026-06-30",
    currentStage: "welcome_call",
    stageOverrides: {
      welcome_call: {
        status: "waiting",
        updatedAt: "2026-07-05T14:00:00Z",
        updatedBy: "Jordan Pace",
        note: "Left voicemail — customer said they'd call back Wednesday.",
      },
    },
    notes: [
      note(
        "not_26848_1",
        "Jordan Pace",
        "2026-07-05T14:03:00Z",
        "Third attempt to reach — number rings out to voicemail. Left a message referencing the order number.",
      ),
    ],
    emails: [
      mail(
        "eml_26848_1",
        "welcome_call_waiting",
        "Trying to reach you about order 26848",
        "joes@airworkshc.com",
        "2026-07-05T14:04:00Z",
        "welcome_call → waiting (by Jordan Pace)",
        "Hi Joe, we tried to reach you today for your welcome call but were unable to connect. Please give the Building Success Team a call back at 813-692-7320.",
      ),
    ],
  }),
  seedOrder({
    id: "ord_26852b",
    orderNumber: "26840",
    customerName: "Marisol Ochoa",
    customerEmail: "mochoa@example.com",
    customerPhone: "915-555-0148",
    buildingSize: "20x21x8",
    buildingType: "Carport",
    address: "1601 Franklin Mtn Dr",
    city: "El Paso",
    state: "TX",
    salesRep: "Salita Bengochea",
    manufacturer: "Safeguard",
    stmDate: "2026-06-28",
    currentStage: "welcome_call",
    stageOverrides: {
      welcome_call: {
        status: "waiting",
        updatedAt: "2026-07-01T18:22:00Z",
        updatedBy: "Jordan Pace",
        note: "Customer requested callback after 6pm CT.",
      },
    },
  }),
  seedOrder({
    id: "ord_26838",
    orderNumber: "26838",
    customerName: "Randall Kite",
    customerEmail: "rkite@example.com",
    customerPhone: "615-555-0192",
    buildingSize: "36x40x12",
    buildingType: "Workshop",
    address: "24 Cedar Ridge Rd",
    city: "Franklin",
    state: "TN",
    salesRep: "Bill Alexander",
    manufacturer: "SBS",
    stmDate: "2026-06-27",
    currentStage: "welcome_call",
  }),

  // ───────────────────────────────────────────────────────────────────────────
  // LAND PREP & PERMITTING — welcome call done, customer prepping site
  // ───────────────────────────────────────────────────────────────────────────
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
    permitType: "Full building permit",
    foundationType: "Concrete slab",
    landPrepStatus: "Cleared",
    checklistOverrides: { welcome_call_made: true },
    notes: [
      note(
        "not_26847_1",
        "Jordan Pace",
        "2026-06-27T10:30:00Z",
        "Called Herbert — sharp guy, contractor himself. Already has grading crew scheduled next week. Pulled permit application same day.",
      ),
    ],
    emails: [
      mail(
        "eml_26847_1",
        "welcome_call_completed",
        "Herbert, your next steps for order 26847",
        "cbuilders316@gmail.com",
        "2026-06-27T10:32:00Z",
        "welcome_call → completed (by Jordan Pace)",
        "Congratulations Covenant Builders LLC (Herbert),\n\nYour next steps can be found on step 1 and step 2 of your checklist: Permitting and Land Prep.",
      ),
    ],
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
    emails: [
      mail(
        "eml_26850_1",
        "welcome_call_completed",
        "Paul, your next steps for order 26850",
        "paulwoolsey3352@gmail.com",
        "2026-07-01T15:10:00Z",
        "welcome_call → completed (by Jordan Pace)",
        "Congratulations Paul & Connie Woolsey,\n\nYour next steps can be found on step 1 and step 2 of your checklist: Permitting and Land Prep. If you are not pulling permits, proceed to land prep.",
      ),
    ],
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
    notes: [
      note(
        "not_26846_1",
        "Jordan Pace",
        "2026-06-28T16:02:00Z",
        "County requires 15ft rear setback; Craig's site is 12ft. He's applying for a variance — hearing scheduled for 2026-07-15.",
      ),
      note(
        "not_26846_2",
        "Jordan Pace",
        "2026-07-03T09:15:00Z",
        "Followed up with Craig — no update from county yet.",
      ),
    ],
    emails: [
      mail(
        "eml_26846_1",
        "welcome_call_completed",
        "Craig, your next steps for order 26846",
        "clhellberg87@yahoo.com",
        "2026-06-26T11:00:00Z",
        "welcome_call → completed (by Jordan Pace)",
        "Congratulations Craig Hellberg,\n\nYour next steps can be found on step 1 and step 2 of your checklist: Permitting and Land Prep.",
      ),
      mail(
        "eml_26846_2",
        "land_prep_permitting_waiting",
        "Following up on your permits — order 26846",
        "clhellberg87@yahoo.com",
        "2026-06-28T16:03:00Z",
        "land_prep_permitting → waiting (by Jordan Pace)",
        "Hi Craig, we're following up on the permits and land prep for order 26846.",
      ),
    ],
  }),
  seedOrder({
    id: "ord_26837",
    orderNumber: "26837",
    customerName: "Denise Boykin",
    customerEmail: "dboykin@example.com",
    customerPhone: "334-555-0173",
    buildingSize: "30x40x12",
    buildingType: "Garage",
    address: "512 County Rd 220",
    city: "Dothan",
    state: "AL",
    salesRep: "Alyssa Chase",
    manufacturer: "Safeguard",
    stmDate: "2026-06-23",
    currentStage: "land_prep_permitting",
    checklistOverrides: { welcome_call_made: true },
    emails: [
      mail(
        "eml_26837_1",
        "welcome_call_completed",
        "Denise, your next steps for order 26837",
        "dboykin@example.com",
        "2026-06-25T13:20:00Z",
        "welcome_call → completed (by Jordan Pace)",
        "Congratulations Denise Boykin, your next steps can be found on step 1 and step 2 of your checklist.",
      ),
    ],
  }),
  seedOrder({
    id: "ord_26836",
    orderNumber: "26836",
    customerName: "Vince Castellano",
    customerEmail: "vcastellano@example.com",
    customerPhone: "719-555-0117",
    buildingSize: "50x60x14",
    buildingType: "Vertical Roof RV Cover",
    address: "804 Mesa Ridge Ln",
    city: "Colorado Springs",
    state: "CO",
    salesRep: "Tucker Fine",
    manufacturer: "TBS",
    stmDate: "2026-06-22",
    currentStage: "land_prep_permitting",
    checklistOverrides: { welcome_call_made: true },
    stageOverrides: {
      land_prep_permitting: {
        status: "waiting",
        updatedAt: "2026-07-02T12:00:00Z",
        updatedBy: "Jordan Pace",
        note: "Land clearing running behind — customer's tree service pushed 2 weeks.",
      },
    },
  }),
  seedOrder({
    id: "ord_26834",
    orderNumber: "26834",
    customerName: "Otis Ramirez",
    customerEmail: "oramirez@example.com",
    customerPhone: "505-555-0181",
    buildingSize: "24x30x10",
    buildingType: "Garage",
    address: "7 Camino del Bosque",
    city: "Rio Rancho",
    state: "NM",
    salesRep: "Bill Alexander",
    manufacturer: "Safeguard",
    stmDate: "2026-06-20",
    currentStage: "land_prep_permitting",
    checklistOverrides: { welcome_call_made: true },
  }),
  seedOrder({
    id: "ord_26833",
    orderNumber: "26833",
    customerName: "Petra Eklund",
    customerEmail: "peklund@example.com",
    customerPhone: "406-555-0154",
    buildingSize: "36x50x14",
    buildingType: "Workshop w/ Loft",
    address: "22 Alpine View Dr",
    city: "Bozeman",
    state: "MT",
    salesRep: "Salita Bengochea",
    manufacturer: "SBS",
    stmDate: "2026-06-19",
    currentStage: "land_prep_permitting",
    checklistOverrides: { welcome_call_made: true },
  }),

  // ───────────────────────────────────────────────────────────────────────────
  // READY FOR INSTALL — permits + land done, with scheduling team
  // ───────────────────────────────────────────────────────────────────────────
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
    stmDate: "2026-06-15",
    currentStage: "ready_for_install",
    permitType: "None",
    foundationType: "Gravel pad",
    landPrepStatus: "Pad poured",
    checklistOverrides: {
      welcome_call_made: true,
      permitting: true,
      land_prep: true,
    },
    notes: [
      note(
        "not_26845_1",
        "Jordan Pace",
        "2026-07-01T09:00:00Z",
        "Site pics look great — pad is level, gravel base solid. Handing off to scheduling.",
      ),
    ],
    emails: [
      mail(
        "eml_26845_1",
        "welcome_call_completed",
        "Donald, your next steps for order 26845",
        "clementsdonald592@gmail.com",
        "2026-06-17T10:00:00Z",
        "welcome_call → completed (by Jordan Pace)",
        "Congratulations Donald Clements, your next steps can be found on step 1 and step 2 of your checklist.",
      ),
      mail(
        "eml_26845_2",
        "land_prep_permitting_completed",
        "Nice work, Donald — you're ready for install!",
        "clementsdonald592@gmail.com",
        "2026-07-01T09:02:00Z",
        "land_prep_permitting → completed (by Jordan Pace)",
        "Congratulations on completing your permits and land prep! You are now ready for the most exciting step of the journey!",
      ),
    ],
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
    stmDate: "2026-06-10",
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
    notes: [
      note(
        "not_26844_1",
        "Jordan Pace",
        "2026-06-30T11:02:00Z",
        "Pinged American Steel scheduler — Central TX route full through 7/20. They're checking if we can slot in early August.",
      ),
    ],
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
    stmDate: "2026-06-08",
    currentStage: "ready_for_install",
    checklistOverrides: {
      welcome_call_made: true,
      permitting: true,
      land_prep: true,
    },
  }),
  seedOrder({
    id: "ord_26831",
    orderNumber: "26831",
    customerName: "Wesley Brock",
    customerEmail: "wbrock@example.com",
    customerPhone: "601-555-0146",
    buildingSize: "24x36x11",
    buildingType: "Garage",
    address: "18 Old Mill Rd",
    city: "Hattiesburg",
    state: "MS",
    salesRep: "Tyler Hughes",
    manufacturer: "Eagle",
    stmDate: "2026-06-05",
    currentStage: "ready_for_install",
    checklistOverrides: {
      welcome_call_made: true,
      permitting: true,
      land_prep: true,
    },
    stageOverrides: {
      ready_for_install: {
        status: "waiting",
        updatedAt: "2026-07-04T15:00:00Z",
        updatedBy: "Jordan Pace",
        note: "Manufacturer confirmed route but need customer to confirm gate access.",
      },
    },
  }),
  seedOrder({
    id: "ord_26830",
    orderNumber: "26830",
    customerName: "Avery Naidoo",
    customerEmail: "anaidoo@example.com",
    customerPhone: "843-555-0159",
    buildingSize: "40x60x12",
    buildingType: "Warehouse",
    address: "1 Coastal Industrial Ct",
    city: "Charleston",
    state: "SC",
    salesRep: "Alyssa Chase",
    manufacturer: "American Steel",
    stmDate: "2026-06-01",
    currentStage: "ready_for_install",
    checklistOverrides: {
      welcome_call_made: true,
      permitting: true,
      land_prep: true,
    },
  }),

  // ───────────────────────────────────────────────────────────────────────────
  // SCHEDULED — install date confirmed
  // ───────────────────────────────────────────────────────────────────────────
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
    stmDate: "2026-05-28",
    currentStage: "scheduled",
    permitType: "Zoning only",
    foundationType: "Concrete piers",
    landPrepStatus: "Pad poured",
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
    notes: [
      note(
        "not_26839_1",
        "Jordan Pace",
        "2026-07-02T15:02:00Z",
        "Confirmed with Kyle — he'll have someone on-site all week. Reminded him about gate code.",
      ),
    ],
    emails: [
      mail(
        "eml_26839_1",
        "ready_for_install_completed",
        "Order 26839 is on the schedule!",
        "kbremer@example.com",
        "2026-07-02T15:03:00Z",
        "ready_for_install → completed (by Jordan Pace)",
        "Hi Kyle, your 30x40x12 Barn w/ Lean-to is officially on the Best Choice schedule.",
      ),
      mail(
        "eml_26839_2",
        "scheduled_pending",
        "Delivery window confirmed for order 26839",
        "kbremer@example.com",
        "2026-07-02T15:04:00Z",
        "scheduled → pending (by Jordan Pace)",
        "Hi Kyle, your delivery + install window has been confirmed! The install crew will call you 24–48 hours ahead to confirm arrival.",
      ),
    ],
  }),
  seedOrder({
    id: "ord_26829",
    orderNumber: "26829",
    customerName: "Cassidy Wolff",
    customerEmail: "cwolff@example.com",
    customerPhone: "217-555-0166",
    buildingSize: "24x30x10",
    buildingType: "Garage",
    address: "34 Prairie Lark Way",
    city: "Bloomington",
    state: "IL",
    salesRep: "Reed Hunt",
    manufacturer: "TBS",
    stmDate: "2026-05-24",
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
        updatedAt: "2026-07-01T10:30:00Z",
        updatedBy: "Jordan Pace",
        note: "Install crew ETA 2026-07-11.",
      },
    },
  }),
  seedOrder({
    id: "ord_26826",
    orderNumber: "26826",
    customerName: "Reggie Pendleton",
    customerEmail: "rpendleton@example.com",
    customerPhone: "252-555-0198",
    buildingSize: "50x80x16",
    buildingType: "Commercial Barn",
    address: "9 Old Farmhouse Rd",
    city: "Wilson",
    state: "NC",
    salesRep: "Salita Bengochea",
    manufacturer: "American Steel",
    stmDate: "2026-05-18",
    currentStage: "scheduled",
    checklistOverrides: {
      welcome_call_made: true,
      permitting: true,
      land_prep: true,
      scheduling: true,
    },
    stageOverrides: {
      scheduled: {
        status: "waiting",
        updatedAt: "2026-07-04T08:00:00Z",
        updatedBy: "Jordan Pace",
        note: "Weather delay — tropical storm warning through weekend. Rescheduling.",
      },
    },
    notes: [
      note(
        "not_26826_1",
        "Jordan Pace",
        "2026-07-04T08:02:00Z",
        "Coordinating with install crew and Reggie to push to the following week. Weather looks clear starting 7/13.",
      ),
    ],
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
    stmDate: "2026-05-10",
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
    notes: [
      note(
        "not_26828_1",
        "Jordan Pace",
        "2026-07-03T09:02:00Z",
        "Quentin was thrilled — crew was ahead of schedule. He's already talking about a second building.",
      ),
    ],
    emails: [
      mail(
        "eml_26828_1",
        "scheduled_completed",
        "Enjoy your new building, Quentin!",
        "qhargrove@example.com",
        "2026-07-03T09:03:00Z",
        "scheduled → completed (by Jordan Pace)",
        "Hi Quentin, congratulations — your 50x80x16 Commercial Storage has been delivered and installed!",
      ),
    ],
  }),
  seedOrder({
    id: "ord_26824",
    orderNumber: "26824",
    customerName: "Boyd Cunningham",
    customerEmail: "bcunningham@example.com",
    customerPhone: "870-555-0121",
    buildingSize: "30x40x12",
    buildingType: "Garage",
    address: "45 Buffalo Creek Rd",
    city: "Fayetteville",
    state: "AR",
    salesRep: "Bill Alexander",
    manufacturer: "TBS",
    stmDate: "2026-04-30",
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
        updatedAt: "2026-06-28T14:00:00Z",
        updatedBy: "Jordan Pace",
        note: "Delivered and installed 6/28. Photos received.",
      },
    },
  }),
];
