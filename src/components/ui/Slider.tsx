import { cn } from '../../lib/utils';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function Slider({ min, max, step = 1, value, onChange, className }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={cn("w-full", className)}
      style={{
        background: `linear-gradient(to right, #E7D1B0 ${percentage}%, #333 ${percentage}%)`,
        height: '3px',
        borderRadius: '10px',
        WebkitAppearance: 'none'
      }}
    />
  );
}
