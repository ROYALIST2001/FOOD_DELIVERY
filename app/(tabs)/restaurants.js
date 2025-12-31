import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   StyleSheet,
   FlatList,
   TouchableOpacity,
   ActivityIndicator,
   TextInput,
} from "react-native";
import { router } from "expo-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";

const RestaurantsScreen = () => {
   const [restaurants, setRestaurants] = useState([]);
   const [filteredRestaurants, setFilteredRestaurants] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");

   useEffect(() => {
      const loadRestaurants = async () => {
         try {
            const usersQuery = query(
               collection(db, "users"),
               where("role", "==", "hotel_owner"),
            );
            const usersSnapshot = await getDocs(usersQuery);

            const restaurantsList = [];
            for (const userDoc of usersSnapshot.docs) {
               const userData = userDoc.data();

               const menuQuery = query(
                  collection(db, "menuItems"),
                  where("hotelOwnerId", "==", userDoc.id),
               );
               const menuSnapshot = await getDocs(menuQuery);

               if (!menuSnapshot.empty) {
                  restaurantsList.push({
                     id: userDoc.id,
                     name: userData.fullName + "'s Restaurant",
                     cuisine: "Multi-Cuisine",
                     rating: 4.5,
                     deliveryTime: "30-45 min",
                     ownerId: userDoc.id,
                     menuCount: menuSnapshot.size,
                  });
               }
            }

            setRestaurants(restaurantsList);
            setFilteredRestaurants(restaurantsList);
         } catch (error) {
            console.error("Error loading restaurants:", error);
         } finally {
            setLoading(false);
         }
      };

      loadRestaurants();
   }, []);

   // Search functionality
   useEffect(() => {
      if (searchQuery.trim() === "") {
         setFilteredRestaurants(restaurants);
      } else {
         const filtered = restaurants.filter(
            (restaurant) =>
               restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()),
         );
         setFilteredRestaurants(filtered);
      }
   }, [searchQuery, restaurants]);

   const clearSearch = () => {
      setSearchQuery("");
   };

   const renderSearchBar = () => (
      <View style={styles.searchContainer}>
         <View style={styles.searchBar}>
            <Ionicons
               name="search-outline"
               size={20}
               color="#7f8c8d"
               style={styles.searchIcon}
            />
            <TextInput
               style={styles.searchInput}
               placeholder="Search restaurants or cuisine..."
               placeholderTextColor="#bdc3c7"
               value={searchQuery}
               onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
               <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color="#7f8c8d" />
               </TouchableOpacity>
            )}
         </View>
      </View>
   );

   const renderRestaurant = ({ item }) => (
      <TouchableOpacity
         style={styles.restaurantCard}
         onPress={() =>
            router.push(`/menu?restaurantId=${item.ownerId}&restaurantName=${item.name}`)
         }
      >
         <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{item.name}</Text>
            <Text style={styles.cuisine}>{item.cuisine}</Text>
            <Text style={styles.details}>
               ⭐ {item.rating} • {item.deliveryTime}
            </Text>
            <Text style={styles.menuCount}>{item.menuCount} items available</Text>
         </View>
         <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
      </TouchableOpacity>
   );

   if (loading) {
      return (
         <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Text style={styles.loadingText}>Loading restaurants...</Text>
         </View>
      );
   }

   return (
      <View style={styles.container}>
         <Text style={styles.title}>Choose a Restaurant</Text>

         {/* Search Bar */}
         {renderSearchBar()}

         {/* Results Count */}
         {searchQuery.length > 0 && (
            <View style={styles.resultsContainer}>
               <Text style={styles.resultsText}>
                  {filteredRestaurants.length === 0
                     ? "No restaurants found"
                     : `${filteredRestaurants.length} restaurant${
                          filteredRestaurants.length > 1 ? "s" : ""
                       } found`}
               </Text>
            </View>
         )}

         {/* Restaurants List */}
         {filteredRestaurants.length === 0 && !loading ? (
            <View style={styles.emptyContainer}>
               <Ionicons
                  name={searchQuery.length > 0 ? "search-outline" : "restaurant-outline"}
                  size={80}
                  color="#bdc3c7"
               />
               <Text style={styles.emptyTitle}>
                  {searchQuery.length > 0
                     ? "No Results Found"
                     : "No Restaurants Available"}
               </Text>
               <Text style={styles.emptySubtext}>
                  {searchQuery.length > 0
                     ? `No restaurants match "${searchQuery}". Try a different search term.`
                     : "No hotel owners have added menu items yet."}
               </Text>
               {searchQuery.length > 0 && (
                  <TouchableOpacity
                     style={styles.clearSearchButton}
                     onPress={clearSearch}
                  >
                     <Text style={styles.clearSearchText}>Clear Search</Text>
                  </TouchableOpacity>
               )}
            </View>
         ) : (
            <FlatList
               data={filteredRestaurants}
               renderItem={renderRestaurant}
               keyExtractor={(item) => item.id}
               showsVerticalScrollIndicator={false}
               contentContainerStyle={styles.listContainer}
            />
         )}
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#f8f9fa",
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: "#2c3e50",
   },

   // Search Bar Styles
   searchContainer: {
      marginBottom: 15,
   },
   searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   searchIcon: {
      marginRight: 10,
   },
   searchInput: {
      flex: 1,
      fontSize: 16,
      color: "#2c3e50",
   },
   clearButton: {
      padding: 5,
   },

   // Results Styles
   resultsContainer: {
      marginBottom: 10,
   },
   resultsText: {
      fontSize: 14,
      color: "#7f8c8d",
      fontStyle: "italic",
   },

   // List Styles
   listContainer: {
      paddingBottom: 20,
   },
   restaurantCard: {
      backgroundColor: "#fff",
      padding: 15,
      marginBottom: 10,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   restaurantInfo: {
      flex: 1,
   },
   restaurantName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#2c3e50",
   },
   cuisine: {
      fontSize: 14,
      color: "#7f8c8d",
      marginTop: 5,
   },
   details: {
      fontSize: 12,
      color: "#95a5a6",
      marginTop: 5,
   },
   menuCount: {
      fontSize: 12,
      color: "#3498db",
      marginTop: 5,
   },

   // Loading Styles
   loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f8f9fa",
   },
   loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: "#7f8c8d",
   },

   // Empty State Styles
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
      textAlign: "center",
   },
   emptySubtext: {
      fontSize: 16,
      color: "#7f8c8d",
      textAlign: "center",
      lineHeight: 24,
   },
   clearSearchButton: {
      backgroundColor: "#e74c3c",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      marginTop: 20,
   },
   clearSearchText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
   },
});

export default RestaurantsScreen;
