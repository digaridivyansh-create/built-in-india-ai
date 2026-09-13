import { useMobility } from '../context/MobilityContext';
import DestinationSearch from '../components/DestinationSearch';
import AIRecommendation from '../components/AIRecommendation';
import BusCard from '../components/BusCard';
import LiveMap from '../components/LiveMap';

export default function StudentDashboard() {
  const { buses, routes, destinations, selectedDestination, setDestination, recommendation, pushNotification } =
    useMobility();

  const routesById = Object.fromEntries(routes.map((r) => [r.id, r]));

  const handleViewBus = () => {
    if (recommendation.recommendedBus) {
      pushNotification(`Tracking ${recommendation.recommendedBus.id} live.`, 'info');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-brand-blue">Good morning</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
          Where do you need to go?
        </h1>
      </div>

      {/* Destination selector */}
      <div className="flex flex-col gap-4">
        <DestinationSearch destinations={destinations} value={selectedDestination} onChange={setDestination} />
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

      {/* AI Recommendation */}
      <AIRecommendation
        destination={selectedDestination}
        recommendation={recommendation}
        onViewBus={handleViewBus}
      />

      {/* Map + Nearby buses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="mb-3 text-lg font-bold text-navy-900">Campus Map</h2>
          <LiveMap buses={buses} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold text-navy-900">Nearby Buses</h2>
          <div className="flex flex-col gap-4">
            {buses.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                routeName={routesById[bus.routeId]?.id}
                highlighted={bus.id === recommendation.recommendedBus?.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
