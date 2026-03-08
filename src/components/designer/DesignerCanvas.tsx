import { useRef, useEffect, useCallback, useMemo } from "react";
import { Stage, Layer, Rect, Text, Image as KImage, Circle, Line, Transformer, Star } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { AnimatePresence, motion } from "framer-motion";
import type { DesignElement } from "./types";
import type { PhoneOutline } from "./phoneOutlines";
import type { PhoneMockup } from "@/hooks/usePhoneMockups";
import { MOCKUP_MAP, type MockupConfig } from "./mockupMap";

interface Props {
  phone: PhoneOutline;
  phoneId: string;
  elements: DesignElement[];
  bgColor: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onTransform: (id: string, attrs: Partial<DesignElement>) => void;
  designImageUrl?: string;
  stageRef: React.RefObject<Konva.Stage | null>;
  scale: number;
  mockup?: PhoneMockup | null;
}

/* ─── Sub-components ─── */

function ImageElement({ el, isSelected, onSelect, onChange, trRef }: {
  el: DesignElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<DesignElement>) => void;
  trRef: React.RefObject<Konva.Transformer | null>;
}) {
  const [img] = useImage(el.src || "", "anonymous");
  const shapeRef = useRef<Konva.Image>(null);

  useEffect(() => {
    if (isSelected && shapeRef.current && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, trRef]);

  if (!img) return null;
  return (
    <KImage
      ref={shapeRef}
      image={img}
      id={el.id}
      x={el.x} y={el.y}
      width={el.width} height={el.height}
      rotation={el.rotation}
      opacity={el.opacity ?? 1}
      scaleX={el.flipX ? -1 : 1}
      scaleY={el.flipY ? -1 : 1}
      offsetX={el.flipX ? el.width : 0}
      offsetY={el.flipY ? el.height : 0}
      draggable={!el.locked}
      visible={el.visible}
      onClick={onSelect} onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={() => {
        const node = shapeRef.current;
        if (!node) return;
        onChange({
          x: node.x(), y: node.y(),
          width: Math.max(10, node.width() * Math.abs(node.scaleX())),
          height: Math.max(10, node.height() * Math.abs(node.scaleY())),
          rotation: node.rotation(),
        });
        node.scaleX(el.flipX ? -1 : 1);
        node.scaleY(el.flipY ? -1 : 1);
      }}
    />
  );
}

function BgImage({ url, width, height }: { url: string; width: number; height: number }) {
  const [img, status] = useImage(url, "anonymous");
  useEffect(() => {
    if (status === "failed") console.warn("Failed to load base design image:", url);
  }, [url, status]);
  if (!img) return null;
  return <KImage image={img} width={width} height={height} listening={false} />;
}

/* ─── Shape renderers ─── */

function renderShape(el: DesignElement, onSelect: () => void, handleChange: (attrs: Partial<DesignElement>) => void, layerRef: React.RefObject<Konva.Layer>) {
  const common = {
    key: el.id, id: el.id,
    rotation: el.rotation, draggable: !el.locked,
    opacity: el.opacity ?? 1, visible: el.visible,
    onClick: onSelect, onTap: onSelect,
  };

  if (el.shapeType === "circle") {
    return (
      <Circle {...common}
        x={el.x + el.width / 2} y={el.y + el.height / 2}
        radius={Math.min(el.width, el.height) / 2}
        fill={el.fill || "#000000"} stroke={el.stroke} strokeWidth={el.strokeWidth || 0}
        onDragEnd={(e) => handleChange({ x: e.target.x() - el.width / 2, y: e.target.y() - el.height / 2 })}
        onTransformEnd={() => {
          const node = layerRef.current?.findOne(`#${el.id}`) as Konva.Circle;
          if (!node) return;
          handleChange({
            x: node.x() - (node.radius() * Math.abs(node.scaleX())),
            y: node.y() - (node.radius() * Math.abs(node.scaleY())),
            width: node.radius() * 2 * Math.abs(node.scaleX()),
            height: node.radius() * 2 * Math.abs(node.scaleY()),
            rotation: node.rotation(),
          });
          node.scaleX(1); node.scaleY(1);
        }}
      />
    );
  }
  if (el.shapeType === "star") {
    return (
      <Star {...common}
        x={el.x + el.width / 2} y={el.y + el.height / 2}
        numPoints={5} innerRadius={el.width * 0.2} outerRadius={el.width / 2}
        fill={el.fill || "#f5c542"} stroke={el.stroke} strokeWidth={el.strokeWidth || 0}
        onDragEnd={(e) => handleChange({ x: e.target.x() - el.width / 2, y: e.target.y() - el.height / 2 })}
      />
    );
  }
  if (el.shapeType === "heart") {
    const w = el.width, h = el.height;
    return (
      <Line {...common}
        points={[w / 2, h * 0.3, w * 0.15, 0, 0, h * 0.35, w / 2, h, w, h * 0.35, w * 0.85, 0, w / 2, h * 0.3]}
        closed fill={el.fill || "#e87f6e"} stroke={el.stroke} strokeWidth={el.strokeWidth || 0}
        x={el.x} y={el.y}
        onDragEnd={(e) => handleChange({ x: e.target.x(), y: e.target.y() })}
      />
    );
  }
  if (el.shapeType === "triangle") {
    return (
      <Line {...common}
        points={[el.width / 2, 0, el.width, el.height, 0, el.height]}
        closed fill={el.fill || "#000000"} stroke={el.stroke} strokeWidth={el.strokeWidth || 0}
        x={el.x} y={el.y}
        onDragEnd={(e) => handleChange({ x: e.target.x(), y: e.target.y() })}
      />
    );
  }
  if (el.shapeType === "line") {
    return (
      <Line {...common}
        points={[0, 0, el.width, 0]}
        stroke={el.stroke || el.fill || "#000000"} strokeWidth={el.strokeWidth || 3}
        x={el.x} y={el.y}
        onDragEnd={(e) => handleChange({ x: e.target.x(), y: e.target.y() })}
      />
    );
  }
  // rect default
  return (
    <Rect {...common}
      x={el.x} y={el.y} width={el.width} height={el.height}
      fill={el.fill || "#000000"} stroke={el.stroke} strokeWidth={el.strokeWidth || 0}
      cornerRadius={6}
      onDragEnd={(e) => handleChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={() => {
        const node = layerRef.current?.findOne(`#${el.id}`) as Konva.Rect;
        if (!node) return;
        handleChange({
          x: node.x(), y: node.y(),
          width: Math.max(5, node.width() * node.scaleX()),
          height: Math.max(5, node.height() * node.scaleY()),
          rotation: node.rotation(),
        });
        node.scaleX(1); node.scaleY(1);
      }}
    />
  );
}

/* ─── Main Component ─── */

export default function DesignerCanvas({
  phone, phoneId, elements, bgColor, selectedId, onSelect, onTransform, designImageUrl, stageRef, scale, mockup,
}: Props) {
  const trRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // Resolve config: DB mockup overrides local map
  const config: MockupConfig | null = useMemo(() => {
    const local = MOCKUP_MAP[phoneId] || null;
    if (!local) {
      console.error(`[MockupMap] No mockup config for model: ${phoneId}`);
      return null;
    }
    // If DB has a custom back image, override the local path
    if (mockup?.back_image_url) {
      return { ...local, imagePath: mockup.back_image_url };
    }
    return local;
  }, [phoneId, mockup]);

  // Container dimensions
  const cW = config?.containerWidth ?? phone.width;
  const cH = config?.containerHeight ?? phone.height;

  // Canvas (case area) dimensions — positioned inside the phone frame
  const ca = config?.caseArea ?? { top: 0.02, left: 0.05, width: 0.90, height: 0.96 };
  const canvasX = Math.round(cW * ca.left);
  const canvasY = Math.round(cH * ca.top);
  const canvasW = Math.round(cW * ca.width);
  const canvasH = Math.round(cH * ca.height);
  const caseRadius = config?.caseRadius ?? 44;

  useEffect(() => {
    if (!selectedId || !trRef.current || !layerRef.current) {
      trRef.current?.nodes([]);
      trRef.current?.getLayer()?.batchDraw();
      return;
    }
    const node = layerRef.current.findOne(`#${selectedId}`);
    if (node) {
      trRef.current.nodes([node as Konva.Node]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, elements]);

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage() || e.target.name() === "bg-rect") onSelect(null);
  }, [onSelect]);

  const handleChange = useCallback((id: string, attrs: Partial<DesignElement>) => {
    onTransform(id, attrs);
  }, [onTransform]);

  // Resolve the frame image: DB overlay or local mockup PNG
  const frameImageSrc = mockup?.overlay_image_url || config?.imagePath || null;

  return (
    <div
      className="flex items-center justify-center rounded-2xl p-4 overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10"
      style={{ minHeight: 440 }}
    >
      {/* Responsive scale wrapper */}
      <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
        {/* Phone container — fixed pixel dimensions matching model group */}
        <div
          style={{
            position: "relative",
            width: cW,
            height: cH,
            margin: "0 auto",
          }}
        >
          {/* ═══ LAYER 1 (Bottom): Design Canvas ═══ */}
          <div
            style={{
              position: "absolute",
              top: canvasY,
              left: canvasX,
              width: canvasW,
              height: canvasH,
              zIndex: 1,
              overflow: "hidden",
              borderRadius: caseRadius,
            }}
          >
            <Stage
              ref={stageRef as React.RefObject<Konva.Stage>}
              width={canvasW}
              height={canvasH}
              onClick={handleStageClick}
              onTap={handleStageClick}
            >
              <Layer ref={layerRef}>
                {/* Background rect */}
                <Rect
                  name="bg-rect"
                  x={0} y={0}
                  width={canvasW} height={canvasH}
                  fill={bgColor}
                  opacity={bgColor === "#ffffff" ? 0.9 : 1}
                  listening={true}
                />

                {/* Base design image */}
                {designImageUrl && <BgImage url={designImageUrl} width={canvasW} height={canvasH} />}

                {/* User elements */}
                {sorted.map((el) => {
                  if (!el.visible) return null;

                  if (el.type === "text") {
                    return (
                      <Text
                        key={el.id} id={el.id}
                        x={el.x} y={el.y}
                        text={el.text || ""} fontSize={el.fontSize || 20}
                        fontFamily={el.fontFamily || "Nunito"}
                        fontStyle={el.fontStyle || "normal"}
                        textDecoration={el.textDecoration || ""}
                        fill={el.fill || "#000000"} align={el.align || "left"}
                        letterSpacing={el.letterSpacing || 0} lineHeight={el.lineHeight || 1.2}
                        rotation={el.rotation} draggable={!el.locked}
                        width={el.width || undefined}
                        onClick={() => onSelect(el.id)} onTap={() => onSelect(el.id)}
                        onDragEnd={(e) => handleChange(el.id, { x: e.target.x(), y: e.target.y() })}
                        onTransformEnd={() => {
                          const node = layerRef.current?.findOne(`#${el.id}`) as Konva.Text;
                          if (!node) return;
                          handleChange(el.id, {
                            x: node.x(), y: node.y(),
                            width: Math.max(20, node.width() * node.scaleX()),
                            rotation: node.rotation(),
                            fontSize: Math.max(8, (el.fontSize || 20) * node.scaleY()),
                          });
                          node.scaleX(1); node.scaleY(1);
                        }}
                      />
                    );
                  }

                  if (el.type === "image" || el.type === "sticker") {
                    return (
                      <ImageElement
                        key={el.id} el={el}
                        isSelected={selectedId === el.id}
                        onSelect={() => onSelect(el.id)}
                        onChange={(attrs) => handleChange(el.id, attrs)}
                        trRef={trRef}
                      />
                    );
                  }

                  if (el.type === "shape") {
                    return renderShape(el, () => onSelect(el.id), (attrs) => handleChange(el.id, attrs), layerRef);
                  }
                  return null;
                })}

                <Transformer
                  ref={trRef}
                  rotateEnabled enabledAnchors={["top-left", "top-center", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-center", "bottom-right"]}
                  boundBoxFunc={(oldBox, newBox) => (newBox.width < 10 || newBox.height < 10 ? oldBox : newBox)}
                  anchorSize={10} anchorCornerRadius={5}
                  borderStroke="hsl(199, 65%, 48%)" anchorStroke="hsl(199, 65%, 48%)"
                  anchorFill="#ffffff" rotateAnchorOffset={22}
                />
              </Layer>
            </Stage>
          </div>

          {/* Clean case-shaped border */}
          <div
            style={{
              position: "absolute",
              top: canvasY - 2,
              left: canvasX - 2,
              width: canvasW + 4,
              height: canvasH + 4,
              borderRadius: caseRadius + 2,
              border: "2px solid hsl(var(--border))",
              boxShadow: "0 4px 24px -4px hsl(var(--foreground) / 0.08)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          />
        </div>
      </div>
    </div>
  );
}
