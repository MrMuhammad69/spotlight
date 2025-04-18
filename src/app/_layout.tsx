import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import InitialLayout from "@/components/initialLayout";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";
SplashScreen.preventAutoHideAsync();
export default function Layout() {
  useEffect(() => {
    // Hide splash screen as soon as the app is ready (no fonts to wait for)
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500); // Optional: Small delay for smoother UX (remove if not needed)
  }, []);
  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-black">
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
      </ClerkAndConvexProvider>
  );
}
