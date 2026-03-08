import { useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Text, Image as KImage, Circle, Line, Transformer, Group } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import type { DesignElement } from "./types";
import type { PhoneOutline } from "./phoneOutlines";

interface Props {
  phone: PhoneOutline;
  elements: DesignElement[];
  bgColor: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onTransform: (id: string, attrs: Partial<DesignElement>) => void;
  designImageUrl?: string;
  stageRef: React.RefObject<Konva.Stage | null>;
  scale: number;
}

// Sub-component for image elements
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
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation}
      opacity={el.opacity ?? 1}
      scaleX={el.flipX ? -1 : 1}
      scaleY={el.flipY ? -1 : 1}
      offsetX={el.flipX ? el.width : 0}
      offsetY={el.flipY ? el.height : 0}
      draggable={!el.locked}
      visible={el.visible}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={() => {
        const node = shapeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(10, node.width() * Math.abs(scaleX)),
          height: Math.max(10, node.height() * Math.abs(scaleY)),
          rotation: node.rotation(),
        });
        node.scaleX(el.flipX ? -1 : 1);
        node.scaleY(el.flipY ? -1 : 1);
      }}
    />
  );
}

// Background design image
function BgImage({ url, width, height }: { url: string; width: number; height: number }) {
  const [img] = useImage(url, "anonymous");
  if (!img) return null;
  return <KImage image={img} width={width} height={height} listening={false} />;
}

export default function DesignerCanvas({
  phone, elements, bgColor, selectedId, onSelect, onTransform, designImageUrl, stageRef, scale,
}: Props) {
  const trRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);

  // Sort by zIndex
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

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
    if (e.target === e.target.getStage() || e.target.name() === "bg-rect") {
      onSelect(null);
    }
  }, [onSelect]);

  const handleChange = useCallback((id: string, attrs: Partial<DesignElement>) => {
    onTransform(id, attrs);
  }, [onTransform]);

  const canvasW = phone.width;
  const canvasH = phone.height;

  return (
    <div className="flex items-center justify-center bg-muted/30 rounded-lg p-4 overflow-hidden" style={{ minHeight: 520 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
        <div
          style={{
            width: canvasW,
            height: canvasH,
            borderRadius: phone.radius,
            overflow: "hidden",
            border: "3px solid hsl(var(--border))",
            boxShadow: "0 20px 60px -15px rgba(0,0,0,0.3)",
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
              {/* Background */}
              <Rect name="bg-rect" x={0} y={0} width={canvasW} height={canvasH} fill={bgColor} listening={true} />

              {/* Base design image */}
              {designImageUrl && <BgImage url={designImageUrl} width={canvasW} height={canvasH} />}

              {/* Elements */}
              {sorted.map((el) => {
                if (!el.visible) return null;

                if (el.type === "text") {
                  return (
                    <Text
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      text={el.text || ""}
                      fontSize={el.fontSize || 20}
                      fontFamily={el.fontFamily || "DM Sans"}
                      fontStyle={el.fontStyle || "normal"}
                      textDecoration={el.textDecoration || ""}
                      fill={el.fill || "#000000"}
                      align={el.align || "left"}
                      letterSpacing={el.letterSpacing || 0}
                      lineHeight={el.lineHeight || 1.2}
                      rotation={el.rotation}
                      draggable={!el.locked}
                      width={el.width || undefined}
                      onClick={() => onSelect(el.id)}
                      onTap={() => onSelect(el.id)}
                      onDragEnd={(e) => handleChange(el.id, { x: e.target.x(), y: e.target.y() })}
                      onTransformEnd={() => {
                        const node = layerRef.current?.findOne(`#${el.id}`) as Konva.Text;
                        if (!node) return;
                        handleChange(el.id, {
                          x: node.x(),
                          y: node.y(),
                          width: Math.max(20, node.width() * node.scaleX()),
                          rotation: node.rotation(),
                          fontSize: Math.max(8, (el.fontSize || 20) * node.scaleY()),
                        });
                        node.scaleX(1);
                        node.scaleY(1);
                      }}
                    />
                  );
                }

                if (el.type === "image") {
                  return (
                    <ImageElement
                      key={el.id}
                      el={el}
                      isSelected={selectedId === el.id}
                      onSelect={() => onSelect(el.id)}
                      onChange={(attrs) => handleChange(el.id, attrs)}
                      trRef={trRef}
                    />
                  );
                }

                if (el.type === "shape") {
                  if (el.shapeType === "circle") {
                    return (
                      <Circle
                        key={el.id}
                        id={el.id}
                        x={el.x + el.width / 2}
                        y={el.y + el.height / 2}
                        radius={Math.min(el.width, el.height) / 2}
                        fill={el.fill || "#000000"}
                        stroke={el.stroke}
                        strokeWidth={el.strokeWidth || 0}
                        rotation={el.rotation}
                        draggable={!el.locked}
                        opacity={el.opacity ?? 1}
                        visible={el.visible}
                        onClick={() => onSelect(el.id)}
                        onTap={() => onSelect(el.id)}
                        onDragEnd={(e) => handleChange(el.id, {
                          x: e.target.x() - el.width / 2,
                          y: e.target.y() - el.height / 2,
                        })}
                        onTransformEnd={() => {
                          const node = layerRef.current?.findOne(`#${el.id}`) as Konva.Circle;
                          if (!node) return;
                          handleChange(el.id, {
                            x: node.x() - (node.radius() * Math.abs(node.scaleX())),
                            y: node.y() - (node.radius() * Math.abs(node.scaleY())),
                            width: node.radius() * 2 * Math.abs(node.scaleX()),
                            height: node.radius() * 2 * Math.abs(node.scaleY()),
                            rotation: node.rotation(),
                          });
                          node.scaleX(1);
                          node.scaleY(1);
                        }}
                      />
                    );
                  }
                  if (el.shapeType === "triangle") {
                    return (
                      <Line
                        key={el.id}
                        id={el.id}
                        points={[el.width / 2, 0, el.width, el.height, 0, el.height]}
                        closed
                        fill={el.fill || "#000000"}
                        stroke={el.stroke}
                        strokeWidth={el.strokeWidth || 0}
                        x={el.x}
                        y={el.y}
                        rotation={el.rotation}
                        draggable={!el.locked}
                        opacity={el.opacity ?? 1}
                        visible={el.visible}
                        onClick={() => onSelect(el.id)}
                        onTap={() => onSelect(el.id)}
                        onDragEnd={(e) => handleChange(el.id, { x: e.target.x(), y: e.target.y() })}
                        onTransformEnd={() => {
                          const node = layerRef.current?.findOne(`#${el.id}`) as Konva.Line;
                          if (!node) return;
                          handleChange(el.id, {
                            x: node.x(),
                            y: node.y(),
                            rotation: node.rotation(),
                          });
                          node.scaleX(1);
                          node.scaleY(1);
                        }}
                      />
                    );
                  }
                  if (el.shapeType === "line") {
                    return (
                      <Line
                        key={el.id}
                        id={el.id}
                        points={[0, 0, el.width, 0]}
                        stroke={el.stroke || el.fill || "#000000"}
                        strokeWidth={el.strokeWidth || 2}
                        x={el.x}
                        y={el.y}
                        rotation={el.rotation}
                        draggable={!el.locked}
                        opacity={el.opacity ?? 1}
                        visible={el.visible}
                        onClick={() => onSelect(el.id)}
                        onTap={() => onSelect(el.id)}
                        onDragEnd={(e) => handleChange(el.id, { x: e.target.x(), y: e.target.y() })}
                      />
                    );
                  }
                  // rect default
                  return (
                    <Rect
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      fill={el.fill || "#000000"}
                      stroke={el.stroke}
                      strokeWidth={el.strokeWidth || 0}
                      cornerRadius={4}
                      rotation={el.rotation}
                      draggable={!el.locked}
                      opacity={el.opacity ?? 1}
                      visible={el.visible}
                      onClick={() => onSelect(el.id)}
                      onTap={() => onSelect(el.id)}
                      onDragEnd={(e) => handleChange(el.id, { x: e.target.x(), y: e.target.y() })}
                      onTransformEnd={() => {
                        const node = layerRef.current?.findOne(`#${el.id}`) as Konva.Rect;
                        if (!node) return;
                        handleChange(el.id, {
                          x: node.x(),
                          y: node.y(),
                          width: Math.max(5, node.width() * node.scaleX()),
                          height: Math.max(5, node.height() * node.scaleY()),
                          rotation: node.rotation(),
                        });
                        node.scaleX(1);
                        node.scaleY(1);
                      }}
                    />
                  );
                }

                return null;
              })}

              {/* Transformer */}
              <Transformer
                ref={trRef}
                rotateEnabled={true}
                enabledAnchors={["top-left", "top-center", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-center", "bottom-right"]}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 10 || newBox.height < 10) return oldBox;
                  return newBox;
                }}
                anchorSize={8}
                anchorCornerRadius={2}
                borderStroke="hsl(214, 55%, 28%)"
                anchorStroke="hsl(214, 55%, 28%)"
                anchorFill="#ffffff"
                rotateAnchorOffset={20}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
