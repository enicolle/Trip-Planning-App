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
      case 'GET':
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
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: trips, error: null })
        };

      case 'POST':
        const tripData = JSON.parse(event.body);
        const { data: newTrip, error: insertError } = await supabase
          .from('trips')
          .insert([tripData])
          .select();
        
        if (insertError) throw insertError;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: newTrip, error: null })
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
