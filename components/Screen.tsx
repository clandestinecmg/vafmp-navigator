import React from 'react';
import { View, ScrollView, ViewProps } from 'react-native';
import { shared } from '../styles/shared';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({
  children,
  scroll,
  style,
  ...rest
}: ViewProps & { scroll?: boolean }) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={shared.screen}>
      <Container style={[shared.screen, style]} {...rest}>
        <View style={shared.safePad} />
        {children}
      </Container>
    </SafeAreaView>
  );
}
