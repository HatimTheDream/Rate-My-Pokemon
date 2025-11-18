import { createClient } from '@supabase/supabase-js';
// Prefer environment variables; fall back to hardcoded values only if missing (dev convenience)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qdmebvlijpytaqwwcgen.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbWVidmxpanB5dGFxd3djZ2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODc2MzcsImV4cCI6MjA3ODM2MzYzN30._gVnf9TgY81NKKbul0MD2WBNTku842UmN9napGGtZiE';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export async function getRating(userId, dex, shiny) {
    // Shiny variant encoded as negative dex locally; server still stores absolute dex only for now.
    const effectiveDex = shiny ? dex * -1 : dex;
    const { data, error } = await supabase
        .from('user_ratings')
        .select('rating')
        .eq('user_id', userId)
        .eq('pokemon_dex', effectiveDex)
        .maybeSingle();
    if (error)
        console.error('getRating error:', error);
    return data?.rating ?? null;
}
export async function getRatingsForUser(userId) {
    const { data, error } = await supabase
        .from('user_ratings')
        .select('pokemon_dex, rating')
        .eq('user_id', userId);
    if (error) {
        console.error('getRatingsForUser error:', error);
        return {};
    }
    return (data || []).reduce((acc, row) => {
        acc[row.pokemon_dex] = row.rating;
        return acc;
    }, {});
}
export async function saveRating(userId, dex, rating, shiny) {
    const effectiveDex = shiny ? dex * -1 : dex;
    const { error } = await supabase
        .from('user_ratings')
        .upsert({ user_id: userId, pokemon_dex: effectiveDex, rating, updated_at: new Date().toISOString() }, { onConflict: 'user_id,pokemon_dex' });
    if (error)
        throw error;
}
export async function addRatingEvent(userId, dex, rating) {
    const { error } = await supabase
        .from('rating_events')
        .insert({ user_id: userId, pokemon_dex: dex, rating });
    if (error)
        throw error;
}
export async function getRatingEvents(userId, dex) {
    const { data, error } = await supabase
        .from('rating_events')
        .select('created_at, rating')
        .eq('user_id', userId)
        .eq('pokemon_dex', dex)
        .order('created_at', { ascending: true });
    if (error) {
        console.error('getRatingEvents error:', error);
        return [];
    }
    return (data || []).map(row => ({
        t: new Date(row.created_at).getTime(),
        y: row.rating
    }));
}
