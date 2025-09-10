import React, { useState } from "react";
import {
   View,
   Text,
   TextInput,
   TouchableOpacity,
   StyleSheet,
   Alert,
   ScrollView,
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

   const getUserRole = async (userId) => {
      try {
         const userDoc = await getDoc(doc(db, "users", userId));
         if (userDoc.exists()) {
            return userDoc.data().role;
         }
         return null;
      } catch (error) {
         console.error("Error fetching user role:", error);
         return null;
      }
   };

   const redirectBasedOnRole = (role) => {
      if (role === "customer") {
         router.replace("/(tabs)/home");
      } else if (role === "hotel_owner") {
         router.replace("/(hotel)/dashboard");
      } else {
         // Fallback if role is not found
         Alert.alert("Error", "User role not found. Please contact support.");
      }
   };

   const handleLogin = async () => {
      if (!email || !password) {
         Alert.alert("Error", "Please fill in all fields");
         return;
      }

      setLoading(true);
      try {
         // Sign in user
         const userCredential = await signInWithEmailAndPassword(auth, email, password);

         // Get user role from Firestore
         const userRole = await getUserRole(userCredential.user.uid);

         if (userRole) {
            // Navigate based on role
            redirectBasedOnRole(userRole);
         } else {
            Alert.alert("Error", "User role not found. Please contact support.");
         }
      } catch (error) {
         Alert.alert("Login Error", error.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <KeyboardAvoidingView
         style={styles.container}
         behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
         <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
         >
            {/* Header Section */}
            <View style={styles.header}>
               <Text style={styles.welcomeText}>Welcome Back!</Text>
               <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
               {/* Email Input */}
               <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                     <Ionicons
                        name="mail-outline"
                        size={22}
                        color="#7f8c8d"
                        style={styles.inputIcon}
                     />
                     <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#bdc3c7"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                     />
                  </View>
               </View>

               {/* Password Input */}
               <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                     <Ionicons
                        name="lock-closed-outline"
                        size={22}
                        color="#7f8c8d"
                        style={styles.inputIcon}
                     />
                     <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Enter your password"
                        placeholderTextColor="#bdc3c7"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        autoComplete="password"
                     />
                     <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                     >
                        <Ionicons
                           name={showPassword ? "eye-outline" : "eye-off-outline"}
                           size={22}
                           color="#7f8c8d"
                        />
                     </TouchableOpacity>
                  </View>
               </View>

               {/* Forgot Password */}
               <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
               </TouchableOpacity>

               {/* Login Button */}
               <TouchableOpacity
                  style={[styles.loginButton, loading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={loading}
               >
                  <Text style={styles.loginButtonText}>
                     {loading ? "Signing In..." : "Sign In"}
                  </Text>
                  {!loading && (
                     <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#fff"
                        style={styles.buttonIcon}
                     />
                  )}
               </TouchableOpacity>

               {/* Sign Up Link */}
               <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/signup")}>
                     <Text style={styles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </ScrollView>
      </KeyboardAvoidingView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f8f9fa",
   },
   scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingVertical: 40,
   },
   header: {
      alignItems: "center",
      marginBottom: 40,
   },
   welcomeText: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: 8,
   },
   subtitle: {
      fontSize: 16,
      color: "#7f8c8d",
      textAlign: "center",
   },
   formContainer: {
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
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
      backgroundColor: "#f8f9fa",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: "#e9ecef",
   },
   inputIcon: {
      marginRight: 12,
   },
   input: {
      flex: 1,
      fontSize: 16,
      color: "#2c3e50",
      paddingVertical: 16,
   },
   eyeIcon: {
      padding: 8,
   },
   forgotPasswordContainer: {
      alignItems: "flex-end",
      marginBottom: 24,
   },
   forgotPasswordText: {
      color: "#e74c3c",
      fontSize: 14,
      fontWeight: "500",
   },
   loginButton: {
      backgroundColor: "#e74c3c",
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
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
      fontWeight: "bold",
   },
   buttonIcon: {
      marginLeft: 8,
   },
   signupContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
   },
   signupText: {
      color: "#7f8c8d",
      fontSize: 16,
   },
   signupLink: {
      color: "#e74c3c",
      fontSize: 16,
      fontWeight: "bold",
   },
});

export default LoginScreen;
