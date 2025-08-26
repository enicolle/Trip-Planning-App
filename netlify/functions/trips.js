import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all trips with their categories and items
        const { data: trips, error: tripsError } = await supabase
          .from('trips')
          .select(`
            *,
            categories (
              *,
              items (*)
            )
          `);
        
        if (tripsError) throw tripsError;
        return res.json({ data: trips, error: null });

      case 'POST':
        // Create new trip
        const { data: newTrip, error: insertError } = await supabase
          .from('trips')
          .insert([req.body])
          .select();
        
        if (insertError) throw insertError;
        return res.json({ data: newTrip, error: null });

      case 'DELETE':
        // Delete trip
        const { tripId } = req.query;
        const { error: deleteError } = await supabase
          .from('trips')
          .delete()
          .eq('id', tripId);
        
        if (deleteError) throw deleteError;
        return res.json({ data: null, error: null });

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
