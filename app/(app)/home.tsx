import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Background from '../../components/Background';
import { shared } from '../../styles/shared';

export default function Home() {
  return (
    <Background>
      <View style={shared.safePad} />
      <View style={styles.container}>
        <Text style={shared.title}>Home</Text>
        <Text style={shared.text}>
          If you can see this, tabs and fonts are loaded. 🎉
        </Text>
        <Text style={shared.text}>
          Next: we’ll wrap other screens and recheck icons in Providers &
          Favorites.
        </Text>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, flex: 1 },
});