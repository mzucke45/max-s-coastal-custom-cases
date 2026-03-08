export interface DesignElement {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  // text props
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string; // "normal" | "bold" | "italic" | "bold italic"
  textDecoration?: string; // "underline" | ""
  fill?: string;
  align?: string; // "left" | "center" | "right"
  letterSpacing?: number;
  lineHeight?: number;
  // image props
  src?: string;
  opacity?: number;
  filters?: string[]; // names of applied filters
  flipX?: boolean;
  flipY?: boolean;
  // shape props
  shapeType?: "rect" | "circle" | "triangle" | "line";
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

export type ToolTab = "elements" | "text" | "image" | "layers" | "canvas";
