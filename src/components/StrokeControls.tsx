import { useState, useEffect, useCallback } from 'react';
import { TextElement } from '../types';
import { HSV, hexToHsv, hsvToHex, isValidHex } from '../lib/colorUtils';
import { SaturationBrightnessPicker, HueSlider, ColorPalette } from './ColorControls';
import Slider from './ui/Slider';

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
    return saved ? JSON.parse(saved) : DEFAULT_COLORS.slice(0, 5);
  });

  useEffect(() => {
    const currentHsv = hexToHsv(element.stroke || '#000000');
    setHsv(currentHsv);
    setHexInput(element.stroke || '#000000');
  }, [element.stroke]);

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

      <div className="flex items-center justify-between gap-4 max-w-full overflow-hidden">
        <div className="space-y-1.5">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Cor (HEX)</label>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-inner shrink-0"
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
              className="w-18 md:w-22 bg-[#1a1a1a] border border-border rounded-lg px-2 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:border-accent transition-colors uppercase"
            />
          </div>
        </div>

        <div className="space-y-1.5">
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

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Espessura</label>
          <span className="text-[10px] font-mono">
            {element.strokeWidth}px
          </span>
        </div>
        <Slider
          min={0}
          max={100}
          value={element.strokeWidth}
          onChange={(val) => onUpdate({ strokeWidth: val })}
        />
      </div>
    </div>
  );
}
