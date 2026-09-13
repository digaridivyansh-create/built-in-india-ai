import { useMobility } from '../context/MobilityContext';
import DestinationSearch from '../components/DestinationSearch';
import AIRecommendation from '../components/AIRecommendation';
import BusCard from '../components/BusCard';
import LiveMap from '../components/LiveMap';

const CAMPUS_LOCATIONS = [
  'Block A',
  'Block B',
  'Block C',
  'Library',
  'Main Gate',
  'Hostel',
  'Academic Block'
];

export default function StudentDashboard() {
  const {
    buses,
    routes,
    destinations,
    currentLocation,
    selectedDestination,
    setCurrentLocation,
    setDestination,
    recommendation,
    pushNotification
  } = useMobility();

  const routesById = Object.fromEntries(
    routes.map((r) => [r.id, r])
  );

  const sortedBuses = [...buses].sort((a, b) => {
    const aDelayed = a.status === 'delayed';
    const bDelayed = b.status === 'delayed';

    if (aDelayed !== bDelayed) {
      return aDelayed ? 1 : -1;
    }

    return Number(a.eta) - Number(b.eta);
  });

  const handleLocationChange = (location) => {
    setCurrentLocation(location);

    pushNotification(
      `Current location set to ${location}. Finding the best route.`,
      'info'
    );
  };

  const handleViewBus = () => {
    if (recommendation.recommendedBus) {
      pushNotification(
        `Tracking ${recommendation.recommendedBus.id} live.`,
        'info'
      );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-semibold text-brand-blue">
          Good morning
        </p>

        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
          Where do you need to go?
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-navy-900">
          📍 Where are you now?
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select your current campus location.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {CAMPUS_LOCATIONS.map((location) => (
            <button
              key={location}
              onClick={() => handleLocationChange(location)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                location === currentLocation
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {location}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
          <span className="font-semibold text-navy-900">
            Current location:
          </span>{' '}
          <span className="text-slate-600">
            {currentLocation}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-navy-900">
            🎯 Where do you want to go?
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select your destination.
          </p>
        </div>

        <DestinationSearch
          destinations={destinations}
          value={selectedDestination}
          onChange={setDestination}
        />

        <div className="flex flex-wrap gap-2">
          {destinations.map((d) => (
            <button
              key={d}
              onClick={() => setDestination(d)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                d === selectedDestination
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <AIRecommendation
        destination={selectedDestination}
        recommendation={recommendation}
        onViewBus={handleViewBus}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="mb-3 text-lg font-bold text-navy-900">
            Campus Map
          </h2>

          <LiveMap buses={buses} />
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold text-navy-900">
            Nearby Buses
          </h2>

          <div className="flex flex-col gap-4">
            {sortedBuses.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                routeName={routesById[bus.routeId]?.id}
                highlighted={
                  bus.id === recommendation.recommendedBus?.id
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
