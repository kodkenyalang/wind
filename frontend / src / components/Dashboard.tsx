import PriceCards from './PriceCards';
import RewardHistory from './RewardHistory';
import AdminPanel from './AdminPanel';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function Dashboard() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold">Price Dashboard</h2>
        <p className="text-muted-foreground">Real-time cryptocurrency price tracking and rewards</p>
      </div>

      <PriceCards />

      {!adminLoading && isAdmin && <AdminPanel />}

      <RewardHistory />
    </div>
  );
}
