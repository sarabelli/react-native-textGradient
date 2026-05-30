import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, type TextStyle } from 'react-native';
import {
  Canvas,
  Text,
  LinearGradient,
  RadialGradient,
  vec,
  useFont,
  Group,
  BlurMask,
  Shadow,
  Circle,
} from '@shopify/react-native-skia';
import type { GradientTextProps } from './types';

function cycle<T>(arr: T[], shift: number): T[] {
  const c = [...arr];
  for (let i = 0; i < shift; i++) c.push(c.shift()!);
  return c;
}

export default function GradientText({
  children,
  colors = ['#667eea', '#764ba2'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  gradientType = 'linear',
  cx = 0.5,
  cy = 0.5,
  rx = 0.5,
  ry = 0.5,
  fontSize = 24,
  fontWeight = 'bold',
  fontFamily,
  strokeColor,
  strokeWidth,
  letterSpacing = 0,
  textAlign = 'left',
  lineHeight,
  shimmer = false,
  shimmerDuration = 2000,
  animated = false,
  animatedDuration = 3000,
  perLetter = false,
  blur,
  neon,
  neonColor = '#667eea',
  style,
}: GradientTextProps) {
  const text = typeof children === 'string' ? children : '';
  const lh = lineHeight ?? fontSize * 1.4;
  const lines = text.split('\n');
  const font = useFont(null, fontSize);

  // --- Animation state ---
  const [shimmerPos, setShimmerPos] = useState(0);
  const [colorShift, setColorShift] = useState(0);

  // Shimmer: ~60fps animation
  useEffect(() => {
    if (!shimmer) return;
    let raf: number;
    const startT = Date.now();
    const tick = () => {
      const t = ((Date.now() - startT) % shimmerDuration) / shimmerDuration;
      setShimmerPos(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shimmer, shimmerDuration]);

  // Animated colors
  useEffect(() => {
    if (!animated || colors.length < 2) return;
    const interval = setInterval(
      () => setColorShift((p) => (p + 1) % colors.length),
      animatedDuration / colors.length
    );
    return () => clearInterval(interval);
  }, [animated, animatedDuration, colors.length]);

  const currentColors = animated ? cycle(colors, colorShift) : colors;

  // --- Shader calculation ---
  const shaderProps = useMemo(() => {
    if (!shimmer) return { s: start, e: end };

    // Move a bright band across the gradient
    const pos = shimmerPos;
    const band = 0.3;
    const sX = start.x - band + pos * (1 + band * 2);
    const eX = end.x - band + pos * (1 + band * 2);
    return {
      s: { x: sX, y: start.y },
      e: { x: eX, y: end.y },
    };
  }, [shimmer, shimmerPos, start, end]);

  // --- Canvas dimensions ---
  const maxLineLen = Math.max(...lines.map((l) => l.length), 1);
  const charW = fontSize * 0.55;
  const cWidth = maxLineLen * charW + 20;
  const cHeight = lines.length * lh + 20;

  // --- Build gradient shader ---
  const renderShader = () => {
    const gradientColors = shimmer
      ? [
          currentColors[0],
          currentColors[0],
          '#ffffff',
          currentColors[currentColors.length - 1],
          currentColors[currentColors.length - 1],
        ]
      : currentColors;

    const positions = shimmer
      ? undefined
      : currentColors.map((_, i) => i / Math.max(currentColors.length - 1, 1));

    if (gradientType === 'radial') {
      return (
        <RadialGradient
          c={vec(cWidth * cx, cHeight * cy)}
          r={Math.max(cWidth * rx, cHeight * ry)}
          colors={gradientColors}
          positions={positions}
        />
      );
    }

    return (
      <LinearGradient
        start={vec(shaderProps.s.x * cWidth, shaderProps.s.y * cHeight)}
        end={vec(shaderProps.e.x * cWidth, shaderProps.e.y * cHeight)}
        colors={gradientColors}
        positions={positions}
      />
    );
  };

  // --- Per-letter mode (render each letter separately) ---
  if (perLetter) {
    return (
      <Canvas style={[styles.canvas, { width: cWidth, height: cHeight }, style]}>
        {lines.map((line, li) => {
          let xOff = 4;
          const lineWidth = line.length * charW;
          const alignX =
            textAlign === 'center'
              ? (cWidth - lineWidth) / 2
              : textAlign === 'right'
              ? cWidth - lineWidth - 4
              : 4;

          return line.split('').map((char, ci) => {
            const letterColors = cycle(currentColors, ci % currentColors.length);
            const lGrad =
              gradientType === 'radial' ? (
                <RadialGradient
                  c={vec(cWidth * cx, cHeight * cy)}
                  r={Math.max(cWidth * rx, cHeight * ry)}
                  colors={[letterColors[0], letterColors[letterColors.length - 1]]}
                />
              ) : (
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(charW, 0)}
                  colors={[letterColors[0], letterColors[letterColors.length - 1]]}
                />
              );

            const xPos = alignX + xOff;
            const charWAdj = charW + letterSpacing;
            xOff += charWAdj;

            return (
              <Group key={`${li}-${ci}`}>
                {blur && <BlurMask blur={blur} style="normal" />}
                {neon && (
                  <>
                    <Shadow dx={0} dy={0} blur={fontSize * 0.5} color={neonColor} />
                    <Shadow dx={0} dy={0} blur={fontSize * 0.2} color={neonColor} />
                  </>
                )}
                <Text
                  text={char}
                  x={xPos}
                  y={li * lh + fontSize * 0.85 + 4}
                  font={font}
                  color={strokeColor || undefined}
                  strokeWidth={strokeWidth}
                >
                  {lGrad}
                </Text>
              </Group>
            );
          });
        })}
      </Canvas>
    );
  }

  // --- Standard mode ---
  return (
    <Canvas style={[styles.canvas, { width: cWidth, height: cHeight }, style]}>
      {lines.map((line, li) => {
        const lineWidth = line.length * charW;
        const alignX =
          textAlign === 'center'
            ? (cWidth - lineWidth) / 2
            : textAlign === 'right'
            ? cWidth - lineWidth - 4
            : 4;

        return (
          <Group key={li}>
            {blur && <BlurMask blur={blur} style="normal" />}
            {neon && (
              <>
                <Shadow dx={0} dy={0} blur={fontSize * 0.5} color={neonColor} />
                <Shadow dx={0} dy={0} blur={fontSize * 0.15} color={neonColor} />
              </>
            )}
            <Text
              text={line}
              x={alignX}
              y={li * lh + fontSize * 0.85 + 4}
              font={font}
              color={strokeColor || undefined}
              strokeWidth={strokeWidth}
              letterSpacing={letterSpacing}
            >
              {renderShader()}
            </Text>
          </Group>
        );
      })}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    minHeight: 40,
  },
});
