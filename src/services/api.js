// src/services/api.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ApiService = {
  // ===== AUTHENTICATION =====
  async login(email, password) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error) throw error;
      return { data: { user: data }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  logout() {
    // Custom logout logic if needed
    return { error: null };
  },

  // ===== REGISTRATION FUNCTIONS =====
  
  async createRegistrant(data) {
    const { data: result, error } = await supabase
      .from('registrants')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async createAddress(data) {
    const { data: result, error } = await supabase
      .from('addresses')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },

  async createFarmParcel(data) {
    const { data: result, error } = await supabase
      .from('farm_parcels')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async createParcelInfos(data) {
    const { data: result, error } = await supabase
      .from('parcel_infos')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },

  async createCrops(data) {
    const { data: result, error } = await supabase
      .from('crops')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },

  async createLivestock(data) {
    const { data: result, error } = await supabase
      .from('livestock')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },

  async createPoultry(data) {
    const { data: result, error } = await supabase
      .from('poultry')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },

  async createFishingActivities(data) {
    const { data: result, error } = await supabase
      .from('fishing_activities')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },

  async createWorkTypes(data) {
    const { data: result, error } = await supabase
      .from('work_types')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },

  async createInvolvementTypes(data) {
    const { data: result, error } = await supabase
      .from('involvement_types')
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },

  async createFinancialInfo(data) {
    const { data: result, error } = await supabase
      .from('financial_infos')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  // ===== QUERY FUNCTIONS (for displaying records) =====
  
  async getRegistrants() {
    const { data, error } = await supabase
      .from('registrants')
      .select(`
        *,
        addresses(*),
        crops(*),
        livestock(*),
        poultry(*),
        farm_parcels(*),
        financial_infos(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  

  async getRegistrantById(id) {
    const { data, error } = await supabase
      .from('registrants')
      .select(`
        *,
        addresses(*),
        farm_parcels(*, parcel_infos(*)),
        crops(*),
        livestock(*),
        poultry(*),
        fishing_activities(*),
        work_types(*),
        involvement_types(*),
        financial_infos(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
};

export default ApiService;
