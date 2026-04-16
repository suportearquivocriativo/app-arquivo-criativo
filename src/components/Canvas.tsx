import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Text, Transformer, Group, Rect, Path } from 'react-konva';
import { TextElement } from '../types';

interface CanvasProps {
  elements: TextElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, attrs: Partial<TextElement>) => void;
  onDelete: (id: string) => void;
  stageRef: React.MutableRefObject<any>;
}

export default function Canvas({ elements, selectedId, onSelect, onChange, onDelete, stageRef }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const padding = 40;
      const availableWidth = container.clientWidth - padding;
      const availableHeight = container.clientHeight - padding;
      
      const targetRatio = 9 / 16;
      let width, height;

      if (availableWidth / availableHeight > targetRatio) {
        height = availableHeight;
        width = height * targetRatio;
      } else {
        width = availableWidth;
        height = width / targetRatio;
      }
      setDimensions({ width, height });
    };

    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleStageClick = (e: any) => {
    // Click on empty area - deselect
    if (e.target === e.target.getStage()) {
      onSelect(null);
    }
  };

  const editingElement = elements.find(el => el.id === editingId);

  return (
    <div ref={containerRef} className="flex-1 w-full flex items-center justify-center p-5 overflow-hidden bg-[#080808]">
      <div 
        className="relative shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-border rounded-[4px] overflow-hidden bg-black"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <div className="absolute inset-0 checkered-bg pointer-events-none z-0" />
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleStageClick}
          onTap={handleStageClick}
          ref={stageRef}
          className="z-10"
        >
          <Layer>
            {elements.map((el) => (
              <TextItem
                key={el.id}
                element={el}
                isSelected={el.id === selectedId}
                isEditing={el.id === editingId}
                onSelect={() => onSelect(el.id)}
                onEdit={() => {
                  setEditingId(el.id);
                  onSelect(el.id);
                }}
                onChange={(newAttrs) => onChange(el.id, newAttrs)}
                onDelete={() => onDelete(el.id)}
              />
            ))}
          </Layer>
        </Stage>

        {editingElement && (
          <HtmlOverlay
            element={editingElement}
            canvasWidth={dimensions.width}
            onClose={(newText) => {
              setEditingId(null);
              onChange(editingElement.id, { text: newText });
            }}
          />
        )}
      </div>
    </div>
  );
}

interface TextItemProps {
  element: TextElement;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onChange: (attrs: Partial<TextElement>) => void;
  onDelete: () => void;
}

function TextItem({ element, isSelected, isEditing, onSelect, onEdit, onChange, onDelete }: TextItemProps) {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const textRef = useRef<any>(null);
  const [bgSize, setBgSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (textRef.current) {
      setBgSize({
        width: textRef.current.width(),
        height: textRef.current.height()
      });
    }
  }, [element.text, element.fontSize, element.fontFamily, element.letterSpacing, element.lineHeight, isEditing]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !isEditing) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, isEditing, element]); // Added element to dependency array to sync with panel changes

  const handleTransform = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();

    // Reset scale and update size/rotation
    node.scaleX(1);
    node.scaleY(1);

    onChange({
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      fontSize: Math.max(5, element.fontSize * scaleX),
    });
  };

  const renderBackground = () => {
    if (isEditing || element.backgroundOpacity <= 0 || bgSize.width === 0) return null;

    const width = bgSize.width + element.paddingX * 2;
    const height = bgSize.height + element.paddingY * 2;

    return (
      <Rect
        x={-element.paddingX}
        y={-element.paddingY}
        width={width}
        height={height}
        fill={element.backgroundColor}
        opacity={element.backgroundOpacity}
        cornerRadius={element.borderRadius}
        listening={true}
      />
    );
  };

  const renderStroke = () => {
    if (isEditing || element.strokeWidth <= 0) return null;

    // Calculate proportional stroke width (max 15% of font size)
    const actualStrokeWidth = (element.strokeWidth / 100) * element.fontSize * 0.15;

    return (
      <Text
        {...element}
        x={0}
        y={0}
        rotation={0}
        fill={element.stroke}
        strokeWidth={actualStrokeWidth + 1.5}
        draggable={false}
        listening={false}
        lineJoin="round"
        strokeJoin="round"
        strokeCap="round"
        perfectDrawEnabled={false}
        shadowColor={element.shadowColor}
        shadowBlur={element.shadowBlur}
        shadowOffset={{ x: element.shadowOffsetX, y: element.shadowOffsetY }}
        shadowOpacity={element.shadowOpacity}
        shadowEnabled={element.shadowOpacity > 0}
      />
    );
  };

  return (
    <>
      <Group
        draggable={!isEditing}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={onEdit}
        onDblTap={onEdit}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={handleTransform}
        x={element.x}
        y={element.y}
        rotation={element.rotation}
        ref={shapeRef}
      >
        {/* Background Layer */}
        {renderBackground()}

        {/* Stroke Layer (Rendered first, below) */}
        {renderStroke()}
        
        {/* Fill Layer (Rendered second, on top) */}
        <Text
          {...element}
          ref={textRef}
          x={0}
          y={0}
          rotation={0}
          strokeWidth={0}
          visible={!isEditing}
          draggable={false}
          lineJoin="round"
          perfectDrawEnabled={false}
          shadowColor={element.shadowColor}
          shadowBlur={element.shadowBlur}
          shadowOffset={{ x: element.shadowOffsetX, y: element.shadowOffsetY }}
          shadowOpacity={element.shadowOpacity}
          shadowEnabled={element.shadowOpacity > 0 && element.strokeWidth <= 0}
        />
      </Group>
      
      {isSelected && !isEditing && (
        <Group>
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            rotateEnabled={true}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            anchorSize={10}
            anchorCornerRadius={5}
            anchorFill="#E7D1B0"
            anchorStroke="#000"
            borderStroke="#E7D1B0"
          />
          <DeleteButton 
            trRef={trRef} 
            onDelete={onDelete} 
          />
        </Group>
      )}
    </>
  );
}

function HtmlOverlay({ element, onClose, canvasWidth }: { element: TextElement; onClose: (text: string) => void; canvasWidth: number }) {
  const [text, setText] = useState(element.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, []);

  const handleBlur = () => {
    onClose(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose(element.text);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: element.y,
        left: element.x,
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: 'top left',
        zIndex: 100,
        pointerEvents: 'auto',
        maxWidth: canvasWidth - element.x - 20,
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          background: 'transparent',
          border: '1px dashed #E7D1B0',
          color: element.fill,
          opacity: element.opacity,
          fontSize: `${element.fontSize}px`,
          fontFamily: element.fontFamily,
          lineHeight: element.lineHeight,
          letterSpacing: `${element.letterSpacing}px`,
          textAlign: element.align as any,
          width: '100%',
          minWidth: '100px',
          outline: 'none',
          resize: 'none',
          padding: '0',
          margin: '0',
          display: 'block',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}

function DeleteButton({ trRef, onDelete }: { trRef: any, onDelete: () => void }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePos = () => {
      if (!trRef.current) return;
      const box = trRef.current.findOne('.back').getClientRect();
      // Position further out diagonally from top right
      setPos({
        x: box.x + box.width + 12,
        y: box.y - 12,
      });
    };

    const timer = setInterval(updatePos, 16);
    return () => clearInterval(timer);
  }, [trRef]);

  return (
    <Group 
      x={pos.x} 
      y={pos.y} 
      onClick={(e) => {
        e.cancelBubble = true;
        onDelete();
      }} 
      onTap={(e) => {
        e.cancelBubble = true;
        onDelete();
      }}
      onMouseEnter={(e: any) => {
        const container = e.target.getStage().container();
        container.style.cursor = 'pointer';
      }}
      onMouseLeave={(e: any) => {
        const container = e.target.getStage().container();
        container.style.cursor = 'default';
      }}
    >
      {/* Hit area circle */}
      <Rect
        width={24}
        height={24}
        x={-12}
        y={-12}
        fill="transparent"
        cornerRadius={12}
      />
      {/* Trash Icon Path - Outline version in accent color */}
      <Path
        data="M16,9V19H8V9H16M14.5,3H9.5L8.5,4H5V6H19V4H15.5L14.5,3M18,7H6V19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7Z"
        fill="#E7D1B0"
        scaleX={0.7}
        scaleY={0.7}
        x={-8}
        y={-8}
      />
    </Group>
  );
}
