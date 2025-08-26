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
        const { category_id } = req.query;
        const { data: items, error } = await supabase
          .from('items')
          .select('*')
          .eq('category_id', category_id);
        
        if (error) throw error;
        return res.json({ data: items, error: null });

      case 'POST':
        const { data: newItem, error: insertError } = await supabase
          .from('items')
          .insert([req.body])
          .select();
        
        if (insertError) throw insertError;
        return res.json({ data: newItem, error: null });

      case 'PUT':
        const { id, ...updateData } = req.body;
        const { data: updatedItem, error: updateError } = await supabase
          .from('items')
          .update(updateData)
          .eq('id', id)
          .select();
        
        if (updateError) throw updateError;
        return res.json({ data: updatedItem, error: null });

      case 'DELETE':
        const { itemId } = req.query;
        const { error: deleteError } = await supabase
          .from('items')
          .delete()
          .eq('id', itemId);
        
        if (deleteError) throw deleteError;
        return res.json({ data: null, error: null });

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Items API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
