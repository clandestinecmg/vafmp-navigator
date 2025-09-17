// components/Icon.tsx
import * as React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Props = React.ComponentProps<typeof MaterialIcons>;
export default function Icon(props: Props) {
  return <MaterialIcons {...props} />;
}
