// OfflineBanner — Shown when no network connection detected (PRD 5.7)
import { WifiOffIcon } from './Icons';

export default function OfflineBanner() {
  return (
    <div className="bg-amber-500 text-white text-center py-1.5 text-sm font-medium">
      <WifiOffIcon size={16} className="inline mr-1.5" />
      You are offline — showing cached data
    </div>
  );
}
