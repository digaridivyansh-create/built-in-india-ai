import TopNav from './TopNav';
import NotificationStack from './Notification';
import { useMobility } from '../context/MobilityContext';

export default function AppShell({ children }) {
  const { notifications, dismissNotification } = useMobility();

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">{children}</main>
      <NotificationStack notifications={notifications} onDismiss={dismissNotification} />
    </div>
  );
}
