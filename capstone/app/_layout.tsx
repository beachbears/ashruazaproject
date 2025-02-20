import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
     <Stack.Screen name="+not-found" />
     
 

<Stack.Screen
  name="routeuser"
  options={{
    headerShown: false, // Hides the default header
    
  }}
/>
    </Stack>
    
  );
}
