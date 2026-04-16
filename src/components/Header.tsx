import { Download, Copy, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  stageRef: React.MutableRefObject<any>;
}

export default function Header({ stageRef }: HeaderProps) {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDownload = async () => {
    if (!stageRef.current) return;
    
    try {
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 2,
        mimeType: 'image/png',
      });

      const link = document.createElement('a');
      link.download = 'design.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    } catch (err) {
      console.error('Erro ao baixar:', err);
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    }
  };

  const handleCopy = async () => {
    if (!stageRef.current) return;
    
    try {
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 2,
        mimeType: 'image/png',
      });
      
      const response = await fetch(dataURL);
      const blob = await response.blob();

      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);

      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-border flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-2">
        <span className="font-bold text-[1.2rem] tracking-[-0.5px] text-accent">STUDIO</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload}
            className={`group flex items-center gap-2 p-2 rounded-full transition-all relative ${
              downloadStatus === 'success' ? "bg-white/10 text-accent" : "text-white/80 hover:bg-white/10 hover:text-accent"
            }`}
            title="Baixar PNG"
          >
            <Download size={22} />
            {downloadStatus === 'success' && (
              <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-[#1a1a1a] text-accent border border-white/10 px-2 py-1 rounded-md shadow-xl whitespace-nowrap z-50">
                Baixado
              </span>
            )}
            {downloadStatus === 'error' && (
              <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-500 border border-red-500/20 px-2 py-1 rounded-md shadow-xl whitespace-nowrap z-50">
                Erro ao baixar
              </span>
            )}
          </button>

          <button 
            onClick={handleCopy}
            className={`group flex items-center gap-2 p-2 rounded-full transition-all relative ${
              copyStatus === 'success' ? "bg-white/10 text-accent" : "text-white/80 hover:bg-white/10 hover:text-accent"
            }`}
            title="Copiar para área de transferência"
          >
            <Copy size={22} />
            {copyStatus === 'success' && (
              <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-[#1a1a1a] text-accent border border-white/10 px-2 py-1 rounded-md shadow-xl whitespace-nowrap z-50">
                Copiado
              </span>
            )}
            {copyStatus === 'error' && (
              <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-500 border border-red-500/20 px-2 py-1 rounded-md shadow-xl whitespace-nowrap z-50">
                Erro ao copiar
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
