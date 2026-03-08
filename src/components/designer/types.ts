export interface DesignElement {
  id: string;
  type: "text" | "image" | "shape" | "sticker";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  // text props
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  textDecoration?: string;
  fill?: string;
  align?: string;
  letterSpacing?: number;
  lineHeight?: number;
  // image/sticker props
  src?: string;
  opacity?: number;
  filters?: string[];
  flipX?: boolean;
  flipY?: boolean;
  // shape props
  shapeType?: "rect" | "circle" | "triangle" | "line" | "star" | "heart";
  stroke?: string;
  strokeWidth?: number;
  // layer
  zIndex: number;
  locked: boolean;
  visible: boolean;
  name: string;
}

export interface HistoryState {
  elements: DesignElement[];
  bgColor: string;
}

export type ToolTab = "text" | "images" | "stickers" | "shapes" | "background" | "layers";
