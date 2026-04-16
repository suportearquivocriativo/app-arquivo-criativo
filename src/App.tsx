import { useState, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Canvas from './components/Canvas';
import EditPanel from './components/EditPanel';
import { TextElement } from './types';

export default function App() {
  const [elements, setElements] = useState<TextElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('text');
  const stageRef = useRef<any>(null);

  const handleAddText = () => {
    const newId = `text-${Date.now()}`;
    const newElement: TextElement = {
      id: newId,
      text: 'Digite aqui',
      x: 50, // More central starting point
      y: 80, // Top of canvas to avoid being covered by panel
      fontSize: 32,
      fontFamily: 'Helvetica Neue',
      fill: '#FFFFFF',
      letterSpacing: 0,
      lineHeight: 1.2,
      rotation: 0,
      align: 'center',
      opacity: 1,
      stroke: '#000000',
      strokeWidth: 0,
      shadowColor: '#000000',
      shadowBlur: 10,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      shadowOpacity: 0.5,
      backgroundColor: '#E7D1B0',
      backgroundOpacity: 0,
      paddingX: 20,
      paddingY: 10,
      borderRadius: 8,
    };

    setElements([...elements, newElement]);
    setSelectedId(newId);
    setActiveTab('text');
  };

  const updateElement = (id: string, attrs: Partial<TextElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...attrs } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedElement = elements.find(el => el.id === selectedId) || null;

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <Header stageRef={stageRef} />
      
      <main className="flex-1 flex flex-col pt-16 pb-20 relative">
        <Canvas 
          elements={elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={updateElement}
          onDelete={deleteElement}
          stageRef={stageRef}
        />
        
        <EditPanel 
          selectedElement={selectedElement}
          onUpdate={(attrs) => selectedId && updateElement(selectedId, attrs)}
          onClose={() => setSelectedId(null)}
        />
      </main>

      <Footer 
        onAddText={handleAddText} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
