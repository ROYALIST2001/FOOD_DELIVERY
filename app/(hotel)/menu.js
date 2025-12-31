import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   StyleSheet,
   ScrollView,
   TouchableOpacity,
   TextInput,
   Alert,
   Modal,
   Image,
   FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
   collection,
   addDoc,
   updateDoc,
   deleteDoc,
   doc,
   onSnapshot,
   query,
   where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

const getCategoryEmoji = (category) => {
   const emojis = {
      All: "🍽️",
      Pizza: "🍕",
      Burgers: "🍔",
      Salads: "🥗",
      Drinks: "🥤",
      Desserts: "🍰",
   };
   return emojis[category] || "🍽️";
};

const HotelMenu = () => {
   const [menuItems, setMenuItems] = useState([]);
   const [modalVisible, setModalVisible] = useState(false);
   const [editingItem, setEditingItem] = useState(null);
   const [selectedCategory, setSelectedCategory] = useState("All");

   const [formData, setFormData] = useState({
      name: "",
      description: "",
      price: "",
      category: "Pizza",
      image: "",
   });

   const categories = ["All", "Pizza", "Burgers", "Salads", "Drinks", "Desserts"];

   useEffect(() => {
      if (!auth.currentUser) return;
      const q = query(
         collection(db, "menuItems"),
         where("hotelOwnerId", "==", auth.currentUser.uid),
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
         const items = [];
         querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
         });
         setMenuItems(items);
      });
      return unsubscribe;
   }, []);

   const getCategoryIcon = (category) => {
      const icons = {
         All: "apps-outline",
         Pizza: "pizza-outline",
         Burgers: "fast-food-outline",
         Salads: "leaf-outline",
         Drinks: "wine-outline",
         Desserts: "ice-cream-outline",
      };
      return icons[category] || "restaurant-outline";
   };

   const getCategoryEmoji = (category) => {
      const emojis = {
         All: "🍽️",
         Pizza: "🍕",
         Burgers: "🍔",
         Salads: "🥗",
         Drinks: "🥤",
         Desserts: "🍰",
      };
      return emojis[category] || "🍽️";
   };

   const resetForm = () => {
      setFormData({
         name: "",
         description: "",
         price: "",
         category: "Pizza",
         image: "",
      });
      setEditingItem(null);
   };

   const openAddModal = () => {
      resetForm();
      setModalVisible(true);
   };

   const openEditModal = (item) => {
      setFormData({
         name: item.name,
         description: item.description,
         price: item.price.toString(),
         category: item.category,
         image: item.image || "",
      });
      setEditingItem(item);
      setModalVisible(true);
   };

   const saveMenuItem = async () => {
      if (!formData.name || !formData.description || !formData.price) {
         Alert.alert("Error", "Please fill in all fields");
         return;
      }

      const menuItem = {
         name: formData.name,
         description: formData.description,
         price: parseFloat(formData.price),
         category: formData.category,
         isAvailable: editingItem ? editingItem.isAvailable : true,
         image:
            formData.image ||
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
         hotelOwnerId: auth.currentUser?.uid,
         hotelName: auth.currentUser?.displayName + "'s Restaurant",
         createdAt: new Date().toISOString(),
      };

      try {
         if (editingItem) {
            await updateDoc(doc(db, "menuItems", editingItem.id), menuItem);
            Alert.alert("Success", "Menu item updated!");
         } else {
            await addDoc(collection(db, "menuItems"), menuItem);
            Alert.alert("Success", "Menu item added!");
         }
         setModalVisible(false);
         resetForm();
      } catch (error) {
         Alert.alert("Error", "Failed to save: " + error.message);
      }
   };

   const deleteMenuItem = async (id) => {
      Alert.alert("Delete Item", "Are you sure?", [
         { text: "Cancel" },
         {
            text: "Delete",
            onPress: async () => {
               try {
                  await deleteDoc(doc(db, "menuItems", id));
                  Alert.alert("Success", "Item deleted!");
               } catch (error) {
                  Alert.alert("Error", error.message);
               }
            },
         },
      ]);
   };

   const toggleAvailability = async (id) => {
      try {
         const item = menuItems.find((item) => item.id === id);
         if (!item) {
            console.log("Item not found");
            return;
         }

         console.log(
            "Toggling availability for:",
            item.name,
            "from",
            item.isAvailable,
            "to",
            !item.isAvailable,
         );

         await updateDoc(doc(db, "menuItems", id), {
            isAvailable: !item.isAvailable,
         });

         console.log("Successfully updated availability");
      } catch (error) {
         console.error("Error updating availability:", error);
         Alert.alert("Error", "Failed to update availability: " + error.message);
      }
   };

   const filteredItems =
      selectedCategory === "All"
         ? menuItems
         : menuItems.filter((item) => item.category === selectedCategory);

   const renderMenuItem = ({ item }) => (
      <View style={styles.card}>
         <Image source={{ uri: item.image }} style={styles.cardImage} />
         <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
               <Text style={styles.itemName}>{item.name}</Text>
               <Text style={styles.itemPrice}>{item.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.itemDescription}>{item.description}</Text>

            {/* Simple Availability Button */}
            <TouchableOpacity
               style={[
                  styles.availabilityBtn,
                  { backgroundColor: item.isAvailable ? "#27ae60" : "#e74c3c" },
               ]}
               onPress={() => toggleAvailability(item.id)}
            >
               <Text style={styles.availabilityBtnText}>
                  {item.isAvailable ? "Available" : "Not Available"}
               </Text>
            </TouchableOpacity>

            <View style={styles.cardFooter}>
               <Text style={styles.itemCategory}>{item.category}</Text>
               <View style={styles.actions}>
                  <TouchableOpacity
                     onPress={() => openEditModal(item)}
                     style={styles.editBtn}
                  >
                     <Ionicons name="pencil" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                     onPress={() => deleteMenuItem(item.id)}
                     style={styles.deleteBtn}
                  >
                     <Ionicons name="trash" size={16} color="#fff" />
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </View>
   );

   return (
      <View style={styles.container}>
         <View style={styles.header}>
            <View style={styles.headerContent}>
               <View style={styles.headerLeft}>
                  <Text style={styles.title}>🍽️ Menu Manager</Text>
                  <Text style={styles.subtitle}>Manage your restaurant menu</Text>
               </View>
               <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
                  <Ionicons name="add" size={24} color="#fff" />
               </TouchableOpacity>
            </View>
         </View>

         <View style={styles.statsContainer}>
            <View style={styles.statCard}>
               <Text style={styles.statNumber}>{menuItems.length}</Text>
               <Text style={styles.statLabel}>Total Items</Text>
            </View>
            <View style={styles.statCard}>
               <Text style={[styles.statNumber, { color: "#27ae60" }]}>
                  {menuItems.filter((item) => item.isAvailable).length}
               </Text>
               <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statCard}>
               <Text style={[styles.statNumber, { color: "#e74c3c" }]}>
                  {menuItems.filter((item) => !item.isAvailable).length}
               </Text>
               <Text style={styles.statLabel}>Unavailable</Text>
            </View>
         </View>

         <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>🍽️ Food Categories</Text>
            <ScrollView
               horizontal
               showsHorizontalScrollIndicator={false}
               contentContainerStyle={styles.categoryScrollContent}
            >
               {categories.map((category) => (
                  <TouchableOpacity
                     key={category}
                     style={[
                        styles.categoryCard,
                        selectedCategory === category && styles.activeCategoryCard,
                     ]}
                     onPress={() => setSelectedCategory(category)}
                  >
                     <View
                        style={[
                           styles.categoryIconContainer,
                           selectedCategory === category &&
                              styles.activeCategoryIconContainer,
                        ]}
                     >
                        <Text style={styles.categoryEmoji}>
                           {getCategoryEmoji(category)}
                        </Text>
                     </View>
                     <Text
                        style={[
                           styles.categoryName,
                           selectedCategory === category && styles.activeCategoryName,
                        ]}
                     >
                        {category}
                     </Text>
                     <Text
                        style={[
                           styles.categoryCount,
                           selectedCategory === category && styles.activeCategoryCount,
                        ]}
                     >
                        {category === "All"
                           ? `${menuItems.length} items`
                           : `${
                                menuItems.filter((item) => item.category === category)
                                   .length
                             } items`}
                     </Text>
                  </TouchableOpacity>
               ))}
            </ScrollView>
         </View>

         <View style={styles.countContainer}>
            <Text style={styles.countText}>
               {filteredItems.length} {filteredItems.length === 1 ? "Item" : "Items"}
               {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </Text>
         </View>

         {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
               <Ionicons name="restaurant-outline" size={60} color="#ccc" />
               <Text style={styles.emptyTitle}>No Items Found</Text>
               <Text style={styles.emptySubtitle}>
                  {selectedCategory === "All"
                     ? "Add your first menu item"
                     : `No items in ${selectedCategory} category`}
               </Text>
               <TouchableOpacity style={styles.emptyActionBtn} onPress={openAddModal}>
                  <Text style={styles.emptyActionText}>Add Item</Text>
               </TouchableOpacity>
            </View>
         ) : (
            <FlatList
               data={filteredItems}
               renderItem={renderMenuItem}
               keyExtractor={(item) => item.id}
               contentContainerStyle={styles.list}
               numColumns={2}
               showsVerticalScrollIndicator={false}
            />
         )}

         <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={styles.modal}>
               <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                     <Text style={styles.modalTitle}>
                        {editingItem ? "Edit" : "Add"} Menu Item
                     </Text>
                     <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#666" />
                     </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.form}>
                     <View style={styles.input}>
                        <Text style={styles.label}>Item Name</Text>
                        <TextInput
                           style={styles.textInput}
                           value={formData.name}
                           onChangeText={(text) =>
                              setFormData({ ...formData, name: text })
                           }
                           placeholder="Enter item name"
                        />
                     </View>

                     <View style={styles.input}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                           style={[styles.textInput, styles.textarea]}
                           value={formData.description}
                           onChangeText={(text) =>
                              setFormData({ ...formData, description: text })
                           }
                           placeholder="Enter description"
                           multiline
                        />
                     </View>

                     <View style={styles.input}>
                        <Text style={styles.label}>Price</Text>
                        <TextInput
                           style={styles.textInput}
                           value={formData.price}
                           onChangeText={(text) =>
                              setFormData({ ...formData, price: text })
                           }
                           placeholder="0.00"
                           keyboardType="numeric"
                        />
                     </View>

                     <View style={styles.input}>
                        <Text style={styles.label}>Image URL (Optional)</Text>
                        <TextInput
                           style={styles.textInput}
                           value={formData.image}
                           onChangeText={(text) =>
                              setFormData({ ...formData, image: text })
                           }
                           placeholder="Enter image URL"
                        />
                     </View>

                     <View style={styles.input}>
                        <Text style={styles.label}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                           {categories.slice(1).map((category) => (
                              <TouchableOpacity
                                 key={category}
                                 style={[
                                    styles.categorySelect,
                                    formData.category === category &&
                                       styles.activeCategorySelect,
                                 ]}
                                 onPress={() => setFormData({ ...formData, category })}
                              >
                                 <Text
                                    style={[
                                       styles.categorySelectText,
                                       formData.category === category &&
                                          styles.activeCategorySelectText,
                                    ]}
                                 >
                                    {category}
                                 </Text>
                              </TouchableOpacity>
                           ))}
                        </ScrollView>
                     </View>

                     <TouchableOpacity style={styles.saveBtn} onPress={saveMenuItem}>
                        <Text style={styles.saveBtnText}>
                           {editingItem ? "Update Item" : "Add Item"}
                        </Text>
                     </TouchableOpacity>
                  </ScrollView>
               </View>
            </View>
         </Modal>
      </View>
   );
};

const styles = StyleSheet.create({
   container: { flex: 1, backgroundColor: "#f8f9fa" },
   header: {
      backgroundColor: "#fff",
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
   },
   headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
   },
   headerLeft: { flex: 1 },
   title: { fontSize: 28, fontWeight: "800", color: "#1a1a1a" },
   subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
   addBtn: {
      backgroundColor: "#ff4757",
      width: 54,
      height: 54,
      borderRadius: 27,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#ff4757",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
   },
   statsContainer: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 20 },
   statCard: {
      flex: 1,
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 18,
      marginHorizontal: 6,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
   },
   statNumber: { fontSize: 28, fontWeight: "800", color: "#ff4757" },
   statLabel: { fontSize: 13, color: "#666", fontWeight: "600", marginTop: 6 },
   categoryContainer: {
      backgroundColor: "#fff",
      paddingVertical: 25,
      paddingHorizontal: 20,
      marginHorizontal: 20,
      marginBottom: 15,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
   },
   categoryTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: "#1a1a1a",
      marginBottom: 20,
      textAlign: "center",
   },
   categoryScrollContent: {
      paddingHorizontal: 5,
   },
   categoryCard: {
      backgroundColor: "#f8f9fa",
      borderRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 15,
      marginRight: 15,
      alignItems: "center",
      width: 110,
      borderWidth: 2,
      borderColor: "transparent",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
   },
   activeCategoryCard: {
      backgroundColor: "#ff4757",
      borderColor: "#ff6b7a",
      transform: [{ scale: 1.05 }],
      shadowColor: "#ff4757",
      shadowOpacity: 0.3,
   },
   categoryIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
   },
   activeCategoryIconContainer: {
      backgroundColor: "#fff",
      shadowColor: "#ff4757",
      shadowOpacity: 0.3,
   },
   categoryEmoji: {
      fontSize: 24,
   },
   categoryName: {
      fontSize: 14,
      fontWeight: "700",
      color: "#2c3e50",
      marginBottom: 5,
      textAlign: "center",
   },
   activeCategoryName: {
      color: "#fff",
      fontWeight: "800",
   },
   categoryCount: {
      fontSize: 11,
      color: "#7f8c8d",
      fontWeight: "600",
      textAlign: "center",
   },
   activeCategoryCount: {
      color: "#fff",
      fontWeight: "700",
   },
   countContainer: { paddingHorizontal: 20, marginBottom: 12 },
   countText: { fontSize: 16, fontWeight: "600", color: "#666" },
   list: { padding: 20 },
   card: {
      flex: 1,
      backgroundColor: "#fff",
      borderRadius: 20,
      margin: 6,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
   },
   cardImage: { width: "100%", height: 140 },
   cardContent: { padding: 16 },
   cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
   },
   itemName: {
      fontSize: 17,
      fontWeight: "700",
      color: "#1a1a1a",
      flex: 1,
      marginRight: 8,
   },
   itemPrice: { fontSize: 17, fontWeight: "700", color: "#ff4757" },
   itemDescription: { fontSize: 13, color: "#666", marginBottom: 14, lineHeight: 18 },
   availabilityBtn: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      marginBottom: 10,
      alignItems: "center",
   },
   availabilityBtnText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
   },
   cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
   },
   itemCategory: {
      fontSize: 11,
      color: "#fff",
      backgroundColor: "#5f27cd",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
      fontWeight: "600",
   },
   actions: { flexDirection: "row" },
   editBtn: {
      backgroundColor: "#3742fa",
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
      shadowColor: "#3742fa",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
   },
   deleteBtn: {
      backgroundColor: "#ff3838",
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#ff3838",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
   },
   emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
   emptyTitle: { fontSize: 22, fontWeight: "700", color: "#1a1a1a", marginTop: 16 },
   emptySubtitle: {
      fontSize: 15,
      color: "#666",
      textAlign: "center",
      marginTop: 8,
      marginBottom: 24,
      lineHeight: 22,
   },
   emptyActionBtn: {
      backgroundColor: "#ff4757",
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 30,
      shadowColor: "#ff4757",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
   },
   emptyActionText: { color: "#fff", fontSize: 15, fontWeight: "700" },
   modal: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
   },
   modalCard: {
      backgroundColor: "#fff",
      borderRadius: 24,
      width: "92%",
      maxHeight: "85%",
   },
   modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: "#f0f0f0",
   },
   modalTitle: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
   form: { padding: 24 },
   input: { marginBottom: 20 },
   label: { fontSize: 15, fontWeight: "600", color: "#1a1a1a", marginBottom: 8 },
   textInput: {
      borderWidth: 1,
      borderColor: "#e0e0e0",
      borderRadius: 14,
      padding: 16,
      fontSize: 16,
      backgroundColor: "#f9f9f9",
   },
   textarea: { height: 90, textAlignVertical: "top" },
   categorySelect: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 10,
      backgroundColor: "#e8ecf0",
      borderRadius: 22,
   },
   activeCategorySelect: { backgroundColor: "#ff4757" },
   categorySelectText: { fontSize: 13, color: "#666", fontWeight: "600" },
   activeCategorySelectText: { color: "#fff" },
   saveBtn: {
      backgroundColor: "#2ed573",
      borderRadius: 14,
      padding: 18,
      alignItems: "center",
      marginTop: 12,
      shadowColor: "#2ed573",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
   },
   saveBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});

export default HotelMenu;
