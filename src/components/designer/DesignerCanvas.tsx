import { useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Text, Image as KImage, Circle, Line, Transformer, Star } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import type { DesignElement } from "./types";
import type { PhoneOutline } from "./phoneOutlines";
import { PhoneBackLayer } from "./PhoneBackSvg";

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
}

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

function BgImage({ url, width, height }: { url: string; width: number; height: number }) {
  const [img] = useImage(url, "anonymous");
  if (!img) return null;
  return <KImage image={img} width={width} height={height} listening={false} />;
}

export default function DesignerCanvas({
  phone, phoneId, elements, bgColor, selectedId, onSelect, onTransform, designImageUrl, stageRef, scale,
}: Props) {
  const trRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);

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
    <div className="flex items-center justify-center rounded-2xl p-4 overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10" style={{ minHeight: 440 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
        {/* 3D floating perspective wrapper */}
        <div
          style={{
            perspective: "800px",
          }}
        >
          <div
            style={{
              width: canvasW,
              height: canvasH,
              borderRadius: phone.radius,
              overflow: "hidden",
              position: "relative",
              transform: "rotateX(2deg)",
              boxShadow:
                "0 30px 60px -15px rgba(0,0,0,0.3), 0 15px 30px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
            }}
          >
            {/* Bottom layer: Phone back base (glass panel) */}
            <PhoneBackLayer phoneId={phoneId} phone={phone} layer="back" />

            {/* Middle layer: Konva canvas (user's design area) */}
            <div className="absolute inset-0" style={{ zIndex: 1 }}>
              <Stage
                ref={stageRef as React.RefObject<Konva.Stage>}
                width={canvasW}
                height={canvasH}
                onClick={handleStageClick}
                onTap={handleStageClick}
              >
                <Layer ref={layerRef}>
                  <Rect name="bg-rect" x={0} y={0} width={canvasW} height={canvasH} fill={bgColor} opacity={bgColor === "#ffffff" ? 0 : 1} listening={true} />
                  {designImageUrl && <BgImage url={designImageUrl} width={canvasW} height={canvasH} />}

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
                          fontFamily={el.fontFamily || "Nunito"}
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

                    if (el.type === "image" || el.type === "sticker") {
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
                      if (el.shapeType === "star") {
                        return (
                          <Star
                            key={el.id}
                            id={el.id}
                            x={el.x + el.width / 2}
                            y={el.y + el.height / 2}
                            numPoints={5}
                            innerRadius={el.width * 0.2}
                            outerRadius={el.width / 2}
                            fill={el.fill || "#f5c542"}
                            stroke={el.stroke}
                            strokeWidth={el.strokeWidth || 0}
                            rotation={el.rotation}
                            draggable={!el.locked}
                            opacity={el.opacity ?? 1}
                            onClick={() => onSelect(el.id)}
                            onTap={() => onSelect(el.id)}
                            onDragEnd={(e) => handleChange(el.id, {
                              x: e.target.x() - el.width / 2,
                              y: e.target.y() - el.height / 2,
                            })}
                          />
                        );
                      }
                      if (el.shapeType === "heart") {
                        const w = el.width;
                        const h = el.height;
                        return (
                          <Line
                            key={el.id}
                            id={el.id}
                            points={[
                              w / 2, h * 0.3,
                              w * 0.15, 0,
                              0, h * 0.35,
                              w / 2, h,
                              w, h * 0.35,
                              w * 0.85, 0,
                              w / 2, h * 0.3,
                            ]}
                            closed
                            fill={el.fill || "#e87f6e"}
                            stroke={el.stroke}
                            strokeWidth={el.strokeWidth || 0}
                            x={el.x}
                            y={el.y}
                            rotation={el.rotation}
                            draggable={!el.locked}
                            opacity={el.opacity ?? 1}
                            onClick={() => onSelect(el.id)}
                            onTap={() => onSelect(el.id)}
                            onDragEnd={(e) => handleChange(el.id, { x: e.target.x(), y: e.target.y() })}
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
                            strokeWidth={el.strokeWidth || 3}
                            x={el.x}
                            y={el.y}
                            rotation={el.rotation}
                            draggable={!el.locked}
                            opacity={el.opacity ?? 1}
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
                          cornerRadius={6}
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

                  <Transformer
                    ref={trRef}
                    rotateEnabled={true}
                    enabledAnchors={["top-left", "top-center", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-center", "bottom-right"]}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 10 || newBox.height < 10) return oldBox;
                      return newBox;
                    }}
                    anchorSize={10}
                    anchorCornerRadius={5}
                    borderStroke="hsl(199, 65%, 48%)"
                    anchorStroke="hsl(199, 65%, 48%)"
                    anchorFill="#ffffff"
                    rotateAnchorOffset={22}
                  />
                </Layer>
              </Stage>
            </div>

            {/* Top layer: Camera bump, Apple logo, frame overlay */}
            <div className="absolute inset-0" style={{ zIndex: 2 }}>
              <PhoneBackLayer phoneId={phoneId} phone={phone} layer="overlay" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
