import { Download, Copy, LogOut, Settings, Layout } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { useNavigate, useLocation, Link } from 'react-router-dom';

interface HeaderProps {
  stageRef?: React.MutableRefObject<any>;
}

export default function Header({ stageRef }: HeaderProps) {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleDownload = async () => {
    if (!stageRef?.current) return;
    
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
    if (!stageRef?.current) return;
    
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

  const isAdminPage = location.pathname === '/admin';

  return (
    <header className="h-10 md:h-12 bg-black border-b border-border flex items-center justify-between px-4 md:px-6 z-50">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-sm md:text-base tracking-[-0.5px] text-accent">STUDIO</Link>
        
        {isAdmin && (
          <Link 
            to={isAdminPage ? "/" : "/admin"} 
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-white transition-colors border-l border-white/10 pl-4"
          >
            {isAdminPage ? <><Layout size={14} /> Editor</> : <><Settings size={14} /> Admin</>}
          </Link>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {!isAdminPage && stageRef && (
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <button 
              onClick={handleDownload}
              className={`group flex items-center gap-2 p-1.5 rounded-full transition-all relative ${
                downloadStatus === 'success' ? "bg-white/10 text-accent" : "text-white/80 hover:bg-white/10 hover:text-accent"
              }`}
              title="Baixar PNG"
            >
              <Download size={18} className="md:w-5 md:h-5" />
              {downloadStatus === 'success' && (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-[#1a1a1a] text-accent border border-white/10 px-2 py-1 rounded-md shadow-xl whitespace-nowrap z-50">
                  Baixado
                </span>
              )}
            </button>

            <button 
              onClick={handleCopy}
              className={`group flex items-center gap-2 p-1.5 rounded-full transition-all relative ${
                copyStatus === 'success' ? "bg-white/10 text-accent" : "text-white/80 hover:bg-white/10 hover:text-accent"
              }`}
              title="Copiar para área de transferência"
            >
              <Copy size={18} className="md:w-5 md:h-5" />
              {copyStatus === 'success' && (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-[#1a1a1a] text-accent border border-white/10 px-2 py-1 rounded-md shadow-xl whitespace-nowrap z-50">
                  Copiado
                </span>
              )}
            </button>
          </div>
        )}

        {user && (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-red-500/80 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden md:inline">Sair</span>
          </button>
        )}
      </div>
    </header>
  );
}
