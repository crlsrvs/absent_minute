import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../core/store';
import { SCENES_DATA } from '../narrative/scenesData';
import {
  EchoChannel,
  HotspotDefinition,
  ItemId,
  PuzzleId,
  SceneId,
} from '../core/types';
import { ParanormalEntities3D } from './ParanormalEntities3D';
import { soundEngine } from '../audio/soundEngine';

function CameraRig({
  reducedMotion,
  focusedTarget,
}: {
  reducedMotion: boolean;
  focusedTarget: [number, number, number] | null;
}) {
  const lookAtRef = useRef(new THREE.Vector3(0, 1.35, -3.2));
  const camPosRef = useRef(new THREE.Vector3(0, 1.8, 3.1));

  useFrame(({ camera, pointer }) => {
    if (reducedMotion) {
      camera.position.set(0, 1.8, 3.1);
      camera.lookAt(0, 1.35, -3.2);
      return;
    }

    const targetX = focusedTarget
      ? focusedTarget[0] * 0.2 + pointer.x * 0.2
      : pointer.x * 0.4;
    const targetY = focusedTarget
      ? 1.75 + (focusedTarget[1] - 1.3) * 0.12
      : 1.8 + pointer.y * 0.18;

    camPosRef.current.x = THREE.MathUtils.lerp(camPosRef.current.x, targetX, 0.06);
    camPosRef.current.y = THREE.MathUtils.lerp(camPosRef.current.y, targetY, 0.06);
    camera.position.copy(camPosRef.current);

    const lookX = focusedTarget ? focusedTarget[0] * 0.45 : pointer.x * 0.3;
    const lookY = focusedTarget ? focusedTarget[1] : 1.35 + pointer.y * 0.2;
    const lookZ = focusedTarget ? focusedTarget[2] : -3.2;

    lookAtRef.current.lerp(new THREE.Vector3(lookX, lookY, lookZ), 0.08);
    camera.lookAt(lookAtRef.current);
  });

  return null;
}

function SuspendedDust({
  channel,
  reducedMotion,
}: {
  channel: EchoChannel;
  reducedMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 80;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = ((i * 17) % 80) / 10 - 4.0;
      arr[i * 3 + 1] = ((i * 29) % 35) / 10 + 0.2;
      arr[i * 3 + 2] = -((i * 13) % 60) / 10 + 0.5;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) return;
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.015;
  });

  const color =
    channel === 'A' ? '#a6bec4' : channel === 'B' ? '#7de0c9' : '#f09b54';

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color={color} transparent opacity={0.5} />
    </points>
  );
}

function VestibuleClock3D({
  powerRestored,
  channel,
  isClockFocused,
  reducedMotion,
}: {
  powerRestored: boolean;
  channel: EchoChannel;
  isClockFocused: boolean;
  reducedMotion: boolean;
}) {
  const secondHandRef = useRef<THREE.Group>(null);
  const minuteHandRef = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!secondHandRef.current || !minuteHandRef.current) return;

    const lookingDirectly =
      isClockFocused ||
      (Math.abs(pointer.x) < 0.22 && pointer.y > -0.1 && pointer.y < 0.55);

    if (lookingDirectly || reducedMotion) {
      secondHandRef.current.rotation.z = 0.08;
      minuteHandRef.current.rotation.z = -Math.PI / 2;
    } else {
      const t = clock.getElapsedTime();
      const steppedTick = Math.floor(t * 2.5) * 0.26;
      secondHandRef.current.rotation.z = -steppedTick;
      minuteHandRef.current.rotation.z =
        -Math.PI / 2 - (channel === 'C' ? Math.sin(t * 6) * 0.18 : 0.05);
    }
  });

  return (
    <group position={[0, 2.65, -4.76]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.14, 28]} />
        <meshStandardMaterial
          color="#465357"
          emissive={powerRestored ? '#d9913b' : '#634321'}
          emissiveIntensity={0.45}
          metalness={0.65}
          roughness={0.35}
        />
      </mesh>

      <mesh position={[0, 0, 0.075]}>
        <circleGeometry args={[0.49, 28]} />
        <meshStandardMaterial
          color="#182226"
          emissive="#1c2d33"
          emissiveIntensity={0.35}
        />
      </mesh>

      {[0, 1, 2, 3].map((idx) => {
        const angle = (idx * Math.PI) / 2;
        return (
          <mesh
            key={idx}
            position={[Math.sin(angle) * 0.4, Math.cos(angle) * 0.4, 0.08]}
            rotation={[0, 0, -angle]}
          >
            <boxGeometry args={[0.03, 0.08, 0.01]} />
            <meshBasicMaterial color="#f0d9b5" />
          </mesh>
        );
      })}

      <group position={[0, 0, 0.085]} rotation={[0, 0, -Math.PI / 3]}>
        <mesh position={[0, 0.13, 0]}>
          <boxGeometry args={[0.04, 0.26, 0.01]} />
          <meshBasicMaterial color="#f5d598" />
        </mesh>
      </group>

      <group
        ref={minuteHandRef}
        position={[0, 0, 0.09]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.03, 0.36, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      <group ref={secondHandRef} position={[0, 0, 0.095]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.016, 0.4, 0.01]} />
          <meshBasicMaterial color="#ff6347" />
        </mesh>
      </group>
    </group>
  );
}

function DoorFrames3D({
  hotspots,
  puzzlesSolved,
  inventory,
}: {
  hotspots: HotspotDefinition[];
  puzzlesSolved: PuzzleId[];
  inventory: ItemId[];
}) {
  const doorHotspots = hotspots.filter((h) => h.type === 'door');

  return (
    <group>
      {doorHotspots.map((door) => {
        const [x, , z] = door.position;
        const isSideWall = Math.abs(x) > 2.8;
        const rotationY = isSideWall ? (x < 0 ? Math.PI / 2 : -Math.PI / 2) : 0;
        const posX = isSideWall ? (x < 0 ? -4.38 : 4.38) : x;
        const posZ = isSideWall ? z : -4.78;

        const puzzleOk =
          !door.requiredPuzzleForDoor ||
          puzzlesSolved.includes(door.requiredPuzzleForDoor);
        const itemOk =
          !door.requiredItemForDoor ||
          inventory.includes(door.requiredItemForDoor);
        const isUnlocked = puzzleOk && itemOk;

        return (
          <group
            key={door.id}
            position={[posX, 1.18, posZ]}
            rotation={[0, rotationY, 0]}
          >
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.55, 2.38, 0.16]} />
              <meshStandardMaterial
                color="#2e3e45"
                metalness={0.55}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[0, -0.04, 0.05]}>
              <boxGeometry args={[1.24, 2.16, 0.1]} />
              <meshStandardMaterial
                color={isUnlocked ? '#1e3330' : '#261d1e'}
                metalness={0.45}
                roughness={0.5}
              />
            </mesh>
            <mesh position={[0, 0.42, 0.11]}>
              <boxGeometry args={[0.55, 0.32, 0.02]} />
              <meshStandardMaterial
                color={isUnlocked ? '#6be0c5' : '#e06353'}
                emissive={isUnlocked ? '#49a897' : '#cf5f4e'}
                emissiveIntensity={0.65}
              />
            </mesh>
            <mesh position={[0, 1.06, 0.1]}>
              <boxGeometry args={[0.85, 0.14, 0.06]} />
              <meshStandardMaterial
                color={isUnlocked ? '#49a897' : '#cf5f4e'}
                emissive={isUnlocked ? '#49a897' : '#cf5f4e'}
                emissiveIntensity={1.1}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function CeilingFixtures3D({ channel }: { channel: EchoChannel }) {
  const tubeColor =
    channel === 'A' ? '#d4e8ed' : channel === 'B' ? '#7ce8cf' : '#ff9f68';

  return (
    <group>
      {[-2.2, 2.2].map((xPos, i) => (
        <group key={i} position={[xPos, 3.68, -2.4]}>
          <mesh>
            <boxGeometry args={[1.8, 0.08, 0.32]} />
            <meshStandardMaterial color="#2a363b" metalness={0.6} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[1.65, 0.04, 0.18]} />
            <meshBasicMaterial color={tubeColor} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RoomArchitecture({
  scene,
  channel,
  powerRestored,
  focusedHotspotId,
  puzzlesSolved,
  inventory,
}: {
  scene: SceneId;
  channel: EchoChannel;
  powerRestored: boolean;
  focusedHotspotId: string | null;
  puzzlesSolved: PuzzleId[];
  inventory: ItemId[];
}) {
  const wallColorByScene: Record<SceneId, string> = {
    vestibulo: '#21343d',
    vigilancia: '#1f2f38',
    archivo: '#283033',
    laboratorio: '#1d3634',
    pasillo: '#202c36',
    camara: '#252a36',
  };

  const wallColor =
    channel === 'C'
      ? '#362628'
      : channel === 'B'
        ? '#1b3634'
        : wallColorByScene[scene];

  const sceneDef = SCENES_DATA[scene];

  return (
    <group>
      <mesh
        position={[0, 0, -1.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[9.5, 8.5]} />
        <meshStandardMaterial color="#1a2226" roughness={0.8} metalness={0.15} />
      </mesh>
      <gridHelper
        args={[
          9.4,
          18,
          channel === 'B' ? '#3d857b' : channel === 'C' ? '#9e4c3b' : '#2f444d',
          '#202e34',
        ]}
        position={[0, 0.01, -1.8]}
      />

      <mesh position={[0, 3.8, -1.8]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.5, 8.5]} />
        <meshStandardMaterial color="#141b1f" roughness={0.9} />
      </mesh>
      <CeilingFixtures3D channel={channel} />

      <mesh position={[0, 1.9, -5.0]} receiveShadow>
        <boxGeometry args={[9.5, 3.8, 0.3]} />
        <meshStandardMaterial color={wallColor} roughness={0.75} metalness={0.1} />
      </mesh>

      <mesh position={[0, 0.35, -4.82]}>
        <boxGeometry args={[9.4, 0.7, 0.06]} />
        <meshStandardMaterial color="#141e22" roughness={0.6} />
      </mesh>

      <mesh position={[-4.6, 1.9, -1.8]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8.5, 3.8, 0.3]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      <mesh
        position={[
          scene === 'pasillo' && channel === 'B' ? 5.2 : 4.6,
          1.9,
          -1.8,
        ]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <boxGeometry args={[8.5, 3.8, 0.3]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      <DoorFrames3D
        hotspots={sceneDef.hotspots}
        puzzlesSolved={puzzlesSolved}
        inventory={inventory}
      />

      {scene === 'vestibulo' && (
        <group>
          <mesh position={[-1.8, 0.45, -2.5]}>
            <boxGeometry args={[2.3, 0.9, 1.0]} />
            <meshStandardMaterial color="#3d3228" roughness={0.65} />
          </mesh>
          <mesh position={[-1.8, 0.92, -2.5]}>
            <boxGeometry args={[2.4, 0.06, 1.08]} />
            <meshStandardMaterial color="#243832" roughness={0.5} />
          </mesh>
          <mesh position={[-2.4, 1.15, -2.5]}>
            <cylinderGeometry args={[0.04, 0.12, 0.4, 12]} />
            <meshStandardMaterial color="#b88b4a" metalness={0.7} />
          </mesh>
          <mesh position={[-2.4, 1.35, -2.5]}>
            <coneGeometry args={[0.22, 0.16, 16]} />
            <meshStandardMaterial
              color="#2e8b57"
              emissive="#43c77e"
              emissiveIntensity={0.85}
            />
          </mesh>

          <VestibuleClock3D
            powerRestored={powerRestored}
            channel={channel}
            isClockFocused={focusedHotspotId === 'vest_reloj_patron'}
            reducedMotion={false}
          />

          <mesh position={[-3.45, 1.5, -1.8]} rotation={[0, 0.35, 0]}>
            <boxGeometry args={[1.15, 0.9, 0.08]} />
            <meshStandardMaterial color="#4a3828" roughness={0.7} />
          </mesh>
          <mesh position={[-3.42, 1.52, -1.74]} rotation={[0, 0.35, 0]}>
            <boxGeometry args={[0.42, 0.56, 0.02]} />
            <meshBasicMaterial color="#ede6d6" />
          </mesh>

          <mesh position={[3.35, 1.6, -2.2]} rotation={[0, -0.35, 0]}>
            <boxGeometry args={[1.35, 0.95, 0.08]} />
            <meshStandardMaterial
              color="#1b3b4b"
              emissive="#337ca0"
              emissiveIntensity={0.65}
            />
          </mesh>

          <mesh position={[2.4, 1.35, -4.72]}>
            <boxGeometry args={[0.85, 1.05, 0.22]} />
            <meshStandardMaterial
              color="#35464d"
              metalness={0.55}
              roughness={0.4}
            />
          </mesh>
        </group>
      )}

      {scene === 'vigilancia' && (
        <group>
          <mesh position={[-1.4, 0.45, -2.7]}>
            <boxGeometry args={[2.5, 0.9, 0.95]} />
            <meshStandardMaterial color="#382f27" roughness={0.7} />
          </mesh>
          <mesh position={[0.2, 0.65, -4.2]}>
            <boxGeometry args={[4.4, 1.1, 1.0]} />
            <meshStandardMaterial color="#2a363b" roughness={0.55} />
          </mesh>
          {[-1.1, -0.3, 0.5, 1.3].map((xPos, i) => (
            <group key={i} position={[xPos, 1.5, -4.15]}>
              <mesh>
                <boxGeometry args={[0.72, 0.58, 0.58]} />
                <meshStandardMaterial color="#364247" />
              </mesh>
              <mesh position={[0, 0, 0.3]}>
                <planeGeometry args={[0.58, 0.44]} />
                <meshBasicMaterial
                  color={
                    i === 3 && channel === 'B'
                      ? '#55e0a3'
                      : channel === 'C'
                        ? '#f08346'
                        : '#2a6352'
                  }
                />
              </mesh>
            </group>
          ))}
          <mesh position={[3.1, 1.1, -3.3]}>
            <boxGeometry args={[0.95, 2.1, 0.85]} />
            <meshStandardMaterial color="#3d4b4f" metalness={0.45} roughness={0.5} />
          </mesh>
        </group>
      )}

      {scene === 'archivo' && (
        <group>
          {[-2.8, -1.1, 1.1, 2.8].map((xPos, idx) => (
            <group key={idx} position={[xPos, 1.35, -3.8]}>
              <mesh>
                <boxGeometry args={[1.05, 2.6, 0.72]} />
                <meshStandardMaterial color="#333d40" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.4, 0.38]}>
                <boxGeometry args={[0.85, 0.35, 0.08]} />
                <meshStandardMaterial color="#8f7556" />
              </mesh>
              <mesh position={[0, -0.2, 0.38]}>
                <boxGeometry args={[0.85, 0.35, 0.08]} />
                <meshStandardMaterial color="#708078" />
              </mesh>
            </group>
          ))}
          <mesh position={[-2.0, 0.48, -2.5]}>
            <boxGeometry args={[1.7, 0.92, 0.95]} />
            <meshStandardMaterial color="#423529" roughness={0.75} />
          </mesh>
        </group>
      )}

      {scene === 'laboratorio' && (
        <group>
          <mesh position={[-1.8, 0.5, -3.2]}>
            <boxGeometry args={[2.3, 0.95, 0.9]} />
            <meshStandardMaterial color="#2d383b" roughness={0.65} />
          </mesh>
          {[-1.6, -0.8, 0, 0.8, 1.6].map((xPos, idx) => (
            <mesh key={idx} position={[xPos, 1.65, -4.35]}>
              <cylinderGeometry args={[0.16, 0.16, 1.9, 18]} />
              <meshStandardMaterial
                color="#526b73"
                emissive={channel === 'B' ? '#49baa6' : '#2a4a52'}
                emissiveIntensity={0.6}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          ))}
          <mesh position={[2.7, 1.1, -3.9]}>
            <cylinderGeometry args={[0.48, 0.48, 1.6, 22]} />
            <meshStandardMaterial
              color="#3d524c"
              emissive="#2d6355"
              emissiveIntensity={0.35}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}

      {scene === 'pasillo' && (
        <group>
          <mesh position={[-2.3, 0.52, -2.4]}>
            <boxGeometry args={[0.95, 0.98, 0.75]} />
            <meshStandardMaterial color="#354047" roughness={0.7} />
          </mesh>
          {[-1.5, -2.8, -4.1].map((zPos, idx) => (
            <group
              key={idx}
              position={[channel === 'B' && idx === 1 ? 0.55 : 0, 1.9, zPos]}
              rotation={[
                0,
                0,
                channel === 'C' ? (idx % 2 === 0 ? 0.06 : -0.06) : 0,
              ]}
            >
              <mesh position={[-2.2, 0, 0]}>
                <boxGeometry args={[0.38, 3.6, 0.38]} />
                <meshStandardMaterial color="#2e404a" />
              </mesh>
              <mesh position={[2.2, 0, 0]}>
                <boxGeometry args={[0.38, 3.6, 0.38]} />
                <meshStandardMaterial color="#2e404a" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {scene === 'camara' && (
        <group>
          <mesh position={[0, 0.6, -3.5]}>
            <cylinderGeometry args={[1.35, 1.55, 1.1, 24]} />
            <meshStandardMaterial
              color="#2c3a42"
              metalness={0.55}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[-2.4, 0.55, -2.5]}>
            <boxGeometry args={[0.85, 1.0, 0.7]} />
            <meshStandardMaterial color="#2b373d" />
          </mesh>
          <mesh position={[2.4, 0.55, -2.5]}>
            <boxGeometry args={[0.85, 1.0, 0.7]} />
            <meshStandardMaterial color="#2b373d" />
          </mesh>
          {Array.from({ length: 8 }).map((_, idx) => {
            const angle = (idx / 8) * Math.PI - Math.PI / 2;
            const x = Math.sin(angle) * 3.1;
            const z = -3.2 - Math.cos(angle) * 1.4;
            return (
              <mesh key={idx} position={[x, 2.35, z]}>
                <boxGeometry args={[0.45, 0.45, 0.14]} />
                <meshStandardMaterial
                  color="#323d42"
                  emissive={channel === 'C' ? '#e07534' : '#658891'}
                  emissiveIntensity={0.55}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}

function HotspotPropMesh({
  type,
  color,
  highlighted,
}: {
  type: HotspotDefinition['type'];
  color: string;
  highlighted: boolean;
}) {
  const reelRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (reelRef.current && type === 'transcript') {
      reelRef.current.rotation.z = clock.getElapsedTime() * 1.8;
    }
  });

  if (type === 'document') {
    return (
      <group rotation={[-0.35, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.44, 0.04, 0.34]} />
          <meshStandardMaterial
            color="#c7a56b"
            emissive={color}
            emissiveIntensity={highlighted ? 0.65 : 0.25}
          />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.38, 0.02, 0.28]} />
          <meshBasicMaterial color="#f5f2eb" />
        </mesh>
        <mesh position={[0.1, 0.045, 0.06]}>
          <cylinderGeometry args={[0.04, 0.04, 0.01, 12]} />
          <meshBasicMaterial color="#cf4638" />
        </mesh>
      </group>
    );
  }

  if (type === 'transcript') {
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.5, 0.28, 0.26]} />
          <meshStandardMaterial
            color="#2b3b40"
            emissive={color}
            emissiveIntensity={highlighted ? 0.6 : 0.25}
          />
        </mesh>
        <group ref={reelRef} position={[-0.12, 0.05, 0.14]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.02, 16]} />
            <meshBasicMaterial color="#73e0d1" />
          </mesh>
        </group>
        <mesh position={[0.12, 0.05, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 16]} />
          <meshBasicMaterial color="#73e0d1" />
        </mesh>
      </group>
    );
  }

  if (type === 'pickup') {
    return (
      <group>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.38, 0.12, 0.28]} />
          <meshStandardMaterial
            color="#48b88a"
            emissive={color}
            emissiveIntensity={highlighted ? 0.95 : 0.5}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.26, 0.28, 0.03, 20]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    );
  }

  if (type === 'puzzle') {
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.52, 0.38, 0.22]} />
          <meshStandardMaterial
            color="#3b2f20"
            emissive={color}
            emissiveIntensity={highlighted ? 0.85 : 0.4}
          />
        </mesh>
        <mesh position={[0, 0.04, 0.12]}>
          <planeGeometry args={[0.38, 0.2]} />
          <meshBasicMaterial color="#f5b35d" />
        </mesh>
      </group>
    );
  }

  return (
    <mesh>
      <torusGeometry args={[0.2, 0.045, 12, 24]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={highlighted ? 1.1 : 0.6}
      />
    </mesh>
  );
}

function InteractiveHotspotNode({
  hotspot,
  channel,
  isFocused,
  isNextRecommended,
  isCompletedOrCollected,
  doorUnlocked,
  hideHtmlOverlay,
  onSelect,
  onFocusChange,
}: {
  hotspot: HotspotDefinition;
  channel: EchoChannel;
  isFocused: boolean;
  isNextRecommended: boolean;
  isCompletedOrCollected: boolean;
  doorUnlocked: boolean;
  hideHtmlOverlay: boolean;
  onSelect: (h: HotspotDefinition) => void;
  onFocusChange: (id: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const scale =
      hovered || isFocused
        ? 1.16
        : isNextRecommended
          ? 1.06 + Math.sin(t * 3.2) * 0.06
          : 1.0;
    groupRef.current.scale.setScalar(scale);
  });

  const colorByType: Record<HotspotDefinition['type'], string> = {
    puzzle: '#f09c3b',
    door: doorUnlocked ? '#52cf9b' : '#e05a47',
    pickup: '#5cd69d',
    document: '#e3c778',
    transcript: '#68d4d8',
    entity: '#e06453',
    inspect: '#9eb8c2',
  };

  const baseColor = isCompletedOrCollected
    ? '#5b7075'
    : colorByType[hotspot.type];

  const isExpanded = hovered || isFocused || isNextRecommended;

  return (
    <group position={hotspot.position}>
      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          soundEngine.initOnUserGesture();
          onSelect(hotspot);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onFocusChange(hotspot.id);
        }}
        onPointerOut={() => {
          setHovered(false);
          onFocusChange(null);
        }}
      >
        <HotspotPropMesh
          type={hotspot.type}
          color={baseColor}
          highlighted={isExpanded}
        />
      </group>

      {!hideHtmlOverlay && (
        <Html
          position={[0, 0.38, 0]}
          center
          zIndexRange={[5, 0]}
        >
          <button
            type="button"
            className={`hotspot-tag hotspot-tag--${hotspot.type} ${
              hovered || isFocused ? 'is-focused' : ''
            } ${isNextRecommended && !isCompletedOrCollected ? 'is-recommended' : ''} ${
              isCompletedOrCollected ? 'is-done' : ''
            } ${
              hotspot.visibleInChannels && !hotspot.visibleInChannels.includes('A')
                ? `is-channel-${channel.toLowerCase()}`
                : ''
            }`}
            onClick={() => {
              soundEngine.initOnUserGesture();
              onSelect(hotspot);
            }}
            onFocus={() => onFocusChange(hotspot.id)}
            onBlur={() => onFocusChange(null)}
            aria-label={`${hotspot.label}: ${hotspot.actionLabel}`}
          >
            <span className="hotspot-tag__title">
              {isNextRecommended && !isCompletedOrCollected
                ? `► ${hotspot.label}`
                : isCompletedOrCollected
                  ? `✓ ${hotspot.label}`
                  : hotspot.label}
            </span>
            {(hovered || isFocused) && (
              <span className="hotspot-tag__action">{hotspot.actionLabel}</span>
            )}
          </button>
        </Html>
      )}
    </group>
  );
}

export function FacilityCanvas() {
  const currentScene = useGameStore((s) => s.currentScene);
  const channel = useGameStore((s) => s.channel);
  const inventory = useGameStore((s) => s.inventory);
  const documentsFound = useGameStore((s) => s.documentsFound);
  const transcriptsFound = useGameStore((s) => s.transcriptsFound);
  const puzzlesSolved = useGameStore((s) => s.puzzlesSolved);
  const focusedHotspotId = useGameStore((s) => s.focusedHotspotId);
  const activeModalType = useGameStore((s) => s.activeModal.type);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);
  const interactWithHotspot = useGameStore((s) => s.interactWithHotspot);
  const setFocusedHotspotId = useGameStore((s) => s.setFocusedHotspotId);

  const sceneDef = SCENES_DATA[currentScene];
  const powerRestored = puzzlesSolved.includes('circuito_emergencia');
  const isModalOpen = activeModalType !== 'none';

  const visibleHotspots = useMemo(() => {
    return sceneDef.hotspots.filter((h) => {
      if (h.visibleInChannels && !h.visibleInChannels.includes(channel)) {
        return false;
      }
      if (h.type === 'pickup' && h.itemId && inventory.includes(h.itemId)) {
        return false;
      }
      return true;
    });
  }, [sceneDef.hotspots, channel, inventory]);

  const focusedHotspotObj = useMemo(
    () => visibleHotspots.find((h) => h.id === focusedHotspotId) ?? null,
    [visibleHotspots, focusedHotspotId]
  );

  const recommendedHotspotId = useMemo(() => {
    for (const h of visibleHotspots) {
      if (h.type === 'pickup' && h.itemId && !inventory.includes(h.itemId)) {
        if (
          h.itemId === 'llave_archivo' &&
          !puzzlesSolved.includes('registros_incompatibles')
        ) {
          continue;
        }
        if (
          h.itemId === 'bobina_maestra' &&
          !puzzlesSolved.includes('secuencia_calibracion')
        ) {
          continue;
        }
        return h.id;
      }
      if (h.type === 'document' && h.documentId && !documentsFound.includes(h.documentId)) {
        return h.id;
      }
      if (
        h.type === 'transcript' &&
        h.transcriptId &&
        !transcriptsFound.includes(h.transcriptId)
      ) {
        return h.id;
      }
      if (h.type === 'puzzle' && h.puzzleId && !puzzlesSolved.includes(h.puzzleId)) {
        return h.id;
      }
    }
    const forwardDoor = visibleHotspots.find(
      (h) => h.type === 'door' && h.targetScene !== 'vestibulo'
    );
    return forwardDoor?.id ?? null;
  }, [visibleHotspots, inventory, documentsFound, transcriptsFound, puzzlesSolved]);

  const ambientLightColor =
    channel === 'A' ? '#6a8d9c' : channel === 'B' ? '#5abaa7' : '#b86c4d';
  const pointLightColor =
    channel === 'A'
      ? powerRestored
        ? '#f2be72'
        : '#d98f54'
      : channel === 'B'
        ? '#6be0c3'
        : '#f2784b';

  return (
    <div className={`canvas-stage canvas-stage--channel-${channel.toLowerCase()}`}>
      <Canvas
        shadows
        camera={{ position: [0, 1.8, 3.1], fov: 56 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color
          attach="background"
          args={[
            channel === 'A' ? '#101a20' : channel === 'B' ? '#0c1f1d' : '#1f1212',
          ]}
        />
        <fog
          attach="fog"
          args={[
            channel === 'A' ? '#101a20' : channel === 'B' ? '#0c1f1d' : '#1f1212',
            4.5,
            13.5,
          ]}
        />

        <ambientLight
          intensity={powerRestored ? 1.05 : 0.85}
          color={ambientLightColor}
        />
        <pointLight
          position={[0, 3.3, -2.2]}
          intensity={powerRestored ? 2.4 : 1.7}
          distance={14}
          color={pointLightColor}
        />
        <pointLight
          position={[-2.6, 2.4, -2.8]}
          intensity={1.2}
          distance={10}
          color={channel === 'B' ? '#5cd6c0' : '#85b0c4'}
        />
        <pointLight
          position={[2.6, 2.4, -2.8]}
          intensity={1.1}
          distance={10}
          color="#d9a566"
        />

        <CameraRig
          reducedMotion={reducedMotion}
          focusedTarget={focusedHotspotObj ? focusedHotspotObj.position : null}
        />
        <SuspendedDust channel={channel} reducedMotion={reducedMotion} />
        <RoomArchitecture
          scene={currentScene}
          channel={channel}
          powerRestored={powerRestored}
          focusedHotspotId={focusedHotspotId}
          puzzlesSolved={puzzlesSolved}
          inventory={inventory}
        />
        <ParanormalEntities3D
          scene={currentScene}
          channel={channel}
          puzzlesSolved={puzzlesSolved}
          reducedMotion={reducedMotion}
        />

        {visibleHotspots.map((hotspot) => {
          const isDone =
            (hotspot.documentId && documentsFound.includes(hotspot.documentId)) ||
            (hotspot.transcriptId &&
              transcriptsFound.includes(hotspot.transcriptId)) ||
            (hotspot.puzzleId && puzzlesSolved.includes(hotspot.puzzleId));

          const doorUnlocked =
            hotspot.type === 'door' &&
            (!hotspot.requiredPuzzleForDoor ||
              puzzlesSolved.includes(hotspot.requiredPuzzleForDoor)) &&
            (!hotspot.requiredItemForDoor ||
              inventory.includes(hotspot.requiredItemForDoor));

          return (
            <InteractiveHotspotNode
              key={hotspot.id}
              hotspot={hotspot}
              channel={channel}
              isFocused={focusedHotspotId === hotspot.id}
              isNextRecommended={recommendedHotspotId === hotspot.id}
              isCompletedOrCollected={Boolean(isDone)}
              doorUnlocked={doorUnlocked}
              hideHtmlOverlay={isModalOpen}
              onSelect={interactWithHotspot}
              onFocusChange={setFocusedHotspotId}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
