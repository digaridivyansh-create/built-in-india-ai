// Mock AI Service
// -----------------------------------------------------------------------
// This is a deliberately DETERMINISTIC stand-in for a real AI/ML backend.
// No external AI API is called here. The "intelligence" is a simple,
// explainable rules engine so the hackathon demo is 100% reliable.
//
// FUTURE: swap this implementation for a call to a real AI service
// (e.g. an LLM or a trained ranking model) that receives the same
// (destination, buses, routes, incidents) inputs and returns the same
// { recommendedBus, eta, reason, alternative } shape.

import { ROUTE_SERVES } from '../data/mockData';

const OCCUPANCY_RANK = { low: 0, moderate: 1, high: 2 };

/**
 * Decide the best bus for a given destination.
 * @param {string} destination
 * @param {Array} buses
 * @param {Array} routes
 * @param {Array} incidents
 * @returns {{ recommendedBus: object|null, eta: number|null, reason: string, alternative: object|null }}
 */
export function getMobilityRecommendation(destination, buses, routes, incidents = []) {
  // 1. Find buses whose route serves this destination.
  const compatibleRouteIds = Object.entries(ROUTE_SERVES)
    .filter(([, stops]) => stops.includes(destination))
    .map(([routeId]) => routeId);

  let candidates = buses.filter((bus) => compatibleRouteIds.includes(bus.routeId));

  if (candidates.length === 0) {
    return {
      recommendedBus: null,
      eta: null,
      reason: `No active bus currently serves ${destination}. Check the Routes page for scheduled service.`,
      alternative: null,
    };
  }

  // 2. Remove inactive buses (none in this mock, but keep the hook for later).
  candidates = candidates.filter((bus) => bus.status !== 'inactive');

  // 3 & 4. Prefer ON TIME buses, then compare ETA.
  const ranked = [...candidates].sort((a, b) => {
    const aOnTime = a.status === 'on_time' ? 0 : a.status === 'warning' ? 1 : 2;
    const bOnTime = b.status === 'on_time' ? 0 : b.status === 'warning' ? 1 : 2;
    if (aOnTime !== bOnTime) return aOnTime - bOnTime;

    if (a.eta !== b.eta) return a.eta - b.eta;

    // 5. Occupancy as a secondary tiebreaker.
    return OCCUPANCY_RANK[a.occupancy] - OCCUPANCY_RANK[b.occupancy];
  });

  const best = ranked[0];
  const runnerUp = ranked[1] || null;

  // 6. Build a human-readable explanation.
  let reason;
  const wasDelayedNowBeaten = candidates.find(
    (b) => b.status === 'delayed' && b.id !== best.id
  );

  if (wasDelayedNowBeaten) {
    reason = `${wasDelayedNowBeaten.id} is currently delayed, so ${best.id} is now the faster option.`;
  } else if (best.status === 'on_time') {
    reason = `${best.id} is currently the fastest suitable option and is operating on time.`;
  } else if (best.status === 'warning') {
    reason = `${best.id} is running with minor delays but remains the fastest option toward ${destination}.`;
  } else {
    reason = `${best.id} is the fastest available option toward ${destination}, despite an active delay.`;
  }

  return {
    recommendedBus: best,
    eta: best.eta,
    reason,
    alternative: runnerUp,
  };
}

/**
 * Very small deterministic "assistant" that answers a handful of
 * campus-mobility question patterns using live mock state. This is NOT a
 * general chatbot and does not call any external AI API — it's a rules
 * engine dressed up as a conversation.
 */
export function answerAssistantQuestion(question, { buses, routes, incidents = [] }) {
  const q = question.toLowerCase();

  const findDestinationMention = () => {
    const known = ['block a', 'block b', 'block c', 'library', 'main gate', 'hostel', 'academic block'];
    const match = known.find((d) => q.includes(d));
    if (!match) return null;
    return match.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const findRouteMention = () => {
    const match = q.match(/r[1-3]/);
    return match ? match[0].toUpperCase() : null;
  };

  // "Which bus should I take to X?"
  if (q.includes('which bus') || (q.includes('take') && findDestinationMention())) {
    const destination = findDestinationMention() || 'Block C';
    const rec = getMobilityRecommendation(destination, buses, routes, incidents);
    if (!rec.recommendedBus) {
      return `${rec.reason}`;
    }
    return `${rec.recommendedBus.id} is currently your best option for ${destination}. It arrives in about ${rec.eta} minutes and is ${
      rec.recommendedBus.status === 'delayed' ? 'currently delayed' : 'operating on time'
    }.`;
  }

  // "Is there a delay on Route R1?"
  if (q.includes('delay')) {
    const routeId = findRouteMention();
    const relevantIncidents = routeId
      ? incidents.filter((i) => routeId && buses.some((b) => b.id === i.busId && b.routeId === routeId))
      : incidents;

    if (relevantIncidents.length === 0) {
      return routeId
        ? `No delays reported on ${routeId} right now — all buses on that route are on time.`
        : 'No delays are currently reported across the campus network.';
    }
    return relevantIncidents.map((i) => i.message).join(' ');
  }

  // "When is the next bus to the Library?"
  if (q.includes('when') || q.includes('next bus')) {
    const destination = findDestinationMention() || 'Library';
    const rec = getMobilityRecommendation(destination, buses, routes, incidents);
    if (!rec.recommendedBus) return rec.reason;
    return `The next bus to ${destination} is ${rec.recommendedBus.id}, arriving in about ${rec.eta} minutes.`;
  }

  // "Which route is fastest right now?"
  if (q.includes('fastest') || q.includes('which route')) {
    const activeBuses = buses.filter((b) => b.status !== 'inactive');
    const fastest = [...activeBuses].sort((a, b) => a.eta - b.eta)[0];
    if (!fastest) return "I don't have live data on any route right now.";
    return `${fastest.routeId} is currently the fastest, with ${fastest.id} arriving in about ${fastest.eta} minutes.`;
  }

  // Fallback
  return "I can help with which bus to take, current delays, arrival times, or the fastest route. Try one of the suggested questions above.";
}
