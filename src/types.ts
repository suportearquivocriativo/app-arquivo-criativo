export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  letterSpacing: number;
  lineHeight: number;
  rotation: number;
  align: 'left' | 'center' | 'right';
  opacity: number;
  stroke: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowOpacity: number;
  backgroundColor: string;
  backgroundOpacity: number;
  paddingX: number;
  paddingY: number;
  borderRadius: number;
}

export type TabId = 'fonte' | 'cor' | 'contorno' | 'sombra' | 'fundo';
