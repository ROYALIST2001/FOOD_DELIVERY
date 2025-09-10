import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
   return (
      <Tabs
         screenOptions={{
            tabBarActiveTintColor: "#e74c3c",
            tabBarInactiveTintColor: "#95a5a6",
            tabBarStyle: {
               backgroundColor: "#fff",
               borderTopWidth: 1,
               borderTopColor: "#ecf0f1",
            },
         }}
      >
         <Tabs.Screen
            name="home"
            options={{
               title: "Home",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home" size={size} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="restaurants"
            options={{
               title: "Restaurants",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="restaurant" size={size} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="cart"
            options={{
               title: "Cart",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="cart" size={size} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="profile"
            options={{
               title: "Profile",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person" size={size} color={color} />
               ),
            }}
         />
      </Tabs>
   );
}
