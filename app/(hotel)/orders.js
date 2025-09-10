import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   StyleSheet,
   ScrollView,
   TouchableOpacity,
   Alert,
   RefreshControl,
   Modal,
   FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const HotelOrders = () => {
   const [orders, setOrders] = useState([]);
   const [selectedStatus, setSelectedStatus] = useState("all");
   const [refreshing, setRefreshing] = useState(false);
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [modalVisible, setModalVisible] = useState(false);

   // Load orders from Firebase in real-time
   useEffect(() => {
      const loadOrders = () => {
         if (!auth.currentUser) {
            console.log("No authenticated user");
            return;
         }

         console.log("=== HOTEL ORDERS DEBUG ===");
         console.log("Current hotel owner ID:", auth.currentUser.uid);
         console.log("Looking for orders with hotelOwnerId:", auth.currentUser.uid);
         console.log("Order in database has hotelOwnerId: eRnauAd2OxcXhtpBkmdbcoea6VW2");

         const q = query(
            collection(db, "orders"),
            where("hotelOwnerId", "==", auth.currentUser.uid),
         );

         const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
               const ordersList = [];
               querySnapshot.forEach((doc) => {
                  const orderData = { id: doc.id, ...doc.data() };
                  console.log("Order found for current user:", orderData);
                  ordersList.push(orderData);
               });

               console.log(`Found {ordersList.length} orders for current user`);
               setOrders(ordersList);
            },
            (error) => {
               console.error("Error loading orders:", error);
            },
         );

         return unsubscribe;
      };

      const unsubscribe = loadOrders();
      return () => {
         if (unsubscribe) unsubscribe();
      };
   }, []);

   const statusConfig = {
      pending: { color: "#f39c12", icon: "time-outline", label: "Pending" },
      preparing: { color: "#3498db", icon: "restaurant-outline", label: "Preparing" },
      ready: { color: "#27ae60", icon: "checkmark-circle-outline", label: "Ready" },
      delivered: { color: "#95a5a6", icon: "checkmark-done-outline", label: "Delivered" },
      cancelled: { color: "#e74c3c", icon: "close-circle-outline", label: "Cancelled" },
   };

   const statusFilters = ["all", "pending", "preparing", "ready", "delivered"];

   const updateOrderStatus = async (orderId, newStatus) => {
      try {
         const orderRef = doc(db, "orders", orderId);
         await updateDoc(orderRef, { status: newStatus });

         const statusLabels = {
            preparing: "Order is now being prepared",
            ready: "Order is ready for pickup/delivery",
            delivered: "Order has been delivered",
            cancelled: "Order has been cancelled",
         };

         Alert.alert("Status Updated", statusLabels[newStatus]);
      } catch (error) {
         console.error("Error updating order status:", error);
         Alert.alert("Error", "Failed to update order status");
      }
   };

   const onRefresh = () => {
      setRefreshing(true);
      setTimeout(() => {
         setRefreshing(false);
         Alert.alert("Refreshed", "Orders updated successfully!");
      }, 1000);
   };

   const filteredOrders =
      selectedStatus === "all"
         ? orders
         : orders.filter((order) => order.status === selectedStatus);

   const formatTime = (timeString) => {
      if (!timeString) return "Unknown time";
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
         hour: "2-digit",
         minute: "2-digit",
         hour12: true,
      });
   };

   const renderStatusFilter = () => (
      <ScrollView
         horizontal
         showsHorizontalScrollIndicator={false}
         style={styles.filterContainer}
      >
         {statusFilters.map((status) => (
            <TouchableOpacity
               key={status}
               style={[
                  styles.filterButton,
                  selectedStatus === status && styles.selectedFilterButton,
               ]}
               onPress={() => setSelectedStatus(status)}
            >
               <Text
                  style={[
                     styles.filterButtonText,
                     selectedStatus === status && styles.selectedFilterText,
                  ]}
               >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== "all" &&
                     ` (${orders.filter((o) => o.status === status).length})`}
               </Text>
            </TouchableOpacity>
         ))}
      </ScrollView>
   );

   const renderOrderCard = ({ item }) => {
      const config = statusConfig[item.status] || statusConfig.pending;

      return (
         <TouchableOpacity
            style={styles.orderCard}
            onPress={() => {
               setSelectedOrder(item);
               setModalVisible(true);
            }}
         >
            <View style={styles.orderHeader}>
               <View style={styles.orderIdContainer}>
                  <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
                  <Text style={styles.orderTime}>{formatTime(item.orderTime)}</Text>
               </View>

               <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
                  <Ionicons name={config.icon} size={14} color="#fff" />
                  <Text style={styles.statusText}>{config.label}</Text>
               </View>
            </View>

            <View style={styles.customerInfo}>
               <Text style={styles.customerName}>{item.customerName || "Customer"}</Text>
               <Text style={styles.customerPhone}>{item.customerEmail || ""}</Text>
            </View>

            <View style={styles.orderSummary}>
               <Text style={styles.itemCount}>
                  {item.items?.length || 0} item{(item.items?.length || 0) > 1 ? "s" : ""}
               </Text>
               <Text style={styles.orderTotal}>{(item.total || 0).toFixed(2)}</Text>
            </View>

            {item.status !== "delivered" && item.status !== "cancelled" && (
               <View style={styles.actionButtons}>
                  {item.status === "pending" && (
                     <>
                        <TouchableOpacity
                           style={[styles.actionButton, { backgroundColor: "#3498db" }]}
                           onPress={() => updateOrderStatus(item.id, "preparing")}
                        >
                           <Text style={styles.actionButtonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                           style={[styles.actionButton, { backgroundColor: "#e74c3c" }]}
                           onPress={() => updateOrderStatus(item.id, "cancelled")}
                        >
                           <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                     </>
                  )}

                  {item.status === "preparing" && (
                     <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: "#27ae60" }]}
                        onPress={() => updateOrderStatus(item.id, "ready")}
                     >
                        <Text style={styles.actionButtonText}>Mark Ready</Text>
                     </TouchableOpacity>
                  )}

                  {item.status === "ready" && (
                     <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: "#95a5a6" }]}
                        onPress={() => updateOrderStatus(item.id, "delivered")}
                     >
                        <Text style={styles.actionButtonText}>Delivered</Text>
                     </TouchableOpacity>
                  )}
               </View>
            )}
         </TouchableOpacity>
      );
   };

   const renderOrderDetailsModal = () => {
      if (!selectedOrder) return null;

      const config = statusConfig[selectedOrder.status] || statusConfig.pending;

      return (
         <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
         >
            <View style={styles.modalOverlay}>
               <View style={styles.orderDetailsModal}>
                  <View style={styles.modalHeader}>
                     <Text style={styles.modalTitle}>Order Details</Text>
                     <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#7f8c8d" />
                     </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.orderDetailsBody}>
                     {/* Order Info */}
                     <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Order Information</Text>
                        <Text style={styles.detailText}>
                           Order ID: #{selectedOrder.id.slice(-6)}
                        </Text>
                        <Text style={styles.detailText}>Status: {config.label}</Text>
                        <Text style={styles.detailText}>
                           Order Time: {formatTime(selectedOrder.orderTime)}
                        </Text>
                        <Text style={styles.detailText}>
                           Total: {selectedOrder.total.toFixed(2)}
                        </Text>
                     </View>

                     {/* Customer Info */}
                     <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Customer Information</Text>
                        <Text style={styles.detailText}>
                           Name: {selectedOrder.customerName}
                        </Text>
                        <Text style={styles.detailText}>
                           Email: {selectedOrder.customerEmail}
                        </Text>
                        <Text style={styles.detailText}>
                           Phone: {selectedOrder.customerPhone}
                        </Text>
                     </View>

                     {/* Delivery Address - NEW SECTION */}
                     <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
                        <View style={styles.addressContainer}>
                           <Text style={styles.addressText}>
                              {selectedOrder.deliveryAddress}
                           </Text>
                        </View>
                     </View>

                     {/* Special Instructions */}
                     {selectedOrder.specialInstructions && (
                        <View style={styles.detailSection}>
                           <Text style={styles.sectionTitle}>Special Instructions</Text>
                           <Text style={styles.instructionsText}>
                              {selectedOrder.specialInstructions}
                           </Text>
                        </View>
                     )}

                     {/* Order Items */}
                     <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Order Items</Text>
                        {selectedOrder.items?.map((item, index) => (
                           <View key={index} style={styles.orderItemRow}>
                              <Text style={styles.itemName}>{item.name}</Text>
                              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                              <Text style={styles.itemPrice}>
                                 {(item.price * item.quantity).toFixed(2)}
                              </Text>
                           </View>
                        ))}
                     </View>
                  </ScrollView>
               </View>
            </View>
         </Modal>
      );
   };

   return (
      <View style={styles.container}>
         {/* Header */}
         <View style={styles.header}>
            <Text style={styles.headerTitle}>Orders ({orders.length})</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
               <Ionicons name="refresh" size={24} color="#e74c3c" />
            </TouchableOpacity>
         </View>

         {/* Status Filter */}
         {renderStatusFilter()}

         {/* Orders List */}
         {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
               <Ionicons name="receipt-outline" size={80} color="#bdc3c7" />
               <Text style={styles.emptyTitle}>No Orders</Text>
               <Text style={styles.emptySubtext}>
                  {selectedStatus === "all"
                     ? "No orders received yet"
                     : `No {selectedStatus} orders`}
               </Text>
            </View>
         ) : (
            <FlatList
               data={filteredOrders}
               renderItem={renderOrderCard}
               keyExtractor={(item) => item.id}
               refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
               }
               contentContainerStyle={styles.ordersList}
               showsVerticalScrollIndicator={false}
            />
         )}

         {/* Order Details Modal */}
         {renderOrderDetailsModal()}
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
   refreshButton: {
      padding: 8,
   },
   filterContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
   },
   filterButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      marginRight: 10,
      backgroundColor: "#ecf0f1",
      borderRadius: 20,
   },
   selectedFilterButton: {
      backgroundColor: "#e74c3c",
   },
   filterButtonText: {
      fontSize: 14,
      color: "#7f8c8d",
      fontWeight: "500",
   },
   selectedFilterText: {
      color: "#fff",
   },
   ordersList: {
      paddingHorizontal: 20,
      paddingBottom: 20,
   },
   orderCard: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 15,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
   },
   orderIdContainer: {
      flex: 1,
   },
   orderId: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#2c3e50",
   },
   orderTime: {
      fontSize: 12,
      color: "#7f8c8d",
      marginTop: 2,
   },
   statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
   },
   statusText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 5,
   },
   customerInfo: {
      marginBottom: 10,
   },
   customerName: {
      fontSize: 14,
      fontWeight: "600",
      color: "#2c3e50",
   },
   customerPhone: {
      fontSize: 12,
      color: "#7f8c8d",
      marginTop: 2,
   },
   orderSummary: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
   },
   itemCount: {
      fontSize: 14,
      color: "#7f8c8d",
   },
   orderTotal: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#e74c3c",
   },
   actionButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
   },
   actionButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
      marginHorizontal: 5,
   },
   actionButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
   },
   emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
   },
   emptyTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#2c3e50",
      marginTop: 20,
      marginBottom: 10,
   },
   emptySubtext: {
      fontSize: 16,
      color: "#7f8c8d",
      textAlign: "center",
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
   },
   orderDetailsModal: {
      backgroundColor: "#fff",
      borderRadius: 20,
      width: "90%",
      maxHeight: "80%",
   },
   orderDetailsBody: {
      padding: 20,
   },
   detailSection: {
      marginBottom: 20,
   },
   sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: 10,
   },
   detailText: {
      fontSize: 14,
      color: "#7f8c8d",
      marginBottom: 5,
   },
   addressContainer: {
      backgroundColor: "#f8f9fa",
      padding: 15,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: "#e74c3c",
   },
   addressText: {
      fontSize: 16,
      color: "#2c3e50",
      lineHeight: 22,
   },
   instructionsText: {
      fontSize: 14,
      color: "#2c3e50",
      backgroundColor: "#fff3cd",
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: "#ffc107",
   },
   orderItemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#f1f2f6",
   },
   itemName: {
      flex: 1,
      fontSize: 14,
      color: "#2c3e50",
   },
   itemQuantity: {
      fontSize: 14,
      color: "#7f8c8d",
      marginHorizontal: 15,
   },
   itemPrice: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#e74c3c",
   },
});

export default HotelOrders;
