import { motion, AnimatePresence } from 'motion/react';
import { X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { TextElement, TabId } from '../types';
import { cn } from '../lib/utils';
import ColorControls from './ColorControls';
import StrokeControls from './StrokeControls';
import ShadowControls from './ShadowControls';
import BackgroundControls from './BackgroundControls';

interface EditPanelProps {
  selectedElement: TextElement | null;
  onUpdate: (attrs: Partial<TextElement>) => void;
  onClose: () => void;
}

const FONTS = [
  { name: 'Helvetica Neue', value: "'Helvetica Neue', Arial, sans-serif" },
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: "'Courier New', Courier, monospace" },
  { name: 'Playfair Display', value: "'Playfair Display', serif" },
  { name: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
];

export default function EditPanel({ selectedElement, onUpdate, onClose }: EditPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('fonte');

  if (!selectedElement) return null;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'fonte', label: 'Fonte' },
    { id: 'cor', label: 'Cor' },
    { id: 'contorno', label: 'Contorno' },
    { id: 'sombra', label: 'Sombra' },
    { id: 'fundo', label: 'Fundo' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-14 md:bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-panel-bg/95 backdrop-blur-xl border border-border border-b-0 z-40 rounded-t-[20px] md:rounded-t-[24px] shadow-[0_-10px_30px_rgba(0,0,0,0.4)]"
      >
        <div className="w-10 h-1 bg-[#333] rounded-[2px] mx-auto mt-2 md:mt-3 mb-1 md:mb-2" />
        
        {/* Tabs Header */}
        <div className="flex items-center border-b border-white/5 px-2 md:px-4">
          <div className="flex-1 flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-[11px] uppercase tracking-widest font-bold whitespace-nowrap transition-colors relative",
                  activeTab === tab.id ? "text-accent" : "text-text-muted hover:text-white/60"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="p-2 md:p-3 text-text-muted hover:text-white shrink-0 border-l border-white/5 ml-1">
            <X size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
        </div>

        <div className="p-4 md:p-6 h-[220px] md:h-[320px] overflow-y-auto custom-scrollbar">
          {activeTab === 'fonte' ? (
            <FontTab element={selectedElement} onUpdate={onUpdate} />
          ) : activeTab === 'cor' ? (
            <ColorControls element={selectedElement} onUpdate={onUpdate} />
          ) : activeTab === 'contorno' ? (
            <StrokeControls element={selectedElement} onUpdate={onUpdate} />
          ) : activeTab === 'sombra' ? (
            <ShadowControls element={selectedElement} onUpdate={onUpdate} />
          ) : activeTab === 'fundo' ? (
            <BackgroundControls element={selectedElement} onUpdate={onUpdate} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-50">
              <span className="text-xs uppercase tracking-widest">Em breve</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function FontTab({ element, onUpdate }: { element: TextElement; onUpdate: (attrs: Partial<TextElement>) => void }) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Font Family Selector */}
      <div className="space-y-2">
        <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Fontes</label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full bg-[#1a1a1a] border border-border rounded-xl px-3 md:px-4 py-2.5 md:py-3 focus:outline-none focus:border-accent transition-colors text-sm appearance-none cursor-pointer"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* Font Size */}
        <div className="space-y-2">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] flex justify-between">
            Tamanho <span>{Math.round(element.fontSize)}px</span>
          </label>
          <input
            type="range"
            min="10"
            max="200"
            value={element.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full accent-accent h-1"
          />
        </div>

        {/* Alignment */}
        <div className="space-y-2">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px]">Alinhamento</label>
          <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-border">
            <button 
              onClick={() => onUpdate({ align: 'left' })}
              className={cn("flex-1 p-1.5 md:p-2 rounded transition-colors", element.align === 'left' ? "bg-accent text-black" : "text-white/60 hover:bg-white/5")}
            >
              <AlignLeft size={14} className="md:w-4 md:h-4 mx-auto" />
            </button>
            <button 
              onClick={() => onUpdate({ align: 'center' })}
              className={cn("flex-1 p-1.5 md:p-2 rounded transition-colors", element.align === 'center' ? "bg-accent text-black" : "text-white/60 hover:bg-white/5")}
            >
              <AlignCenter size={14} className="md:w-4 md:h-4 mx-auto" />
            </button>
            <button 
              onClick={() => onUpdate({ align: 'right' })}
              className={cn("flex-1 p-1.5 md:p-2 rounded transition-colors", element.align === 'right' ? "bg-accent text-black" : "text-white/60 hover:bg-white/5")}
            >
              <AlignRight size={14} className="md:w-4 md:h-4 mx-auto" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* Letter Spacing */}
        <div className="space-y-2">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] flex justify-between">
            Espaçamento <span>{element.letterSpacing}</span>
          </label>
          <input
            type="range"
            min="-10"
            max="50"
            value={element.letterSpacing}
            onChange={(e) => onUpdate({ letterSpacing: parseInt(e.target.value) })}
            className="w-full accent-accent h-1"
          />
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] flex justify-between">
            Altura da Linha <span>{element.lineHeight.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={element.lineHeight}
            onChange={(e) => onUpdate({ lineHeight: parseFloat(e.target.value) })}
            className="w-full accent-accent h-1"
          />
        </div>
      </div>
    </div>
  );
}
