// src/services/api.js

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// AUTH

// Sign up with Supabase (optional, not used in your main App by default)
export const register = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

// Sign in with Supabase Auth (auth.users table)
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// Sign in by checking custom users table
export const loginTable = async (email, password) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();
  return { data, error };
};

// Get current user (from Supabase Auth session)
export const getProfile = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { success: false, error };
  return { success: true, data };
};

// Supabase sign out (and clear local session data)
export const logout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
};

// Example: Call a Supabase Edge Function
export const getCountries = async () => {
  const { data, error } = await supabase.functions.invoke("my-function", {
    body: { name: "Some data" },
    method: "POST",
  });
  if (error) {
    console.error("Error fetching countries:", error);
  }
  return data;
};

// Example: Query a Supabase table directly
export const fetchCountries = async () => {
  const { data, error } = await supabase.from("countries").select("*");
  if (error) {
    console.error("Error querying countries:", error);
  }
  return data || [];
};

// Bundle ALL functions in default export object
const ApiService = {
  register,
  login,
  loginTable, // <-- Added here for use everywhere
  getProfile,
  logout,
  getCountries,
  fetchCountries,
};

export default ApiService;
