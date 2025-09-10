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

   // Load menu items from Firebase
   useEffect(() => {
      const loadMenuItems = () => {
         if (!auth.currentUser) {
            console.log("No authenticated user in hotel menu");
            return;
         }

         console.log("Loading menu items for hotel owner:", auth.currentUser.uid);

         const q = query(
            collection(db, "menuItems"),
            where("hotelOwnerId", "==", auth.currentUser.uid),
         );

         const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
               const item = { id: doc.id, ...doc.data() };
               console.log("Menu item found:", item);
               items.push(item);
            });
            console.log(`Found ${items.length} menu items`);
            setMenuItems(items);
         });

         return unsubscribe;
      };

      const unsubscribe = loadMenuItems();
      return () => {
         if (unsubscribe) unsubscribe();
      };
   }, []);

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
         image: item.image,
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
         isAvailable: true,
         image:
            formData.image ||
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
         hotelOwnerId: auth.currentUser?.uid,
         hotelName: auth.currentUser?.displayName + "'s Restaurant",
         createdAt: new Date().toISOString(),
      };

      try {
         console.log("Saving menu item:", menuItem);

         if (editingItem) {
            await updateDoc(doc(db, "menuItems", editingItem.id), menuItem);
            console.log("✅ Menu item updated");
            Alert.alert("Success", "Menu item updated!");
         } else {
            const docRef = await addDoc(collection(db, "menuItems"), menuItem);
            console.log("✅ Menu item created with ID:", docRef.id);
            Alert.alert("Success", "Menu item added!");
         }

         setModalVisible(false);
         resetForm();
      } catch (error) {
         console.error("❌ Error saving menu item:", error);
         Alert.alert("Error", "Failed to save menu item: " + error.message);
      }
   };

   const deleteMenuItem = async (id) => {
      console.log("🗑️ DELETE BUTTON CLICKED");
      console.log("Item ID to delete:", id);
      console.log("Current user:", auth.currentUser?.uid);

      Alert.alert("Delete Item", "Are you sure you want to delete this menu item?", [
         {
            text: "Cancel",
            style: "cancel",
            onPress: () => console.log("❌ Delete cancelled"),
         },
         {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
               console.log("🔄 Starting delete process...");
               try {
                  console.log("Attempting to delete document:", id);

                  await deleteDoc(doc(db, "menuItems", id));

                  console.log("✅ Successfully deleted from Firebase");
                  Alert.alert("Success", "Menu item deleted successfully!");
               } catch (error) {
                  console.error("❌ Delete failed:", error);
                  console.error("Error code:", error.code);
                  console.error("Error message:", error.message);
                  Alert.alert("Error", `Failed to delete: ${error.message}`);
               }
            },
         },
      ]);
   };

   const toggleAvailability = async (id) => {
      try {
         const currentItem = menuItems.find((item) => item.id === id);
         if (!currentItem) return;

         console.log("Toggling availability for item:", id);

         await updateDoc(doc(db, "menuItems", id), {
            isAvailable: !currentItem.isAvailable,
         });

         console.log("✅ Item availability updated");
      } catch (error) {
         console.error("❌ Error updating availability:", error);
         Alert.alert("Error", "Failed to update item availability");
      }
   };

   const filteredItems =
      selectedCategory === "All"
         ? menuItems
         : menuItems.filter((item) => item.category === selectedCategory);

   const renderCategoryFilter = () => (
      <ScrollView
         horizontal
         showsHorizontalScrollIndicator={false}
         style={styles.categoryContainer}
      >
         {categories.map((category) => (
            <TouchableOpacity
               key={category}
               style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategoryButton,
               ]}
               onPress={() => setSelectedCategory(category)}
            >
               <Text
                  style={[
                     styles.categoryButtonText,
                     selectedCategory === category && styles.selectedCategoryText,
                  ]}
               >
                  {category}
               </Text>
            </TouchableOpacity>
         ))}
      </ScrollView>
   );

   const renderMenuItem = ({ item }) => (
      <View style={styles.menuItemCard}>
         <Image source={{ uri: item.image }} style={styles.menuItemImage} />

         <View style={styles.menuItemContent}>
            <View style={styles.menuItemHeader}>
               <Text style={styles.menuItemName}>{item.name}</Text>
               <View style={styles.menuItemActions}>
                  {/* Availability Toggle */}
                  <TouchableOpacity
                     onPress={() => {
                        console.log("🔄 Availability toggle pressed for:", item.id);
                        toggleAvailability(item.id);
                     }}
                     style={[
                        styles.availabilityButton,
                        { backgroundColor: item.isAvailable ? "#27ae60" : "#e74c3c" },
                     ]}
                  >
                     <Ionicons
                        name={item.isAvailable ? "checkmark" : "close"}
                        size={16}
                        color="#fff"
                     />
                  </TouchableOpacity>

                  {/* Edit Button */}
                  <TouchableOpacity
                     onPress={() => {
                        console.log("✏️ Edit button pressed for:", item.id);
                        openEditModal(item);
                     }}
                     style={styles.actionButton}
                  >
                     <Ionicons name="pencil" size={18} color="#3498db" />
                  </TouchableOpacity>

                  {/* Delete Button - Make sure this is correct */}
                  <TouchableOpacity
                     onPress={() => {
                        console.log("🗑️ Delete button pressed for item:", item.id);
                        console.log("Item details:", item);
                        deleteMenuItem(item.id);
                     }}
                     style={styles.actionButton}
                  >
                     <Ionicons name="trash" size={18} color="#e74c3c" />
                  </TouchableOpacity>
               </View>
            </View>

            <Text style={styles.menuItemDescription}>{item.description}</Text>

            <View style={styles.menuItemFooter}>
               <Text style={styles.menuItemPrice}>{item.price.toFixed(2)}</Text>
               <Text style={styles.menuItemCategory}>{item.category}</Text>
            </View>
         </View>
      </View>
   );

   return (
      <View style={styles.container}>
         {/* Header */}
         <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu Management</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
               <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
         </View>

         {/* Category Filter */}
         {renderCategoryFilter()}

         {/* Stats */}
         <View style={styles.statsContainer}>
            <View style={styles.statCard}>
               <Text style={styles.statValue}>{menuItems.length}</Text>
               <Text style={styles.statLabel}>Total Items</Text>
            </View>
            <View style={styles.statCard}>
               <Text style={styles.statValue}>
                  {menuItems.filter((item) => item.isAvailable).length}
               </Text>
               <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statCard}>
               <Text style={styles.statValue}>{categories.length - 1}</Text>
               <Text style={styles.statLabel}>Categories</Text>
            </View>
         </View>

         {/* Menu Items List */}
         {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
               <Ionicons name="restaurant-outline" size={80} color="#bdc3c7" />
               <Text style={styles.emptyTitle}>No Menu Items</Text>
               <Text style={styles.emptySubtext}>
                  {selectedCategory === "All"
                     ? "Add your first menu item to get started"
                     : `No items in ${selectedCategory} category`}
               </Text>
               <TouchableOpacity style={styles.addFirstButton} onPress={openAddModal}>
                  <Text style={styles.addFirstButtonText}>Add Menu Item</Text>
               </TouchableOpacity>
            </View>
         ) : (
            <FlatList
               data={filteredItems}
               renderItem={renderMenuItem}
               keyExtractor={(item) => item.id.toString()}
               contentContainerStyle={styles.menuList}
               showsVerticalScrollIndicator={false}
            />
         )}

         {/* Add/Edit Modal */}
         <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
         >
            <View style={styles.modalOverlay}>
               <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                     <Text style={styles.modalTitle}>
                        {editingItem ? "Edit Menu Item" : "Add Menu Item"}
                     </Text>
                     <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={styles.closeButton}
                     >
                        <Ionicons name="close" size={24} color="#7f8c8d" />
                     </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalForm}>
                     {/* Name Input */}
                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Item Name</Text>
                        <TextInput
                           style={styles.textInput}
                           placeholder="Enter item name"
                           value={formData.name}
                           onChangeText={(text) =>
                              setFormData({ ...formData, name: text })
                           }
                        />
                     </View>

                     {/* Description Input */}
                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Description</Text>
                        <TextInput
                           style={[styles.textInput, { height: 80 }]}
                           placeholder="Enter description"
                           multiline
                           value={formData.description}
                           onChangeText={(text) =>
                              setFormData({ ...formData, description: text })
                           }
                        />
                     </View>

                     {/* Price Input */}
                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Price</Text>
                        <TextInput
                           style={styles.textInput}
                           placeholder="0.00"
                           keyboardType="numeric"
                           value={formData.price}
                           onChangeText={(text) =>
                              setFormData({ ...formData, price: text })
                           }
                        />
                     </View>

                     {/* Category Selection */}
                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                           {categories.slice(1).map((category) => (
                              <TouchableOpacity
                                 key={category}
                                 style={[
                                    styles.categorySelectButton,
                                    formData.category === category &&
                                       styles.selectedCategorySelectButton,
                                 ]}
                                 onPress={() => setFormData({ ...formData, category })}
                              >
                                 <Text
                                    style={[
                                       styles.categorySelectText,
                                       formData.category === category &&
                                          styles.selectedCategorySelectText,
                                    ]}
                                 >
                                    {category}
                                 </Text>
                              </TouchableOpacity>
                           ))}
                        </ScrollView>
                     </View>

                     {/* Image URL Input */}
                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Image URL (Optional)</Text>
                        <TextInput
                           style={styles.textInput}
                           placeholder="Enter image URL"
                           value={formData.image}
                           onChangeText={(text) =>
                              setFormData({ ...formData, image: text })
                           }
                        />
                     </View>

                     {/* Save Button */}
                     <TouchableOpacity style={styles.saveButton} onPress={saveMenuItem}>
                        <Text style={styles.saveButtonText}>
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
   addButton: {
      backgroundColor: "#e74c3c",
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
   },
   categoryContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
   },
   categoryButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      marginRight: 10,
      backgroundColor: "#ecf0f1",
      borderRadius: 20,
   },
   selectedCategoryButton: {
      backgroundColor: "#e74c3c",
   },
   categoryButtonText: {
      fontSize: 14,
      color: "#7f8c8d",
      fontWeight: "500",
   },
   selectedCategoryText: {
      color: "#fff",
   },
   statsContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 15,
   },
   statCard: {
      flex: 1,
      backgroundColor: "#fff",
      padding: 15,
      marginHorizontal: 5,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   statValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#e74c3c",
   },
   statLabel: {
      fontSize: 12,
      color: "#7f8c8d",
      marginTop: 5,
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
      marginBottom: 30,
   },
   addFirstButton: {
      backgroundColor: "#e74c3c",
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 25,
   },
   addFirstButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
   },
   menuList: {
      paddingHorizontal: 20,
      paddingBottom: 20,
   },
   menuItemCard: {
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
      height: 150,
      backgroundColor: "#ecf0f1",
   },
   menuItemContent: {
      padding: 15,
   },
   menuItemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
   },
   menuItemName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#2c3e50",
      flex: 1,
   },
   menuItemActions: {
      flexDirection: "row",
      alignItems: "center",
   },
   availabilityButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
   },
   actionButton: {
      padding: 8,
      marginLeft: 4,
   },
   menuItemDescription: {
      fontSize: 14,
      color: "#7f8c8d",
      marginBottom: 12,
      lineHeight: 20,
   },
   menuItemFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
   },
   menuItemPrice: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#e74c3c",
   },
   menuItemCategory: {
      fontSize: 12,
      color: "#3498db",
      backgroundColor: "#ecf8ff",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
   },
   availabilityStatus: {
      fontSize: 12,
      fontWeight: "600",
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
   closeButton: {
      padding: 5,
   },
   modalForm: {
      padding: 20,
   },
   inputContainer: {
      marginBottom: 20,
   },
   inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#2c3e50",
      marginBottom: 8,
   },
   textInput: {
      borderWidth: 1,
      borderColor: "#e9ecef",
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      backgroundColor: "#f8f9fa",
   },
   categorySelectButton: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      marginRight: 10,
      backgroundColor: "#ecf0f1",
      borderRadius: 20,
   },
   selectedCategorySelectButton: {
      backgroundColor: "#e74c3c",
   },
   categorySelectText: {
      fontSize: 14,
      color: "#7f8c8d",
   },
   selectedCategorySelectText: {
      color: "#fff",
   },
   saveButton: {
      backgroundColor: "#e74c3c",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginTop: 10,
   },
   saveButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
   },
});

export default HotelMenu;
