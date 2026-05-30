import React from 'react';
import { StyleSheet, ScrollView, Text, Alert } from 'react-native';
import GradientText from 'react-native-skia-gradient';

export default function App() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>react-native-skia-gradient</Text>
      <Text style={styles.subtitle}>GPU gradient text — 60fps, shaders, effects</Text>

      <Section title="Basic">
        <GradientText colors={['#667eea', '#764ba2']} fontSize={36}>Hello World</GradientText>
      </Section>

      <Section title="Diagonal">
        <GradientText colors={['#11998e', '#38ef7d']} start={{x:0,y:0}} end={{x:1,y:1}} fontSize={36}>Diagonal</GradientText>
      </Section>

      <Section title="Radial Gradient">
        <GradientText colors={['#38ef7d', '#11998e']} gradientType="radial" fontSize={36}>Radial</GradientText>
      </Section>

      <Section title="Shimmer ✨ (60fps)">
        <GradientText colors={['#667eea', '#764ba2']} shimmer fontSize={36}>Shimmer</GradientText>
      </Section>

      <Section title="Animated Colors">
        <GradientText colors={['#ff6b6b', '#feca57', '#48dbfb', '#7c3aed']} animated animatedDuration={3000} fontSize={32}>Cycling</GradientText>
      </Section>

      <Section title="Multi-line">
        <GradientText colors={['#f093fb', '#f5576c']} fontSize={24} textAlign="center">
          Line one{'\n'}Line two{'\n'}Line three
        </GradientText>
      </Section>

      <Section title="Per-letter">
        <GradientText colors={['#ff6b6b', '#feca57', '#48dbfb', '#7c3aed']} perLetter fontSize={36}>Rainbow</GradientText>
      </Section>

      <Section title="Neon glow">
        <GradientText colors={['#00f2fe', '#4facfe']} neon neonColor="#00f2fe" fontSize={36}>Neon</GradientText>
      </Section>

      <Section title="Blur effect">
        <GradientText colors={['#667eea', '#764ba2']} blur={4} fontSize={36}>Blurry</GradientText>
      </Section>

      <Section title="Stroke + Gradient">
        <GradientText colors={['#ff6b6b', '#feca57']} strokeColor="#7c3aed" strokeWidth={2} fontSize={36}>Bordered</GradientText>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ScrollView horizontal style={styles.sectionScroll} contentContainerStyle={styles.sectionContent}>
      <Text style={styles.label}>{title}</Text>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  content: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#666', marginBottom: 36, textAlign: 'center' },
  label: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
});
