import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        const { trip_id } = req.query;
        const { data: categories, error } = await supabase
          .from('categories')
          .select(`
            *,
            items (*)
          `)
          .eq('trip_id', trip_id);
        
        if (error) throw error;
        return res.json({ data: categories, error: null });

      case 'POST':
        const { data: newCategory, error: insertError } = await supabase
          .from('categories')
          .insert([req.body])
          .select();
        
        if (insertError) throw insertError;
        return res.json({ data: newCategory, error: null });

      case 'PUT':
        const { id, ...updateData } = req.body;
        const { data: updatedCategory, error: updateError } = await supabase
          .from('categories')
          .update(updateData)
          .eq('id', id)
          .select();
        
        if (updateError) throw updateError;
        return res.json({ data: updatedCategory, error: null });

      case 'DELETE':
        const { categoryId } = req.query;
        const { error: deleteError } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryId);
        
        if (deleteError) throw deleteError;
        return res.json({ data: null, error: null });

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Categories API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
