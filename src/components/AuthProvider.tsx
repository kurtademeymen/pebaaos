"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fallback for primary admin email or checks
        const superAdmins = [
          "kurtademeymen@gmail.com",
          "kurtad.emeymen@gmail.com",

          // İleride buraya virgülle yeni mailler ekleyebilirsin: "digeradmin@gmail.com"
        ];

        if (currentUser.email && superAdmins.includes(currentUser.email)) {
          setIsAdmin(true);
        } else {
          // Verify if they used an ADMIN reference key
          try {
            const { collection, query, where, getDocs, getFirestore } = await import("firebase/firestore");
            const db = getFirestore();
            const keysQuery = query(
              collection(db, "referenceKeys"),
              where("usedBy", "==", currentUser.uid),
              where("role", "==", "admin")
            );
            const snapshot = await getDocs(keysQuery);
            setIsAdmin(!snapshot.empty);
          } catch (err) {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
