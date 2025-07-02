// Test script to verify dashboard scraper control
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testScraperAPI() {
  console.log('🧪 Testing Dashboard Scraper Control...\n');
  
  try {
    // Test 1: Check if API endpoint is accessible
    console.log('1️⃣ Testing API endpoint accessibility...');
    const response = await fetch('http://localhost:3000/api/scraper', {
      method: 'GET'
    });
    
    if (response.ok) {
      console.log('✅ API endpoint is accessible');
    } else {
      console.log('❌ API endpoint not accessible');
      return;
    }
    
    // Test 2: Test scraper start (will be killed after 5 seconds)
    console.log('\n2️⃣ Testing scraper start...');
    const startResponse = await fetch('http://localhost:3000/api/scraper', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pincodes: '560037',
        searchTerm: 'rice',
        mode: 'search'
      })
    });
    
    if (startResponse.ok) {
      const result = await startResponse.json();
      console.log('✅ Scraper started successfully!');
      console.log('📋 Process ID:', result.processId);
      console.log('🔧 Command:', result.command);
      
      // Kill the process after 5 seconds for testing
      setTimeout(() => {
        console.log('\n⏰ Test completed - scraper process was started successfully');
        console.log('🎉 Dashboard scraper control is working!');
      }, 5000);
      
    } else {
      const error = await startResponse.text();
      console.log('❌ Failed to start scraper:', error);
    }
    
  } catch (error) {
    console.log('❌ Error testing scraper:', error.message);
  }
}

// Run the test
testScraperAPI(); 