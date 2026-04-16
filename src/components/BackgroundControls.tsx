import { useState, useEffect, useCallback } from 'react';
import { TextElement } from '../types';
import { HSV, hexToHsv, hsvToHex, isValidHex } from '../lib/colorUtils';
import { cn } from '../lib/utils';
import { SaturationBrightnessPicker, HueSlider } from './ColorControls';
import Slider from './ui/Slider';

interface BackgroundControlsProps {
  element: TextElement;
  onUpdate: (attrs: Partial<TextElement>) => void;
}

const DEFAULT_COLORS = [
  '#E7D1B0', '#000000', '#FFFFFF', '#808080',
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080'
];

export default function BackgroundControls({ element, onUpdate }: BackgroundControlsProps) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(element.backgroundColor || '#E7D1B0'));
  const [hexInput, setHexInput] = useState(element.backgroundColor || '#E7D1B0');
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentBackgroundColors');
    return saved ? JSON.parse(saved) : DEFAULT_COLORS.slice(0, 5);
  });

  useEffect(() => {
    const currentHsv = hexToHsv(element.backgroundColor || '#E7D1B0');
    setHsv(currentHsv);
    setHexInput(element.backgroundColor || '#E7D1B0');
  }, [element.backgroundColor]);

  const addToRecent = useCallback((hex: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== hex);
      const updated = [hex, ...filtered].slice(0, 5);
      localStorage.setItem('recentBackgroundColors', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleColorChange = (newHsv: HSV) => {
    setHsv(newHsv);
    const hex = hsvToHex(newHsv);
    setHexInput(hex);
    onUpdate({ backgroundColor: hex });
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

      <div className="flex items-center justify-between gap-5 max-w-full overflow-hidden mb-10">
        <div className="space-y-5">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] mb-4 block">Cor (HEX)</label>
          <div className="flex items-center gap-2 mt-3">
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-inner shrink-0"
              style={{ backgroundColor: element.backgroundColor }}
            />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setHexInput(val);
                if (isValidHex(val)) {
                  onUpdate({ backgroundColor: val });
                  addToRecent(val);
                }
              }}
              className="w-18 md:w-22 h-8 md:h-10 bg-[#1a1a1a] border border-border rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:border-accent transition-colors uppercase"
            />
          </div>
        </div>

        <div className="space-y-5">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] mb-4 block text-left">Cores Recentes</label>
          <div className="mt-3">
            <div className="flex items-center gap-1.5">
            {recentColors.map((color, i) => (
              <button
                key={`${color}-${i}`}
                onClick={() => {
                  onUpdate({ backgroundColor: color });
                  addToRecent(color);
                }}
                className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-lg transition-all active:scale-95 shrink-0",
                  element.backgroundColor === color ? "opacity-100" : "hover:opacity-80"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>

      <div className="space-y-5 pt-2 mb-10">
        <div className="flex justify-between items-center mb-4">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Opacidade</label>
          <span className="text-[10px] font-mono">{Math.round(element.backgroundOpacity * 100)}%</span>
        </div>
        <div className="mt-3">
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={element.backgroundOpacity}
            onChange={(val) => onUpdate({ backgroundOpacity: val })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 md:gap-6 mb-10">
        <div className="space-y-5">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Padding Horizontal</label>
            <span className="text-[10px] font-mono">{element.paddingX}px</span>
          </div>
          <div className="mt-3">
            <Slider
              min={0}
              max={100}
              value={element.paddingX}
              onChange={(val) => onUpdate({ paddingX: val })}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Padding Vertical</label>
            <span className="text-[10px] font-mono">{element.paddingY}px</span>
          </div>
          <div className="mt-3">
            <Slider
              min={0}
              max={100}
              value={element.paddingY}
              onChange={(val) => onUpdate({ paddingY: val })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-center mb-4">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Arredondamento</label>
          <span className="text-[10px] font-mono">{element.borderRadius}px</span>
        </div>
        <div className="mt-3">
          <Slider
            min={0}
            max={50}
            value={element.borderRadius}
            onChange={(val) => onUpdate({ borderRadius: val })}
          />
        </div>
      </div>
    </div>
  );
}
