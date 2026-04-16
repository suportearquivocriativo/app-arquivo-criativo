import { useState, useEffect, useCallback } from 'react';
import { TextElement } from '../types';
import { HSV, hexToHsv, hsvToHex, isValidHex } from '../lib/colorUtils';
import { cn } from '../lib/utils';
import { SaturationBrightnessPicker, HueSlider } from './ColorControls';

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
    return saved ? JSON.parse(saved) : DEFAULT_COLORS.slice(0, 10);
  });

  useEffect(() => {
    const currentHsv = hexToHsv(element.shadowColor || '#000000');
    setHsv(currentHsv);
    setHexInput(element.shadowColor || '#000000');
  }, [element.shadowColor]);

  const addToRecent = useCallback((hex: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== hex);
      const updated = [hex, ...filtered].slice(0, 10);
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

      <HueSlider 
        h={hsv.h} 
        onChange={(h) => handleColorChange({ ...hsv, h })} 
        onEnd={handleEndDrag}
      />

      <div className="grid grid-cols-[auto_1fr] gap-6 items-end">
        <div className="space-y-2">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Cor da Sombra</label>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg border border-white/10 shadow-inner"
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
              className="w-24 h-10 bg-[#1a1a1a] border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors uppercase"
            />
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Cores Recentes</label>
          <div className="flex gap-2">
            {recentColors.slice(0, 5).map((color, i) => (
              <button
                key={`${color}-${i}`}
                onClick={() => {
                  onUpdate({ shadowColor: color });
                  addToRecent(color);
                }}
                className={cn(
                  "w-10 h-10 rounded-lg border border-white/5 transition-transform active:scale-90",
                  element.shadowColor === color && "ring-2 ring-accent ring-offset-2 ring-offset-[#111]"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Desfoque</label>
            <span className="text-[10px] font-mono">{element.shadowBlur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={element.shadowBlur}
            onChange={(e) => onUpdate({ shadowBlur: parseInt(e.target.value) })}
            className="w-full accent-accent h-1"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Opacidade</label>
            <span className="text-[10px] font-mono">{Math.round(element.shadowOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={element.shadowOpacity}
            onChange={(e) => onUpdate({ shadowOpacity: parseFloat(e.target.value) })}
            className="w-full accent-accent h-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Posição X</label>
            <span className="text-[10px] font-mono">{element.shadowOffsetX}px</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={element.shadowOffsetX}
            onChange={(e) => onUpdate({ shadowOffsetX: parseInt(e.target.value) })}
            className="w-full accent-accent h-1"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Posição Y</label>
            <span className="text-[10px] font-mono">{element.shadowOffsetY}px</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={element.shadowOffsetY}
            onChange={(e) => onUpdate({ shadowOffsetY: parseInt(e.target.value) })}
            className="w-full accent-accent h-1"
          />
        </div>
      </div>
    </div>
  );
}
