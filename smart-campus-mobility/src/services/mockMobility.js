// Mock Mobility Service
// -----------------------------------------------------------------------
// This module simulates what a real backend (e.g. Firebase Realtime DB)
// would provide: buses, routes, and incidents. Every function here is a
// stand-in for a future network/Firebase call. Nothing outside this file
// should know it's fake — that's the integration boundary.
//
// FUTURE: replace the bodies of these functions with Firebase reads
// (onSnapshot / get) without changing their signatures, and the rest of
// the app keeps working unchanged.

import { initialBuses, initialRoutes, initialIncidents } from '../data/mockData';

export function getBuses() {
  return initialBuses;
}

export function getRoutes() {
  return initialRoutes;
}

export function getIncidents() {
  return initialIncidents;
}

export function getStatusLabel(status) {
  switch (status) {
    case 'on_time':
      return 'ON TIME';
    case 'delayed':
      return 'DELAYED';
    case 'warning':
      return 'WARNING';
    default:
      return status;
  }
}

export function getOccupancyLabel(occupancy) {
  switch (occupancy) {
    case 'low':
      return 'Low';
    case 'moderate':
      return 'Moderate';
    case 'high':
      return 'High';
    default:
      return occupancy;
  }
}
