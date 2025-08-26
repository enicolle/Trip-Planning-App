const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    switch (event.httpMethod) {
      case 'POST':
        const itemData = JSON.parse(event.body);
        const { data: newItem, error: insertError } = await supabase
          .from('items')
          .insert([itemData])
          .select();
        
        if (insertError) throw insertError;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: newItem, error: null })
        };

      case 'PUT':
        const updateData = JSON.parse(event.body);
        const { id, ...updates } = updateData;
        const { data: updatedItem, error: updateError } = await supabase
          .from('items')
          .update(updates)
          .eq('id', id)
          .select();
        
        if (updateError) throw updateError;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: updatedItem, error: null })
        };

      case 'DELETE':
        const params = new URLSearchParams(event.rawQuery);
        const itemId = params.get('itemId');
        const { error: deleteError } = await supabase
          .from('items')
          .delete()
          .eq('id', itemId);
        
        if (deleteError) throw deleteError;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: null, error: null })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
