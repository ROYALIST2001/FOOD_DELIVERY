import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   TextInput,
   TouchableOpacity,
   StyleSheet,
   Alert,
   KeyboardAvoidingView,
   Platform,
   Dimensions,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { router } from "expo-router";
import { auth, db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);

   const getUserRole = async (uid) => {
      try {
         const userDoc = await getDoc(doc(db, "users", uid));
         if (userDoc.exists()) {
            return userDoc.data().role;
         }
         return null;
      } catch (error) {
         console.error("Error getting user role:", error);
         return null;
      }
   };

   const redirectBasedOnRole = (role) => {
      if (role === "customer") {
         router.replace("/(tabs)/home");
      } else if (role === "hotel_owner") {
         router.replace("/(hotel)/dashboard");
      }
   };

   const handleLogin = async () => {
      if (!email || !password) {
         Alert.alert("Error", "Please fill in all fields");
         return;
      }

      if (!email.includes("@")) {
         Alert.alert("Error", "Please enter a valid email address");
         return;
      }

      setLoading(true);
      try {
         console.log("Attempting to login with email:", email);

         // Sign in user
         const userCredential = await signInWithEmailAndPassword(auth, email, password);
         console.log("Login successful for user:", userCredential.user.uid);

         // Get user role from Firestore
         const userRole = await getUserRole(userCredential.user.uid);
         console.log("User role:", userRole);

         if (userRole) {
            // Navigate based on role
            redirectBasedOnRole(userRole);
         } else {
            Alert.alert("Error", "User role not found. Please contact support.");
         }
      } catch (error) {
         console.error("Login error:", error);
         console.log("Error code:", error.code);

         // Show specific error messages
         let errorMessage = "Login failed. Please try again.";

         if (error.code === "auth/user-not-found") {
            errorMessage = "No account found with this email address.";
         } else if (error.code === "auth/wrong-password") {
            errorMessage = "Incorrect password. Please try again.";
         } else if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email address format.";
         } else if (error.code === "auth/user-disabled") {
            errorMessage = "This account has been disabled.";
         } else if (error.code === "auth/too-many-requests") {
            errorMessage = "Too many failed attempts. Please try again later.";
         } else if (error.code === "auth/invalid-credential") {
            errorMessage = "Invalid email or password. Please check your credentials.";
         } else if (error.code === "auth/network-request-failed") {
            errorMessage = "Network error. Please check your internet connection.";
         } else if (error.message) {
            errorMessage = error.message;
         }

         Alert.alert("Login Error", errorMessage);
      } finally {
         setLoading(false);
      }
   };

   return (
      <KeyboardAvoidingView
         style={styles.container}
         behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
         <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
               <Text style={styles.title}>🍽️ FoodDelivery</Text>
               <Text style={styles.subtitle}>
                  Welcome back! Please sign in to continue
               </Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
               {/* Email Input */}
               <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                     <Ionicons
                        name="mail-outline"
                        size={20}
                        color="#7f8c8d"
                        style={styles.inputIcon}
                     />
                     <TextInput
                        style={styles.textInput}
                        placeholder="Enter your email"
                        placeholderTextColor="#bdc3c7"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                     />
                  </View>
               </View>

               {/* Password Input */}
               <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                     <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="#7f8c8d"
                        style={styles.inputIcon}
                     />
                     <TextInput
                        style={[styles.textInput, { flex: 1 }]}
                        placeholder="Enter your password"
                        placeholderTextColor="#bdc3c7"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                     />
                     <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                     >
                        <Ionicons
                           name={showPassword ? "eye-outline" : "eye-off-outline"}
                           size={20}
                           color="#7f8c8d"
                        />
                     </TouchableOpacity>
                  </View>
               </View>

               {/* Login Button */}
               <TouchableOpacity
                  style={[styles.loginButton, loading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={loading}
               >
                  <Text style={styles.loginButtonText}>
                     {loading ? "Signing In..." : "Sign In"}
                  </Text>
               </TouchableOpacity>

               {/* Divider */}
               <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
               </View>

               {/* Sign Up Link */}
               <TouchableOpacity
                  style={styles.signupButton}
                  onPress={() => router.push("/signup")}
               >
                  <Text style={styles.signupButtonText}>
                     Don't have an account? Sign Up
                  </Text>
               </TouchableOpacity>
            </View>
         </View>
      </KeyboardAvoidingView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f8f9fa",
   },
   content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
   },
   header: {
      alignItems: "center",
      marginBottom: 40,
   },
   title: {
      fontSize: 32,
      fontWeight: "800",
      color: "#2c3e50",
      marginBottom: 8,
   },
   subtitle: {
      fontSize: 16,
      color: "#7f8c8d",
      textAlign: "center",
      lineHeight: 22,
   },
   form: {
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 25,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
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
   inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#e9ecef",
      borderRadius: 12,
      backgroundColor: "#f8f9fa",
      paddingHorizontal: 15,
   },
   inputIcon: {
      marginRight: 12,
   },
   textInput: {
      flex: 1,
      paddingVertical: 15,
      fontSize: 16,
      color: "#2c3e50",
   },
   eyeIcon: {
      padding: 5,
   },
   loginButton: {
      backgroundColor: "#e74c3c",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 10,
      shadowColor: "#e74c3c",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
   },
   disabledButton: {
      backgroundColor: "#bdc3c7",
      shadowOpacity: 0,
      elevation: 0,
   },
   loginButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
   },
   divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 25,
   },
   dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: "#e9ecef",
   },
   dividerText: {
      color: "#7f8c8d",
      fontSize: 14,
      marginHorizontal: 15,
      fontWeight: "500",
   },
   signupButton: {
      alignItems: "center",
      paddingVertical: 15,
   },
   signupButtonText: {
      color: "#3498db",
      fontSize: 16,
      fontWeight: "600",
   },
});

export default LoginScreen;
