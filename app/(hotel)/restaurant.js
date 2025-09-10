import React, { useState } from "react";
import {
   View,
   Text,
   StyleSheet,
   ScrollView,
   TouchableOpacity,
   TextInput,
   Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const RestaurantScreen = () => {
   const [restaurantInfo, setRestaurantInfo] = useState({
      name: "Grand Palace Hotel Restaurant",
      description:
         "Premium dining experience with authentic cuisine and exceptional service",
      address: "123 Main Street, Downtown City",
      phone: "+1-234-567-8900",
      email: "contact@grandpalace.com",
      cuisineType: "Multi-Cuisine",
      openingTime: "09:00",
      closingTime: "23:00",
      isOpen: true,
   });

   const [isEditing, setIsEditing] = useState(false);

   const handleSave = () => {
      setIsEditing(false);
      Alert.alert("Success", "Restaurant information updated successfully!");
   };

   const renderInfoCard = (title, value, field, icon) => (
      <View style={styles.infoCard}>
         <View style={styles.cardHeader}>
            <Ionicons name={icon} size={24} color="#e74c3c" />
            <Text style={styles.cardTitle}>{title}</Text>
         </View>
         {isEditing ? (
            <TextInput
               style={styles.editInput}
               value={value}
               onChangeText={(text) =>
                  setRestaurantInfo((prev) => ({ ...prev, [field]: text }))
               }
               multiline={field === "description"}
            />
         ) : (
            <Text style={styles.cardValue}>{value}</Text>
         )}
      </View>
   );

   return (
      <ScrollView style={styles.container}>
         {/* Header */}
         <View style={styles.header}>
            <Text style={styles.headerTitle}>Restaurant Information</Text>
            <TouchableOpacity
               style={styles.editButton}
               onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
               <Ionicons
                  name={isEditing ? "checkmark" : "pencil"}
                  size={20}
                  color="#fff"
               />
               <Text style={styles.editButtonText}>{isEditing ? "Save" : "Edit"}</Text>
            </TouchableOpacity>
         </View>

         {/* Restaurant Details */}
         <View style={styles.detailsContainer}>
            {renderInfoCard(
               "Restaurant Name",
               restaurantInfo.name,
               "name",
               "storefront-outline",
            )}
            {renderInfoCard(
               "Description",
               restaurantInfo.description,
               "description",
               "document-text-outline",
            )}
            {renderInfoCard(
               "Address",
               restaurantInfo.address,
               "address",
               "location-outline",
            )}
            {renderInfoCard("Phone", restaurantInfo.phone, "phone", "call-outline")}
            {renderInfoCard("Email", restaurantInfo.email, "email", "mail-outline")}
            {renderInfoCard(
               "Cuisine Type",
               restaurantInfo.cuisineType,
               "cuisineType",
               "restaurant-outline",
            )}
         </View>

         {/* Opening Hours */}
         <View style={styles.hoursContainer}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            <View style={styles.hoursCard}>
               <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Opening Time:</Text>
                  {isEditing ? (
                     <TextInput
                        style={styles.timeInput}
                        value={restaurantInfo.openingTime}
                        onChangeText={(text) =>
                           setRestaurantInfo((prev) => ({ ...prev, openingTime: text }))
                        }
                        placeholder="09:00"
                     />
                  ) : (
                     <Text style={styles.timeValue}>{restaurantInfo.openingTime}</Text>
                  )}
               </View>

               <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Closing Time:</Text>
                  {isEditing ? (
                     <TextInput
                        style={styles.timeInput}
                        value={restaurantInfo.closingTime}
                        onChangeText={(text) =>
                           setRestaurantInfo((prev) => ({ ...prev, closingTime: text }))
                        }
                        placeholder="23:00"
                     />
                  ) : (
                     <Text style={styles.timeValue}>{restaurantInfo.closingTime}</Text>
                  )}
               </View>
            </View>
         </View>

         {/* Status Toggle */}
         <View style={styles.statusContainer}>
            <Text style={styles.sectionTitle}>Restaurant Status</Text>
            <TouchableOpacity
               style={[
                  styles.statusButton,
                  { backgroundColor: restaurantInfo.isOpen ? "#27ae60" : "#e74c3c" },
               ]}
               onPress={() =>
                  setRestaurantInfo((prev) => ({ ...prev, isOpen: !prev.isOpen }))
               }
            >
               <Ionicons
                  name={restaurantInfo.isOpen ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color="#fff"
               />
               <Text style={styles.statusButtonText}>
                  {restaurantInfo.isOpen ? "Currently Open" : "Currently Closed"}
               </Text>
            </TouchableOpacity>
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#2c3e50",
   },
   editButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#e74c3c",
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
   },
   editButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 5,
   },
   detailsContainer: {
      paddingHorizontal: 20,
   },
   infoCard: {
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
   cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
   },
   cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#2c3e50",
      marginLeft: 10,
   },
   cardValue: {
      fontSize: 14,
      color: "#7f8c8d",
      lineHeight: 20,
   },
   editInput: {
      borderWidth: 1,
      borderColor: "#e9ecef",
      borderRadius: 8,
      padding: 10,
      fontSize: 14,
      backgroundColor: "#f8f9fa",
   },
   hoursContainer: {
      padding: 20,
   },
   sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: 15,
   },
   hoursCard: {
      backgroundColor: "#fff",
      padding: 15,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   timeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
   },
   timeLabel: {
      fontSize: 16,
      color: "#2c3e50",
      fontWeight: "500",
   },
   timeValue: {
      fontSize: 16,
      color: "#7f8c8d",
   },
   timeInput: {
      borderWidth: 1,
      borderColor: "#e9ecef",
      borderRadius: 8,
      padding: 8,
      fontSize: 14,
      backgroundColor: "#f8f9fa",
      width: 80,
      textAlign: "center",
   },
   statusContainer: {
      padding: 20,
      paddingBottom: 40,
   },
   statusButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 15,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   statusButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
   },
});

export default RestaurantScreen;
