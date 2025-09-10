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

const ProfileScreen = () => {
   const [user, setUser] = useState(null);

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
         if (user) {
            setUser(user);
         } else {
            router.replace("/");
         }
      });

      return () => unsubscribe();
   }, []);

   const handleLogout = async () => {
      try {
         console.log("Customer logout started...");
         await signOut(auth);
         console.log("Customer logout successful");
      } catch (error) {
         console.error("Logout error:", error);
         Alert.alert("Error", "Failed to logout. Please try again.");
      }
   };

   const menuItems = [
      {
         id: 1,
         title: "Browse Restaurants",
         icon: "restaurant-outline",
         action: () => router.push("/(tabs)/restaurants"),
      },
      {
         id: 2,
         title: "My Cart",
         icon: "cart-outline",
         action: () => router.push("/(tabs)/cart"),
      },
      {
         id: 3,
         title: "Home",
         icon: "home-outline",
         action: () => router.push("/(tabs)/home"),
      },
   ];

   return (
      <ScrollView style={styles.container}>
         {/* Header */}
         <View style={styles.header}>
            <Text style={styles.userName}>
               {user?.displayName || user?.email || "Customer"}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userRole}>Customer</Text>
         </View>

         {/* Menu Items */}
         <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            {menuItems.map((item) => (
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

         {/* Account Information */}
         <View style={styles.accountContainer}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoCard}>
               <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{user?.displayName || "Not set"}</Text>
               </View>
               <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
               </View>
               <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Account Type:</Text>
                  <Text style={styles.infoValue}>Customer</Text>
               </View>
            </View>
         </View>

         {/* Logout Button */}
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
      color: "#27ae60",
      backgroundColor: "#eafaf1",
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
   accountContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
   },
   infoCard: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#f1f2f6",
   },
   infoLabel: {
      fontSize: 16,
      color: "#7f8c8d",
      fontWeight: "500",
   },
   infoValue: {
      fontSize: 16,
      color: "#2c3e50",
      fontWeight: "600",
      flex: 1,
      textAlign: "right",
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

export default ProfileScreen;
