/**
 * Type Declarations for modules without TypeScript types
 * Deklarasi tipe untuk module yang tidak punya types bawaan
 */

// react-grid-layout tidak punya @types resmi, jadi kita deklarasi manual
declare module "react-grid-layout" {
  import * as React from "react";

  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
  }

  export interface Layouts {
    [key: string]: Layout[];
  }

  export interface ResponsiveProps {
    className?: string;
    layouts?: Layouts;
    breakpoints?: { [key: string]: number };
    cols?: { [key: string]: number };
    rowHeight?: number;
    margin?: [number, number];
    containerPadding?: [number, number];
    isDraggable?: boolean;
    isResizable?: boolean;
    onLayoutChange?: (currentLayout: Layout[], allLayouts: Layouts) => void;
    children?: React.ReactNode;
  }

  export class Responsive extends React.Component<ResponsiveProps> {}

  export function WidthProvider<P extends object>(
    component: React.ComponentType<P>
  ): React.ComponentType<P>;
}
