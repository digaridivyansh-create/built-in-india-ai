// Centralized mock data for Smart Campus Mobility.
// This is the ONLY place raw seed data lives. Components should never
// hardcode bus/route data directly — they consume it via context/services.

export const STOPS = [
  { id: 'main-gate', name: 'Main Gate', x: 60, y: 260 },
  { id: 'block-a', name: 'Block A', x: 180, y: 120 },
  { id: 'block-b', name: 'Block B', x: 420, y: 320 },
  { id: 'block-c', name: 'Block C', x: 520, y: 90 },
  { id: 'library', name: 'Library', x: 300, y: 60 },
  { id: 'hostel', name: 'Hostel', x: 80, y: 380 },
  { id: 'academic-block', name: 'Academic Block', x: 260, y: 340 },
];

export const DESTINATIONS = [
  'Block A',
  'Block B',
  'Block C',
  'Library',
  'Main Gate',
  'Hostel',
  'Academic Block',
];

export const initialRoutes = [
  {
    id: 'R1',
    name: 'Route R1',
    stops: ['Main Gate', 'Block A', 'Library', 'Block C'],
    durationMin: 14,
  },
  {
    id: 'R2',
    name: 'Route R2',
    stops: ['Hostel', 'Academic Block', 'Block B', 'Main Gate'],
    durationMin: 18,
  },
  {
    id: 'R3',
    name: 'Route R3',
    stops: ['Hostel', 'Library', 'Block C'],
    durationMin: 12,
  },
];

// Which destinations each route can actually serve (last stop or passes through)
export const ROUTE_SERVES = {
  R1: ['Main Gate', 'Block A', 'Library', 'Block C'],
  R2: ['Hostel', 'Academic Block', 'Block B', 'Main Gate'],
  R3: ['Hostel', 'Library', 'Block C'],
};

export const initialBuses = [
  {
    id: 'BUS12',
    routeId: 'R1',
    status: 'on_time', // 'on_time' | 'delayed' | 'warning'
    eta: 5,
    speed: 25,
    nextStop: 'Block C',
    occupancy: 'moderate', // 'low' | 'moderate' | 'high'
    progress: 0.65,
  },
  {
    id: 'BUS14',
    routeId: 'R2',
    status: 'on_time',
    eta: 7,
    speed: 22,
    nextStop: 'Academic Block',
    occupancy: 'low',
    progress: 0.3,
  },
  {
    id: 'BUS18',
    routeId: 'R3',
    status: 'on_time',
    eta: 10,
    speed: 20,
    nextStop: 'Library',
    occupancy: 'high',
    progress: 0.45,
  },
];

export const initialIncidents = [];

// The exact "delayed" values BUS12 takes on when SIMULATE DELAY is triggered.
export const DELAY_OVERRIDE = {
  status: 'delayed',
  eta: 11,
  speed: 15,
};
