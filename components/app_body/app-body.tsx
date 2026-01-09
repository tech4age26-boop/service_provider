import React, { ReactNode } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  ViewStyle,
  StatusBarStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AppBodyProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  statusBarStyle?: StatusBarStyle;
}

import { useTheme } from "../../theme/ThemeContext";

const AppBody: React.FC<AppBodyProps> = ({
  children,
  style,
  backgroundColor,
  statusBarStyle,
}) => {
  const { theme } = useTheme();

  // Default to theme background if not provided
  const finalBackgroundColor = backgroundColor || theme.background;

  // Default status bar style based on theme mode
  // If theme is dark, we want light text (light-content)
  // If theme is light, we want dark text (dark-content)
  const defaultBarStyle = theme.mode === 'dark' ? 'light-content' : 'dark-content';
  const finalBarStyle = statusBarStyle || defaultBarStyle;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: finalBackgroundColor }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={finalBarStyle} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.container, style]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AppBody;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
