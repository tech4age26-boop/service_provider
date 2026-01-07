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

const AppBody: React.FC<AppBodyProps> = ({
  children,
  style,
  backgroundColor = "#FFFFFF",
  statusBarStyle = "dark-content",
}) => {
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={statusBarStyle} />

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
