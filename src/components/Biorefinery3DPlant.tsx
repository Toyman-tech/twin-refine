'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { CompleteModelOutput } from '../lib/types';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Layers,
  Zap,
  Info,
  Maximize2,
  Sliders,
  Flame,
  Droplets,
  Wind,
  Compass,
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Gauge,
  Maximize,
  Minimize
} from 'lucide-react';

interface Biorefinery3DPlantProps {
  data: CompleteModelOutput;
  onInspectUnit?: (unitId: string) => void;
}

type StreamFilter = 'all' | 'juice' | 'solids' | 'vapor' | 'thermal';
type ColorMode = 'physical' | 'thermal';
type CameraPreset = 'all' | 'reactor' | 'clarifier' | 'evaporator' | 'dryer' | 'storage';

interface LabelPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  visible: boolean;
  telemetry: string;
  subText: string;
  badgeColor: string;
}

export const Biorefinery3DPlant: React.FC<Biorefinery3DPlantProps> = ({ data, onInspectUnit }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Playback & Flow Simulation Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [flowSpeedFactor, setFlowSpeedFactor] = useState<number>(1);
  const [activeStreamFilter, setActiveStreamFilter] = useState<StreamFilter>('all');
  const [colorMode, setColorMode] = useState<ColorMode>('physical');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('all');
  const [showFlowArrows, setShowFlowArrows] = useState<boolean>(true);
  const [showBadges, setShowBadges] = useState<boolean>(true);
  const [particleDensity, setParticleDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Dynamic 3D telemetry badges mapped to viewport pixel coordinates
  const [badgePositions, setBadgePositions] = useState<LabelPosition[]>([]);

  // Camera preset target coordinates
  const presetCameraTargets = useMemo(() => ({
    all: { pos: new THREE.Vector3(25, 20, 32), look: new THREE.Vector3(0, 1.5, -3) },
    reactor: { pos: new THREE.Vector3(-10, 9, 14), look: new THREE.Vector3(-10, 2.5, 0) },
    clarifier: { pos: new THREE.Vector3(-2, 8, 12), look: new THREE.Vector3(-2, 2.0, 0) },
    evaporator: { pos: new THREE.Vector3(6, 9, 14), look: new THREE.Vector3(6, 3.0, 0) },
    dryer: { pos: new THREE.Vector3(0, 10, 2), look: new THREE.Vector3(-1, 1.5, -10) },
    storage: { pos: new THREE.Vector3(16, 8, 12), look: new THREE.Vector3(14, 2.0, 0) },
  }), []);

  const currentCameraTargetRef = useRef(presetCameraTargets.all);

  useEffect(() => {
    currentCameraTargetRef.current = presetCameraTargets[cameraPreset];
  }, [cameraPreset, presetCameraTargets]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 500;

    // 1. SCENE & CAMERA SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.copy(currentCameraTargetRef.current.pos);
    const currentLookAt = currentCameraTargetRef.current.look.clone();
    camera.lookAt(currentLookAt);

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. LIGHTING SYSTEM
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.8);
    dirLight.position.set(25, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    scene.add(dirLight);

    const secondaryLight = new THREE.DirectionalLight(0xf59e0b, 1.2);
    secondaryLight.position.set(-20, 20, -15);
    scene.add(secondaryLight);

    const reactorSpot = new THREE.PointLight(0xf43f5e, 2, 20);
    reactorSpot.position.set(-10, 4, 0);
    scene.add(reactorSpot);

    const evapSpot = new THREE.PointLight(0xa855f7, 2, 20);
    evapSpot.position.set(6, 4, 0);
    scene.add(evapSpot);

    // 4. INDUSTRIAL FLOOR & PLATFORM GRID
    const gridHelper = new THREE.GridHelper(60, 60, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Tech Floor Slab
    const floorGeo = new THREE.BoxGeometry(56, 0.4, 38);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090e1a,
      roughness: 0.85,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, -0.2, -3);
    floor.receiveShadow = true;
    scene.add(floor);

    // Safety Yellow Boundary Lines on Floor
    const boundaryGeo = new THREE.BoxGeometry(54, 0.02, 36);
    const boundaryMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true });
    const boundary = new THREE.Mesh(boundaryGeo, boundaryMat);
    boundary.position.set(0, 0.01, -3);
    scene.add(boundary);

    // 5. EQUIPMENT CREATION & INTERACTIVE MESH GROUP
    const equipmentGroup = new THREE.Group();
    scene.add(equipmentGroup);

    // Materials Library
    const stainlessMetalMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.25, metalness: 0.85 });
    const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.9 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });
    const cyanGlassMat = new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5, roughness: 0.1, transmission: 0.7 });
    const roseGlassMat = new THREE.MeshPhysicalMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.55, roughness: 0.1, transmission: 0.6 });
    const amberGlassMat = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6, roughness: 0.15 });
    const purpleGlassMat = new THREE.MeshPhysicalMaterial({ color: 0xa855f7, transparent: true, opacity: 0.55, roughness: 0.1, transmission: 0.65 });
    const fluidCyanMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.8 });
    const fluidAmberMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85 });

    // --- UNIT 0: FEED HOPPER & SCREW PRESS (-18, 0, 0) ---
    const feedGroup = new THREE.Group();
    feedGroup.position.set(-18, 0, 0);
    feedGroup.userData = { id: 'press', name: 'Screw Press & Intake' };

    const hopperGeo = new THREE.CylinderGeometry(2.2, 0.9, 2.8, 16);
    const hopper = new THREE.Mesh(hopperGeo, stainlessMetalMat);
    hopper.position.y = 2.8;
    hopper.castShadow = true;
    feedGroup.add(hopper);

    const pressBodyGeo = new THREE.BoxGeometry(4.2, 1.8, 2.0);
    const pressBody = new THREE.Mesh(pressBodyGeo, darkSteelMat);
    pressBody.position.y = 0.9;
    pressBody.castShadow = true;
    feedGroup.add(pressBody);

    // Rotating Auger Shaft inside press
    const augerGeo = new THREE.CylinderGeometry(0.3, 0.3, 3.8, 12);
    augerGeo.rotateZ(Math.PI / 2);
    const auger = new THREE.Mesh(augerGeo, brassMat);
    auger.position.set(0, 0.9, 0);
    feedGroup.add(auger);

    equipmentGroup.add(feedGroup);

    // --- UNIT 1: HYDROTHERMAL REACTOR (-10, 0, 0) ---
    const reactorGroup = new THREE.Group();
    reactorGroup.position.set(-10, 0, 0);
    reactorGroup.userData = { id: 'reactor', name: 'Hydrothermal Reactor' };

    const reactorVesselGeo = new THREE.CylinderGeometry(1.8, 1.8, 4.2, 24);
    const reactorVessel = new THREE.Mesh(reactorVesselGeo, roseGlassMat);
    reactorVessel.position.y = 2.6;
    reactorGroup.add(reactorVessel);

    const reactorCapGeo = new THREE.SphereGeometry(1.8, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const reactorCap = new THREE.Mesh(reactorCapGeo, stainlessMetalMat);
    reactorCap.position.y = 4.7;
    reactorGroup.add(reactorCap);

    const agitatorMotorGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.0, 16);
    const agitatorMotor = new THREE.Mesh(agitatorMotorGeo, darkSteelMat);
    agitatorMotor.position.y = 5.7;
    reactorGroup.add(agitatorMotor);

    // Internal Rotating Agitator Impeller
    const agitatorShaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8, 8);
    const agitatorShaft = new THREE.Mesh(agitatorShaftGeo, stainlessMetalMat);
    agitatorShaft.position.y = 2.6;
    reactorGroup.add(agitatorShaft);

    const impellerBladeGeo = new THREE.BoxGeometry(1.4, 0.12, 0.3);
    const impeller1 = new THREE.Mesh(impellerBladeGeo, brassMat);
    impeller1.position.y = 1.6;
    agitatorShaft.add(impeller1);

    const impeller2 = new THREE.Mesh(impellerBladeGeo, brassMat);
    impeller2.position.y = 3.0;
    impeller2.rotation.y = Math.PI / 2;
    agitatorShaft.add(impeller2);

    equipmentGroup.add(reactorGroup);

    // --- UNIT 2: GRAVITY CLARIFIER (-2, 0, 0) ---
    const clarifierGroup = new THREE.Group();
    clarifierGroup.position.set(-2, 0, 0);
    clarifierGroup.userData = { id: 'clarifier', name: 'Gravity Clarifier' };

    const clarifierCylinderGeo = new THREE.CylinderGeometry(2.5, 2.5, 2.6, 32);
    const clarifierCylinder = new THREE.Mesh(clarifierCylinderGeo, cyanGlassMat);
    clarifierCylinder.position.y = 3.0;
    clarifierGroup.add(clarifierCylinder);

    const coneGeo = new THREE.ConeGeometry(2.5, 2.0, 32);
    const cone = new THREE.Mesh(coneGeo, stainlessMetalMat);
    cone.position.y = 0.7;
    cone.rotation.x = Math.PI;
    clarifierGroup.add(cone);

    // Internal Liquid Surface Sheen
    const liquidSurfaceGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.1, 32);
    const liquidSurface = new THREE.Mesh(liquidSurfaceGeo, fluidCyanMat);
    liquidSurface.position.y = 4.1;
    clarifierGroup.add(liquidSurface);

    // Rotating Bottom Rake
    const rakeArmGeo = new THREE.BoxGeometry(4.2, 0.1, 0.2);
    const rakeArm = new THREE.Mesh(rakeArmGeo, darkSteelMat);
    rakeArm.position.y = 1.2;
    clarifierGroup.add(rakeArm);

    equipmentGroup.add(clarifierGroup);

    // --- UNIT 3: VACUUM EVAPORATOR (6, 0, 0) ---
    const evaporatorGroup = new THREE.Group();
    evaporatorGroup.position.set(6, 0, 0);
    evaporatorGroup.userData = { id: 'evaporator', name: 'Vacuum Evaporator' };

    const evapVesselGeo = new THREE.CylinderGeometry(2.0, 2.0, 4.8, 24);
    const evapVessel = new THREE.Mesh(evapVesselGeo, purpleGlassMat);
    evapVessel.position.y = 2.8;
    evaporatorGroup.add(evapVessel);

    const evapDomeGeo = new THREE.SphereGeometry(2.0, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const evapDome = new THREE.Mesh(evapDomeGeo, stainlessMetalMat);
    evapDome.position.y = 5.2;
    evaporatorGroup.add(evapDome);

    // Internal Boiling Fluid Level
    const evapFluidGeo = new THREE.CylinderGeometry(1.9, 1.9, 1.8, 24);
    const evapFluid = new THREE.Mesh(evapFluidGeo, fluidAmberMat);
    evapFluid.position.y = 1.3;
    evaporatorGroup.add(evapFluid);

    equipmentGroup.add(evaporatorGroup);

    // --- UNIT 4: SYRUP PRODUCT STORAGE TANK (14, 0, 0) ---
    const syrupTankGroup = new THREE.Group();
    syrupTankGroup.position.set(14, 0, 0);
    syrupTankGroup.userData = { id: 'syrup_tank', name: 'Syrup Storage Tank' };

    const tankGeo = new THREE.CylinderGeometry(2.2, 2.2, 4.5, 24);
    const tankMesh = new THREE.Mesh(tankGeo, stainlessMetalMat);
    tankMesh.position.y = 2.65;
    syrupTankGroup.add(tankMesh);

    // Sight Glass Level Tube
    const sightGlassGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.8, 8);
    const sightGlass = new THREE.Mesh(sightGlassGeo, amberGlassMat);
    sightGlass.position.set(2.3, 2.65, 0);
    syrupTankGroup.add(sightGlass);

    equipmentGroup.add(syrupTankGroup);

    // --- UNIT 5: SOLAR COLLECTOR FIELD (-10, 0, -10) ---
    const solarGroup = new THREE.Group();
    solarGroup.position.set(-10, 0, -10);
    solarGroup.userData = { id: 'solar', name: 'Solar Collector Array' };

    for (let i = 0; i < 4; i++) {
      const panelGeo = new THREE.BoxGeometry(3.2, 0.1, 2.2);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.95, roughness: 0.1 });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(i * 3.8 - 5.7, 1.4, 0);
      panel.rotation.x = Math.PI / 5; // Sun tilt angle
      panel.castShadow = true;
      solarGroup.add(panel);

      // Frame Legs
      const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 6);
      const leg1 = new THREE.Mesh(legGeo, darkSteelMat);
      leg1.position.set(i * 3.8 - 5.7, 0.7, 0.8);
      solarGroup.add(leg1);
    }
    equipmentGroup.add(solarGroup);

    // --- UNIT 6: TUNNEL DRYER (0, 0, -10) ---
    const dryerGroup = new THREE.Group();
    dryerGroup.position.set(0, 0, -10);
    dryerGroup.userData = { id: 'dryer', name: 'Tunnel Dryer' };

    const tunnelGeo = new THREE.BoxGeometry(11, 2.4, 3.2);
    const tunnel = new THREE.Mesh(tunnelGeo, amberGlassMat);
    tunnel.position.set(0, 1.4, 0);
    tunnel.castShadow = true;
    dryerGroup.add(tunnel);

    // Exhaust Stack
    const stackGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.5, 12);
    const stack = new THREE.Mesh(stackGeo, stainlessMetalMat);
    stack.position.set(3, 3.2, 0);
    dryerGroup.add(stack);

    equipmentGroup.add(dryerGroup);

    // --- UNIT 7: BIO-FLOUR SILO (10, 0, -10) ---
    const siloGroup = new THREE.Group();
    siloGroup.position.set(10, 0, -10);
    siloGroup.userData = { id: 'flour_silo', name: 'Bio-Flour Silo' };

    const siloBodyGeo = new THREE.CylinderGeometry(2.0, 2.0, 4.2, 24);
    const siloBody = new THREE.Mesh(siloBodyGeo, stainlessMetalMat);
    siloBody.position.y = 3.5;
    siloGroup.add(siloBody);

    const siloConeGeo = new THREE.ConeGeometry(2.0, 1.8, 24);
    const siloCone = new THREE.Mesh(siloConeGeo, stainlessMetalMat);
    siloCone.position.y = 0.9;
    siloCone.rotation.x = Math.PI;
    siloGroup.add(siloCone);

    equipmentGroup.add(siloGroup);

    // 6. PIPING PATHWAYS & FLOW CURVES DEFINITION
    const createPipeMesh = (points: THREE.Vector3[], color: number) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const pipeGeo = new THREE.TubeGeometry(curve, 48, 0.16, 10, false);
      const pipeMat = new THREE.MeshStandardMaterial({
        color: colorMode === 'thermal' ? 0x64748b : color,
        roughness: 0.3,
        metalness: 0.7,
        transparent: true,
        opacity: 0.85,
      });
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      scene.add(pipe);

      // Outer Glowing Sheath
      const outerPipeGeo = new THREE.TubeGeometry(curve, 48, 0.22, 10, false);
      const outerPipeMat = new THREE.MeshPhysicalMaterial({
        color: color,
        transparent: true,
        opacity: 0.2,
        roughness: 0.1,
      });
      const outerPipe = new THREE.Mesh(outerPipeGeo, outerPipeMat);
      scene.add(outerPipe);

      return curve;
    };

    // Curve 1: Raw Feed Intake
    const rawFeedCurve = createPipeMesh([
      new THREE.Vector3(-22, 4.5, 0),
      new THREE.Vector3(-18, 4.5, 0),
      new THREE.Vector3(-18, 3.8, 0),
    ], 0x92400e);

    // Curve 2: Raw Extracted Juice (Press -> Reactor)
    const rawJuiceCurve = createPipeMesh([
      new THREE.Vector3(-16, 1.2, 0),
      new THREE.Vector3(-13, 1.2, 0),
      new THREE.Vector3(-10, 3.6, 0),
    ], 0x06b6d4);

    // Curve 3: Reactor Pretreated Slurry (Reactor -> Clarifier)
    const reactorSlurryCurve = createPipeMesh([
      new THREE.Vector3(-10, 1.4, 0),
      new THREE.Vector3(-6, 1.4, 0),
      new THREE.Vector3(-2, 4.0, 0),
    ], 0xef4444);

    // Curve 4: Overhead Clarified Juice (Clarifier -> Evaporator)
    const clarifiedJuiceCurve = createPipeMesh([
      new THREE.Vector3(-2, 4.1, 0),
      new THREE.Vector3(2, 4.8, 0),
      new THREE.Vector3(6, 3.8, 0),
    ], 0x22d3ee);

    // Curve 5: Underflow Tannin Sludge (Clarifier Cone -> Sludge Bin)
    const sludgeCurve = createPipeMesh([
      new THREE.Vector3(-2, -0.1, 0),
      new THREE.Vector3(-2, -0.6, 2.5),
      new THREE.Vector3(-5, -0.6, 3.5),
    ], 0x78350f);

    // Curve 6: Concentrated Bio-Syrup (Evaporator -> Storage Tank)
    const syrupCurve = createPipeMesh([
      new THREE.Vector3(6, 1.0, 0),
      new THREE.Vector3(10, 1.0, 0),
      new THREE.Vector3(14, 2.5, 0),
    ], 0xf59e0b);

    // Curve 7: Evaporated Steam Vapor (Evaporator Top -> Vapor Condenser)
    const vaporCurve = createPipeMesh([
      new THREE.Vector3(6, 5.8, 0),
      new THREE.Vector3(6, 7.2, 0),
      new THREE.Vector3(9, 7.2, 2.5),
      new THREE.Vector3(9, 4.0, 4),
    ], 0x93c5fd);

    // Curve 8: Wet Bagasse Cake (Press -> Tunnel Dryer Inlet)
    const bagasseCurve = createPipeMesh([
      new THREE.Vector3(-18, 0.6, 0),
      new THREE.Vector3(-18, 0.6, -6),
      new THREE.Vector3(-5, 0.6, -10),
    ], 0xd97706);

    // Curve 9: Solar Hot Air Supply (Solar Field -> Tunnel Dryer)
    const solarHotAirCurve = createPipeMesh([
      new THREE.Vector3(-10, 2.2, -10),
      new THREE.Vector3(-6, 3.2, -10),
      new THREE.Vector3(-4, 2.4, -10),
    ], 0xfde047);

    // Curve 10: Dried Bio-Flour (Tunnel Dryer -> Silo)
    const flourCurve = createPipeMesh([
      new THREE.Vector3(5, 0.8, -10),
      new THREE.Vector3(8, 0.8, -10),
      new THREE.Vector3(10, 3.2, -10),
    ], 0xeab308);

    // 7. PARTICLES & DIRECTIONAL FLOW ARROW SYSTEMS
    const countMultiplier = particleDensity === 'high' ? 1.5 : particleDensity === 'low' ? 0.6 : 1.0;

    const createStreamParticles = (curve: THREE.CatmullRomCurve3, count: number, colorHex: number, size: number) => {
      const actualCount = Math.floor(count * countMultiplier);
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(actualCount * 3);
      const progress = new Float32Array(actualCount);

      for (let i = 0; i < actualCount; i++) {
        progress[i] = i / actualCount;
        const p = curve.getPoint(progress[i]);
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

      const mat = new THREE.PointsMaterial({
        color: colorHex,
        size,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });

      const pointsMesh = new THREE.Points(geo, mat);
      scene.add(pointsMesh);

      return { pointsMesh, progress, curve, actualCount };
    };

    // Flow Direction Cones (Arrows moving along pipe direction)
    const createDirectionArrows = (curve: THREE.CatmullRomCurve3, arrowCount: number, colorHex: number) => {
      const arrowGroup = new THREE.Group();
      const arrowConeGeo = new THREE.ConeGeometry(0.22, 0.5, 8);
      arrowConeGeo.rotateX(Math.PI / 2); // Point along +Z initially

      const arrowMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const arrows: { mesh: THREE.Mesh; progress: number }[] = [];

      for (let i = 0; i < arrowCount; i++) {
        const mesh = new THREE.Mesh(arrowConeGeo, arrowMat);
        const prog = i / arrowCount;
        const point = curve.getPoint(prog);
        const tangent = curve.getTangent(prog).normalize();

        mesh.position.copy(point);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
        arrowGroup.add(mesh);
        arrows.push({ mesh, progress: prog });
      }

      scene.add(arrowGroup);
      return { arrowGroup, arrows, curve };
    };

    // Stream Particle Systems Setup
    const rawFeedStream = createStreamParticles(rawFeedCurve, 40, 0x92400e, 0.45);
    const rawJuiceStream = createStreamParticles(rawJuiceCurve, 80, 0x06b6d4, 0.35);
    const reactorSlurryStream = createStreamParticles(reactorSlurryCurve, 90, 0xef4444, 0.4);
    const clarifiedJuiceStream = createStreamParticles(clarifiedJuiceCurve, 100, 0x22d3ee, 0.35);
    const sludgeStream = createStreamParticles(sludgeCurve, 40, 0x78350f, 0.45);
    const syrupStream = createStreamParticles(syrupCurve, 80, 0xf59e0b, 0.4);
    const vaporStream = createStreamParticles(vaporCurve, 60, 0xcbd5e1, 0.5);
    const bagasseStream = createStreamParticles(bagasseCurve, 90, 0xd97706, 0.45);
    const solarHotAirStream = createStreamParticles(solarHotAirCurve, 50, 0xfde047, 0.4);
    const flourStream = createStreamParticles(flourCurve, 60, 0xeab308, 0.4);

    // Directional Flow Arrows Setup
    const rawJuiceArrows = createDirectionArrows(rawJuiceCurve, 4, 0x06b6d4);
    const reactorSlurryArrows = createDirectionArrows(reactorSlurryCurve, 5, 0xef4444);
    const clarifiedJuiceArrows = createDirectionArrows(clarifiedJuiceCurve, 6, 0x22d3ee);
    const syrupArrows = createDirectionArrows(syrupCurve, 4, 0xf59e0b);
    const bagasseArrows = createDirectionArrows(bagasseCurve, 6, 0xd97706);
    const solarAirArrows = createDirectionArrows(solarHotAirCurve, 3, 0xfde047);

    // 8. INTERACTIVE RAYCASTING & MOUSE ORBIT
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let currentRotX = 0.45;
    let currentRotY = -0.55;
    let currentRadius = 42;

    const onPointerMove = (e: MouseEvent) => {
      const rect = domElem.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Handle Orbit Rotation Drag
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        currentRotY += deltaX * 0.005;
        currentRotX += deltaY * 0.005;
        currentRotX = Math.max(0.08, Math.min(Math.PI / 2.3, currentRotX));

        previousMousePosition = { x: e.clientX, y: e.clientY };
        return;
      }

      // Handle Hover Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(equipmentGroup.children, true);

      if (intersects.length > 0) {
        let topParent: THREE.Object3D | null = intersects[0].object;
        while (topParent && (!topParent.userData || !topParent.userData.id) && topParent.parent !== equipmentGroup) {
          topParent = topParent.parent;
        }

        if (topParent && topParent.userData && topParent.userData.id) {
          domElem.style.cursor = 'pointer';
          setHoveredUnit(topParent.userData.name || topParent.userData.id);
          return;
        }
      }

      domElem.style.cursor = 'grab';
      setHoveredUnit(null);
    };

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };

      // Raycast on click to inspect equipment
      const rect = domElem.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(equipmentGroup.children, true);

      if (intersects.length > 0) {
        let topParent: THREE.Object3D | null = intersects[0].object;
        while (topParent && (!topParent.userData || !topParent.userData.id) && topParent.parent !== equipmentGroup) {
          topParent = topParent.parent;
        }

        if (topParent && topParent.userData && topParent.userData.id) {
          const unitId = topParent.userData.id;
          setSelectedUnit(unitId);
          if (onInspectUnit) onInspectUnit(unitId);
        }
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      currentRadius += e.deltaY * 0.03;
      currentRadius = Math.max(15, Math.min(80, currentRadius));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousemove', onPointerMove);
    domElem.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    // 9. 3D WORLD COORDINATES FOR FLOATING BADGES
    const badgeWorldTargets = [
      { id: 'press', name: 'Intake & Press', pos: new THREE.Vector3(-18, 5.0, 0), telemetry: `${data.feedRateKgH} kg/h Feed`, subText: `Juice: ${data.juiceFlowKgH.toFixed(1)} kg/h`, color: 'border-cyan-500/40 text-cyan-300' },
      { id: 'reactor', name: 'Hydrothermal Reactor', pos: new THREE.Vector3(-10, 6.2, 0), telemetry: `${data.reactor.temperatureC}°C | ${data.reactor.residenceTimeMin} min`, subText: `Heat: ${data.reactor.heatingDutykW.toFixed(1)} kW`, color: 'border-rose-500/40 text-rose-300' },
      { id: 'clarifier', name: 'Stokes Clarifier', pos: new THREE.Vector3(-2, 5.4, 0), telemetry: `${data.clarifier.settlingVelocityMmPerS.toFixed(2)} mm/s Settling`, subText: `Juice: ${data.clarifiedJuiceKgH.toFixed(1)} kg/h`, color: 'border-cyan-400/40 text-cyan-300' },
      { id: 'evaporator', name: 'Vacuum Evaporator', pos: new THREE.Vector3(6, 6.4, 0), telemetry: `Brix ${data.evaporator.feedBrix}° -> ${data.evaporator.targetBrix}°`, subText: `Water Rem: ${data.evaporator.waterRemovalKgH.toFixed(1)} kg/h`, color: 'border-purple-400/40 text-purple-300' },
      { id: 'syrup_tank', name: 'Bio-Syrup Storage', pos: new THREE.Vector3(14, 5.2, 0), telemetry: `${data.evaporator.syrupOutputKgH.toFixed(1)} kg/h Syrup`, subText: `Val: $${data.tea.syrupRevenueUSDH.toFixed(2)}/h`, color: 'border-amber-400/40 text-amber-300' },
      { id: 'solar', name: 'Solar Thermal Field', pos: new THREE.Vector3(-10, 3.2, -10), telemetry: `${data.solar.solarDutykW.toFixed(1)} kW Solar Heat`, subText: `Solar Frac: ${data.solar.solarFractionPct.toFixed(0)}%`, color: 'border-yellow-400/40 text-yellow-300' },
      { id: 'dryer', name: 'Tunnel Dryer', pos: new THREE.Vector3(0, 4.0, -10), telemetry: `Flour: ${data.dryer.flourOutputKgH.toFixed(1)} kg/h`, subText: `Moisture: ${data.dryer.targetMoisturePct}%`, color: 'border-orange-400/40 text-amber-400' },
    ];

    // 10. MAIN ANIMATION LOOP
    let animationFrameId: number;
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth Camera Target Interpolation
      const targetPos = currentCameraTargetRef.current.pos;
      const targetLook = currentCameraTargetRef.current.look;

      if (cameraPreset !== 'all') {
        camera.position.lerp(targetPos, 0.05);
        currentLookAt.lerp(targetLook, 0.05);
        camera.lookAt(currentLookAt);
      } else {
        // Free Orbit Mode
        camera.position.x = currentRadius * Math.sin(currentRotY) * Math.cos(currentRotX);
        camera.position.z = currentRadius * Math.cos(currentRotY) * Math.cos(currentRotX);
        camera.position.y = currentRadius * Math.sin(currentRotX);
        camera.lookAt(0, 1.5, -2);
      }

      // Rotate Internal Vessel Mechanisms
      agitatorShaft.rotation.y += 0.06 * flowSpeedFactor;
      auger.rotation.x += 0.08 * flowSpeedFactor;
      rakeArm.rotation.y += 0.02 * flowSpeedFactor;

      // Pulse Fluid Surfaces
      evapFluid.scale.y = 1.0 + Math.sin(Date.now() * 0.005) * 0.04;

      // Update Stream Flow Particles & Direction Arrows if Playing
      if (isPlaying) {
        const baseSpeed = 0.0035 * (data.feedRateKgH / 150) * flowSpeedFactor;

        // Helper to update a particle system
        const updateStream = (streamObj: ReturnType<typeof createStreamParticles>, filterType: StreamFilter, speedMult: number = 1) => {
          const isVisible = activeStreamFilter === 'all' || activeStreamFilter === filterType;
          streamObj.pointsMesh.visible = isVisible;
          if (!isVisible) return;

          const posArr = streamObj.pointsMesh.geometry.attributes.position.array as Float32Array;
          const speed = baseSpeed * speedMult;

          for (let i = 0; i < streamObj.actualCount; i++) {
            streamObj.progress[i] = (streamObj.progress[i] + speed) % 1;
            const pt = streamObj.curve.getPoint(streamObj.progress[i]);

            // Add subtle fluid pulse jitter
            const jitter = (Math.sin(Date.now() * 0.01 + i) * 0.03);
            posArr[i * 3] = pt.x + jitter;
            posArr[i * 3 + 1] = pt.y + jitter;
            posArr[i * 3 + 2] = pt.z + jitter;
          }
          streamObj.pointsMesh.geometry.attributes.position.needsUpdate = true;
        };

        // Helper to update direction arrow movement & rotation
        const updateArrows = (arrowObj: ReturnType<typeof createDirectionArrows>, filterType: StreamFilter, speedMult: number = 1) => {
          const isVisible = showFlowArrows && (activeStreamFilter === 'all' || activeStreamFilter === filterType);
          arrowObj.arrowGroup.visible = isVisible;
          if (!isVisible) return;

          const speed = baseSpeed * speedMult;
          arrowObj.arrows.forEach((item) => {
            item.progress = (item.progress + speed) % 1;
            const pt = arrowObj.curve.getPoint(item.progress);
            const tan = arrowObj.curve.getTangent(item.progress).normalize();
            item.mesh.position.copy(pt);
            item.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
          });
        };

        // Update Streams & Arrows
        updateStream(rawFeedStream, 'solids', 0.8);
        updateStream(rawJuiceStream, 'juice', 1.0);
        updateStream(reactorSlurryStream, 'juice', 1.1);
        updateStream(clarifiedJuiceStream, 'juice', 1.2);
        updateStream(sludgeStream, 'solids', 0.6);
        updateStream(syrupStream, 'juice', 0.9);
        updateStream(vaporStream, 'vapor', 1.4);
        updateStream(bagasseStream, 'solids', 0.85);
        updateStream(solarHotAirStream, 'thermal', 1.5);
        updateStream(flourStream, 'solids', 0.9);

        updateArrows(rawJuiceArrows, 'juice', 1.0);
        updateArrows(reactorSlurryArrows, 'juice', 1.1);
        updateArrows(clarifiedJuiceArrows, 'juice', 1.2);
        updateArrows(syrupArrows, 'juice', 0.9);
        updateArrows(bagasseArrows, 'solids', 0.85);
        updateArrows(solarAirArrows, 'thermal', 1.5);
      }

      // 11. MAP 3D WORLD TARGETS TO 2D SCREEN POSITIONS FOR HTML BADGES
      if (showBadges) {
        const newPositions: LabelPosition[] = badgeWorldTargets.map((item) => {
          tempVec.copy(item.pos);
          tempVec.project(camera);

          const isBehind = tempVec.z > 1;
          const x = (tempVec.x * 0.5 + 0.5) * width;
          const y = (-(tempVec.y * 0.5) + 0.5) * height;

          return {
            id: item.id,
            name: item.name,
            x,
            y,
            visible: !isBehind && x > 20 && x < width - 20 && y > 20 && y < height - 20,
            telemetry: item.telemetry,
            subText: item.subText,
            badgeColor: item.color,
          };
        });
        setBadgePositions(newPositions);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. WINDOW RESIZE HANDLER
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousemove', onPointerMove);
      domElem.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      domElem.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [
    data,
    isPlaying,
    flowSpeedFactor,
    activeStreamFilter,
    colorMode,
    cameraPreset,
    particleDensity,
    showFlowArrows,
    showBadges,
    onInspectUnit,
  ]);

  return (
    <div className={`hmi-panel p-3 sm:p-4 mb-3 sm:mb-4 relative overflow-hidden transition-all ${isFullscreen ? 'fixed inset-2 z-50 bg-slate-950 flex flex-col' : ''}`}>
      {/* Top Header & Interactive Control Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute" />
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2">
              Interactive 3D Biorefinery Model & Flow Movement Dynamics
            </h3>
            <span className="text-[10px] text-slate-400 font-mono block">
              Multi-Phase Volumetric Stream Flow &amp; Unit Operations Digital Twin
            </span>
          </div>
        </div>

        {/* Viewport Control Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Play/Pause Stream Flow */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause Flow' : 'Resume Flow'}
          </button>

          {/* Flow Speed Multiplier */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
            {[0.5, 1, 2, 4].map((factor) => (
              <button
                key={factor}
                onClick={() => setFlowSpeedFactor(factor)}
                className={`px-2 py-0.5 rounded transition-all ${
                  flowSpeedFactor === factor ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {factor}x
              </button>
            ))}
          </div>

          {/* Stream Filter Toggle */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
            {(['all', 'juice', 'solids', 'vapor', 'thermal'] as StreamFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveStreamFilter(filter)}
                className={`px-2 py-0.5 rounded capitalize transition-all ${
                  activeStreamFilter === filter ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Show Flow Arrows Toggle */}
          <button
            onClick={() => setShowFlowArrows(!showFlowArrows)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all ${
              showFlowArrows
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Arrows
          </button>

          {/* Show 3D Telemetry Badges */}
          <button
            onClick={() => setShowBadges(!showBadges)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all ${
              showBadges
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Telemetry
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Camera Viewport Presets Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5 px-2 py-1.5 rounded-xl bg-slate-950/80 border border-slate-850 font-mono text-xs">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mr-1">
          Camera Views:
        </span>
        {[
          { id: 'all', label: '🌐 Full Plant Overview' },
          { id: 'reactor', label: '🧪 Pretreatment Reactor' },
          { id: 'clarifier', label: '💧 Stokes Clarifier' },
          { id: 'evaporator', label: '♨️ Vacuum Evaporator' },
          { id: 'dryer', label: '☀️ Solar Tunnel Dryer' },
          { id: 'storage', label: '🍯 Syrup & Silo Product' },
        ].map((preset) => (
          <button
            key={preset.id}
            onClick={() => setCameraPreset(preset.id as CameraPreset)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              cameraPreset === preset.id
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 3D CANVAS VIEWPORT CONTAINER */}
      <div
        ref={mountRef}
        className={`w-full rounded-xl bg-slate-950 border border-slate-800 relative cursor-grab active:cursor-grabbing overflow-hidden ${
          isFullscreen ? 'flex-1 min-h-0' : 'h-[420px] sm:h-[500px]'
        }`}
      >
        {/* Hover Equipment Notification Bar */}
        {hoveredUnit && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-cyan-500/40 px-4 py-1.5 rounded-full font-mono text-xs text-cyan-300 backdrop-blur-md shadow-lg pointer-events-none flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Click to inspect equations for: <strong>{hoveredUnit}</strong></span>
          </div>
        )}

        {/* Floating 3D Telemetry Badges Overlay */}
        {showBadges &&
          badgePositions.map(
            (badge) =>
              badge.visible && (
                <div
                  key={badge.id}
                  style={{ left: `${badge.x}px`, top: `${badge.y}px` }}
                  onClick={() => {
                    if (onInspectUnit) onInspectUnit(badge.id);
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 border p-2 rounded-lg font-mono text-[10px] shadow-xl backdrop-blur-md cursor-pointer hover:scale-105 transition-transform ${badge.badgeColor}`}
                >
                  <div className="font-bold flex items-center gap-1 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    {badge.name}
                  </div>
                  <div className="text-slate-200 mt-0.5">{badge.telemetry}</div>
                  <div className="text-slate-400 text-[9px]">{badge.subText}</div>
                </div>
              )
          )}

        {/* Floating Stream Color Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg font-mono text-[10px] space-y-1.5 pointer-events-none backdrop-blur-md shadow-md">
          <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1">
            Process Stream Dynamics:
          </div>
          <div className="flex items-center gap-2 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            Juice &amp; Clarified Hydrolysate Stream
          </div>
          <div className="flex items-center gap-2 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            Pretreated Hot Slurry Stream (90°C)
          </div>
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            Concentrated Bio-Syrup (65° Brix)
          </div>
          <div className="flex items-center gap-2 text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
            Bagasse Cake &amp; Flour Solids Stream
          </div>
          <div className="flex items-center gap-2 text-yellow-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
            Solar Heated Thermal Air Loop
          </div>
          <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-800">
            Left Click Drag to Rotate | Mouse Wheel to Zoom
          </div>
        </div>

        {/* Real-Time Plant Summary Telemetry Panel Overlay */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-cyan-500/30 p-2.5 rounded-lg font-mono text-xs flex items-center gap-4 backdrop-blur-md pointer-events-none shadow-md">
          <div>
            <span className="text-[9px] text-slate-400 block">Biomass Feed Rate:</span>
            <strong className="text-cyan-300">{data.feedRateKgH} kg/h</strong>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[9px] text-slate-400 block">Clarified Extract:</span>
            <strong className="text-emerald-400">{data.clarifiedJuiceKgH.toFixed(1)} kg/h</strong>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[9px] text-slate-400 block">Bio-Syrup Yield:</span>
            <strong className="text-amber-300">{data.evaporator.syrupOutputKgH.toFixed(1)} kg/h</strong>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[9px] text-slate-400 block">Flour Output:</span>
            <strong className="text-yellow-300">{data.dryer.flourOutputKgH.toFixed(1)} kg/h</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

