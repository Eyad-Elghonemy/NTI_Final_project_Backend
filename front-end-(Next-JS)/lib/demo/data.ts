// lib/demo/data.ts

// ============================================================
// DEMO IMAGES
// ============================================================

export const DEMO_IMAGE = "/images/demo-car-original.jpg";

export const DEMO_RESULT_IMAGE = "/images/demo-car-detection.jpg";

export const DEMO_FILE_NAME = "demo-severe-front-right.jpg";

// ============================================================
// DEMO DETECTIONS
// ============================================================

export const DEMO_DETECTIONS = [
  {
    type: "Lamp Broken",
    location: "front right headlight assembly",
    percentage: 1.4,
    level: "Severe",
    tone: "red",
    bbox: [0, 0, 0, 0],
  },
  {
    type: "Tire Flat",
    location: "front right wheel and tire",
    percentage: 3.1,
    level: "Severe",
    tone: "red",
    bbox: [0, 0, 0, 0],
  },
  {
    type: "Dent",
    location: "front right fender and bumper corner",
    percentage: 1.0,
    level: "Severe",
    tone: "red",
    bbox: [0, 0, 0, 0],
  },
];

// ============================================================
// DEMO AI DAMAGE REPORT
// ============================================================

export const DEMO_REPORT = {
  notes:
    "Cost includes replacement parts for the headlight assembly, front tire, fender panel, and bumper components along with professional painting and alignment services.",

  estimated_repair_time_hours: 18,

  technician_service_cost_egp: {
    min: 3500,
    max: 6000,
  },

  equipment_and_parts_cost_egp: {
    min: 15000,
    max: 28000,
  },

  total_estimated_cost_egp: {
    min: 18500,
    max: 34000,
  },

  // ==========================================================
  // DAMAGE ASSESSMENT
  // ==========================================================

  damage_assessment: [
    {
      damage_type: "Lamp Broken",

      location_on_vehicle: "front right headlight assembly",

      severity: "severe",

      description:
        "Completely smashed front right headlight lens and housing unit requiring full assembly replacement.",
    },

    {
      damage_type: "Tire Flat",

      location_on_vehicle: "front right wheel and tire",

      severity: "severe",

      description:
        "Completely deflated and structurally compromised front right tire.",
    },

    {
      damage_type: "Dent",

      location_on_vehicle: "front right fender and bumper corner",

      severity: "severe",

      description:
        "Severe depression and structural deformation on the front right fender panel and bumper corner with detachment points.",
    },
  ],

  // ==========================================================
  // REPAIR PLAN
  // ==========================================================

  repair_steps: [
    "Secure the vehicle on a lift in the workshop and disconnect the battery.",

    "Remove the damaged front bumper assembly and the severely dented right fender.",

    "Inspect the inner fender apron, suspension components, and wheel alignment for secondary damage.",

    "Replace the broken front right headlight assembly with an OEM replacement unit.",

    "Replace the damaged front right tire and perform balancing.",

    "Install a new front right fender and bumper cover, align panel gaps, and prep for paint.",

    "Paint match and spray the newly installed fender and bumper matching the vehicle's silver color.",

    "Reassemble all components, test electrical connections, and conduct a full wheel alignment check.",
  ],

  // ==========================================================
  // TOOLS & EQUIPMENT
  // ==========================================================

  tools_and_equipment_needed: [
    "Hydraulic vehicle lift",

    "Pneumatic socket sets and wrenches",

    "Trim removal tools",

    "Body hammer and dolly set",

    "Paint spray gun and paint booth",

    "Tire changing machine and wheel balancer",

    "Wheel alignment machine",

    "Multimeter for electrical testing",
  ],
};

// ============================================================
// OVERALL SEVERITY
// ============================================================

export const DEMO_SEVERITY = "Severe";

// ============================================================
// DEMO HISTORY
// ============================================================

export const DEMO_HISTORY_ITEM = {
  id: "demo-severe-front-right",

  date: "Sep 10, 2026",

  timestamp: Date.now(),

  vehicle: "Demo Vehicle",

  damage: "Lamp Broken, Tire Flat, Dent",

  severity: "Severe",

  cost: "18,500 – 34,000 EGP",

  originalImage: DEMO_IMAGE,

  resultImage: DEMO_RESULT_IMAGE,

  report: DEMO_REPORT,

  detections: DEMO_DETECTIONS,
};

// ============================================================
// DEMO HISTORY LIST
// ============================================================

export const DEMO_HISTORY = [DEMO_HISTORY_ITEM];
