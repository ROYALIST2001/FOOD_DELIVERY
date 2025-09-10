import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const HomeScreen = () => {
   return (
      <ScrollView style={styles.container}>
         <Text style={styles.title}>Welcome to Food Delivery!</Text>

         <View style={styles.card}>
            <Text style={styles.cardTitle}>🍕 Popular Today</Text>
            <Text style={styles.cardText}>Pizza Palace - 30% off on all pizzas!</Text>
         </View>

         <View style={styles.card}>
            <Text style={styles.cardTitle}>🚚 Fast Delivery</Text>
            <Text style={styles.cardText}>
               Get your food delivered in 30 minutes or less
            </Text>
         </View>

         <View style={styles.card}>
            <Text style={styles.cardTitle}>⭐ Top Rated</Text>
            <Text style={styles.cardText}>Sushi World - 4.8 stars from customers</Text>
         </View>
      </ScrollView>
   );
};

const styles = StyleSheet.create({
   container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
   title: {
      fontSize: 28,
      marginBottom: 30,
      textAlign: "center",
      fontWeight: "bold",
      color: "#2c3e50",
   },
   card: {
      backgroundColor: "#fff",
      padding: 20,
      marginBottom: 15,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: "#e74c3c",
   },
   cardText: {
      fontSize: 14,
      color: "#7f8c8d",
   },
});

export default HomeScreen;
