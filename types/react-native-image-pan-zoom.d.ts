// types/react-native-image-pan-zoom.d.ts
declare module 'react-native-image-pan-zoom' {
  import * as React from 'react';
  import { ViewStyle } from 'react-native';

  export interface ImageZoomClickEvent {
    locationX: number;
    locationY: number;
    pageX: number;
    pageY: number;
    duration: number;
  }

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
    children?: React.ReactNode;

    /** Not in upstream types but supported by the lib */
    onClick?: (e: ImageZoomClickEvent) => void;
  }

  // Expose the instance method used at runtime
  export default class ImageZoom extends React.Component<ImageZoomProps> {
    centerOn(p: {
      x: number;
      y: number;
      scale: number;
      duration?: number;
    }): void;
  }
}
