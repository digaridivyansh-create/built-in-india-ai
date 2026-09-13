import { useMobility } from '../context/MobilityContext';
import RouteCard from '../components/RouteCard';

export default function RoutesPage() {
  const { routes, buses } = useMobility();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-semibold text-brand-blue">Campus network</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
          Routes
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          All active campus shuttle routes, their stops, and which buses are currently running on
          them.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} buses={buses} />
        ))}
      </div>
    </div>
  );
}
