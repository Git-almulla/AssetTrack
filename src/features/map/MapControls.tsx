// ============================================================
// MapControls — My Location, Show All Assets, Layer toggle (PRD 5.2.2)
// ============================================================

import { CrosshairIcon, MaximizeIcon, LayersIcon } from '../../components';

interface MapControlsProps {
  onMyLocation: () => void;
  onShowAll: () => void;
  onToggleStyle: () => void;
  currentStyle: 'streets' | 'satellite' | 'hybrid';
}

export default function MapControls({
  onMyLocation,
  onShowAll,
  onToggleStyle,
  currentStyle,
}: MapControlsProps) {
  return (
    <div className="absolute bottom-28 right-3 z-10 flex flex-col gap-2">
      <ControlButton
        onClick={onMyLocation}
        label="My Location"
        icon={<CrosshairIcon size={20} className="text-gray-700" />}
      />
      <ControlButton
        onClick={onShowAll}
        label="Show All Assets"
        icon={<MaximizeIcon size={20} className="text-gray-700" />}
      />
      <ControlButton
        onClick={onToggleStyle}
        label={`Map: ${currentStyle}`}
        icon={<LayersIcon size={20} className="text-gray-700" />}
      />
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  icon,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-11 h-11 bg-white rounded-xl shadow-lg flex items-center justify-center
                 hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      {icon}
    </button>
  );
}
