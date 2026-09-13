import { useState, useRef, useEffect } from 'react';
import { useMobility } from '../context/MobilityContext';

const API_BASE = 'http://localhost:3000';

const SUGGESTED = [
  'Which bus should I take to Block C?',
  'Is there a delay on Route R1?',
  'When is the next bus to the Library?',
  'Which route is fastest right now?',
];

const DESTINATIONS = [
  'Main Gate',
  'Block A',
  'Block B',
  'Block C',
  'Library',
  'Hostel',
  'Academic Block',
];

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function detectDestination(question) {
  const q = normalize(question);

  return DESTINATIONS.find((destination) => {
    const d = normalize(destination);
    return q.includes(d);
  });
}

function detectRoute(question) {
  const q = normalize(question);
  const match = q.match(/\br\s*([123])\b/);

  return match ? `R${match[1]}` : null;
}

function detectBus(question) {
  const q = normalize(question);
  const match = q.match(/\bbus\s*(\d+)\b/);

  return match ? `BUS${match[1]}` : null;
}

async function getBuses() {
  const response = await fetch(`${API_BASE}/api/buses`);

  if (!response.ok) {
    throw new Error('Unable to fetch live bus data');
  }

  const data = await response.json();
  return data.buses || [];
}

async function getRecommendation(destination, currentLocation) {
  const response = await fetch(
    `${API_BASE}/api/recommendation?currentLocation=${encodeURIComponent(
      currentLocation
    )}&destination=${encodeURIComponent(destination)}`
  );

  if (!response.ok) {
    throw new Error('Unable to get recommendation');
  }

  return response.json();
}

async function answerQuestion(question, currentLocation) {
  const q = normalize(question);
  const buses = await getBuses();

  if (!buses.length) {
    return 'There is currently no live bus data available.';
  }

  const destination = detectDestination(question);
  const route = detectRoute(question);
  const busId = detectBus(question);

  const asksDelay =
    q.includes('delay') ||
    q.includes('delayed') ||
    q.includes('late') ||
    q.includes('late bus');

  const asksFastest =
    q.includes('fastest') ||
    q.includes('quickest') ||
    q.includes('fast bus') ||
    q.includes('fastest bus') ||
    q.includes('fastest route');

  const asksOccupancy =
    q.includes('occupancy') ||
    q.includes('crowded') ||
    q.includes('crowd') ||
    q.includes('full') ||
    q.includes('empty') ||
    q.includes('seats');

  const asksLocation =
    q.includes('where is') ||
    q.includes('where does') ||
    q.includes('location') ||
    q.includes('position') ||
    q.includes('currently');

  const asksETA =
    q.includes('eta') ||
    q.includes('arrival') ||
    q.includes('arrive') ||
    q.includes('when') ||
    q.includes('how long') ||
    q.includes('next bus');

  const asksBusChoice =
    q.includes('which bus') ||
    q.includes('what bus') ||
    q.includes('take') ||
    q.includes('recommend') ||
    q.includes('suggest') ||
    q.includes('go to');

  if (busId) {
    const bus = buses.find((b) => b.busId === busId);

    if (!bus) {
      return `${busId} is not currently available in the live fleet data.`;
    }

    if (asksDelay) {
      return `${bus.busId} on Route ${bus.routeId} is currently ${bus.status === 'delayed' ? 'delayed' : 'on time'}. Its next stop is ${bus.nextStop} and ETA is about ${bus.eta} minutes.`;
    }

    if (asksOccupancy) {
      return `${bus.busId} currently has ${bus.occupancy}% occupancy. Its status is ${bus.status === 'delayed' ? 'delayed' : 'on time'}, and its next stop is ${bus.nextStop}.`;
    }

    if (asksLocation) {
      return `${bus.busId} is currently near ${bus.nextStop}. Its live GPS position is latitude ${Number(bus.latitude).toFixed(5)}, longitude ${Number(bus.longitude).toFixed(5)}.`;
    }

    return `${bus.busId} is on Route ${bus.routeId}. Its next stop is ${bus.nextStop}, ETA is approximately ${bus.eta} minutes, speed is ${Number(bus.speed).toFixed(1)} km/h, and occupancy is ${bus.occupancy}%.`;
  }

  if (route) {
    const routeBuses = buses.filter((b) => b.routeId === route);

    if (!routeBuses.length) {
      return `There are currently no live buses operating on Route ${route}.`;
    }

    if (asksDelay) {
      const delayed = routeBuses.filter(
        (b) => b.status === 'delayed' || b.status === 'late'
      );

      if (delayed.length) {
        return delayed
          .map(
            (b) =>
              `${b.busId} on ${route} is delayed. Next stop: ${b.nextStop}, ETA: ${b.eta} minutes.`
          )
          .join(' ');
      }

      return `Route ${route} has no delayed buses right now. The live buses on this route are operating on time.`;
    }

    if (asksFastest || asksETA) {
      const best = [...routeBuses].sort(
        (a, b) => Number(a.eta) - Number(b.eta)
      )[0];

      return `The best current option on Route ${route} is ${best.busId}, with an ETA of about ${best.eta} minutes. Its next stop is ${best.nextStop}.`;
    }

    return `Route ${route} currently has ${routeBuses.length} live bus${routeBuses.length > 1 ? 'es' : ''}: ${routeBuses.map((b) => `${b.busId} (${b.nextStop}, ${b.eta} min)`).join(', ')}.`;
  }

  if (asksDelay) {
    const delayed = buses.filter(
      (bus) => bus.status === 'delayed' || bus.status === 'late'
    );

    if (!delayed.length) {
      return 'There are currently no delayed buses. All live buses are operating on time.';
    }

    return delayed
      .map(
        (bus) =>
          `${bus.busId} on Route ${bus.routeId} is delayed. Next stop: ${bus.nextStop}, ETA: ${bus.eta} minutes.`
      )
      .join(' ');
  }

  if (asksOccupancy && !destination) {
    const leastCrowded = [...buses].sort(
      (a, b) => Number(a.occupancy) - Number(b.occupancy)
    )[0];

    return `The least crowded live bus is ${leastCrowded.busId} on Route ${leastCrowded.routeId}, with ${leastCrowded.occupancy}% occupancy. Its next stop is ${leastCrowded.nextStop}.`;
  }

  if (destination) {
    try {
      const result = await getRecommendation(
        destination,
        currentLocation
      );

      if (result.recommendation) {
        const bus = result.recommendation;

        return `${result.explanation} Live occupancy is ${bus.occupancy}%, speed is ${Number(bus.speed).toFixed(1)} km/h, and the next stop is ${bus.nextStop}.`;
      }

      return result.explanation;
    } catch (error) {
      console.error('Recommendation error:', error);
    }
  }

  if (asksFastest) {
    const fastest = [...buses].sort(
      (a, b) => Number(a.eta) - Number(b.eta)
    )[0];

    return `The fastest live bus right now is ${fastest.busId} on Route ${fastest.routeId}. It has an ETA of approximately ${fastest.eta} minutes and is currently ${fastest.status === 'delayed' ? 'delayed' : 'on time'}.`;
  }

  if (asksETA) {
    const best = [...buses].sort(
      (a, b) => Number(a.eta) - Number(b.eta)
    )[0];

    return `The next available bus is ${best.busId}, approximately ${best.eta} minutes away. It is heading toward ${best.nextStop} and is currently ${best.status === 'delayed' ? 'delayed' : 'on time'}.`;
  }

  if (asksBusChoice) {
    return `Your current location is ${currentLocation}. Tell me your destination, for example "Which bus should I take to Library?" and I will check the live buses.`;
  }

  return 'I can answer questions about live buses, destinations, routes, ETA, delays, occupancy, speed, and the fastest available option. Try: "Where is BUS12?", "Is R1 delayed?", or "Which bus should I take to Library?"';
}

export default function AIAssistant() {
  const { currentLocation } = useMobility();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm your Campus Mobility Assistant. Ask me which bus to take, when it will arrive, or what's happening on your route.",
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const trimmed = text.trim();

    if (!trimmed || loading) return;

    setInput('');

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
    ]);

    setLoading(true);

    try {
      const answer = await answerQuestion(
        trimmed,
        currentLocation
      );

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: answer },
      ]);
    } catch (error) {
      console.error('AI Assistant error:', error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I could not connect to the live mobility system. Please make sure the backend server and bus simulator are running.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-sm font-semibold text-brand-blue">AI-powered</p>

        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
          Campus Mobility Assistant
        </h1>

        <p className="mt-2 text-slate-500">
          Current location: <span className="font-semibold text-navy-900">{currentLocation}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={loading}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-navy-800 shadow-soft transition hover:border-brand-blue hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex h-[420px] flex-col rounded-3xl border border-slate-200 bg-white shadow-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed animate-fadeSlideIn ${
                  m.role === 'user'
                    ? 'bg-navy-900 text-white'
                    : 'bg-slate-100 text-navy-900'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                Checking live bus data...
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-3 border-t border-slate-100 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a bus, route, or delay..."
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
