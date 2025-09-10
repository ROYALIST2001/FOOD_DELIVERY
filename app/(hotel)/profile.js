import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   StyleSheet,
   TouchableOpacity,
   ScrollView,
   Alert,
} from "react-native";
import { router } from "expo-router";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";

const HotelProfileScreen = () => {
   const [userInfo, setUserInfo] = useState({
      displayName: "",
      email: "",
   });

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
         if (user) {
            setUserInfo({
               displayName: user.displayName || "Hotel Owner",
               email: user.email || "",
            });
         } else {
            // User is signed out, redirect to login
            router.replace("/");
         }
      });

      return () => unsubscribe();
   }, []);

   // Simple logout function
   const handleLogout = async () => {
      try {
         console.log("Starting logout...");
         await signOut(auth);
         console.log("Logout successful");
         // Navigation will be handled by useEffect when auth state changes
      } catch (error) {
         console.error("Logout error:", error);
         Alert.alert("Error", "Failed to logout. Please try again.");
      }
   };

   const menuOptions = [
      {
         id: 1,
         title: "Hotel Information",
         icon: "business-outline",
         action: () => router.push("/(hotel)/restaurant"),
      },
      {
         id: 2,
         title: "Menu Management",
         icon: "restaurant-outline",
         action: () => router.push("/(hotel)/menu"),
      },
      {
         id: 3,
         title: "View Orders",
         icon: "receipt-outline",
         action: () => router.push("/(hotel)/orders"),
      },
      {
         id: 4,
         title: "Dashboard",
         icon: "analytics-outline",
         action: () => router.push("/(hotel)/dashboard"),
      },
   ];

   return (
      <ScrollView style={styles.container}>
         {/* Header - Profile Picture Removed */}
         <View style={styles.header}>
            <Text style={styles.userName}>{userInfo.displayName}</Text>
            <Text style={styles.userEmail}>{userInfo.email}</Text>
            <Text style={styles.userRole}>Hotel Owner</Text>
         </View>

         {/* Menu Options */}
         <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            {menuOptions.map((item) => (
               <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.action}
               >
                  <View style={styles.menuItemLeft}>
                     <View style={styles.iconContainer}>
                        <Ionicons name={item.icon} size={24} color="#e74c3c" />
                     </View>
                     <Text style={styles.menuItemTitle}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
               </TouchableOpacity>
            ))}
         </View>

         {/* Simple Logout Button */}
         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
         </TouchableOpacity>

         <View style={styles.bottomPadding} />
      </ScrollView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f8f9fa",
   },
   header: {
      backgroundColor: "#fff",
      alignItems: "center",
      paddingVertical: 30,
      paddingHorizontal: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   userName: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: 5,
   },
   userEmail: {
      fontSize: 16,
      color: "#7f8c8d",
      marginBottom: 10,
   },
   userRole: {
      fontSize: 14,
      color: "#3498db",
      backgroundColor: "#ecf8ff",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
   },
   menuContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
   },
   sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: 15,
   },
   menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#fff",
      padding: 15,
      marginBottom: 10,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
   },
   iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#fff5f5",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
   },
   menuItemTitle: {
      fontSize: 16,
      color: "#2c3e50",
      fontWeight: "600",
   },
   logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#e74c3c",
      marginHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   logoutButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
   },
   bottomPadding: {
      height: 30,
   },
});

export default HotelProfileScreen;
