import { useState, useEffect, useCallback } from 'react';
import { TextElement } from '../types';
import { HSV, hexToHsv, hsvToHex, isValidHex } from '../lib/colorUtils';
import { SaturationBrightnessPicker, HueSlider, ColorPalette } from './ColorControls';

interface StrokeControlsProps {
  element: TextElement;
  onUpdate: (attrs: Partial<TextElement>) => void;
}

const DEFAULT_COLORS = [
  '#FFFFFF', '#000000', '#808080', '#E7D1B0', 
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080'
];

export default function StrokeControls({ element, onUpdate }: StrokeControlsProps) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(element.stroke || '#000000'));
  const [hexInput, setHexInput] = useState(element.stroke || '#000000');
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentColors');
    return saved ? JSON.parse(saved) : DEFAULT_COLORS.slice(0, 10);
  });

  useEffect(() => {
    const currentHsv = hexToHsv(element.stroke || '#000000');
    setHsv(currentHsv);
    setHexInput(element.stroke || '#000000');
  }, [element.stroke]);

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
    onUpdate({ stroke: hex });
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
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Cor do Contorno (HEX)</label>
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-white/10 shadow-inner"
              style={{ backgroundColor: element.stroke }}
            />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setHexInput(val);
                if (isValidHex(val)) {
                  onUpdate({ stroke: val });
                  addToRecent(val);
                }
              }}
              className="w-20 md:w-24 bg-[#1a1a1a] border border-border rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:border-accent transition-colors uppercase"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Espessura</label>
            <span className="text-[10px] font-mono">
              {element.strokeWidth}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={element.strokeWidth}
            onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) })}
            className="w-full accent-accent h-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Cores Recentes</label>
        <ColorPalette 
          colors={recentColors} 
          selectedColor={element.stroke} 
          onSelect={(color) => {
            onUpdate({ stroke: color });
            addToRecent(color);
          }}
        />
      </div>
    </div>
  );
}
