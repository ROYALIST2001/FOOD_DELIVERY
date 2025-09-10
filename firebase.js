import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyBiEVWgkBLdfGpxkEaMAn2cIi13GhEpK4c",
   authDomain: "food-delivery-cf3e2.firebaseapp.com",
   projectId: "food-delivery-cf3e2",
   storageBucket: "food-delivery-cf3e2.firebasestorage.app",
   messagingSenderId: "911258046967",
   appId: "1:911258046967:web:ffee9bd57b9fc0299a1ef2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
