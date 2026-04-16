import { useState, useEffect, useCallback } from 'react';
import { TextElement } from '../types';
import { HSV, hexToHsv, hsvToHex, isValidHex } from '../lib/colorUtils';
import { cn } from '../lib/utils';
import { SaturationBrightnessPicker, HueSlider } from './ColorControls';

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
    <div className="space-y-4 md:space-y-6">
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

      <div className="grid grid-cols-[auto_1fr] gap-4 md:gap-6 items-end">
        <div className="space-y-2">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Cor do Fundo</label>
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-white/10 shadow-inner"
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
              className="w-20 md:w-24 h-8 md:h-10 bg-[#1a1a1a] border border-border rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:border-accent transition-colors uppercase"
            />
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Cores Recentes</label>
          <div className="flex gap-2">
            {recentColors.map((color, i) => (
              <button
                key={`${color}-${i}`}
                onClick={() => {
                  onUpdate({ backgroundColor: color });
                  addToRecent(color);
                }}
                className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-lg border border-white/5 transition-transform active:scale-90",
                  element.backgroundColor === color && "ring-2 ring-accent ring-offset-2 ring-offset-[#111]"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Opacidade</label>
          <span className="text-[10px] font-mono">{Math.round(element.backgroundOpacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={element.backgroundOpacity}
          onChange={(e) => onUpdate({ backgroundOpacity: parseFloat(e.target.value) })}
          className="w-full accent-accent h-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Padding Horizontal</label>
            <span className="text-[10px] font-mono">{element.paddingX}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={element.paddingX}
            onChange={(e) => onUpdate({ paddingX: parseInt(e.target.value) })}
            className="w-full accent-accent h-1"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Padding Vertical</label>
            <span className="text-[10px] font-mono">{element.paddingY}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={element.paddingY}
            onChange={(e) => onUpdate({ paddingY: parseInt(e.target.value) })}
            className="w-full accent-accent h-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Arredondamento</label>
          <span className="text-[10px] font-mono">{element.borderRadius}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={element.borderRadius}
          onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
          className="w-full accent-accent h-1"
        />
      </div>
    </div>
  );
}
