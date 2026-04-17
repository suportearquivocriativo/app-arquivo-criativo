import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Upload, Link as LinkIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface Font {
  id: string;
  name: string;
  url: string;
  uploadedAt: any;
}

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [fonts, setFonts] = useState<Font[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [fontName, setFontName] = useState('');
  const [fontUrl, setFontUrl] = useState('');
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('file');

  useEffect(() => {
    const q = query(collection(db, 'fonts'), orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fontsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Font[];
      setFonts(fontsData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'fonts');
    });

    return () => unsubscribe();
  }, []);

  const handleAddFont = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fontName) return;
    setLoading(true);

    try {
      let finalUrl = fontUrl;

      if (uploadType === 'file' && fontFile) {
        const storageRef = ref(storage, `fonts/${Date.now()}_${fontFile.name}`);
        const uploadResult = await uploadBytes(storageRef, fontFile);
        finalUrl = await getDownloadURL(uploadResult.ref);
      }

      if (!finalUrl) throw new Error('URL ou arquivo é necessário');

      await addDoc(collection(db, 'fonts'), {
        name: fontName,
        url: finalUrl,
        uploadedAt: serverTimestamp()
      });

      // Reset
      setFontName('');
      setFontUrl('');
      setFontFile(null);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar fonte.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFont = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta fonte?')) return;
    try {
      await deleteDoc(doc(db, 'fonts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `fonts/${id}`);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Painel Admin</h1>
            <p className="text-text-muted">Gerencie as fontes disponíveis no editor</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-accent text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            Nova Fonte
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fonts.map(font => (
            <motion.div 
              layout
              key={font.id}
              className="bg-[#111] border border-border p-6 rounded-2xl flex justify-between items-center group"
            >
              <div>
                <h3 className="font-bold text-lg mb-1">{font.name}</h3>
                <p className="text-[10px] uppercase text-text-muted tracking-widest truncate max-w-[200px]">
                  {font.url}
                </p>
              </div>
              <button 
                onClick={() => handleDeleteFont(font.id)}
                className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Modal Simples */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#111] border border-border p-8 rounded-3xl w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">Adicionar Fonte</h2>
              
              <form onSubmit={handleAddFont} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Nome da Fonte</label>
                  <input 
                    type="text" 
                    value={fontName}
                    onChange={e => setFontName(e.target.value)}
                    required
                    className="w-full bg-black border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
                    placeholder="Ex: Roboto Bold"
                  />
                </div>

                <div className="flex bg-black p-1 rounded-xl border border-border mb-4">
                  <button 
                    type="button"
                    onClick={() => setUploadType('file')}
                    className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${uploadType === 'file' ? 'bg-[#222] text-white' : 'text-text-muted'}`}
                  >
                    <Upload size={14} /> Upload
                  </button>
                  <button 
                    type="button"
                    onClick={() => setUploadType('url')}
                    className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${uploadType === 'url' ? 'bg-[#222] text-white' : 'text-text-muted'}`}
                  >
                    <LinkIcon size={14} /> Link URL
                  </button>
                </div>

                {uploadType === 'file' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Arquivo (.ttf, .otf, .woff)</label>
                    <input 
                      type="file" 
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={e => setFontFile(e.target.files?.[0] || null)}
                      required
                      className="w-full bg-black border border-border rounded-xl px-4 py-3 outline-none focus:border-accent text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">URL da Fonte</label>
                    <input 
                      type="url" 
                      value={fontUrl}
                      onChange={e => setFontUrl(e.target.value)}
                      required
                      className="w-full bg-black border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
                      placeholder="https://exemplo.com/fonte.ttf"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 border border-border py-4 rounded-xl font-bold hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-accent text-black font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
