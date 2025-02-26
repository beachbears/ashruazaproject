import { Slot, Stack } from "expo-router";
import { PostProvider } from "./PostContext"; 

export default function RootLayout() {
  return (
    <PostProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="routeuser" options={{ headerShown: false }} />
        <Stack.Screen 
          name="postsuggestions" 
          options={{ 
            headerShown: false,
            title: 'Suggestions'
          }} 
        />
        <Slot />  
      </Stack>
    </PostProvider>
  );
}
