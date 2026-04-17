import { motion, AnimatePresence } from 'motion/react';
import { X, AlignLeft, AlignCenter, AlignRight, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { TextElement, TabId } from '../types';
import { cn } from '../lib/utils';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import ColorControls from './ColorControls';
import StrokeControls from './StrokeControls';
import ShadowControls from './ShadowControls';
import BackgroundControls from './BackgroundControls';
import Slider from './ui/Slider';

interface EditPanelProps {
  selectedElement: TextElement | null;
  onUpdate: (attrs: Partial<TextElement>) => void;
  onClose: () => void;
}

const DEFAULT_FONTS = [
  { name: 'Helvetica Neue', value: "'Helvetica Neue', Arial, sans-serif" },
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: "'Courier New', Courier, monospace" },
  { name: 'Playfair Display', value: "'Playfair Display', serif" },
  { name: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
];

export default function EditPanel({ selectedElement, onUpdate, onClose }: EditPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('fonte');
  const [customFonts, setCustomFonts] = useState<{name: string, value: string}[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'fonts'), orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fontsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const fontName = data.name;
        const fontUrl = data.url;
        
        // Dynamically load font face
        const fontFace = new FontFace(fontName, `url(${fontUrl})`);
        fontFace.load().then((loadedFace) => {
          document.fonts.add(loadedFace);
        }).catch(err => console.error(`Error loading font ${fontName}:`, err));

        return {
          name: fontName,
          value: `"${fontName}", sans-serif`
        };
      });
      setCustomFonts(fontsData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'fonts');
    });

    return () => unsubscribe();
  }, []);

  const allFonts = useMemo(() => [...DEFAULT_FONTS, ...customFonts], [customFonts]);

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
        <div className="flex items-center border-b border-white/5 px-4 md:px-8">
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

        <div className="px-8 py-4 md:px-10 md:py-6 h-[220px] md:h-[320px] overflow-y-auto custom-scrollbar">
          {activeTab === 'fonte' ? (
            <FontTab element={selectedElement} onUpdate={onUpdate} fonts={allFonts} />
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

function FontTab({ element, onUpdate, fonts }: { element: TextElement; onUpdate: (attrs: Partial<TextElement>) => void; fonts: {name: string, value: string}[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentFont = fonts.find(f => f.value === element.fontFamily) || fonts[0];

  return (
    <div className="space-y-6">
      {/* Font Family Selector */}
      <div className="space-y-5 relative mb-10" ref={dropdownRef}>
        <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] mb-4 block">Fontes</label>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-[#1a1a1a] border border-border rounded-xl px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between hover:border-accent transition-colors text-sm cursor-pointer mt-3"
        >
          <span style={{ fontFamily: currentFont.value }}>{currentFont.name}</span>
          <ChevronDown size={16} className={cn("text-text-muted transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-border rounded-xl shadow-2xl z-[60] overflow-hidden"
            >
              <div className="max-h-[200px] overflow-y-auto custom-scrollbar py-2">
                {fonts.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      onUpdate({ fontFamily: f.value });
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-colors hover:bg-white/5 flex items-center justify-between",
                      element.fontFamily === f.value ? "text-accent" : "text-white"
                    )}
                  >
                    <span style={{ fontFamily: f.value }} className="text-base md:text-lg">
                      {f.name}
                    </span>
                    {element.fontFamily === f.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-5 md:gap-6 mb-10">
        {/* Font Size */}
        <div className="space-y-5">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] flex justify-between mb-4">
            Tamanho <span>{Math.round(element.fontSize)}px</span>
          </label>
          <div className="mt-3">
            <Slider
              min={10}
              max={200}
              value={element.fontSize}
              onChange={(val) => onUpdate({ fontSize: val })}
            />
          </div>
        </div>

        {/* Alignment */}
        <div className="space-y-5">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] mb-4 block">Alinhamento</label>
          <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-border mt-3">
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

      <div className="grid grid-cols-2 gap-5 md:gap-6">
        {/* Letter Spacing */}
        <div className="space-y-5">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] flex justify-between mb-4">
            Espaçamento <span>{element.letterSpacing}</span>
          </label>
          <div className="mt-3">
            <Slider
              min={-10}
              max={50}
              value={element.letterSpacing}
              onChange={(val) => onUpdate({ letterSpacing: val })}
            />
          </div>
        </div>

        {/* Line Height */}
        <div className="space-y-5">
          <label className="text-[10px] text-text-muted uppercase font-medium tracking-[0.5px] flex justify-between mb-4">
            Altura da Linha <span>{element.lineHeight.toFixed(1)}</span>
          </label>
          <div className="mt-3">
            <Slider
              min={0.5}
              max={3}
              step={0.1}
              value={element.lineHeight}
              onChange={(val) => onUpdate({ lineHeight: val })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
