import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   StyleSheet,
   ScrollView,
   TouchableOpacity,
   Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { router } from "expo-router";

const HotelDashboard = () => {
   const [userInfo, setUserInfo] = useState({
      displayName: "",
      email: "",
   });

   const [stats, setStats] = useState({
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
      totalMenuItems: 0,
   });

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
         if (user) {
            setUserInfo({
               displayName: user.displayName || "Hotel Owner",
               email: user.email || "",
            });
         }
      });

      return () => unsubscribe();
   }, []);

   // Load real orders data
   useEffect(() => {
      if (!auth.currentUser) return;

      const ordersQuery = query(
         collection(db, "orders"),
         where("hotelOwnerId", "==", auth.currentUser.uid),
      );

      const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
         let totalOrders = 0;
         let pendingOrders = 0;
         let totalRevenue = 0;

         querySnapshot.forEach((doc) => {
            const order = doc.data();
            totalOrders++;

            if (order.status === "pending") {
               pendingOrders++;
            }

            if (order.status === "delivered") {
               totalRevenue += order.total || 0;
            }
         });

         setStats((prev) => ({
            ...prev,
            totalOrders,
            pendingOrders,
            totalRevenue,
         }));
      });

      return () => unsubscribe();
   }, [auth.currentUser]);

   // Load real menu items data
   useEffect(() => {
      if (!auth.currentUser) return;

      const menuQuery = query(
         collection(db, "menuItems"),
         where("hotelOwnerId", "==", auth.currentUser.uid),
      );

      const unsubscribe = onSnapshot(menuQuery, (querySnapshot) => {
         setStats((prev) => ({
            ...prev,
            totalMenuItems: querySnapshot.size,
         }));
      });

      return () => unsubscribe();
   }, [auth.currentUser]);

   const quickActions = [
      {
         id: 1,
         title: "Add Menu Item",
         icon: "add-circle-outline",
         color: "#27ae60",
         action: () => router.push("/(hotel)/menu"),
      },
      {
         id: 2,
         title: "View Orders",
         icon: "receipt-outline",
         color: "#3498db",
         action: () => router.push("/(hotel)/orders"),
      },
      {
         id: 3,
         title: "Restaurant Info",
         icon: "storefront-outline",
         color: "#e74c3c",
         action: () => router.push("/(hotel)/restaurant"),
      },
      {
         id: 4,
         title: "Profile Settings",
         icon: "settings-outline",
         color: "#9b59b6",
         action: () => router.push("/(hotel)/profile"),
      },
   ];

   const renderStatCard = (title, value, icon, color) => (
      <View style={[styles.statCard, { borderLeftColor: color }]}>
         <View style={styles.statIconContainer}>
            <Ionicons name={icon} size={24} color={color} />
         </View>
         <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
         </View>
      </View>
   );

   const renderQuickAction = (item) => (
      <TouchableOpacity
         key={item.id}
         style={styles.quickActionCard}
         onPress={item.action}
      >
         <View style={[styles.quickActionIcon, { backgroundColor: `${item.color}20` }]}>
            <Ionicons name={item.icon} size={32} color={item.color} />
         </View>
         <Text style={styles.quickActionText}>{item.title}</Text>
      </TouchableOpacity>
   );

   return (
      <ScrollView style={styles.container}>
         {/* Header */}
         <View style={styles.header}>
            <View>
               <Text style={styles.welcomeText}>Welcome back,</Text>
               <Text style={styles.ownerName}>{userInfo.displayName}!</Text>
            </View>
         </View>

         {/* Real Stats Overview */}
         <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Your Business Overview</Text>
            <View style={styles.statsGrid}>
               {renderStatCard("Total Orders", stats.totalOrders, "receipt", "#3498db")}
               {renderStatCard("Pending Orders", stats.pendingOrders, "time", "#e67e22")}
               {renderStatCard(
                  "Total Revenue",
                  `${stats.totalRevenue.toFixed(2)}`,
                  "cash",
                  "#27ae60",
               )}
               {renderStatCard(
                  "Menu Items",
                  stats.totalMenuItems,
                  "restaurant",
                  "#9b59b6",
               )}
            </View>
         </View>

         {/* Quick Actions */}
         <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
               {quickActions.map(renderQuickAction)}
            </View>
         </View>

         {/* Business Status */}
         <View style={styles.statusContainer}>
            <Text style={styles.sectionTitle}>Business Status</Text>
            <View style={styles.statusCard}>
               <View style={styles.statusRow}>
                  <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
                  <Text style={styles.statusText}>Restaurant is Active</Text>
               </View>
               <View style={styles.statusRow}>
                  <Ionicons
                     name={
                        stats.pendingOrders > 0 ? "notifications" : "notifications-off"
                     }
                     size={24}
                     color={stats.pendingOrders > 0 ? "#e74c3c" : "#95a5a6"}
                  />
                  <Text style={styles.statusText}>
                     {stats.pendingOrders > 0
                        ? `${stats.pendingOrders} new orders pending`
                        : "No pending orders"}
                  </Text>
               </View>
               <View style={styles.statusRow}>
                  <Ionicons
                     name={stats.totalMenuItems > 0 ? "restaurant" : "restaurant-outline"}
                     size={24}
                     color={stats.totalMenuItems > 0 ? "#27ae60" : "#e74c3c"}
                  />
                  <Text style={styles.statusText}>
                     {stats.totalMenuItems > 0
                        ? `${stats.totalMenuItems} items in menu`
                        : "No menu items added yet"}
                  </Text>
               </View>
            </View>
         </View>
      </ScrollView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f8f9fa",
   },
   header: {
      padding: 20,
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   welcomeText: {
      fontSize: 16,
      color: "#7f8c8d",
   },
   ownerName: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#2c3e50",
   },
   statsContainer: {
      padding: 20,
   },
   sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: 15,
   },
   statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
   },
   statCard: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      width: "48%",
      borderLeftWidth: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      flexDirection: "row",
      alignItems: "center",
   },
   statIconContainer: {
      marginRight: 10,
   },
   statTextContainer: {
      flex: 1,
   },
   statValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#2c3e50",
   },
   statTitle: {
      fontSize: 12,
      color: "#7f8c8d",
      marginTop: 2,
   },
   quickActionsContainer: {
      padding: 20,
   },
   quickActionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
   },
   quickActionCard: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      width: "48%",
      alignItems: "center",
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   quickActionIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
   },
   quickActionText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#2c3e50",
      textAlign: "center",
   },
   statusContainer: {
      padding: 20,
      paddingBottom: 40,
   },
   statusCard: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   statusRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
   },
   statusText: {
      fontSize: 16,
      color: "#2c3e50",
      marginLeft: 15,
      flex: 1,
   },
});

export default HotelDashboard;
