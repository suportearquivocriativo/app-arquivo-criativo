import { useState, useEffect, useCallback } from 'react';
import { TextElement } from '../types';
import { HSV, hexToHsv, hsvToHex, isValidHex } from '../lib/colorUtils';
import { cn } from '../lib/utils';
import { SaturationBrightnessPicker, HueSlider } from './ColorControls';
import Slider from './ui/Slider';

interface ShadowControlsProps {
  element: TextElement;
  onUpdate: (attrs: Partial<TextElement>) => void;
}

const DEFAULT_COLORS = [
  '#000000', '#404040', '#808080', '#FFFFFF',
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080'
];

export default function ShadowControls({ element, onUpdate }: ShadowControlsProps) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(element.shadowColor || '#000000'));
  const [hexInput, setHexInput] = useState(element.shadowColor || '#000000');
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentShadowColors');
    return saved ? JSON.parse(saved) : DEFAULT_COLORS.slice(0, 5);
  });

  useEffect(() => {
    const currentHsv = hexToHsv(element.shadowColor || '#000000');
    setHsv(currentHsv);
    setHexInput(element.shadowColor || '#000000');
  }, [element.shadowColor]);

  const addToRecent = useCallback((hex: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== hex);
      const updated = [hex, ...filtered].slice(0, 5);
      localStorage.setItem('recentShadowColors', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleColorChange = (newHsv: HSV) => {
    setHsv(newHsv);
    const hex = hsvToHex(newHsv);
    setHexInput(hex);
    onUpdate({ shadowColor: hex });
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

      <div className="pt-2">
        <HueSlider 
          h={hsv.h} 
          onChange={(h) => handleColorChange({ ...hsv, h })} 
          onEnd={handleEndDrag}
        />
      </div>

      <div className="flex items-center justify-between gap-5 max-w-full overflow-hidden mb-2">
        <div className="space-y-3">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] mb-2 block">Cor (HEX)</label>
          <div className="flex items-center gap-2 mt-1">
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-inner shrink-0"
              style={{ backgroundColor: element.shadowColor }}
            />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setHexInput(val);
                if (isValidHex(val)) {
                  onUpdate({ shadowColor: val });
                  addToRecent(val);
                }
              }}
              className="w-18 md:w-22 h-8 md:h-10 bg-[#1a1a1a] border border-border rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:border-accent transition-colors uppercase"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] mb-2 block text-left">Cores Recentes</label>
          <div className="mt-1">
            <div className="flex items-center gap-1.5">
            {recentColors.slice(0, 5).map((color, i) => (
              <button
                key={`${color}-${i}`}
                onClick={() => {
                  onUpdate({ shadowColor: color });
                  addToRecent(color);
                }}
                className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-lg transition-transform active:scale-90",
                  element.shadowColor === color ? "scale-110 z-10" : "hover:scale-105"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>

      <div className="grid grid-cols-2 gap-5 md:gap-6 mb-2">
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Desfoque</label>
            <span className="text-[10px] font-mono">{element.shadowBlur}px</span>
          </div>
          <div className="mt-1">
            <Slider
              min={0}
              max={50}
              value={element.shadowBlur}
              onChange={(val) => onUpdate({ shadowBlur: val })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Opacidade</label>
            <span className="text-[10px] font-mono">{Math.round(element.shadowOpacity * 100)}%</span>
          </div>
          <div className="mt-1">
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={element.shadowOpacity}
              onChange={(val) => onUpdate({ shadowOpacity: val })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 md:gap-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Posição X</label>
            <span className="text-[10px] font-mono">{element.shadowOffsetX}px</span>
          </div>
          <div className="mt-1">
            <Slider
              min={-50}
              max={50}
              value={element.shadowOffsetX}
              onChange={(val) => onUpdate({ shadowOffsetX: val })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Posição Y</label>
            <span className="text-[10px] font-mono">{element.shadowOffsetY}px</span>
          </div>
          <div className="mt-1">
            <Slider
              min={-50}
              max={50}
              value={element.shadowOffsetY}
              onChange={(val) => onUpdate({ shadowOffsetY: val })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
