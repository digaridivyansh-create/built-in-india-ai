import { useMobility } from '../context/MobilityContext';
import MetricCard from '../components/MetricCard';
import FleetTable from '../components/FleetTable';
import AdminMap from '../components/AdminMap';
import DemoControls from '../components/DemoControls';

export default function AdminDashboard() {
  const { buses, routes, incidents, demoDelayActive, simulateDelay, resetDemo } = useMobility();
  const routesById = Object.fromEntries(routes.map((r) => [r.id, r]));

  const activeBuses = buses.length;
  const onTime = buses.filter((b) => b.status === 'on_time').length;
  const delayed = buses.filter((b) => b.status === 'delayed').length;
  const incidentCount = incidents.length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-semibold text-brand-blue">Operations</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
          Fleet Operations
        </h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Active Buses" value={activeBuses} />
        <MetricCard label="On Time" value={onTime} tone="good" />
        <MetricCard label="Delayed" value={delayed} tone={delayed > 0 ? 'bad' : 'default'} />
        <MetricCard label="Incidents" value={incidentCount} tone={incidentCount > 0 ? 'warn' : 'default'} />
      </div>

      {/* Demo controls */}
      <DemoControls demoDelayActive={demoDelayActive} onSimulateDelay={simulateDelay} onReset={resetDemo} />

      {/* Map + Table */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <AdminMap buses={buses} />
        </div>
        <div className="xl:col-span-3">
          <h3 className="mb-3 text-base font-bold text-navy-900">Fleet Table</h3>
          <FleetTable buses={buses} routesById={routesById} />
        </div>
      </div>
    </div>
  );
}
