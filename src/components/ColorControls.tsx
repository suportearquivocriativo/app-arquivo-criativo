import { useState, useEffect, useRef, useCallback } from 'react';
import { TextElement } from '../types';
import { HSV, hexToHsv, hsvToHex, isValidHex } from '../lib/colorUtils';
import { cn } from '../lib/utils';
import Slider from './ui/Slider';

interface ColorControlsProps {
  element: TextElement;
  onUpdate: (attrs: Partial<TextElement>) => void;
}

const DEFAULT_COLORS = [
  '#FFFFFF', '#000000', '#808080', '#E7D1B0', 
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080'
];

// --- Reusable Sub-components ---

export function SaturationBrightnessPicker({ hsv, onChange, onEnd }: { hsv: HSV, onChange: (hsv: HSV) => void, onEnd?: () => void }) {
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!pickerRef.current) return;
    const rect = pickerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let s = ((clientX - rect.left) / rect.width) * 100;
    let v = 100 - ((clientY - rect.top) / rect.height) * 100;
    
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    
    onChange({ ...hsv, s, v });
  };

  const startDragging = () => {
    const onMove = (e: any) => handleMove(e);
    const onEndDrag = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEndDrag);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEndDrag);
      onEnd?.();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEndDrag);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onEndDrag);
  };

  return (
    <div 
      ref={pickerRef}
      className="relative w-full h-28 md:h-40 rounded-xl cursor-crosshair overflow-hidden"
      style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
      onMouseDown={(e) => { handleMove(e); startDragging(); }}
      onTouchStart={(e) => { handleMove(e); startDragging(); }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      <div 
        className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg pointer-events-none"
        style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
      />
    </div>
  );
}

export function HueSlider({ h, onChange, onEnd }: { h: number, onChange: (h: number) => void, onEnd?: () => void }) {
  const hueRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    let newH = ((clientX - rect.left) / rect.width) * 360;
    newH = Math.max(0, Math.min(360, newH));
    
    onChange(newH);
  };

  const startDragging = () => {
    const onMove = (e: any) => handleMove(e);
    const onEndDrag = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEndDrag);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEndDrag);
      onEnd?.();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEndDrag);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onEndDrag);
  };

  return (
    <div 
      ref={hueRef}
      className="relative w-full h-3 rounded-full cursor-pointer hue-gradient"
      onMouseDown={(e) => { handleMove(e); startDragging(); }}
      onTouchStart={(e) => { handleMove(e); startDragging(); }}
    >
      <div 
        className="absolute w-4 h-4 bg-white border border-black/10 rounded-full -translate-x-1/2 -top-0.5 shadow-md pointer-events-none"
        style={{ left: `${(h / 360) * 100}%` }}
      />
      <style>{`
        .hue-gradient {
          background: linear-gradient(to right, 
            #ff0000 0%, #ffff00 17%, #00ff00 33%, 
            #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%
          );
        }
      `}</style>
    </div>
  );
}

export function ColorPalette({ 
  colors, 
  selectedColor, 
  onSelect 
}: { 
  colors: string[], 
  selectedColor: string, 
  onSelect: (color: string) => void 
}) {
  return (
    <div className="flex items-center gap-1.5">
      {colors.slice(0, 5).map((color, i) => (
        <button
          key={`${color}-${i}`}
          onClick={() => onSelect(color)}
          className={cn(
            "w-8 h-8 md:w-10 md:h-10 rounded-lg transition-all active:scale-95 shrink-0",
            selectedColor === color ? "opacity-100" : "hover:opacity-80"
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

// --- Main Component ---

export default function ColorControls({ element, onUpdate }: ColorControlsProps) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(element.fill));
  const [hexInput, setHexInput] = useState(element.fill);
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentColors');
    return saved ? JSON.parse(saved) : DEFAULT_COLORS.slice(0, 5);
  });

  useEffect(() => {
    const currentHsv = hexToHsv(element.fill);
    setHsv(currentHsv);
    setHexInput(element.fill);
  }, [element.fill]);

  const addToRecent = useCallback((hex: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== hex);
      const updated = [hex, ...filtered].slice(0, 5);
      localStorage.setItem('recentColors', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleColorChange = (newHsv: HSV) => {
    setHsv(newHsv);
    const hex = hsvToHex(newHsv);
    setHexInput(hex);
    onUpdate({ fill: hex });
  };

  const handleEndDrag = () => {
    addToRecent(hsvToHex(hsv));
  };

  return (
    <div className="space-y-6">
      <div>
        <SaturationBrightnessPicker 
          hsv={hsv} 
          onChange={handleColorChange} 
          onEnd={handleEndDrag}
        />
      </div>

      <div className="mb-10">
        <HueSlider 
          h={hsv.h} 
          onChange={(h) => handleColorChange({ ...hsv, h })} 
          onEnd={handleEndDrag}
        />
      </div>

      <div className="flex items-center justify-between gap-4 max-w-full overflow-hidden mb-10">
        <div className="space-y-5">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] mb-4 block">Cor (HEX)</label>
          <div className="flex items-center gap-2 mt-3">
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-inner shrink-0"
              style={{ backgroundColor: element.fill }}
            />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setHexInput(val);
                if (isValidHex(val)) {
                  onUpdate({ fill: val });
                  addToRecent(val);
                }
              }}
              className="w-18 md:w-22 bg-[#1a1a1a] border border-border rounded-lg px-2 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:border-accent transition-colors uppercase"
            />
          </div>
        </div>

        <div className="space-y-5">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] mb-4 block text-left">Cores Recentes</label>
          <div className="mt-3">
            <ColorPalette 
              colors={recentColors} 
              selectedColor={element.fill} 
              onSelect={(color) => {
                onUpdate({ fill: color });
                addToRecent(color);
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-5 pt-2">
        <div className="flex justify-between items-center mb-4">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Opacidade</label>
          <span className="text-[10px] font-mono">{Math.round(element.opacity * 100)}%</span>
        </div>
        <div className="mt-3">
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={element.opacity}
            onChange={(val) => onUpdate({ opacity: val })}
          />
        </div>
      </div>
    </div>
  );
}

