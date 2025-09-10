import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HotelLayout() {
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
            name="dashboard"
            options={{
               title: "Dashboard",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="analytics" size={size} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="restaurant"
            options={{
               title: "Restaurant",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="storefront" size={size} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="menu"
            options={{
               title: "Menu",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="restaurant" size={size} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="orders"
            options={{
               title: "Orders",
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="receipt" size={size} color={color} />
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
