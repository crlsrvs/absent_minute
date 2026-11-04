import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { EchoChannel, PuzzleId, SceneId } from '../core/types';
import { EntityFSMState, evaluateEntityFSM } from '../paranormal/entities';

interface EntitiesProps {
  scene: SceneId;
  channel: EchoChannel;
  puzzlesSolved: ReadonlyArray<PuzzleId>;
  reducedMotion: boolean;
}

export function ResidualFigure({
  basePosition,
  reducedMotion,
  variant,
  fsmState,
}: {
  basePosition: [number, number, number];
  reducedMotion: boolean;
  variant: 'lab' | 'corridor';
  fsmState: EntityFSMState;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const lagArmRef = useRef<THREE.Mesh>(null);
  const echoTrailRef = useRef<THREE.Mesh>(null);

  const isStabilized = fsmState === 'STABILIZED';

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion || isStabilized) return;
    const t = clock.getElapsedTime();

    if (variant === 'lab') {
      // Repite cada 6 segundos un desplazamiento frente a los diales del laboratorio
      const cycle = Math.sin(t * 1.1) * 0.55;
      groupRef.current.position.x = basePosition[0] + cycle;
      groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.35;
    } else {
      // En el pasillo repite el avance hacia la Esclusa Lateral (derecha)
      const progress = (t % 4.5) / 4.5;
      groupRef.current.position.x = basePosition[0] - 0.8 + progress * 1.3;
      groupRef.current.position.z = basePosition[2] + Math.sin(progress * Math.PI) * 0.4;
    }

    if (lagArmRef.current) {
      // Desfase temporal en las extremidades
      lagArmRef.current.rotation.x = Math.sin(t * 2.4 - 0.9) * 0.5;
    }
    if (echoTrailRef.current) {
      echoTrailRef.current.position.x = -Math.sin(t * 1.1) * 0.22;
    }
  });

  const emissiveColor = isStabilized ? '#4c9ab8' : '#3b6e6c';
  const mainOpacity = isStabilized ? 0.28 : 0.52;

  return (
    <group ref={groupRef} position={basePosition}>
      {/* Torso de partículas oscuras semitransparentes */}
      <mesh position={[0, 0.15, 0]}>
        <capsuleGeometry args={[0.22, 0.75, 8, 16]} />
        <meshStandardMaterial
          color="#172426"
          emissive={emissiveColor}
          emissiveIntensity={isStabilized ? 0.25 : 0.45}
          transparent
          opacity={mainOpacity}
          roughness={0.9}
        />
      </mesh>

      {/* Cabeza sin facciones (contorno difuso) */}
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial
          color="#10181a"
          emissive={emissiveColor}
          emissiveIntensity={0.35}
          transparent
          opacity={isStabilized ? 0.22 : 0.45}
        />
      </mesh>

      {/* Extremidad con desfase temporal */}
      <mesh ref={lagArmRef} position={[-0.28, 0.22, 0.12]}>
        <boxGeometry args={[0.1, 0.55, 0.1]} />
        <meshStandardMaterial
          color="#1f3438"
          emissive="#6da8a2"
          emissiveIntensity={0.6}
          transparent
          opacity={isStabilized ? 0.2 : 0.4}
        />
      </mesh>

      {/* Estela cinética retrasada */}
      {!isStabilized && (
        <mesh ref={echoTrailRef} position={[-0.18, 0.15, -0.18]}>
          <capsuleGeometry args={[0.2, 0.72, 6, 10]} />
          <meshStandardMaterial
            color="#0d1417"
            emissive="#4a7c77"
            emissiveIntensity={0.3}
            transparent
            opacity={0.24}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

export function TestigoFigure({
  position,
  reducedMotion,
}: {
  position: [number, number, number];
  reducedMotion: boolean;
}) {
  const dustRingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!dustRingRef.current || reducedMotion) return;
    dustRingRef.current.rotation.y = clock.getElapsedTime() * 0.25;
  });

  return (
    <group position={position}>
      {/* Vacío óptico central (ausencia de profundidad) */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.18, 0.26, 1.35, 14]} />
        <meshBasicMaterial color="#050708" transparent opacity={0.86} />
      </mesh>

      {/* Halo de polvo suspendido inmóvil */}
      <mesh ref={dustRingRef} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.26, 0.34, 1.42, 12, 4, true]} />
        <meshStandardMaterial
          color="#8f8672"
          emissive="#b59e6d"
          emissiveIntensity={0.28}
          transparent
          opacity={0.32}
          wireframe
        />
      </mesh>

      {/* Brazo estático señalando el gavetero censurado */}
      <mesh position={[0.26, 0.35, -0.12]} rotation={[0, 0, -0.9]}>
        <boxGeometry args={[0.08, 0.52, 0.08]} />
        <meshBasicMaterial color="#090c0e" transparent opacity={0.78} />
      </mesh>
    </group>
  );
}

export function ElContadorMarks({
  scene,
  channel,
  fsmState,
  reducedMotion,
}: {
  scene: SceneId;
  channel: EchoChannel;
  fsmState: EntityFSMState;
  reducedMotion: boolean;
}) {
  const pendulumRef = useRef<THREE.Group>(null);
  const isStabilized = fsmState === 'STABILIZED';

  useFrame(({ clock }) => {
    if (!pendulumRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    if (isStabilized) {
      // Una vez reconstruido el minuto 02:16, el péndulo late con cadencia armónica limpia
      pendulumRef.current.rotation.z = Math.sin(t * 2.0) * 0.18;
    } else if (channel === 'C') {
      // Oscilación síncrona antinatural con paradas bruscas
      const stepped = Math.floor(t * 2) / 2;
      pendulumRef.current.rotation.z = Math.sin(stepped * 3.14) * 0.28;
    } else if (channel === 'B') {
      pendulumRef.current.rotation.z = Math.sin(t * 1.5) * 0.12;
    } else {
      pendulumRef.current.rotation.z = 0;
    }
  });

  return (
    <group>
      {scene === 'camara' && (
        <group ref={pendulumRef} position={[0, 3.2, -4.1]}>
          <mesh position={[0, -1.1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2.2, 12]} />
            <meshStandardMaterial color="#8c734b" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -2.2, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.16, 24]} />
            <meshStandardMaterial
              color="#c48f3f"
              emissive={
                isStabilized ? '#49a897' : channel === 'C' ? '#d96b27' : '#3a2b14'
              }
              emissiveIntensity={channel === 'C' || isStabilized ? 0.9 : 0.25}
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>
        </group>
      )}

      {channel === 'C' && (
        <Html position={[0, 2.65, -4.1]} center zIndexRange={[5, 0]}>
          <div className="contador-mark-3d" aria-hidden="true">
            {scene === 'vestibulo' && '02:15 // 02:17'}
            {scene === 'vigilancia' && 'CAM-04 :: 02:16:12'}
            {scene === 'archivo' && 'REGISTRO EXCLUIDO'}
            {scene === 'laboratorio' && '3 · 1 · 4 · 2 · 5'}
            {scene === 'pasillo' && '02:16:33 — UMBRAL'}
            {scene === 'camara' &&
              (isStabilized
                ? '02:16:59.9 — LISTO PARA DECISIÓN'
                : '02:16:59.8 — EN ESPERA')}
          </div>
        </Html>
      )}
    </group>
  );
}

export function ParanormalEntities3D({
  scene,
  channel,
  puzzlesSolved,
  reducedMotion,
}: EntitiesProps) {
  const testigoState = evaluateEntityFSM(
    'testigo_archivo',
    scene,
    channel,
    puzzlesSolved
  );
  const labResidualState = evaluateEntityFSM(
    'residual_laboratorio',
    scene,
    channel,
    puzzlesSolved
  );
  const corridorResidualState = evaluateEntityFSM(
    'residual_pasillo',
    scene,
    channel,
    puzzlesSolved
  );
  const contadorState = evaluateEntityFSM(
    'el_contador',
    scene,
    channel,
    puzzlesSolved
  );

  return (
    <group>
      {testigoState !== 'DORMANT' && (
        <TestigoFigure position={[1.8, 0.75, -3.8]} reducedMotion={reducedMotion} />
      )}
      {labResidualState !== 'DORMANT' && (
        <ResidualFigure
          basePosition={[1.6, 0.75, -3.2]}
          reducedMotion={reducedMotion}
          variant="lab"
          fsmState={labResidualState}
        />
      )}
      {corridorResidualState !== 'DORMANT' && (
        <ResidualFigure
          basePosition={[2.0, 0.75, -3.3]}
          reducedMotion={reducedMotion}
          variant="corridor"
          fsmState={corridorResidualState}
        />
      )}
      <ElContadorMarks
        scene={scene}
        channel={channel}
        fsmState={contadorState}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
