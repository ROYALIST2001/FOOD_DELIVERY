import { Stack } from "expo-router";
import { CartProvider } from "../CartContext";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { router } from "expo-router";

export default function RootLayout() {
   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
         if (user) {
            // User is signed in, check their role and redirect
            try {
               const userDoc = await getDoc(doc(db, "users", user.uid));
               if (userDoc.exists()) {
                  const userRole = userDoc.data().role;
                  if (userRole === "customer") {
                     router.replace("/(tabs)/home");
                  } else if (userRole === "hotel_owner") {
                     router.replace("/(hotel)/dashboard");
                  }
               }
            } catch (error) {
               console.error("Error checking user role:", error);
            }
         }
      });

      return () => unsubscribe();
   }, []);

   return (
      <CartProvider>
         <Stack>
            <Stack.Screen name="index" options={{ title: "Login" }} />
            <Stack.Screen name="signup" options={{ title: "Signup" }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(hotel)" options={{ headerShown: false }} />
            <Stack.Screen name="menu" options={{ title: "Menu", headerShown: false }} />
         </Stack>
      </CartProvider>
   );
}
