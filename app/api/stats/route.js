import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client only if environment variables are available
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null

console.log('DEBUG ENV SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('DEBUG ENV SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

// Helper function to parse date safely
function parseDate(dateString) {
  if (!dateString) return null
  
  try {
    // Handle format like "30/6/2025, 9:02:32 am"
    if (dateString.includes('/') && dateString.includes(',')) {
      const [datePart, timePart] = dateString.split(', ')
      const dateParts = datePart.split('/')
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0])
        const month = parseInt(dateParts[1]) - 1
        const year = parseInt(dateParts[2])
        
        let hours = 0
        let minutes = 0
        let seconds = 0
        
        if (timePart) {
          const timeMatch = timePart.match(/(\d+):(\d+):(\d+)\s*(am|pm)/i)
          if (timeMatch) {
            hours = parseInt(timeMatch[1])
            minutes = parseInt(timeMatch[2])
            seconds = parseInt(timeMatch[3])
            const isPM = timeMatch[4].toLowerCase() === 'pm'
            
            if (isPM && hours !== 12) hours += 12
            if (!isPM && hours === 12) hours = 0
          }
        }
        
        return new Date(year, month, day, hours, minutes, seconds)
      }
    }
    
    // Try standard parsing
    return new Date(dateString)
  } catch (error) {
    console.error('Error parsing date:', dateString, error)
    return null
  }
}

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return Response.json({ error: "Supabase is not configured. Please set environment variables." }, { status: 500 });
    }

    // Get total count of products (more efficient and accurate)
    const { count: totalProducts, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return Response.json({ error: countError.message }, { status: 500 });
    }

    // Get unique locations using a more robust approach
    let allLocations = []
    let from = 0
    const limit = 1000
    
    while (true) {
      const { data: locationBatch, error: locationError } = await supabase
        .from('products')
        .select('location')
        .not('location', 'is', null)
        .not('location', 'eq', '')
        .range(from, from + limit - 1)
      
      if (locationError) {
        return Response.json({ error: locationError.message }, { status: 500 });
      }
      
      if (!locationBatch || locationBatch.length === 0) break
      
      allLocations = allLocations.concat(locationBatch.map(p => p.location))
      from += limit
      
      // Safety check to prevent infinite loop
      if (from > 10000) break
    }

    // Get unique categories using a more robust approach
    let allCategories = []
    from = 0
    
    while (true) {
      const { data: categoryBatch, error: categoryError } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null)
        .not('category', 'eq', '')
        .range(from, from + limit - 1)
      
      if (categoryError) {
        return Response.json({ error: categoryError.message }, { status: 500 });
      }
      
      if (!categoryBatch || categoryBatch.length === 0) break
      
      allCategories = allCategories.concat(categoryBatch.map(p => p.category))
      from += limit
      
      // Safety check to prevent infinite loop
      if (from > 10000) break
    }

    // Get the latest date from all products
    const { data: latestProduct, error: latestError } = await supabase
      .from('products')
      .select('date')
      .not('date', 'is', null)
      .not('date', 'eq', '')
      .order('date', { ascending: false })
      .limit(1)

    if (latestError) {
      return Response.json({ error: latestError.message }, { status: 500 });
    }

    // Get recent products for chart data (limited to 1000 for charts)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('date', { ascending: false })
      .limit(1000)

    if (productsError) {
      return Response.json({ error: productsError.message }, { status: 500 });
    }

    // Calculate stats
    const uniqueLocations = [...new Set(allLocations)]
    const uniqueCategories = [...new Set(allCategories)]
    const lastScrape = latestProduct?.length > 0 ? parseDate(latestProduct[0].date) : null

    const stats = {
      totalProducts: totalProducts || 0,
      totalLocations: uniqueLocations.length,
      totalCategories: uniqueCategories.length,
      lastScrape: lastScrape?.toISOString() || null
    }

    // --- Build chart data ---
    // Products by category
    const categoryMap = {}
    products.forEach((p) => {
      if (!p.category) return
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { name: p.category, products: 0 }
      }
      categoryMap[p.category].products += 1
    })
    // Assign colors (cycle through a palette)
    const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#a21caf', '#f472b6', '#facc15']
    const categoryData = Object.values(categoryMap).map((cat, i) => ({ ...cat, color: palette[i % palette.length] }))

    // Product count trend by date
    const trendMap = {}
    products.forEach((p) => {
      if (!p.date) return
      const d = parseDate(p.date)
      if (!d) return
      const dateStr = d.toISOString().slice(0, 10)
      if (!trendMap[dateStr]) trendMap[dateStr] = 0
      trendMap[dateStr] += 1
    })
    const trendData = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, products]) => ({ date, products }))

    return Response.json({ stats, charts: { categoryData, trendData } })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 