import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function InitialLayout() {
  const {isLoaded, isSignedIn} = useAuth()
  const segments  = useSegments()
  const router = useRouter()
  useEffect(()=> {
    if(!isLoaded) return
    const inAuthScreen = segments[0] === '(auth)'
    if(!isSignedIn && !inAuthScreen) router.navigate('/(auth)/login')
    else if (isSignedIn && inAuthScreen) router.navigate('/(tabs)')

  }, [isLoaded, isSignedIn, segments])
  if(!isLoaded) return null
  return <Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
  <Stack.Screen name="user" options={{ headerShown: false }} />
</Stack>
}