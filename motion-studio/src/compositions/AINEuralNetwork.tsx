import React from "react";
import {
  AbsoluteFill,
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  springPresets,
  getSpringValue,
  interpolateSafe,
  clamp,
  getInOutOpacity,
  slideIn,
  palettes,
  KineticTitle,
  ParticleField,
  CameraRig,
  VignetteOverlay,
  GridBackdrop,
  LightSweep,
  GlowDefs,
} from "../library";

const { width, height, fps, durationInFrames } = {
  width: 1920,
  height: 1080,
  fps: 60,
  durationInFrames: 1800,
};

const SCENE_DURATION = 360;
const TOTAL_SCENES = 5;

const palette = palettes.cyberpunk;
const bgPalette = palettes.deepSpace;

const cyberAccent = palette.accent;
const cyberAccentSecondary = palette.accentSecondary;
const cyberGlow = palette.glow;
const deepSpaceBg = bgPalette.background;
const deepSpaceSurface = bgPalette.surface;
const deepSpaceTextPrimary = bgPalette.textPrimary;
const deepSpaceTextSecondary = bgPalette.textSecondary;
const deepSpaceAccent = bgPalette.accent;
const deepSpaceAccentSecondary = bgPalette.accentSecondary;

const GlowText = ({
  children,
  x,
  y,
  scale = 1,
  opacity = 1,
  color = deepSpaceTextPrimary,
  fontSize = 48,
  fontWeight = 600,
  textAlign = "center",
}: {
  children: React.ReactNode;
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: "center" | "left" | "right";
}) => (
  <text
    x={x}
    y={y}
    textAnchor={textAlign === "center" ? "middle" : textAlign === "left" ? "start" : "end"}
    dominantBaseline="middle"
    fill={color}
    fontSize={fontSize}
    fontWeight={fontWeight}
    fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
    opacity={opacity}
    transform={`scale(${scale})`}
    transformOrigin={`${x}px ${y}px`}
    filter="url(#glow)"
  >
    {children}
  </text>
);

const NeuralNode = ({
  cx,
  cy,
  r,
  pulse,
  color = cyberAccent,
  glowIntensity = 1,
}: {
  cx: number;
  cy: number;
  r: number;
  pulse: number;
  color?: string;
  glowIntensity?: number;
}) => (
  <g filter="url(#glow)">
    <circle
      cx={cx}
      cy={cy}
      r={r * (1 + pulse * 0.3)}
      fill={color}
      opacity={0.9}
    />
    <circle
      cx={cx}
      cy={cy}
      r={r * (1 + pulse * 0.6) * glowIntensity}
      fill="none"
      stroke={color}
      strokeWidth={2}
      opacity={0.4 * glowIntensity}
    />
  </g>
);

const NeuralConnection = ({
  x1,
  y1,
  x2,
  y2,
  progress,
  color = cyberAccentSecondary,
  width = 2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  color?: string;
  width?: number;
}) => {
  const drawProgress = clamp(progress, 0, 1);
  if (drawProgress <= 0) return null;
  const cx = x1 + (x2 - x1) * drawProgress;
  const cy = y1 + (y2 - y1) * drawProgress;
  return (
    <g filter="url(#glow)">
      <line
        x1={x1}
        y1={y1}
        x2={cx}
        y2={cy}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        opacity={0.7}
      />
      <circle
        cx={cx}
        cy={cy}
        r={width * 3}
        fill={color}
        opacity={0.9}
      />
    </g>
  );
};

const Badge = ({
  x,
  y,
  text,
  width = 400,
  height = 48,
  opacity = 1,
  glowColor = cyberAccent,
  bgColor = `${deepSpaceSurface}CC`,
  textColor = deepSpaceTextPrimary,
}: {
  x: number;
  y: number;
  text: string;
  width?: number;
  height?: number;
  opacity?: number;
  glowColor?: string;
  bgColor?: string;
  textColor?: string;
}) => (
  <g opacity={opacity} filter="url(#glow)">
    <rect
      x={x - width / 2}
      y={y - height / 2}
      width={width}
      height={height}
      rx={8}
      fill={bgColor}
      stroke={glowColor}
      strokeWidth={2}
    />
    <GlowText
      x={x}
      y={y}
      fontSize={20}
      fontWeight={600}
      color={textColor}
      opacity={1}
    >
      {text}
    </GlowText>
  </g>
);

const Scene01_Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const titleScale = getSpringValue(localFrame, fps, "cinematic", 0);
  const titleOpacity = getInOutOpacity(localFrame, SCENE_DURATION, 60);
  const subtitleOpacity = getInOutOpacity(localFrame - 60, SCENE_DURATION - 60, 40);
  const badgeOpacity = getInOutOpacity(localFrame - 120, SCENE_DURATION - 120, 40);
  const particleIntensity = getSpringValue(localFrame, fps, "gentle", 0);

  return (
    <AbsoluteFill style={{ background: deepSpaceBg }}>
      <GlowDefs />
      <GridBackdrop />
      <ParticleField />
      <CameraRig durationFrames={SCENE_DURATION}>
        <KineticTitle
          text="ARTIFICIAL INTELLIGENCE"
          fontSize={72}
          fontWeight={800}
          color={deepSpaceTextPrimary}
          staggerFrames={3}
        />
        <GlowText
          x={width / 2}
          y={height / 2 + 30}
          fontSize={36}
          fontWeight={400}
          color={deepSpaceTextSecondary}
          opacity={subtitleOpacity}
          scale={1}
        >
          NEURAL NETWORKS DEMYSTIFIED
        </GlowText>
        <Badge
          x={width / 2}
          y={height / 2 + 110}
          text="DEEP LEARNING • MACHINE LEARNING • AI"
          width={600}
          height={56}
          opacity={badgeOpacity}
          glowColor={cyberAccent}
          textColor={cyberAccent}
        />
      </CameraRig>
      <VignetteOverlay intensity={0.4} color={deepSpaceBg} />
      <LightSweep
        color={cyberAccent}
        angle={-45}
      />
    </AbsoluteFill>
  );
};

const Scene02_Neuron = () => {
  const frame = useCurrentFrame();
  const localFrame = frame - SCENE_DURATION;

  const neuronPulse = getSpringValue(localFrame, fps, "smooth", 0);
  const inputOpacity = getInOutOpacity(localFrame, SCENE_DURATION, 30);
  const weightOpacity = getInOutOpacity(localFrame - 60, SCENE_DURATION - 60, 30);
  const sumOpacity = getInOutOpacity(localFrame - 120, SCENE_DURATION - 120, 30);
  const activationOpacity = getInOutOpacity(localFrame - 180, SCENE_DURATION - 180, 30);
  const outputOpacity = getInOutOpacity(localFrame - 240, SCENE_DURATION - 240, 30);
  const labelOpacity = getInOutOpacity(localFrame - 300, SCENE_DURATION - 300, 30);

  const centerX = width / 2;
  const centerY = height / 2;
  const neuronR = 60;

  const inputs = [
    { x: centerX - 350, y: centerY - 150, label: "x₁", value: 0.8 },
    { x: centerX - 350, y: centerY - 50, label: "x₂", value: -0.3 },
    { x: centerX - 350, y: centerY + 50, label: "x₃", value: 0.5 },
    { x: centerX - 350, y: centerY + 150, label: "xₙ", value: 0.1 },
  ];

  const weights = [0.6, -0.4, 0.9, 0.2];

  return (
    <AbsoluteFill style={{ background: deepSpaceBg }}>
      <GlowDefs />
      <GridBackdrop />
      <CameraRig durationFrames={SCENE_DURATION}>
        <KineticTitle
          text="THE ARTIFICIAL NEURON"
          fontSize={56}
          fontWeight={700}
          color={deepSpaceTextPrimary}
          staggerFrames={2}
        />

        {inputs.map((input, i) => {
          const weightProgress = interpolateSafe(localFrame, [60 + i * 30, 120 + i * 30], [0, 1]);
          const signalProgress = interpolateSafe(localFrame, [90 + i * 30, 150 + i * 30], [0, 1]);
          return (
            <g key={i} opacity={inputOpacity}>
              <GlowText
                x={input.x}
                y={input.y}
                fontSize={28}
                fontWeight={600}
                color={cyberAccent}
                opacity={1}
              >
                {input.label} = {input.value}
              </GlowText>
              <NeuralConnection
                x1={input.x + 60}
                y1={input.y}
                x2={centerX - neuronR}
                y2={centerY}
                progress={signalProgress}
                color={weights[i] > 0 ? cyberAccent : cyberAccentSecondary}
                width={Math.abs(weights[i]) * 4 + 1}
              />
              <GlowText
                x={input.x + 180}
                y={input.y - 30}
                fontSize={20}
                fontWeight={500}
                color={deepSpaceTextSecondary}
                opacity={weightOpacity}
              >
                w = {weights[i]}
              </GlowText>
            </g>
          );
        })}

        <g opacity={sumOpacity}>
          <GlowText
            x={centerX - 200}
            y={centerY - 100}
            fontSize={24}
            fontWeight={600}
            color={cyberAccentSecondary}
            textAlign="left"
          >
            Σ (Weighted Sum)
          </GlowText>
          <GlowText
            x={centerX - 200}
            y={centerY - 60}
            fontSize={20}
            fontWeight={400}
            color={deepSpaceTextSecondary}
            textAlign="left"
          >
            z = Σ(w₁ · x₁) + b
          </GlowText>
        </g>

        <NeuralNode
          cx={centerX}
          cy={centerY}
          r={neuronR}
          pulse={neuronPulse}
          color={cyberAccent}
          glowIntensity={1.5}
        />

        <g opacity={activationOpacity}>
          <GlowText
            x={centerX + 200}
            y={centerY - 100}
            fontSize={24}
            fontWeight={600}
            color={deepSpaceAccent}
            textAlign="left"
          >
            σ (Activation)
          </GlowText>
          <GlowText
            x={centerX + 200}
            y={centerY - 60}
            fontSize={20}
            fontWeight={400}
            color={deepSpaceTextSecondary}
            textAlign="left"
          >
            ReLU(z) = max(0, z)
          </GlowText>
          <GlowText
            x={centerX + 200}
            y={centerY - 20}
            fontSize={20}
            fontWeight={400}
            color={deepSpaceTextSecondary}
            textAlign="left"
          >
            Sigmoid(z) = 1/(1+e⁻ºz)
          </GlowText>
          <GlowText
            x={centerX + 200}
            y={centerY + 20}
            fontSize={20}
            fontWeight={400}
            color={deepSpaceTextSecondary}
            textAlign="left"
          >
            Tanh(z) = (eºz-e⁻ºz)/(eºz+e⁻ºz)
          </GlowText>
        </g>

        <NeuralConnection
          x1={centerX + neuronR}
          y1={centerY}
          x2={centerX + 350}
          y2={centerY}
          progress={interpolateSafe(localFrame, [180, 240], [0, 1])}
          color={cyberAccent}
          width={3}
        />

        <g opacity={outputOpacity}>
          <GlowText
            x={centerX + 400}
            y={centerY}
            fontSize={32}
            fontWeight={700}
            color={cyberAccent}
            textAlign="left"
          >
            ŷ = 0.847
          </GlowText>
        </g>

        {inputs.map((input, i) => (
          <NeuralNode
            key={`in-${i}`}
            cx={input.x}
            cy={input.y}
            r={20}
            pulse={neuronPulse * 0.5}
            color={cyberAccentSecondary}
            glowIntensity={0.8}
          />
        ))}

        <g opacity={labelOpacity}>
          <Badge
            x={centerX}
            y={height - 100}
            text="INPUT LAYER → WEIGHTS → SUM → ACTIVATION → OUTPUT"
            width={1000}
            height={48}
            glowColor={cyberAccentSecondary}
            textColor={deepSpaceTextPrimary}
          />
        </g>
      </CameraRig>
      <VignetteOverlay intensity={0.3} color={deepSpaceBg} />
    </AbsoluteFill>
  );
};

const Scene03_Network = () => {
  const frame = useCurrentFrame();
  const localFrame = frame - SCENE_DURATION * 2;

  const layerReveal = getSpringValue(localFrame, fps, "bouncy", 0);
  const connectionFlow = interpolateSafe(localFrame, [60, 300], [0, 1]);
  const labelOpacity = getInOutOpacity(localFrame - 120, SCENE_DURATION - 120, 30);

  const layerConfigs = [
    { name: "INPUT", count: 7, x: width * 0.12, color: cyberAccentSecondary },
    { name: "HIDDEN 1", count: 12, x: width * 0.35, color: cyberAccent },
    { name: "HIDDEN 2", count: 12, x: width * 0.55, color: cyberAccent },
    { name: "HIDDEN 3", count: 8, x: width * 0.75, color: deepSpaceAccent },
    { name: "OUTPUT", count: 3, x: width * 0.9, color: deepSpaceAccentSecondary },
  ];

  return (
    <AbsoluteFill style={{ background: deepSpaceBg }}>
      <GlowDefs />
      <GridBackdrop />
      <ParticleField />
      <CameraRig durationFrames={SCENE_DURATION}>
        <KineticTitle
          text="DEEP NEURAL NETWORK ARCHITECTURE"
          fontSize={52}
          fontWeight={700}
          color={deepSpaceTextPrimary}
          staggerFrames={2}
        />

        {layerConfigs.map((layer, layerIdx) => {
          const layerDelay = layerIdx * 40;
          const layerProgress = interpolateSafe(localFrame, [layerDelay, layerDelay + 80], [0, 1]);
          const nodeRadius = 18;

          return (
            <g key={layer.name} opacity={layerProgress}>
              <GlowText
                x={layer.x}
                y={60}
                fontSize={20}
                fontWeight={700}
                color={layer.color}
                textAlign="center"
              >
                {layer.name}
              </GlowText>
              <GlowText
                x={layer.x}
                y={height - 60}
                fontSize={16}
                fontWeight={500}
                color={deepSpaceTextSecondary}
                textAlign="center"
              >
                {layer.count} neurons
              </GlowText>

              {Array.from({ length: layer.count }, (_, i) => {
                const y = height * 0.2 + (height * 0.6 * i) / (layer.count - 1 || 1);
                const nodePulse = getSpringValue(localFrame - layerDelay - i * 5, fps, "gentle", 0);
                return (
                  <NeuralNode
                    key={`${layer.name}-${i}`}
                    cx={layer.x}
                    cy={y}
                    r={nodeRadius}
                    pulse={nodePulse * layerProgress}
                    color={layer.color}
                    glowIntensity={layerProgress}
                  />
                );
              })}

              {layerIdx < layerConfigs.length - 1 && (
                <g opacity={connectionFlow * layerProgress}>
                  {Array.from({ length: layer.count }, (_, i) => {
                    const y1 = height * 0.2 + (height * 0.6 * i) / (layer.count - 1 || 1);
                    const nextLayer = layerConfigs[layerIdx + 1];
                    return Array.from({ length: nextLayer.count }, (_, j) => {
                      const y2 = height * 0.2 + (height * 0.6 * j) / (nextLayer.count - 1 || 1);
                      const delay = (i * nextLayer.count + j) * 0.5;
                      const prog = clamp(connectionFlow - delay * 0.002, 0, 1);
                      return (
                        <NeuralConnection
                          key={`${layer.name}-${i}-${nextLayer.name}-${j}`}
                          x1={layer.x + nodeRadius}
                          y1={y1}
                          x2={nextLayer.x - nodeRadius}
                          y2={y2}
                          progress={prog}
                          color={layer.color}
                          width={0.5}
                        />
                      );
                    });
                  })}
                </g>
              )}
            </g>
          );
        })}

        <g opacity={labelOpacity}>
          <Badge
            x={width / 2}
            y={height - 100}
            text="FEEDFORWARD: x → Hidden Layers (ReLU) → Output (Softmax/Sigmoid)"
            width={1100}
            height={48}
            glowColor={cyberAccent}
            textColor={deepSpaceTextPrimary}
          />
        </g>
      </CameraRig>
      <VignetteOverlay intensity={0.35} color={deepSpaceBg} />
      <LightSweep
        color={cyberAccent}
        angle={30}
      />
    </AbsoluteFill>
  );
};

const Scene04_Training = () => {
  const frame = useCurrentFrame();
  const localFrame = frame - SCENE_DURATION * 3;

  const epochCycle = localFrame % 180;
  const epochProgress = epochCycle / 180;
  const totalEpochs = Math.floor(localFrame / 180) + 1;
  const lossValue = Math.max(0.02, 2.5 * Math.exp(-totalEpochs * 0.15) + Math.sin(localFrame * 0.1) * 0.1);
  const accuracyValue = Math.min(0.99, 1 - Math.exp(-totalEpochs * 0.12));

  const forwardPass = interpolateSafe(epochCycle, [0, 60], [0, 1]);
  const lossCalc = interpolateSafe(epochCycle, [50, 100], [0, 1]);
  const backprop = interpolateSafe(epochCycle, [90, 150], [0, 1]);
  const weightUpdate = interpolateSafe(epochCycle, [140, 180], [0, 1]);
  const metricsOpacity = getInOutOpacity(localFrame, SCENE_DURATION, 30);

  return (
    <AbsoluteFill style={{ background: deepSpaceBg }}>
      <GlowDefs />
      <GridBackdrop />
      <CameraRig durationFrames={SCENE_DURATION}>
        <KineticTitle
          text="BACKPROPAGATION & GRADIENT DESCENT"
          fontSize={52}
          fontWeight={700}
          color={deepSpaceTextPrimary}
          staggerFrames={2}
        />

        <g transform={`translate(${width * 0.1}, ${height * 0.2})`}>
          <GlowText
            x={0}
            y={-40}
            fontSize={24}
            fontWeight={600}
            color={cyberAccentSecondary}
            textAlign="left"
          >
            FORWARD PASS
          </GlowText>
          <GlowText
            x={0}
            y={0}
            fontSize={18}
            fontWeight={400}
            color={deepSpaceTextSecondary}
            opacity={forwardPass}
            textAlign="left"
          >
            Input → Hidden Layers → Output → Loss
          </GlowText>
          <NeuralNode
            cx={0}
            cy={60}
            r={30}
            pulse={forwardPass}
            color={cyberAccentSecondary}
            glowIntensity={forwardPass}
          />
        </g>

        <g transform={`translate(${width * 0.5}, ${height * 0.2})`}>
          <GlowText
            x={0}
            y={-40}
            fontSize={24}
            fontWeight={600}
            color={cyberAccentSecondary}
            textAlign="left"
          >
            LOSS CALCULATION
          </GlowText>
          <GlowText
            x={0}
            y={0}
            fontSize={18}
            fontWeight={400}
            color={deepSpaceTextSecondary}
            opacity={lossCalc}
            textAlign="left"
          >
            L = ½(y - ŷ)²  (MSE)  or  CrossEntropy
          </GlowText>
          <GlowText
            x={0}
            y={60}
            fontSize={36}
            fontWeight={700}
            color={lossValue > 0.5 ? cyberAccentSecondary : deepSpaceAccentSecondary}
            opacity={lossCalc}
            textAlign="left"
          >
            Loss: {lossValue.toFixed(4)}
          </GlowText>
        </g>

        <g transform={`translate(${width * 0.1}, ${height * 0.6})`}>
          <GlowText
            x={0}
            y={-40}
            fontSize={24}
            fontWeight={600}
            color={cyberAccent}
            textAlign="left"
          >
            BACKPROPAGATION
          </GlowText>
          <GlowText
            x={0}
            y={0}
            fontSize={18}
            fontWeight={400}
            color={deepSpaceTextSecondary}
            opacity={backprop}
            textAlign="left"
          >
            ∂L/∂w = ∂L/∂ŷ · ∂ŷ/∂z · ∂z/∂w  (Chain Rule)
          </GlowText>
          <NeuralConnection
            x1={0}
            y1={60}
            x2={200}
            y2={60}
            progress={backprop}
            color={cyberAccent}
            width={3}
          />
        </g>

        <g transform={`translate(${width * 0.5}, ${height * 0.6})`}>
          <GlowText
            x={0}
            y={-40}
            fontSize={24}
            fontWeight={600}
            color={deepSpaceAccent}
            textAlign="left"
          >
            WEIGHT UPDATE
          </GlowText>
          <GlowText
            x={0}
            y={0}
            fontSize={18}
            fontWeight={400}
            color={deepSpaceTextSecondary}
            opacity={weightUpdate}
            textAlign="left"
          >
            w ← w - η · ∂L/∂w  (Learning Rate η)
          </GlowText>
          <GlowText
            x={0}
            y={60}
            fontSize={18}
            fontWeight={400}
            color={deepSpaceTextSecondary}
            opacity={weightUpdate}
            textAlign="left"
          >
            Adam / SGD / RMSprop Optimizers
          </GlowText>
        </g>

        <g opacity={metricsOpacity} transform={`translate(${width * 0.5}, ${height - 180})`}>
          <Badge
            x={0}
            y={0}
            text={`EPOCH ${totalEpochs}  |  ACCURACY: ${(accuracyValue * 100).toFixed(1)}%  |  LR: 0.001`}
            width={600}
            height={48}
            glowColor={accuracyValue > 0.9 ? deepSpaceAccentSecondary : cyberAccent}
            textColor={accuracyValue > 0.9 ? deepSpaceAccentSecondary : deepSpaceTextPrimary}
          />
        </g>

        <g transform={`translate(${width - 350}, ${height * 0.35})`} opacity={metricsOpacity}>
          <GlowText
            x={0}
            y={0}
            fontSize={20}
            fontWeight={600}
            color={deepSpaceTextPrimary}
            textAlign="right"
          >
            TRAINING METRICS
          </GlowText>
          <rect
            x={-300}
            y={30}
            width={300}
            height={150}
            fill={`${deepSpaceSurface}80`}
            rx={8}
            stroke={deepSpaceAccentSecondary}
            strokeWidth={1}
          />
          {Array.from({ length: 50 }, (_, i) => {
            const x = -290 + i * 6;
            const epochLoss = 2.5 * Math.exp(-i * 0.1) + Math.sin(i * 0.5) * 0.15;
            const h = Math.min(130, (epochLoss / 2.5) * 130);
            return (
              <rect
                key={i}
                x={x}
                y={170 - h}
                width={4}
                height={h}
                fill={epochLoss > 0.5 ? cyberAccentSecondary : deepSpaceAccentSecondary}
                opacity={0.7}
              />
            );
          })}
        </g>
      </CameraRig>
      <VignetteOverlay intensity={0.3} color={deepSpaceBg} />
    </AbsoluteFill>
  );
};

const Scene05_Applications = () => {
  const frame = useCurrentFrame();
  const localFrame = frame - SCENE_DURATION * 4;

  const cardReveal = getSpringValue(localFrame, fps, "bouncy", 0);
  const finalOpacity = getInOutOpacity(localFrame, SCENE_DURATION, 60);

  const applications = [
    {
      icon: "📈",
      title: "COMPUTER VISION",
      desc: "Image classification, object detection,\nface recognition, medical imaging",
      color: cyberAccent,
      delay: 0,
    },
    {
      icon: "💬",
      title: "NATURAL LANGUAGE",
      desc: "Translation, chatbots, sentiment analysis,\ntext generation, code completion",
      color: cyberAccentSecondary,
      delay: 60,
    },
    {
      icon: "🎮",
      title: "REINFORCEMENT LEARNING",
      desc: "Game AI (AlphaGo), robotics,\nautonomous vehicles, resource optimization",
      color: deepSpaceAccent,
      delay: 120,
    },
    {
      icon: "🔬",
      title: "SCIENTIFIC DISCOVERY",
      desc: "Protein folding, drug discovery,\nclimate modeling, particle physics",
      color: deepSpaceAccentSecondary,
      delay: 180,
    },
    {
      icon: "🎨",
      title: "GENERATIVE AI",
      desc: "Art, music, video synthesis,\n3D generation, creative tools",
      color: cyberGlow,
      delay: 240,
    },
  ];

  return (
    <AbsoluteFill style={{ background: deepSpaceBg }}>
      <GlowDefs />
      <GridBackdrop />
      <ParticleField />
      <CameraRig durationFrames={SCENE_DURATION}>
        <KineticTitle
          text="REAL-WORLD APPLICATIONS"
          fontSize={52}
          fontWeight={700}
          color={deepSpaceTextPrimary}
          staggerFrames={2}
        />

        {applications.map((app, i) => {
          const cardProgress = interpolateSafe(localFrame, [app.delay, app.delay + 100], [0, 1]);
          const cardScale = 0.9 + cardReveal * 0.1;
          const x = width * 0.15 + (i % 3) * width * 0.3;
          const y = height * 0.25 + Math.floor(i / 3) * height * 0.35;

          return (
            <g
              key={app.title}
              opacity={cardProgress * finalOpacity}
              transform={`translate(${x}, ${y}) scale(${cardScale})`}
              transformOrigin={`${x}px ${y}px`}
            >
              <rect
                x={-180}
                y={-80}
                width={360}
                height={200}
                rx={16}
                fill={`${app.color}15`}
                stroke={app.color}
                strokeWidth={2}
                filter="url(#glow)"
              />
              <GlowText
                x={0}
                y={-80}
                fontSize={48}
                fontWeight={400}
                color={app.color}
                opacity={1}
              >
                {app.icon}
              </GlowText>
              <GlowText
                x={0}
                y={-10}
                fontSize={22}
                fontWeight={700}
                color={deepSpaceTextPrimary}
              >
                {app.title}
              </GlowText>
              <GlowText
                x={0}
                y={50}
                fontSize={16}
                fontWeight={400}
                color={deepSpaceTextSecondary}
                textAlign="center"
              >
                {app.desc}
              </GlowText>
            </g>
          );
        })}

        <g opacity={finalOpacity}>
          <Badge
            x={width / 2}
            y={height - 100}
            text="NEURAL NETWORKS: THE FOUNDATION OF MODERN AI"
            width={800}
            height={56}
            glowColor={cyberAccent}
            textColor={deepSpaceTextPrimary}
          />
        </g>
      </CameraRig>
      <VignetteOverlay intensity={0.4} color={deepSpaceBg} />
      <LightSweep
        color={cyberAccent}
        angle={-30}
      />
    </AbsoluteFill>
  );
};

export const AINEuralNetwork = () => {
  return (
    <>
      <GlowDefs />
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <Scene01_Intro />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <Scene02_Neuron />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <Scene03_Network />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <Scene04_Training />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <Scene05_Applications />
        </Series.Sequence>
      </Series>
    </>
  );
};

AINEuralNetwork.config = {
  durationInFrames,
  fps,
  width,
  height,
};