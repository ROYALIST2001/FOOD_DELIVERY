// CartContext.js
import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => {
   const context = useContext(CartContext);
   if (!context) {
      throw new Error("useCart must be used within a CartProvider");
   }
   return context;
};

export const CartProvider = ({ children }) => {
   const [cartItems, setCartItems] = useState([]);

   const addToCart = (item) => {
      setCartItems((prevItems) => {
         const existingItem = prevItems.find((cartItem) => cartItem.id === item.id);

         if (existingItem) {
            // If item already exists, increase quantity
            return prevItems.map((cartItem) =>
               cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem,
            );
         } else {
            // If new item, add with quantity 1
            return [...prevItems, { ...item, quantity: 1 }];
         }
      });
   };

   const removeFromCart = (id) => {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
   };

   const updateQuantity = (id, newQuantity) => {
      if (newQuantity === 0) {
         removeFromCart(id);
         return;
      }
      setCartItems((prevItems) =>
         prevItems.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item,
         ),
      );
   };

   const clearCart = () => {
      setCartItems([]);
   };

   const getTotalPrice = () => {
      return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
   };

   const getItemCount = () => {
      return cartItems.reduce((total, item) => total + item.quantity, 0);
   };

   return (
      <CartContext.Provider
         value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotalPrice,
            getItemCount,
         }}
      >
         {children}
      </CartContext.Provider>
   );
};
