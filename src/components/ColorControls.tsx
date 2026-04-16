import { useState, useEffect, useRef, useCallback } from 'react';
import { TextElement } from '../types';
import { HSV, hexToHsv, hsvToHex, isValidHex } from '../lib/colorUtils';
import { cn } from '../lib/utils';

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
      className="relative w-full h-40 rounded-xl cursor-crosshair overflow-hidden"
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
    <div className="grid grid-cols-10 gap-2">
      {colors.map((color, i) => (
        <button
          key={`${color}-${i}`}
          onClick={() => onSelect(color)}
          className={cn(
            "aspect-square rounded-md border border-white/5 transition-transform active:scale-90",
            selectedColor === color && "ring-2 ring-accent ring-offset-2 ring-offset-[#111]"
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
    return saved ? JSON.parse(saved) : DEFAULT_COLORS.slice(0, 10);
  });

  useEffect(() => {
    const currentHsv = hexToHsv(element.fill);
    setHsv(currentHsv);
    setHexInput(element.fill);
  }, [element.fill]);

  const addToRecent = useCallback((hex: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== hex);
      const updated = [hex, ...filtered].slice(0, 10);
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
      <SaturationBrightnessPicker 
        hsv={hsv} 
        onChange={handleColorChange} 
        onEnd={handleEndDrag}
      />

      <HueSlider 
        h={hsv.h} 
        onChange={(h) => handleColorChange({ ...hsv, h })} 
        onEnd={handleEndDrag}
      />

      <div className="grid grid-cols-[auto_1fr] gap-6 items-end">
        <div className="space-y-2">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Cor (HEX)</label>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg border border-white/10 shadow-inner"
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
              className="w-24 bg-[#1a1a1a] border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors uppercase"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Opacidade</label>
            <span className="text-[10px] font-mono">{Math.round(element.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={element.opacity}
            onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
            className="w-full accent-accent h-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Cores Recentes</label>
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
  );
}

