declare module 'react-native-image-pan-zoom' {
  import * as React from 'react';
  import { ViewStyle } from 'react-native';

  export interface ImageZoomProps {
    cropWidth: number;
    cropHeight: number;
    imageWidth: number;
    imageHeight: number;
    minScale?: number;
    maxScale?: number;
    enableCenterFocus?: boolean;
    pinchToZoom?: boolean;
    panToMove?: boolean;
    doubleClickInterval?: number;
    style?: ViewStyle;
    children?: React.ReactNode; // <— the missing bit
  }

  export default class ImageZoom extends React.Component<ImageZoomProps> {}
}
