"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useCompanionState, type Expression } from "@/store/useCompanionState";

// ─── Configuration ───────────────────────────────────────────────────────────
const COLORS = {
  skin: "#F5D0B0",
  skinShadow: "#E8B896",
  skinHighlight: "#FDE4CC",
  hair: "#4A2C17",
  hairHighlight: "#6B3D22",
  eyeWhite: "#FFFFFF",
  iris: "#5B8FAF",
  irisDark: "#3A6B8A",
  pupil: "#1A1A2E",
  eyebrow: "#3D2314",
  lips: "#D4837A",
  lipsDark: "#C06B62",
  shirtBase: "#A8D5E2",
  shirtShadow: "#8BC0D0",
  shirtHighlight: "#BFE3ED",
  pants: "#D4C5A0",
  blush: "rgba(230, 150, 140, 0.25)",
  eyelash: "#2A1810",
};

interface AnimState {
  // Idle
  breathPhase: number;
  blinkTimer: number;
  blinkProgress: number; // 0=open, 1=closed
  isBlinking: boolean;
  nextBlinkIn: number;
  idleSwayPhase: number;
  microEyeX: number;
  microEyeY: number;
  microEyeTimer: number;

  // Tracking
  targetEyeX: number;
  targetEyeY: number;
  currentEyeX: number;
  currentEyeY: number;
  targetHeadX: number;
  targetHeadY: number;
  currentHeadX: number;
  currentHeadY: number;

  // Expression
  currentExpression: Expression;
  mouthSmile: number; // -1 to 1 (frown to smile)
  mouthOpen: number; // 0 to 1
  eyebrowRaise: number; // -1 to 1
  eyeSize: number; // 0.8 to 1.2

  // Gesture
  rightArmAngle: number;
  rightArmTarget: number;
  rightHandY: number;
  rightHandTargetY: number;
  leftArmAngle: number;
  leftArmTarget: number;
  wavePhase: number;

  // Speech bubble
  speechOpacity: number;
}

function createInitialAnimState(): AnimState {
  return {
    breathPhase: 0,
    blinkTimer: 0,
    blinkProgress: 0,
    isBlinking: false,
    nextBlinkIn: 3000 + Math.random() * 4000,
    idleSwayPhase: 0,
    microEyeX: 0,
    microEyeY: 0,
    microEyeTimer: 0,

    targetEyeX: 0,
    targetEyeY: 0,
    currentEyeX: 0,
    currentEyeY: 0,
    targetHeadX: 0,
    targetHeadY: 0,
    currentHeadX: 0,
    currentHeadY: 0,

    currentExpression: "idle",
    mouthSmile: 0.3,
    mouthOpen: 0,
    eyebrowRaise: 0,
    eyeSize: 1,

    rightArmAngle: 0,
    rightArmTarget: 0,
    rightHandY: 0,
    rightHandTargetY: 0,
    leftArmAngle: 0,
    leftArmTarget: 0,
    wavePhase: 0,

    speechOpacity: 0,
  };
}

// ─── Expression Presets ──────────────────────────────────────────────────────
const EXPRESSION_PRESETS: Record<Expression, { smile: number; mouthOpen: number; eyebrowRaise: number; eyeSize: number }> = {
  idle: { smile: 0.3, mouthOpen: 0, eyebrowRaise: 0, eyeSize: 1 },
  happy: { smile: 0.9, mouthOpen: 0.2, eyebrowRaise: 0.2, eyeSize: 1.1 },
  concerned: { smile: -0.3, mouthOpen: 0.05, eyebrowRaise: 0.5, eyeSize: 1.15 },
  thinking: { smile: 0.1, mouthOpen: 0, eyebrowRaise: 0.3, eyeSize: 0.95 },
  serious: { smile: -0.1, mouthOpen: 0, eyebrowRaise: -0.2, eyeSize: 0.9 },
  greeting: { smile: 0.8, mouthOpen: 0.35, eyebrowRaise: 0.4, eyeSize: 1.15 },
  celebrating: { smile: 1.0, mouthOpen: 0.4, eyebrowRaise: 0.5, eyeSize: 1.2 },
};

// ─── Lerp helper ─────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Component ───────────────────────────────────────────────────────────────
interface SafeSphereCompanionProps {
  width?: number;
  height?: number;
  mode?: "full" | "bust" | "avatar";
  className?: string;
}

export default function SafeSphereCompanion({
  width = 280,
  height = 400,
  mode = "bust",
  className = "",
}: SafeSphereCompanionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animStateRef = useRef<AnimState>(createInitialAnimState());
  const mouseRef = useRef({ x: 0.5, y: 0.5 }); // normalized 0–1
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  const { expression, gesture, speechText, isSpeaking, isListening } = useCompanionState();

  // ─── Mouse tracking ──────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Check reduced motion preference
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mql.matches;
    const handler = (e: MediaQueryListEvent) => { prefersReducedMotion.current = e.matches; };
    mql.addEventListener("change", handler);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      mql.removeEventListener("change", handler);
    };
  }, []);

  // ─── Drawing functions ────────────────────────────────────────────
  const drawCharacter = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, anim: AnimState, dpr: number) => {
    ctx.clearRect(0, 0, w * dpr, h * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const scale = Math.min(w / 280, h / 400);
    const breathOffset = Math.sin(anim.breathPhase) * 2 * scale;
    const swayOffset = Math.sin(anim.idleSwayPhase) * 1.5 * scale;
    const headRotation = anim.currentHeadX * 0.08; // radians, subtle

    // Character origin
    const originY = mode === "avatar" ? h * 0.5 : h * 0.55;

    ctx.save();
    ctx.translate(cx + swayOffset, originY + breathOffset);

    // ─── Body / Shirt ──────────────────────────────────────
    if (mode !== "avatar") {
      drawBody(ctx, scale, anim);
    }

    // ─── Neck ──────────────────────────────────────────────
    drawNeck(ctx, scale);

    // ─── Head (with rotation) ──────────────────────────────
    ctx.save();
    ctx.translate(anim.currentHeadX * 3 * scale, anim.currentHeadY * 2 * scale);
    ctx.rotate(headRotation * 0.15);

    drawHead(ctx, scale);
    drawEars(ctx, scale);
    drawFace(ctx, scale, anim);
    drawHair(ctx, scale, anim);

    ctx.restore(); // head transform

    // ─── Arms ──────────────────────────────────────────────
    if (mode !== "avatar") {
      drawArms(ctx, scale, anim);
    }

    ctx.restore(); // main transform

    // ─── Speech bubble ─────────────────────────────────────
    if (anim.speechOpacity > 0.01 && speechText) {
      drawSpeechBubble(ctx, cx, originY - 130 * scale, w, speechText, anim.speechOpacity, scale);
    }

    ctx.restore(); // dpr scale
  }, [mode, speechText]);

  // ─── Body Drawing ──────────────────────────────────────────────
  function drawBody(ctx: CanvasRenderingContext2D, s: number, anim: AnimState) {
    // Shirt / torso
    ctx.save();
    ctx.scale(1, 1 + Math.sin(anim.breathPhase) * 0.008);

    // Torso shape
    ctx.beginPath();
    ctx.moveTo(-45 * s, -30 * s);
    ctx.bezierCurveTo(-50 * s, 20 * s, -40 * s, 80 * s, -30 * s, 120 * s);
    ctx.lineTo(30 * s, 120 * s);
    ctx.bezierCurveTo(40 * s, 80 * s, 50 * s, 20 * s, 45 * s, -30 * s);
    ctx.closePath();

    // Shirt gradient
    const shirtGrad = ctx.createLinearGradient(-45 * s, -30 * s, 45 * s, 120 * s);
    shirtGrad.addColorStop(0, COLORS.shirtHighlight);
    shirtGrad.addColorStop(0.5, COLORS.shirtBase);
    shirtGrad.addColorStop(1, COLORS.shirtShadow);
    ctx.fillStyle = shirtGrad;
    ctx.fill();

    // Collar
    ctx.beginPath();
    ctx.moveTo(-15 * s, -35 * s);
    ctx.lineTo(-5 * s, -20 * s);
    ctx.lineTo(0, -25 * s);
    ctx.lineTo(5 * s, -20 * s);
    ctx.lineTo(15 * s, -35 * s);
    ctx.strokeStyle = COLORS.shirtShadow;
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();

    // Button line
    ctx.beginPath();
    ctx.moveTo(0, -20 * s);
    ctx.lineTo(0, 80 * s);
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 1 * s;
    ctx.stroke();

    // Buttons
    for (let i = 0; i < 4; i++) {
      const by = -10 * s + i * 22 * s;
      ctx.beginPath();
      ctx.arc(0, by, 2.5 * s, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fill();
    }

    ctx.restore();
  }

  // ─── Neck ─────────────────────────────────────────────────────
  function drawNeck(ctx: CanvasRenderingContext2D, s: number) {
    ctx.beginPath();
    ctx.moveTo(-12 * s, -35 * s);
    ctx.bezierCurveTo(-12 * s, -55 * s, 12 * s, -55 * s, 12 * s, -35 * s);
    const neckGrad = ctx.createLinearGradient(-12 * s, -55 * s, 12 * s, -35 * s);
    neckGrad.addColorStop(0, COLORS.skin);
    neckGrad.addColorStop(1, COLORS.skinShadow);
    ctx.fillStyle = neckGrad;
    ctx.fill();
  }

  // ─── Head ─────────────────────────────────────────────────────
  function drawHead(ctx: CanvasRenderingContext2D, s: number) {
    // Main head shape - oval
    ctx.beginPath();
    ctx.ellipse(0, -85 * s, 48 * s, 55 * s, 0, 0, Math.PI * 2);

    const headGrad = ctx.createRadialGradient(-10 * s, -95 * s, 5 * s, 0, -85 * s, 55 * s);
    headGrad.addColorStop(0, COLORS.skinHighlight);
    headGrad.addColorStop(0.6, COLORS.skin);
    headGrad.addColorStop(1, COLORS.skinShadow);
    ctx.fillStyle = headGrad;
    ctx.fill();

    // Chin definition
    ctx.beginPath();
    ctx.ellipse(0, -38 * s, 22 * s, 12 * s, 0, 0, Math.PI);
    ctx.fillStyle = COLORS.skin;
    ctx.fill();
  }

  // ─── Ears ─────────────────────────────────────────────────────
  function drawEars(ctx: CanvasRenderingContext2D, s: number) {
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.ellipse(side * 47 * s, -85 * s, 8 * s, 12 * s, side * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.skinShadow;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(side * 47 * s, -85 * s, 5 * s, 8 * s, side * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.skin;
      ctx.fill();
    });
  }

  // ─── Face ─────────────────────────────────────────────────────
  function drawFace(ctx: CanvasRenderingContext2D, s: number, anim: AnimState) {
    const eyeY = -90 * s;
    const eyeSpacing = 22 * s;
    const eyeH = 14 * s * anim.eyeSize;
    const eyeW = 16 * s * anim.eyeSize;
    const blinkFactor = 1 - anim.blinkProgress;

    // ─── Blush ───────────────────────────
    ctx.beginPath();
    ctx.ellipse(-28 * s, -72 * s, 12 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.blush;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(28 * s, -72 * s, 12 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.blush;
    ctx.fill();

    // ─── Eyes ────────────────────────────
    [-1, 1].forEach((side) => {
      const ex = side * eyeSpacing;

      // Eye white
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeW, eyeH * blinkFactor, 0, 0, Math.PI * 2);
      ctx.clip();

      // White
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.eyeWhite;
      ctx.fill();

      if (blinkFactor > 0.1) {
        // Iris
        const irisOffsetX = (anim.currentEyeX + anim.microEyeX) * 5 * s;
        const irisOffsetY = (anim.currentEyeY + anim.microEyeY) * 3 * s;
        const irisR = 8 * s * anim.eyeSize;

        const irisGrad = ctx.createRadialGradient(
          ex + irisOffsetX, eyeY + irisOffsetY, irisR * 0.1,
          ex + irisOffsetX, eyeY + irisOffsetY, irisR
        );
        irisGrad.addColorStop(0, COLORS.iris);
        irisGrad.addColorStop(0.7, COLORS.irisDark);
        irisGrad.addColorStop(1, COLORS.irisDark);

        ctx.beginPath();
        ctx.arc(ex + irisOffsetX, eyeY + irisOffsetY, irisR, 0, Math.PI * 2);
        ctx.fillStyle = irisGrad;
        ctx.fill();

        // Pupil
        ctx.beginPath();
        ctx.arc(ex + irisOffsetX, eyeY + irisOffsetY, 4 * s, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.pupil;
        ctx.fill();

        // Eye highlight
        ctx.beginPath();
        ctx.arc(ex + irisOffsetX - 2 * s, eyeY + irisOffsetY - 3 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fill();

        // Secondary highlight
        ctx.beginPath();
        ctx.arc(ex + irisOffsetX + 2 * s, eyeY + irisOffsetY + 1 * s, 1.2 * s, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fill();
      }

      ctx.restore();

      // Eyelashes (top)
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeW + 1 * s, (eyeH + 1 * s) * blinkFactor, 0, Math.PI + 0.3, -0.3);
      ctx.strokeStyle = COLORS.eyelash;
      ctx.lineWidth = 2.2 * s;
      ctx.lineCap = "round";
      ctx.stroke();

      // Lower lash line
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeW * 0.85, eyeH * 0.7 * blinkFactor, 0, 0.3, Math.PI - 0.3);
      ctx.strokeStyle = "rgba(42,24,16,0.3)";
      ctx.lineWidth = 1 * s;
      ctx.stroke();
    });

    // ─── Eyebrows ────────────────────────
    [-1, 1].forEach((side) => {
      const bx = side * eyeSpacing;
      const by = eyeY - 18 * s - anim.eyebrowRaise * 4 * s;

      ctx.beginPath();
      ctx.moveTo(bx - side * 14 * s, by + 2 * s);
      ctx.quadraticCurveTo(bx, by - 4 * s - anim.eyebrowRaise * 2 * s, bx + side * 14 * s, by + 3 * s);
      ctx.strokeStyle = COLORS.eyebrow;
      ctx.lineWidth = 3 * s;
      ctx.lineCap = "round";
      ctx.stroke();
    });

    // ─── Nose ────────────────────────────
    ctx.beginPath();
    ctx.moveTo(0, -78 * s);
    ctx.quadraticCurveTo(4 * s, -68 * s, 1 * s, -63 * s);
    ctx.strokeStyle = "rgba(200,160,130,0.5)";
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = "round";
    ctx.stroke();

    // Nostril hint
    ctx.beginPath();
    ctx.arc(-3 * s, -63 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200,160,130,0.3)";
    ctx.fill();

    // ─── Mouth ───────────────────────────
    const mouthY = -52 * s;
    const smileAmount = anim.mouthSmile;
    const openAmount = anim.mouthOpen;

    // Upper lip
    ctx.beginPath();
    ctx.moveTo(-12 * s, mouthY);
    ctx.quadraticCurveTo(-6 * s, mouthY - 3 * s * smileAmount, 0, mouthY - 1 * s);
    ctx.quadraticCurveTo(6 * s, mouthY - 3 * s * smileAmount, 12 * s, mouthY);
    ctx.strokeStyle = COLORS.lips;
    ctx.lineWidth = 2.5 * s;
    ctx.lineCap = "round";
    ctx.stroke();

    if (openAmount > 0.05) {
      // Open mouth
      ctx.beginPath();
      ctx.moveTo(-10 * s, mouthY + 1 * s);
      ctx.quadraticCurveTo(0, mouthY + 12 * s * openAmount, 10 * s, mouthY + 1 * s);
      ctx.quadraticCurveTo(0, mouthY - 2 * s * smileAmount, -10 * s, mouthY + 1 * s);
      ctx.fillStyle = "#C06060";
      ctx.fill();

      // Teeth hint
      if (openAmount > 0.2) {
        ctx.beginPath();
        ctx.moveTo(-7 * s, mouthY + 1 * s);
        ctx.quadraticCurveTo(0, mouthY + 4 * s, 7 * s, mouthY + 1 * s);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fill();
      }
    }

    // Lower lip (closed mouth)
    if (openAmount <= 0.05) {
      ctx.beginPath();
      ctx.moveTo(-8 * s, mouthY + 2 * s);
      ctx.quadraticCurveTo(0, mouthY + 5 * s + smileAmount * 3 * s, 8 * s, mouthY + 2 * s);
      ctx.strokeStyle = COLORS.lipsDark;
      ctx.lineWidth = 1.5 * s;
      ctx.stroke();
    }

    // Smile lines (dimples)
    if (smileAmount > 0.4) {
      const dimpleAlpha = (smileAmount - 0.4) * 0.5;
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.arc(side * 16 * s, mouthY + 2 * s, 3 * s, side > 0 ? -0.5 : Math.PI + 0.5, side > 0 ? 0.5 : Math.PI - 0.5);
        ctx.strokeStyle = `rgba(200,150,130,${dimpleAlpha})`;
        ctx.lineWidth = 1 * s;
        ctx.stroke();
      });
    }
  }

  // ─── Hair ─────────────────────────────────────────────────────
  function drawHair(ctx: CanvasRenderingContext2D, s: number, anim: AnimState) {
    const hairBounce = Math.sin(anim.breathPhase * 0.7) * 1 * s;

    // Back hair volume
    ctx.beginPath();
    ctx.ellipse(0, -90 * s, 52 * s, 60 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.hair;
    ctx.fill();

    // Main hair shape (covers top of head)
    ctx.beginPath();
    ctx.moveTo(-48 * s, -75 * s);
    ctx.bezierCurveTo(-52 * s, -110 * s, -40 * s, -145 * s, -10 * s, -148 * s + hairBounce);
    ctx.bezierCurveTo(20 * s, -150 * s + hairBounce, 50 * s, -130 * s, 48 * s, -100 * s);
    ctx.bezierCurveTo(50 * s, -80 * s, 48 * s, -70 * s, 45 * s, -65 * s);
    // Side fringe going down to ear on right
    ctx.bezierCurveTo(48 * s, -60 * s, 50 * s, -55 * s, 48 * s, -50 * s);

    const hairGrad = ctx.createLinearGradient(-30 * s, -150 * s, 30 * s, -60 * s);
    hairGrad.addColorStop(0, COLORS.hairHighlight);
    hairGrad.addColorStop(0.4, COLORS.hair);
    hairGrad.addColorStop(1, COLORS.hair);
    ctx.fillStyle = hairGrad;
    ctx.fill();

    // Bun
    ctx.beginPath();
    ctx.ellipse(5 * s, -145 * s + hairBounce, 22 * s, 20 * s, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.hair;
    ctx.fill();

    // Bun highlight
    ctx.beginPath();
    ctx.ellipse(2 * s, -150 * s + hairBounce, 10 * s, 8 * s, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.hairHighlight;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Side fringe strands
    ctx.beginPath();
    ctx.moveTo(-42 * s, -80 * s);
    ctx.bezierCurveTo(-50 * s, -75 * s, -52 * s, -65 * s, -45 * s, -55 * s);
    ctx.strokeStyle = COLORS.hair;
    ctx.lineWidth = 6 * s;
    ctx.lineCap = "round";
    ctx.stroke();

    // Hair shine line
    ctx.beginPath();
    ctx.moveTo(-20 * s, -135 * s + hairBounce);
    ctx.quadraticCurveTo(0, -140 * s + hairBounce, 20 * s, -130 * s);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 3 * s;
    ctx.stroke();
  }

  // ─── Arms ─────────────────────────────────────────────────────
  function drawArms(ctx: CanvasRenderingContext2D, s: number, anim: AnimState) {
    // Left arm (subtle)
    ctx.save();
    ctx.translate(-45 * s, -20 * s);
    ctx.rotate(anim.leftArmAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-15 * s, 30 * s, -20 * s, 60 * s, -15 * s, 90 * s);
    ctx.strokeStyle = COLORS.shirtBase;
    ctx.lineWidth = 18 * s;
    ctx.lineCap = "round";
    ctx.stroke();
    // Hand
    ctx.beginPath();
    ctx.ellipse(-15 * s, 93 * s, 8 * s, 9 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.skin;
    ctx.fill();
    ctx.restore();

    // Right arm
    ctx.save();
    ctx.translate(45 * s, -20 * s);
    ctx.rotate(anim.rightArmAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(15 * s, 30 * s, 20 * s, 60 * s, 15 * s + anim.rightHandY * 0.3, 90 * s - Math.abs(anim.rightArmAngle) * 50);
    ctx.strokeStyle = COLORS.shirtBase;
    ctx.lineWidth = 18 * s;
    ctx.lineCap = "round";
    ctx.stroke();
    // Hand
    const handY = 93 * s - Math.abs(anim.rightArmAngle) * 55;
    ctx.beginPath();
    ctx.ellipse(15 * s + anim.rightHandY * 0.3, handY, 8 * s, 9 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.skin;
    ctx.fill();

    // Thumb up gesture
    if (Math.abs(anim.rightArmAngle) > 0.3) {
      ctx.beginPath();
      ctx.moveTo(15 * s + anim.rightHandY * 0.3, handY - 8 * s);
      ctx.lineTo(15 * s + anim.rightHandY * 0.3 + 2 * s, handY - 18 * s);
      ctx.strokeStyle = COLORS.skin;
      ctx.lineWidth = 5 * s;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    ctx.restore();
  }

  // ─── Speech Bubble ────────────────────────────────────────────
  function drawSpeechBubble(ctx: CanvasRenderingContext2D, x: number, y: number, maxW: number, text: string, opacity: number, s: number) {
    ctx.save();
    ctx.globalAlpha = opacity;

    const padding = 12 * s;
    ctx.font = `${11 * s}px Inter, system-ui, sans-serif`;
    const metrics = ctx.measureText(text);
    const textW = Math.min(metrics.width, maxW * 0.85);
    const bubbleW = textW + padding * 2;
    const bubbleH = 32 * s;
    const bx = x - bubbleW / 2;
    const by = y - bubbleH;

    // Bubble shadow
    ctx.beginPath();
    ctx.roundRect(bx + 2, by + 2, bubbleW, bubbleH, 12 * s);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fill();

    // Bubble
    ctx.beginPath();
    ctx.roundRect(bx, by, bubbleW, bubbleH, 12 * s);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "rgba(74, 222, 128, 0.3)";
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(x - 6 * s, by + bubbleH);
    ctx.lineTo(x, by + bubbleH + 8 * s);
    ctx.lineTo(x + 6 * s, by + bubbleH);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // Text
    ctx.fillStyle = "#1F2937";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, by + bubbleH / 2, maxW * 0.85);

    ctx.restore();
  }

  // ─── Animation Loop ──────────────────────────────────────────
  const updateAndDraw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dt = lastTimeRef.current ? Math.min(timestamp - lastTimeRef.current, 50) : 16;
    lastTimeRef.current = timestamp;

    const anim = animStateRef.current;
    const reduced = prefersReducedMotion.current;
    const dtSec = dt / 1000;

    // ─── Update idle animations ────────────────────────
    if (!reduced) {
      anim.breathPhase += dtSec * 2.1;
      anim.idleSwayPhase += dtSec * 1.2;
    }

    // ─── Blinking ──────────────────────────────────────
    anim.blinkTimer += dt;
    if (!anim.isBlinking && anim.blinkTimer >= anim.nextBlinkIn) {
      anim.isBlinking = true;
      anim.blinkTimer = 0;
    }
    if (anim.isBlinking) {
      anim.blinkProgress += dtSec * 12;
      if (anim.blinkProgress >= 1) {
        anim.blinkProgress = 1;
        // Start opening
        anim.isBlinking = false;
      }
    } else if (anim.blinkProgress > 0) {
      anim.blinkProgress -= dtSec * 10;
      if (anim.blinkProgress <= 0) {
        anim.blinkProgress = 0;
        anim.nextBlinkIn = 2000 + Math.random() * 4000;
      }
    }

    // ─── Micro eye movements ───────────────────────────
    anim.microEyeTimer += dt;
    if (anim.microEyeTimer > 800 + Math.random() * 1500) {
      anim.microEyeX = (Math.random() - 0.5) * 0.3;
      anim.microEyeY = (Math.random() - 0.5) * 0.2;
      anim.microEyeTimer = 0;
    }

    // ─── Cursor tracking ───────────────────────────────
    let mx = (mouseRef.current.x - 0.5) * 2; // -1 to 1
    let my = (mouseRef.current.y - 0.5) * 2;
    
    if (isListening) {
      // Subtly lean in and tilt when listening
      mx = lerp(mx, 0.4, 0.05);
      my = lerp(my, -0.2, 0.05);
    }
    
    anim.targetEyeX = mx;
    anim.targetEyeY = my * 0.7;
    anim.targetHeadX = mx * 0.6;
    anim.targetHeadY = my * 0.3;

    const trackSpeed = reduced ? 1 : 0.08;
    anim.currentEyeX = lerp(anim.currentEyeX, anim.targetEyeX, trackSpeed);
    anim.currentEyeY = lerp(anim.currentEyeY, anim.targetEyeY, trackSpeed);
    anim.currentHeadX = lerp(anim.currentHeadX, anim.targetHeadX, 0.05);
    anim.currentHeadY = lerp(anim.currentHeadY, anim.targetHeadY, 0.04);

    // ─── Expression transitions ────────────────────────
    const preset = EXPRESSION_PRESETS[expression] || EXPRESSION_PRESETS.idle;
    const exprSpeed = 0.06;
    
    let targetMouthOpen = preset.mouthOpen;
    if (isSpeaking) {
      // Procedural lip sync
      targetMouthOpen = preset.mouthOpen + Math.abs(Math.sin(timestamp * 0.015)) * 0.3;
    }
    
    anim.mouthSmile = lerp(anim.mouthSmile, preset.smile, exprSpeed);
    anim.mouthOpen = lerp(anim.mouthOpen, targetMouthOpen, exprSpeed * 4); // faster mouth lerp
    anim.eyebrowRaise = lerp(anim.eyebrowRaise, preset.eyebrowRaise, exprSpeed);
    anim.eyeSize = lerp(anim.eyeSize, preset.eyeSize, exprSpeed);

    // ─── Gesture arm animation ─────────────────────────
    if (gesture === "wave") {
      anim.rightArmTarget = -0.8;
      anim.wavePhase += dtSec * 8;
      anim.rightHandTargetY = Math.sin(anim.wavePhase) * 15;
    } else if (gesture === "thumbsUp") {
      anim.rightArmTarget = -0.6;
      anim.rightHandTargetY = 0;
    } else if (gesture === "point") {
      anim.rightArmTarget = -0.5;
      anim.rightHandTargetY = 10;
    } else if (gesture === "thinking") {
      anim.rightArmTarget = -0.3;
      anim.rightHandTargetY = -5;
    } else {
      anim.rightArmTarget = 0;
      anim.rightHandTargetY = 0;
      anim.wavePhase = 0;
    }

    anim.rightArmAngle = lerp(anim.rightArmAngle, anim.rightArmTarget, 0.06);
    anim.rightHandY = lerp(anim.rightHandY, anim.rightHandTargetY, 0.08);

    // ─── Speech bubble ─────────────────────────────────
    const speechTarget = speechText ? 1 : 0;
    anim.speechOpacity = lerp(anim.speechOpacity, speechTarget, 0.1);

    // ─── Draw ──────────────────────────────────────────
    const dpr = window.devicePixelRatio || 1;
    drawCharacter(ctx, width, height, anim, dpr);

    frameRef.current = requestAnimationFrame(updateAndDraw);
  }, [expression, gesture, speechText, isSpeaking, isListening, width, height, drawCharacter]);

  // ─── Canvas setup & animation start ───────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    frameRef.current = requestAnimationFrame(updateAndDraw);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [width, height, updateAndDraw]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width, height }}
      aria-label="SafeSphere AI Companion"
      role="img"
    />
  );
}
