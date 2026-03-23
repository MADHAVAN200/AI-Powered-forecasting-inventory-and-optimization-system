import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to derive role from email since we didn't attach metadata
  const determineRole = (email) => {
    if (!email) return null;
    if (email.includes("admin")) return "admin";
    if (email.includes("staff")) return "staff";
    if (email.includes("vendor")) return "vendor";
    return "vendor"; // fallback
  };

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setRole(determineRole(currentUser?.email));
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setRole(determineRole(currentUser?.email));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  const loginDemo = (email) => {
    const mockUser = { email, id: "demo-user-" + Date.now() };
    setUser(mockUser);
    setRole(determineRole(email));
    setLoading(false);
  };

  const value = {
    user,
    role,
    loading,
    signOut,
    loginDemo,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
