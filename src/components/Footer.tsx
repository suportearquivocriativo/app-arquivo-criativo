import { Type, Image as ImageIcon, Layers, Folder } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface FooterProps {
  onAddText: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Footer({ onAddText, activeTab, setActiveTab }: FooterProps) {
  const tabs = [
    { id: 'text', label: 'Texto', icon: Type, action: onAddText },
    { id: 'icons', label: 'Ícones', icon: ImageIcon },
    { id: 'layers', label: 'Camadas', icon: Layers },
    { id: 'projects', label: 'Projetos', icon: Folder },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-black border-t border-border flex items-center justify-around px-2 z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            if (tab.action) tab.action();
          }}
          className={cn(
            "flex flex-col items-center gap-1.5 px-4 py-2 transition-all duration-300",
            activeTab === tab.id ? "text-accent" : "text-text-muted hover:text-white/70"
          )}
        >
          <tab.icon size={24} />
          <span className="text-[10px] font-medium uppercase tracking-[0.5px]">{tab.label}</span>
        </button>
      ))}
    </footer>
  );
}
