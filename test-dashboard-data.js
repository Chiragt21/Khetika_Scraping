// Test script to verify dashboard data loading
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDashboardData() {
  console.log('🧪 Testing Dashboard Data Loading...\n');
  
  try {
    // Test 1: Check stats API
    console.log('1️⃣ Testing Stats API...');
    const statsResponse = await fetch('http://localhost:3000/api/stats');
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Stats API is working');
      console.log('📊 Total Products:', statsData.stats?.totalProducts || 'N/A');
      console.log('📍 Total Locations:', statsData.stats?.totalLocations || 'N/A');
      console.log('📈 Total Categories:', statsData.stats?.totalCategories || 'N/A');
      console.log('⏰ Last Scrape:', statsData.stats?.lastScrape || 'N/A');
    } else {
      console.log('❌ Stats API failed');
      return;
    }
    
    // Test 2: Check products API
    console.log('\n2️⃣ Testing Products API...');
    const productsResponse = await fetch('http://localhost:3000/api/products?page=1&limit=5');
    
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      console.log('✅ Products API is working');
      console.log('📋 Products found:', productsData.data?.length || 0);
      console.log('📄 Total products in DB:', productsData.pagination?.total || 0);
      
      if (productsData.data && productsData.data.length > 0) {
        console.log('📦 Sample product:', productsData.data[0].name);
      }
    } else {
      console.log('❌ Products API failed');
    }
    
    console.log('\n🎉 Dashboard data loading test completed!');
    console.log('💡 Your dashboard should now show real data from Supabase');
    
  } catch (error) {
    console.log('❌ Error testing dashboard data:', error.message);
  }
}

// Run the test
testDashboardData(); 