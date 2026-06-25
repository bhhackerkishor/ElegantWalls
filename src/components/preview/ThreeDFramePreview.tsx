'use client';

import { Suspense, useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { ProductCategory } from '@/types';
import { resolveFrameStyle, hasFrame } from '@/lib/preview/frame-styles';
import { parseSizeDimensions } from '@/lib/preview/size-utils';

interface FrameMeshProps {
  imageUrl: string;
  frameName: string;
  size: string;
  orientation: string;
  category: ProductCategory;
}

function FrameMesh({ imageUrl, frameName, size, orientation, category }: FrameMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const [dragging, setDragging] = useState(false);
  
  const dragStart = useRef(0);
  const currentRotationY = useRef(0);
  const targetRotationY = useRef(0);
  const velocityY = useRef(0);

  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  const frameStyle = resolveFrameStyle(frameName);
  const showFrame = hasFrame(frameName) && category !== 'sticker';
  
  // 1. Parse real physical dimensions (inches)
  const dims = useMemo(() => parseSizeDimensions(size, orientation), [size, orientation]);

  // 2. Calculate dynamic scale factor based on a 24-inch benchmark limit
  const scaleFactor = useMemo(() => {
    const maxPhysicalDimension = Math.max(dims.widthIn, dims.heightIn);
    // 24 inches acts as our 100% scale ceiling. 4x4 will scale down beautifully.
    const baselineMax = 24; 
    // Clamp the minimum scale to 0.35 so tiny sizes remain clear and legible
    return Math.max(0.35, maxPhysicalDimension / baselineMax);
  }, [dims]);

  const aspect = dims.widthIn / dims.heightIn;
  const artW = 2.2 * aspect;
  const artH = 2.2;
  
  const borderThickness = showFrame ? artW * frameStyle.borderRatio * 2 : 0;
  const outerThickness = borderThickness * 0.75;
  const innerThickness = borderThickness * 0.25;
  
  const totalDepth = showFrame ? frameStyle.depthPx * 0.005 : 0.02;
  const outerDepth = totalDepth;
  const innerDepth = totalDepth + 0.012;

  const totalW = artW + borderThickness * 2;
  const totalH = artH + borderThickness * 2;

  const frameColor = useMemo(() => {
    const map: Record<string, string> = {
      'natural-oak': '#C4A574',
      'black-matte': '#151515',
      'white-classic': '#F5F5F7',
      'walnut-wood': '#3A2312',
      'black-frame': '#151515',
      'white-frame': '#EAEAEA',
      'wooden-frame': '#96734B',
      none: '#222222',
    };
    return map[frameStyle.key] ?? '#C4A574';
  }, [frameStyle.key]);

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
  setDragging(true);
  dragStart.current = e.clientX;
  velocityY.current = 0;
}, []);

const onPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  setDragging(false);
}, []);

  useEffect(() => {
  gl.domElement.style.cursor = dragging ? 'grabbing' : 'grab';
}, [dragging, gl]);

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging) return;
      const currentX = e.clientX;
      const deltaX = currentX - dragStart.current;
      dragStart.current = currentX;

      const sensitivity = 0.005;
      targetRotationY.current += deltaX * sensitivity;
      velocityY.current = deltaX * sensitivity;
    },
    [dragging]
  );

  useFrame(() => {
    if (!groupRef.current) return;
    if (dragging) {
      currentRotationY.current += (targetRotationY.current - currentRotationY.current) * 0.25;
    } else {
      velocityY.current *= 0.94;
      currentRotationY.current += velocityY.current;
      targetRotationY.current = currentRotationY.current;
    }
    groupRef.current.rotation.y = currentRotationY.current;
  });

 
const materialRoughness = frameStyle.texture === 'matte-black' ? 0.8 : 0.35;


  return (
    // The scale prop handles zooming down small layouts cleanly inside the view viewport window
    <group
      ref={groupRef}
      scale={[scaleFactor, scaleFactor, scaleFactor]}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* 1. ARTWORK INTERIOR CANVAS LAYER */}
      <mesh position={[0, 0, outerDepth / 2 + 0.005]} castShadow receiveShadow>
        <planeGeometry args={[artW, artH]} />
        <meshStandardMaterial map={texture} roughness={0.2} metalness={0.01} />
      </mesh>

      {/* 2. ARCHITECTURAL LAYERED MOLDING FRAME */}
      {showFrame && (
        <group>
          {/* A. DEEP OUTER BASE FRAME LAYER */}
          <mesh position={[0, (artH + borderThickness + innerThickness) / 2, outerDepth / 4]} castShadow>
            <boxGeometry args={[totalW, outerThickness, outerDepth]} />
            <meshStandardMaterial color={frameColor} roughness={materialRoughness} metalness={0.05} />
          </mesh>
          <mesh position={[0, -(artH + borderThickness + innerThickness) / 2, outerDepth / 4]} castShadow>
            <boxGeometry args={[totalW, outerThickness, outerDepth]} />
            <meshStandardMaterial color={frameColor} roughness={materialRoughness} metalness={0.05} />
          </mesh>
          <mesh position={[-(artW + borderThickness + innerThickness) / 2, 0, outerDepth / 4]} castShadow>
            <boxGeometry args={[outerThickness, artH + innerThickness * 2, outerDepth]} />
            <meshStandardMaterial color={frameColor} roughness={materialRoughness} metalness={0.05} />
          </mesh>
          <mesh position={[(artW + borderThickness + innerThickness) / 2, 0, outerDepth / 4]} castShadow>
            <boxGeometry args={[outerThickness, artH + innerThickness * 2, outerDepth]} />
            <meshStandardMaterial color={frameColor} roughness={materialRoughness} metalness={0.05} />
          </mesh>

          {/* B. RAISED INNER TRIM BEVEL LAYER */}
          <mesh position={[0, (artH + innerThickness) / 2, innerDepth / 4]} castShadow>
            <boxGeometry args={[artW + innerThickness * 2, innerThickness, innerDepth]} />
            <meshStandardMaterial color={frameColor} roughness={materialRoughness - 0.05} metalness={0.08} />
          </mesh>
          <mesh position={[0, -(artH + innerThickness) / 2, innerDepth / 4]} castShadow>
            <boxGeometry args={[artW + innerThickness * 2, innerThickness, innerDepth]} />
            <meshStandardMaterial color={frameColor} roughness={materialRoughness - 0.05} metalness={0.08} />
          </mesh>
          <mesh position={[-(artW + innerThickness) / 2, 0, innerDepth / 4]} castShadow>
            <boxGeometry args={[innerThickness, artH, innerDepth]} />
            <meshStandardMaterial color={frameColor} roughness={materialRoughness - 0.05} metalness={0.08} />
          </mesh>
          <mesh position={[(artW + innerThickness) / 2, 0, innerDepth / 4]} castShadow>
            <boxGeometry args={[innerThickness, artH, innerDepth]} />
            <meshStandardMaterial color={frameColor} roughness={materialRoughness - 0.05} metalness={0.08} />
          </mesh>

          {/* C. INNER DROP SHADOW LAYER */}
          <mesh position={[0, 0, outerDepth / 2 + 0.006]}>
            <boxGeometry args={[artW + 0.005, artH + 0.005, 0.002]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.4} />
          </mesh>
        </group>
      )}

      {/* 3. HARDWARE BACKING BOARD */}
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[totalW - 0.002, totalH - 0.002, outerDepth]} />
        <meshStandardMaterial color="#1c1c1e" roughness={0.9} />
      </mesh>
    </group>
  );
}

function StudioLighting() {
  return (
    <>
      {/* Diffuse Ambient Floor Bounce Grid */}
      <ambientLight intensity={0.4} />

      {/* High-Contrast Primary Key Spotlight (Simulating directional gallery beam track) */}
      <directionalLight 
        position={[4, 6, 6]} 
        intensity={1.8} 
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      {/* Soft Fill Light to naturally preserve print value contrast metrics */}
      <directionalLight position={[-4, 2, 4]} intensity={0.6} />

      {/* Architectural Rim Highlight Accent (Catches edges cleanly during a full 360 cycle) */}
      <directionalLight position={[0, -5, -4]} intensity={0.5} color="#ffffff" />
    </>
  );
}

export interface ThreeDFramePreviewProps {
  imageUrl: string;
  size: string;
  frame: string;
  orientation: string;
  category: ProductCategory;
  className?: string;
}

export default function ThreeDFramePreview({
  imageUrl,
  size,
  frame,
  orientation,
  category,
  className = '',
}: ThreeDFramePreviewProps) {
  return (
    <div
      className={`relative w-full h-[450px] sm:h-[520px] rounded-[32px] overflow-hidden bg-gradient-to-b from-stone-50 to-stone-100 dark:from-neutral-900 dark:to-neutral-950 border border-black/5 dark:border-white/5 shadow-inner transition-colors duration-500 ${className}`}
    >
      {/* Brand Context Logo Badges */}
      <div className="absolute top-6 left-8 z-10 select-none pointer-events-none">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-30 text-foreground">
          Elegant Walls Studio
        </span>
      </div>

      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 38 }}
        dpr={[1, 2]} // Enhanced high-density retina rendering support
        shadows
        gl={{ 
          antialias: true, 
          alpha: true, 
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping, // Luxury cinematic photo rendering curve
          toneMappingExposure: 1.15
        }}
        style={{ cursor: 'grab' }}
      >
        <StudioLighting />
        <Suspense fallback={null}>
          <FrameMesh
            imageUrl={imageUrl}
            frameName={frame}
            size={size}
            orientation={orientation}
            category={category}
          />
        </Suspense>
      </Canvas>

      {/* Centered Minimal User Guide Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center select-none pointer-events-none w-full px-4">
        <p className="text-[10px] tracking-[0.2em] uppercase font-medium text-foreground/40 dark:text-white/30">
          Hold & Drag Object • Interactive 360° Inspection
        </p>
      </div>
    </div>
  );
}