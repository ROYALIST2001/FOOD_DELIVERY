import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   StyleSheet,
   FlatList,
   TouchableOpacity,
   Alert,
   Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useCart } from "../CartContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";

const MenuScreen = () => {
   const { restaurantId, restaurantName } = useLocalSearchParams();
   const { addToCart, getItemCount } = useCart();
   const [menuItems, setMenuItems] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (restaurantId) {
         const q = query(
            collection(db, "menuItems"),
            where("hotelOwnerId", "==", restaurantId),
            where("isAvailable", "==", true),
         );

         const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
               items.push({ id: doc.id, ...doc.data() });
            });
            setMenuItems(items);
            setLoading(false);
         });

         return () => unsubscribe();
      }
   }, [restaurantId]);

   const handleAddToCart = (item) => {
      const cartItem = {
         ...item,
         restaurantId,
         restaurantName,
      };
      addToCart(cartItem);
      Alert.alert("Added to Cart", `${item.name} has been added to your cart!`, [
         { text: "Continue Shopping" },
         { text: "Go to Cart", onPress: () => router.push("/(tabs)/cart") },
      ]);
   };

   if (loading) {
      return (
         <View style={styles.loadingContainer}>
            <Ionicons name="restaurant-outline" size={50} color="#e74c3c" />
            <Text style={styles.loadingText}>Loading menu...</Text>
         </View>
      );
   }

   if (menuItems.length === 0) {
      return (
         <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={80} color="#bdc3c7" />
            <Text style={styles.emptyTitle}>No Menu Items</Text>
            <Text style={styles.emptySubtitle}>
               This restaurant hasn't added any menu items yet.
            </Text>
         </View>
      );
   }

   const renderMenuItem = ({ item }) => (
      <View style={styles.menuItem}>
         <Image source={{ uri: item.image }} style={styles.menuItemImage} />

         <View style={styles.itemContent}>
            <View style={styles.itemInfo}>
               <Text style={styles.itemName}>{item.name}</Text>
               <Text style={styles.itemDescription}>{item.description}</Text>
               <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
               </View>
            </View>

            <TouchableOpacity
               style={styles.addButton}
               onPress={() => handleAddToCart(item)}
            >
               <Ionicons name="add" size={20} color="#fff" />
               <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
         </View>
      </View>
   );

   return (
      <View style={styles.container}>
         {/* Header */}
         <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
               <Ionicons name="arrow-back" size={24} color="#2c3e50" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
               <Text style={styles.title}>{restaurantName}</Text>
               <Text style={styles.subtitle}>{menuItems.length} items available</Text>
            </View>

            <TouchableOpacity
               style={styles.cartButton}
               onPress={() => router.push("/(tabs)/cart")}
            >
               <Ionicons name="cart" size={24} color="#e74c3c" />
               {getItemCount() > 0 && (
                  <View style={styles.cartBadge}>
                     <Text style={styles.cartBadgeText}>{getItemCount()}</Text>
                  </View>
               )}
            </TouchableOpacity>
         </View>

         {/* Menu Items */}
         <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.menuList}
            showsVerticalScrollIndicator={false}
         />
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f8f9fa",
   },
   header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   backButton: {
      padding: 8,
   },
   headerCenter: {
      flex: 1,
      alignItems: "center",
   },
   title: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#2c3e50",
   },
   subtitle: {
      fontSize: 12,
      color: "#7f8c8d",
      marginTop: 2,
   },
   cartButton: {
      position: "relative",
      padding: 8,
   },
   cartBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      backgroundColor: "#e74c3c",
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
   },
   cartBadgeText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
   },
   loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f8f9fa",
   },
   loadingText: {
      fontSize: 16,
      color: "#7f8c8d",
      marginTop: 15,
   },
   emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f8f9fa",
      padding: 40,
   },
   emptyTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#2c3e50",
      marginTop: 20,
      marginBottom: 10,
   },
   emptySubtitle: {
      fontSize: 16,
      color: "#7f8c8d",
      textAlign: "center",
      lineHeight: 24,
   },
   menuList: {
      padding: 20,
   },
   menuItem: {
      backgroundColor: "#fff",
      borderRadius: 12,
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: "hidden",
   },
   menuItemImage: {
      width: "100%",
      height: 180,
      backgroundColor: "#ecf0f1",
   },
   itemContent: {
      padding: 15,
   },
   itemInfo: {
      flex: 1,
   },
   itemName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: 8,
   },
   itemDescription: {
      fontSize: 14,
      color: "#7f8c8d",
      lineHeight: 20,
      marginBottom: 12,
   },
   itemFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
   },
   itemPrice: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#e74c3c",
   },
   itemCategory: {
      fontSize: 12,
      color: "#3498db",
      backgroundColor: "#ecf8ff",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
   },
   addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#e74c3c",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      shadowColor: "#e74c3c",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
   },
   addButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 5,
   },
});

export default MenuScreen;
