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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { router } from "expo-router";
import { auth, db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const SignupScreen = () => {
   const [fullName, setFullName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [selectedRole, setSelectedRole] = useState(""); // customer or hotel_owner
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [loading, setLoading] = useState(false);

   const handleSignup = async () => {
      // Validation checks
      if (!fullName || !email || !password || !confirmPassword || !selectedRole) {
         Alert.alert("Error", "Please fill in all fields and select your role");
         return;
      }

      if (password !== confirmPassword) {
         Alert.alert("Error", "Passwords do not match");
         return;
      }

      if (password.length < 6) {
         Alert.alert("Error", "Password must be at least 6 characters long");
         return;
      }

      if (!email.includes("@")) {
         Alert.alert("Error", "Please enter a valid email address");
         return;
      }

      setLoading(true);

      try {
         console.log("Starting signup process...");

         // Create user account
         const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
         );
         console.log("User created:", userCredential.user.uid);

         // Save full name to Firebase user profile
         await updateProfile(userCredential.user, {
            displayName: fullName,
         });
         console.log("Profile updated with display name");

         // Save user role and info to Firestore
         await setDoc(doc(db, "users", userCredential.user.uid), {
            fullName: fullName,
            email: email,
            role: selectedRole,
            createdAt: new Date().toISOString(),
            isActive: true,
         });
         console.log("User data saved to Firestore");

         Alert.alert("Success", "Account created successfully!", [
            { text: "OK", onPress: () => redirectBasedOnRole(selectedRole) },
         ]);
      } catch (error) {
         console.error("Signup error:", error);

         // Handle specific Firebase errors
         let errorMessage = "Failed to create account. Please try again.";

         if (error.code === "auth/email-already-in-use") {
            errorMessage =
               "This email is already registered. Please use a different email or try logging in.";
         } else if (error.code === "auth/weak-password") {
            errorMessage = "Password is too weak. Please use a stronger password.";
         } else if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email address. Please enter a valid email.";
         } else if (error.code === "auth/network-request-failed") {
            errorMessage =
               "Network error. Please check your internet connection and try again.";
         } else if (error.code === "permission-denied") {
            errorMessage = "Permission denied. Please contact support.";
         } else if (error.message) {
            errorMessage = error.message;
         }

         Alert.alert("Signup Error", errorMessage);
      } finally {
         setLoading(false);
      }
   };

   const redirectBasedOnRole = (role) => {
      if (role === "customer") {
         router.replace("/(tabs)/home");
      } else if (role === "hotel_owner") {
         router.replace("/(hotel)/dashboard");
      }
   };

   const renderRoleOption = (role, title, description, icon) => (
      <TouchableOpacity
         style={[styles.roleOption, selectedRole === role && styles.selectedRoleOption]}
         onPress={() => setSelectedRole(role)}
      >
         <View style={styles.roleIconContainer}>
            <Ionicons
               name={icon}
               size={40}
               color={selectedRole === role ? "#e74c3c" : "#7f8c8d"}
            />
         </View>
         <View style={styles.roleTextContainer}>
            <Text
               style={[
                  styles.roleTitle,
                  selectedRole === role && styles.selectedRoleTitle,
               ]}
            >
               {title}
            </Text>
            <Text style={styles.roleDescription}>{description}</Text>
         </View>
         <View style={styles.radioContainer}>
            <View
               style={[
                  styles.radioOuter,
                  selectedRole === role && styles.selectedRadioOuter,
               ]}
            >
               {selectedRole === role && <View style={styles.radioInner} />}
            </View>
         </View>
      </TouchableOpacity>
   );

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
               <Text style={styles.welcomeText}>Create Account</Text>
               <Text style={styles.subtitle}>Join us for delicious food delivery</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
               {/* Role Selection */}
               <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>I want to:</Text>
                  <View style={styles.roleContainer}>
                     {renderRoleOption(
                        "customer",
                        "Order Food",
                        "Browse restaurants and order delicious meals",
                        "restaurant-outline",
                     )}
                     {renderRoleOption(
                        "hotel_owner",
                        "Hotel Owner",
                        "Manage your hotel restaurant and receive orders",
                        "business-outline",
                     )}
                  </View>
               </View>

               {/* Full Name Input */}
               <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                     <Ionicons
                        name="person-outline"
                        size={22}
                        color="#7f8c8d"
                        style={styles.inputIcon}
                     />
                     <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        placeholderTextColor="#bdc3c7"
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                        autoComplete="name"
                     />
                  </View>
               </View>

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

               {/* Confirm Password Input */}
               <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                     <Ionicons
                        name="lock-closed-outline"
                        size={22}
                        color="#7f8c8d"
                        style={styles.inputIcon}
                     />
                     <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Confirm your password"
                        placeholderTextColor="#bdc3c7"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        autoComplete="password"
                     />
                     <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeIcon}
                     >
                        <Ionicons
                           name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                           size={22}
                           color="#7f8c8d"
                        />
                     </TouchableOpacity>
                  </View>
               </View>

               {/* Terms and Conditions */}
               <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                     By creating an account, you agree to our{" "}
                     <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                     <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
               </View>

               {/* Signup Button */}
               <TouchableOpacity
                  style={[styles.signupButton, loading && styles.disabledButton]}
                  onPress={handleSignup}
                  disabled={loading}
               >
                  <Text style={styles.signupButtonText}>
                     {loading ? "Creating Account..." : "Create Account"}
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

               {/* Login Link */}
               <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/")}>
                     <Text style={styles.loginLink}>Sign In</Text>
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
   roleContainer: {
      gap: 12,
   },
   roleOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f8f9fa",
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: "#e9ecef",
   },
   selectedRoleOption: {
      borderColor: "#e74c3c",
      backgroundColor: "#fff5f5",
   },
   roleIconContainer: {
      marginRight: 15,
   },
   roleTextContainer: {
      flex: 1,
   },
   roleTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#2c3e50",
   },
   selectedRoleTitle: {
      color: "#e74c3c",
   },
   roleDescription: {
      fontSize: 12,
      color: "#7f8c8d",
      marginTop: 4,
   },
   radioContainer: {
      marginLeft: 10,
   },
   radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: "#bdc3c7",
      justifyContent: "center",
      alignItems: "center",
   },
   selectedRadioOuter: {
      borderColor: "#e74c3c",
   },
   radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#e74c3c",
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
   termsContainer: {
      marginBottom: 24,
   },
   termsText: {
      fontSize: 13,
      color: "#7f8c8d",
      textAlign: "center",
      lineHeight: 18,
   },
   termsLink: {
      color: "#e74c3c",
      fontWeight: "500",
   },
   signupButton: {
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
   signupButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
   },
   buttonIcon: {
      marginLeft: 8,
   },
   loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
   },
   loginText: {
      color: "#7f8c8d",
      fontSize: 16,
   },
   loginLink: {
      color: "#e74c3c",
      fontSize: 16,
      fontWeight: "bold",
   },
});

export default SignupScreen;
