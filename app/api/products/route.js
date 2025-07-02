import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL="https://aczcololiedppabxmsmb.supabase.co"
const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjemNvbG9saWVkcHBhYnhtc21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNTE0NjcsImV4cCI6MjA2NjgyNzQ2N30.NTlpkbn4PIdHO4xwV0J60ylNDB3RYawJa54LIteCpDo"
// Initialize Supabase client only if environment variables are available
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL,SUPABASE_ANON_KEY)
  : null
  console.log('DEBUG SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('DEBUG SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const location = searchParams.get('location') || ''
    const filtersOnly = searchParams.get('filters') === 'true'
    const date = searchParams.get('date') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    
    // Check if Supabase is configured
    if (!supabase) {
      return Response.json({ error: "Supabase is not configured. Please set environment variables." }, { status: 500 });
    }
    
    // If only filters are requested, return unique categories and locations
    if (filtersOnly) {
      try {
        const { data: allProducts, error } = await supabase
          .from('products')
          .select('category, location')
        
        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }
        
        const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort()
        const uniqueLocations = [...new Set(allProducts.map(p => p.location).filter(Boolean))].sort()
        
        return Response.json({
          categories: uniqueCategories,
          locations: uniqueLocations
        })
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }
    
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
    
    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,pincode.ilike.%${search}%`)
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    if (location && location !== 'all') {
      query = query.eq('location', location)
    }
    
    if (date) {
      // Filter for the entire day
      query = query.gte('date', date)
      // Calculate next day
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = nextDay.toISOString().slice(0, 10)
      query = query.lt('date', nextDayStr)
    } else {
      if (startDate) {
        query = query.gte('date', startDate)
      }
      if (endDate) {
        query = query.lte('date', endDate)
      }
    }
    
    // Remove pagination: do not use .range(from, to)
    try {
      const { data, error, count } = await query
        .order('date', { ascending: false })
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: 1
        }
      });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.log('Supabase not configured, cannot insert data')
      return Response.json({ 
        error: 'Database not configured',
        message: 'Please configure Supabase credentials to insert data'
      }, { status: 503 })
    }

    const body = await request.json()
    
    const { data, error } = await supabase
      .from('products')
      .insert(body)
      .select()
    
    if (error) {
      console.error('Supabase insert error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }
    
    return Response.json({ data })
  } catch (error) {
    console.error('POST API error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
} 