// components/Background.tsx
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

type Props = { children: React.ReactNode };

export default function Background({ children }: Props) {
  return (
    <ImageBackground
      source={require('../assets/flag-texture.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
});
