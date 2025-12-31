import React, { useState } from "react";
import {
   View,
   Text,
   StyleSheet,
   FlatList,
   TouchableOpacity,
   Alert,
   Modal,
   TextInput,
} from "react-native";
import { useCart } from "../../CartContext";
import { Ionicons } from "@expo/vector-icons";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const CartScreen = () => {
   const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
      useCart();

   const [addressModalVisible, setAddressModalVisible] = useState(false);
   const [deliveryAddress, setDeliveryAddress] = useState("");
   const [customerName, setCustomerName] = useState("");
   const [phoneNumber, setPhoneNumber] = useState("");
   const [specialInstructions, setSpecialInstructions] = useState("");

   const handlePlaceOrderPress = () => {
      if (cartItems.length === 0) {
         Alert.alert("Empty Cart", "Please add items to your cart first.");
         return;
      }

      if (!auth.currentUser) {
         Alert.alert("Error", "Please login to place an order.");
         return;
      }

      setAddressModalVisible(true);
   };

   const placeOrder = async () => {
      if (!deliveryAddress.trim()) {
         Alert.alert("Error", "Please enter your delivery address.");
         return;
      }

      if (!customerName.trim()) {
         Alert.alert("Error", "Please enter your name.");
         return;
      }

      if (!phoneNumber.trim()) {
         Alert.alert("Error", "Please enter your phone number.");
         return;
      }

      try {
         console.log("=== PLACING ORDER ===");
         console.log("Current user:", auth.currentUser.uid);
         console.log("Delivery address:", deliveryAddress);

         const ordersByRestaurant = {};
         cartItems.forEach((item) => {
            if (!ordersByRestaurant[item.restaurantId]) {
               ordersByRestaurant[item.restaurantId] = {
                  restaurantId: item.restaurantId,
                  restaurantName: item.restaurantName,
                  items: [],
                  total: 0,
               };
            }
            ordersByRestaurant[item.restaurantId].items.push(item);
            ordersByRestaurant[item.restaurantId].total += item.price * item.quantity;
         });

         for (const order of Object.values(ordersByRestaurant)) {
            const orderData = {
               customerId: auth.currentUser.uid,
               customerName: customerName.trim(),
               customerEmail: auth.currentUser.email,
               customerPhone: phoneNumber.trim(),
               hotelOwnerId: order.restaurantId,
               restaurantName: order.restaurantName,
               items: order.items,
               total: order.total,
               status: "pending",
               orderTime: new Date().toISOString(),
               estimatedTime: 30,
               deliveryAddress: deliveryAddress.trim(),
               paymentMethod: "Cash on Delivery",
               specialInstructions: specialInstructions.trim(),
            };

            console.log("Creating order with address:", orderData);
            const docRef = await addDoc(collection(db, "orders"), orderData);
            console.log("✅ Order created with ID:", docRef.id);
         }

         setAddressModalVisible(false);
         setDeliveryAddress("");
         setCustomerName("");
         setPhoneNumber("");
         setSpecialInstructions("");

         Alert.alert("Order Placed!", "Your order has been placed successfully!");
         clearCart();
      } catch (error) {
         console.error("❌ Error placing order:", error);
         Alert.alert("Error", "Failed to place order: " + error.message);
      }
   };

   const renderAddressModal = () => (
      <Modal
         animationType="slide"
         transparent={true}
         visible={addressModalVisible}
         onRequestClose={() => setAddressModalVisible(false)}
      >
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Delivery Information</Text>
                  <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                     <Ionicons name="close" size={24} color="#7f8c8d" />
                  </TouchableOpacity>
               </View>

               <View style={styles.modalBody}>
                  <View style={styles.inputContainer}>
                     <Text style={styles.inputLabel}>Full Name</Text>
                     <TextInput
                        style={styles.addressInput}
                        placeholder="Enter your full name"
                        value={customerName}
                        onChangeText={setCustomerName}
                     />
                  </View>

                  <View style={styles.inputContainer}>
                     <Text style={styles.inputLabel}>Phone Number</Text>
                     <TextInput
                        style={styles.addressInput}
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                     />
                  </View>

                  <View style={styles.inputContainer}>
                     <Text style={styles.inputLabel}>Delivery Address</Text>
                     <TextInput
                        style={[styles.addressInput, { height: 80 }]}
                        placeholder="Enter your complete address"
                        value={deliveryAddress}
                        onChangeText={setDeliveryAddress}
                        multiline
                        numberOfLines={3}
                     />
                  </View>

                  <View style={styles.inputContainer}>
                     <Text style={styles.inputLabel}>
                        Special Instructions (Optional)
                     </Text>
                     <TextInput
                        style={[styles.addressInput, { height: 60 }]}
                        placeholder="Any special delivery instructions..."
                        value={specialInstructions}
                        onChangeText={setSpecialInstructions}
                        multiline
                        numberOfLines={2}
                     />
                  </View>

                  <View style={styles.orderSummary}>
                     <Text style={styles.summaryTitle}>Order Summary</Text>
                     <Text style={styles.summaryText}>Items: {cartItems.length}</Text>
                     <Text style={styles.summaryTotal}>
                        Total: {getTotalPrice().toFixed(2)}
                     </Text>
                  </View>

                  <View style={styles.modalButtons}>
                     <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setAddressModalVisible(false)}
                     >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                     </TouchableOpacity>

                     <TouchableOpacity
                        style={styles.confirmOrderButton}
                        onPress={placeOrder}
                     >
                        <Text style={styles.confirmOrderText}>Place Order</Text>
                     </TouchableOpacity>
                  </View>
               </View>
            </View>
         </View>
      </Modal>
   );

   const renderCartItem = ({ item }) => (
      <View style={styles.cartItem}>
         <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{item.price.toFixed(2)}</Text>
         </View>
         <View style={styles.quantityControls}>
            <TouchableOpacity
               style={styles.quantityButton}
               onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
               <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
               style={styles.quantityButton}
               onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
               <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
         </View>
         <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromCart(item.id)}
         >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
         </TouchableOpacity>
      </View>
   );

   return (
      <View style={styles.container}>
         <Text style={styles.title}>Your Cart</Text>
         {cartItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
               <Ionicons name="cart-outline" size={80} color="#bdc3c7" />
               <Text style={styles.emptyCart}>Your cart is empty</Text>
               <Text style={styles.emptyCartSubtext}>
                  Add some delicious items from restaurants!
               </Text>
            </View>
         ) : (
            <>
               <FlatList
                  data={cartItems}
                  renderItem={renderCartItem}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.cartList}
               />
               <View style={styles.totalContainer}>
                  <Text style={styles.total}>Total: {getTotalPrice().toFixed(2)}</Text>
                  <TouchableOpacity
                     style={styles.orderButton}
                     onPress={handlePlaceOrderPress}
                  >
                     <Text style={styles.orderButtonText}>Place Order</Text>
                  </TouchableOpacity>
               </View>
            </>
         )}

         {renderAddressModal()}
      </View>
   );
};

const styles = StyleSheet.create({
   container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
   title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#2c3e50" },
   emptyCartContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
   },
   emptyCart: {
      textAlign: "center",
      fontSize: 18,
      fontWeight: "bold",
      color: "#7f8c8d",
      marginTop: 20,
   },
   emptyCartSubtext: {
      textAlign: "center",
      fontSize: 14,
      color: "#95a5a6",
      marginTop: 8,
   },
   cartList: {
      flex: 1,
   },
   cartItem: {
      flexDirection: "row",
      backgroundColor: "#fff",
      padding: 15,
      marginBottom: 10,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   itemInfo: { flex: 1 },
   itemName: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
   itemPrice: { fontSize: 14, color: "#e74c3c", marginTop: 5, fontWeight: "600" },
   quantityControls: { flexDirection: "row", alignItems: "center", marginRight: 15 },
   quantityButton: {
      backgroundColor: "#3498db",
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
   },
   quantityButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
   quantity: { marginHorizontal: 15, fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
   removeButton: {
      padding: 8,
   },
   totalContainer: {
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: "#ecf0f1",
      paddingTop: 20,
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   total: {
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 15,
      color: "#2c3e50",
   },
   orderButton: {
      backgroundColor: "#27ae60",
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
   },
   orderButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
   },
   modalContent: {
      backgroundColor: "#fff",
      borderRadius: 20,
      width: "90%",
      maxHeight: "80%",
   },
   modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#ecf0f1",
   },
   modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#2c3e50",
   },
   modalBody: {
      padding: 20,
   },
   inputContainer: {
      marginBottom: 15,
   },
   inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#2c3e50",
      marginBottom: 8,
   },
   addressInput: {
      borderWidth: 1,
      borderColor: "#e9ecef",
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      backgroundColor: "#f8f9fa",
   },
   orderSummary: {
      backgroundColor: "#f8f9fa",
      padding: 15,
      borderRadius: 12,
      marginBottom: 20,
   },
   summaryTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: 8,
   },
   summaryText: {
      fontSize: 14,
      color: "#7f8c8d",
      marginBottom: 5,
   },
   summaryTotal: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#e74c3c",
   },
   modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
   },
   cancelButton: {
      flex: 1,
      backgroundColor: "#ecf0f1",
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
      marginRight: 10,
   },
   cancelButtonText: {
      color: "#7f8c8d",
      fontSize: 16,
      fontWeight: "bold",
   },
   confirmOrderButton: {
      flex: 1,
      backgroundColor: "#27ae60",
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
      marginLeft: 10,
   },
   confirmOrderText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
   },
});

export default CartScreen;
