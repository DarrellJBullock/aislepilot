// NativeWind's own `/// <reference types="nativewind/types" />` chain augments
// whichever "react-native" module is resolved from nativewind's own (possibly
// nested/duplicated) node_modules location, which can end up being a
// different module identity than the "react-native" this app actually
// imports in a workspace install. Augmenting it directly here, resolved from
// this file's own location, avoids that mismatch.
import "react-native";

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
    contentContainerClassName?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
    placeholderClassName?: string;
  }
  interface ActivityIndicatorProps {
    className?: string;
  }
  interface KeyboardAvoidingViewProps {
    className?: string;
    contentContainerClassName?: string;
  }
}
