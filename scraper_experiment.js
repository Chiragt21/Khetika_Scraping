const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://aczcololiedppabxmsmb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjemNvbG9saWVkcHBhYnhtc21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNTE0NjcsImV4cCI6MjA2NjgyNzQ2N30.NTlpkbn4PIdHO4xwV0J60ylNDB3RYawJa54LIteCpDo';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuration constants
const CONFIG = {
  TIMEOUTS: {
    LOCATION_SELECTOR: 3000,
    LOCATION_DROPDOWN: 10000,
    CATEGORY_GRID: 10000,
    SEARCH_SUGGESTION: 5000,
    PRODUCT_LOAD: 2000
  },
  SCROLL: {
    MAX_ATTEMPTS: 50,
    MAX_NO_NEW_PRODUCTS: 8,
    STEP_SIZE: 800,
    GRID_STEP_SIZE: 200,
    MAX_GRID_ATTEMPTS: 30
  },
  WAIT_TIMES: {
    LOCATION_SELECTION: 2000,
    CATEGORY_CLICK: 1000,
    PRODUCT_LOAD: 5000,
    SEARCH_SUGGESTION: 1000,
    SCROLL_PAUSE: 1000
  }
};

// Robustly split pincodes by comma, allowing optional spaces
const pincodes = process.argv[2].split(/\s*,\s*/).filter(Boolean);
const searchTerm = process.argv[3] || 'rice';
const extractionTime = new Date().toISOString();
const XLSX = require('xlsx');
const fs = require('fs');

// Parse CLI arguments for mode and category
const args = process.argv.slice(2).join(' ');
const modeMatch = args.match(/--mode=(\w+)/);
const mode = modeMatch ? modeMatch[1] : 'search';
// Improved regex: capture everything after --category= (with or without quotes), up to next -- or end
const categoryMatch = args.match(/--category=(?:"([^"]+)"|([^\s][^\-]*))/);
const categoryName = categoryMatch ? (categoryMatch[1] || (categoryMatch[2] ? categoryMatch[2].trim() : '')) : '';

const userAgents = [
  // Windows Chrome
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  // Mac Chrome
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  // Linux Chrome
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  // Windows Edge
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
  // Android Chrome
  "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
];
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

const main = async () => {
  let allProducts = [];

  for (const locationInput of pincodes) {
    const isPincode = /^\d{5,6}$/.test(locationInput.trim());
    let browser = null;
    let page = null;
    let scrapeFailed = false;
    let scrapeErrorMessage = "";
    
    try {
      const { chromium } = require('playwright');
      browser = await chromium.launch({ headless: true });
      page = await browser.newPage({ userAgent: getRandomUserAgent() });
      
      // Maximize the browser window for better visibility
      await page.setViewportSize({ width: 1920, height: 1080 });
      console.log("🖥️ Browser window maximized");
      
      let products = [];
      let selectedLocation = '';
      
      // Step 1: Go to Blinkit
      console.log("🌐 Opening Blinkit website...");
      await page.goto('https://www.blinkit.com/');
      
      // Step 2: Wait for popup to appear and handle location search
      console.log("📍 Handling location popup...");
      await page.waitForTimeout(2000); // Wait for popup to load
      
      // Look for location input in popup (prioritize screenshot selector)
      const locationSelectors = [
        "input[placeholder='search delivery location']",
        'input[placeholder*="delivery location" i]',
        'input[placeholder*="pincode" i]',
        'input[placeholder*="PIN" i]',
        'input[placeholder*="code" i]',
        'input[data-testid*="pincode" i]',
        'input[data-testid*="location" i]',
        'input[placeholder*="Enter your pincode" i]',
        'input[placeholder*="Search for your pincode" i]'
      ];
      
      let locationInputField = null;
      for (const selector of locationSelectors) {
        try {
          locationInputField = await page.waitForSelector(selector, { timeout: 3000 });
          if (locationInputField) {
            console.log(`✅ Found location input with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
          //add sample
        }
      }
      
      if (!locationInputField) {
        await page.screenshot({ path: 'debug-location-error.png' });
        console.log('📸 Debug screenshot saved as debug-location-error.png');
        scrapeFailed = true;
        scrapeErrorMessage = "Could not find location input field";
        throw new Error(scrapeErrorMessage);
      }
      
      // Fill location (do not press Enter)
      await locationInputField.fill(locationInput);
      console.log(`📍 Entered location: ${locationInput}`);
      await page.waitForTimeout(1000);
      
      // Step 3: Select first result from dropdown (wait for dropdown after filling location)
      console.log("🔍 Selecting first location result...");
      // Wait for the dropdown to appear
      await page.waitForSelector('.LocationSearchList__LocationListContainer-sc-93rfr7-0', { timeout: 10000 });
      // Select the first visible result
      const locationOptions = await page.$$('.LocationSearchList__LocationListContainer-sc-93rfr7-0');
      console.log(`Found ${locationOptions.length} location options`);
      if (locationOptions.length > 0) {
        await locationOptions[0].waitForElementState('visible');
        await locationOptions[0].waitForElementState('enabled');
        // Extract only the bold label part if available
        const boldLabel = await locationOptions[0].$('div[class*="LocationLabel"]');
        if (boldLabel) {
          selectedLocation = await boldLabel.innerText();
        } else {
          selectedLocation = await locationOptions[0].innerText();
        }
        await locationOptions[0].click();
        console.log("✅ Selected first location result:", selectedLocation);

        // Wait 2 seconds after selecting location
        await page.waitForTimeout(2000);

        // Always scroll to the 'Paan Corner' category after pincode selection
        // Find the element containing the text 'Paan Corner'
        // const paanTextHandle = await page.$x("//*[text()[contains(., 'Paan Corner')]]");
        // if (paanTextHandle.length > 0) { ... }

        if (mode === 'search') {
          // First, perform the search
          console.log(`🔍 Performing search for: ${searchTerm}`);
          
          // Find and click the search input (using the correct search bar element)
          const searchInput = await page.$('a.SearchBar__Button-sc-16lps2d-4.fgHDQx');
          if (!searchInput) {
            console.log('❌ Search input not found');
            return;
          }
          await searchInput.click();
          await page.waitForTimeout(500);
          
          // After clicking the search bar, find the actual input field that appears
          const actualSearchInput = await page.$('input[placeholder*="search"], input[placeholder*="Search"], input[type="search"]');
          if (!actualSearchInput) {
            console.log('❌ Actual search input field not found after clicking search bar');
            return;
          }
          
          await actualSearchInput.fill(searchTerm);
          await page.waitForTimeout(1000);
          
          // Wait for search suggestions and click the first one
          await page.waitForTimeout(1000); // Wait for suggestions to load
          let searchSuggestions = await page.$$('div[role="button"][tabindex="0"], div[class*="suggestion"], div[class*="Suggestion"], li[class*="suggestion"], li[class*="Suggestion"]');
          if (searchSuggestions.length > 0) {
            console.log(`✅ Found ${searchSuggestions.length} search suggestions, clicking first one`);
            try {
              // Re-query suggestions to ensure they're still attached
              searchSuggestions = await page.$$('div[role="button"][tabindex="0"], div[class*="suggestion"], div[class*="Suggestion"], li[class*="suggestion"], li[class*="Suggestion"]');
              if (searchSuggestions.length > 0) {
                // Use page.click instead of element.click for better reliability
                await page.click('div[role="button"][tabindex="0"], div[class*="suggestion"], div[class*="Suggestion"], li[class*="suggestion"], li[class*="Suggestion"]', { timeout: 5000 });
                await page.waitForTimeout(2000); // Wait for search results to load
              } else {
                throw new Error("Suggestions disappeared");
              }
            } catch (error) {
              console.log('⚠️ Error clicking first suggestion, trying to press Enter instead');
              await actualSearchInput.press('Enter');
              await page.waitForTimeout(2000);
            }
          } else {
            console.log('⚠️ No search suggestions found, trying to press Enter');
            await actualSearchInput.press('Enter');
            await page.waitForTimeout(2000);
          }
          
          // Now start the robust main page scroll loop for search mode
          let previousCount = 0;
          let currentCount = 0;
          let scrollAttempts = 0;
          let noNewProductsCount = 0;
          const maxScrollAttempts = 50;
          const maxNoNewProductsAttempts = 8;
          const scrollStep = 800;
          do {
            await page.waitForTimeout(1000);
            previousCount = currentCount;
            currentCount = await page.$$eval('div.tw-flex.tw-w-full.tw-flex-col', cards => cards.length);
            console.log(`📊 Found ${currentCount} products so far... (attempt ${scrollAttempts + 1})`);

            // Check for 'Showing related products' after each scroll
            const relatedProductsElement = await page.$('div.tw-text-400.tw-font-bold.tw-line-clamp-2:text("Showing related products")');
            if (relatedProductsElement) {
              console.log("🏁 Found 'Showing related products' section during scrolling, stopping scroll...");
              break;
            }

            // Always scroll the main page by scrollStep
            await page.evaluate((step) => {
              window.scrollBy(0, step);
            }, scrollStep);
            await page.waitForTimeout(1000);

            if (currentCount === previousCount) {
              noNewProductsCount++;
              console.log(`⚠️ No new products loaded (${noNewProductsCount}/${maxNoNewProductsAttempts})`);
            } else {
              noNewProductsCount = 0;
            }
            if (noNewProductsCount >= maxNoNewProductsAttempts) {
              console.log("🛑 No new products loaded after multiple attempts, stopping scroll");
              break;
            }
            scrollAttempts++;
          } while (scrollAttempts < maxScrollAttempts);
          console.log(`✅ Finished scrolling. Total products found: ${currentCount}`);
        } else if (mode === 'category') {
          console.log('🟢 Entered category mode, looking for category:', categoryName);
          if (!categoryName || categoryName.trim().length < 3) {
            console.log('❌ Please enter at least 3 letters for category matching!');
            return;
          }
          await page.waitForTimeout(2000);

          // Wait for the category grid to appear
          const gridSelector = '.MultiImage__Grid-sc-o0ozdb-2.fazwpN';
          await page.waitForSelector(gridSelector, { timeout: 10000 });
          const grid = await page.$(gridSelector);
          if (!grid) return;

          // Scroll the grid in increments to force all containers/images to load
          let lastScrollTop = -1;
          let gridScrollTop = 0;
          let gridScrollAttempts = 0;
          const maxGridScrollAttempts = 30;
          const gridScrollStep = 200;
          while (gridScrollAttempts < maxGridScrollAttempts) {
            await grid.evaluate((node, step) => {
              node.scrollTop = node.scrollTop + step;
            }, gridScrollStep);
            await page.waitForTimeout(500);
            gridScrollTop = await grid.evaluate(node => node.scrollTop);
            if (gridScrollTop === lastScrollTop) break; // No more scrolling possible
            lastScrollTop = gridScrollTop;
            gridScrollAttempts++;
          }
          await page.waitForTimeout(1000); // Final wait for images to load

          // Now extract category names as before
          const containers = await grid.$$('.Imagestyles__ImageContainer-sc-1u3ccmn-0.gwkGLQ');
          let found = false;
          const availableCategories = [];
          const inputLower = categoryName.trim().toLowerCase();
          for (let i = 0; i < containers.length; i++) {
            const container = containers[i];
            await container.evaluate(node => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            await page.waitForTimeout(400);
            let label = '';
            let img = await container.$('img');
            if (img) {
              const alt = await img.getAttribute('alt');
              if (alt) {
                const dashIdx = alt.indexOf('-');
                label = dashIdx !== -1 ? alt.substring(dashIdx + 1).trim() : alt.trim();
              }
            }
            if (!label) {
              const textElements = await container.$$('div, span, p');
              for (const textEl of textElements) {
                const text = await textEl.innerText();
                if (text && text.trim() && text.length < 50) {
                  label = text.trim();
                  break;
                }
              }
            }
            if (!label) {
              const ariaLabel = await container.getAttribute('aria-label');
              if (ariaLabel) {
                label = ariaLabel.trim();
              } else {
                const title = await container.getAttribute('title');
                if (title) {
                  label = title.trim();
                }
              }
            }
            if (label) {
              availableCategories.push(label);
            }
            // --- MATCH ANYWHERE, MIN 3 LETTERS ---
            if (
              label &&
              inputLower.length >= 3 &&
              label.toLowerCase().includes(inputLower)
            ) {
              await page.waitForTimeout(500);
              if (img) {
                await img.click();
                console.log(`✅ Clicked category: ${label}`);
                found = true;
                break;
              }
            }
          }
          
          if (!found) {
            console.log(`⚠️ No category matched for '${categoryName}'`);
            console.log(`📋 Available categories: ${availableCategories.join(', ')}`);
            return;
          }
          await page.waitForTimeout(1000); // Reduced from 3000ms for faster processing

          // Wait for products to load on the category page
          console.log("🔄 Waiting for products to load on category page...");
          await page.waitForTimeout(5000);

          // Scroll through all products on the category page
          console.log("📜 Scrolling through category products...");
          let endReached = false;
          let previousCount = 0;
          let currentCount = 0;
          let scrollAttempts = 0;
          let noNewProductsCount = 0;
          const maxScrollAttempts = 50; // Increased to allow more scrolling
          const maxNoNewProductsAttempts = 8; // Increased attempts before stopping

          do {
            // Wait for products to load
            await page.waitForTimeout(1000); // Reduced wait time
            
            // Count current products
            previousCount = currentCount;
            currentCount = await page.$$eval('div.tw-flex.tw-w-full.tw-flex-col', cards => cards.length);
            
            console.log(`📊 Found ${currentCount} products so far... (attempt ${scrollAttempts + 1})`);

            // Check if "Showing related products" section has appeared (for search mode)
            if (mode === 'search') {
              const relatedProductsElement = await page.$('div.tw-text-400.tw-font-bold.tw-line-clamp-2:text("Showing related products")');
              if (relatedProductsElement) {
                console.log("🏁 Found 'Showing related products' section during scrolling, stopping scroll...");
                break;
              }
            }

            // Try to find and click "Load More" buttons
            const loadMoreButton = await page.$('button:has-text("Load More"), button:has-text("Show More"), [data-testid="load-more"]');
            if (loadMoreButton) {
              console.log("🔄 Found Load More button, clicking it...");
              await loadMoreButton.click();
              await page.waitForTimeout(1000);
            } else {
              // Try to find and scroll the specific products container (plpContainer)
              console.log("🔍 Looking for plpContainer...");
              
              // Try multiple selectors for the plpContainer
              let productsContainer = await page.$('#plpContainer.BffPlpFeedContainer__ItemsContainer-sc-12wcdtn-2.jkPwTA');
              if (!productsContainer) {
                console.log("🔍 Trying ID only selector...");
                productsContainer = await page.$('#plpContainer');
              }
              if (!productsContainer) {
                console.log("🔍 Trying partial class selector...");
                productsContainer = await page.$('[class*="BffPlpFeedContainer__ItemsContainer"]');
              }
              if (!productsContainer) {
                console.log("🔍 Trying any element with plpContainer class...");
                productsContainer = await page.$('[class*="plpContainer"]');
              }
              
              if (productsContainer) {
                console.log("🔄 Found plpContainer, scrolling it...");
                // Get container info for debugging
                const containerInfo = await productsContainer.evaluate(node => ({
                  id: node.id,
                  className: node.className,
                  scrollHeight: node.scrollHeight,
                  clientHeight: node.clientHeight,
                  scrollTop: node.scrollTop,
                  overflow: node.style.overflow
                }));
                console.log("📊 Container info:", containerInfo);
                
                await productsContainer.evaluate(node => {
                  node.scrollTop = node.scrollTop + 1000; // Scroll the container by 1000px
                });
                await page.waitForTimeout(1000);
              } else {
                console.log("❌ plpContainer not found, trying alternative selectors...");
                
                // Debug: List all elements with scroll or overflow
                const allScrollableElements = await page.$$eval('[class*="scroll"], [class*="Scroll"], [class*="overflow"], [class*="Overflow"], [style*="overflow"]', containers => {
                  return containers.map(c => ({
                    tagName: c.tagName,
                    id: c.id,
                    className: c.className,
                    scrollHeight: c.scrollHeight,
                    clientHeight: c.clientHeight,
                    scrollTop: c.scrollTop,
                    style: c.getAttribute('style')
                  }));
                });
                console.log("🔍 Debug - All scrollable elements found:", allScrollableElements.length);
                if (allScrollableElements.length > 0) {
                  console.log("📋 First few scrollable elements:", allScrollableElements.slice(0, 3));
                }
                
                // Fallback: Try alternative selectors for the products container
                const alternativeContainer = await page.$('[class*="BffPlpFeedContainer"], [class*="plpContainer"], [class*="product"], [class*="Product"], .products-container, [data-testid="products-list"], .product-grid, .products-grid, [class*="scroll"], [class*="Scroll"], [class*="list"], [class*="List"]');
                if (alternativeContainer) {
                  console.log("🔄 Found alternative products container, scrolling it...");
                  await alternativeContainer.evaluate(node => {
                    node.scrollTop = node.scrollTop + 1000; // Scroll the container by 1000px
                  });
                  await page.waitForTimeout(1000);
                } else {
                  // Try scrolling the main page as last resort
                  console.log("🔄 Scrolling main page...");
                  await page.evaluate(() => {
                    const currentScroll = window.pageYOffset;
                    window.scrollTo(0, currentScroll + 1000); // Scroll by 1000px increments
                  });
                  await page.waitForTimeout(1000); // Reduced wait time for new products to load
                }
              }
            }
            
            scrollAttempts++;
            
            // Track if no new products were loaded
            if (currentCount === previousCount) {
              noNewProductsCount++;
              console.log(`⚠️ No new products loaded (${noNewProductsCount}/${maxNoNewProductsAttempts})`);
            } else {
              noNewProductsCount = 0; // Reset counter when new products are found
            }
            
            // Stop if no new products loaded after multiple attempts
            if (noNewProductsCount >= maxNoNewProductsAttempts) {
              console.log("🛑 No new products loaded after multiple attempts, stopping scroll");
              break;
            }
            
          } while (!endReached && scrollAttempts < maxScrollAttempts);

          console.log(`✅ Finished scrolling. Total products found: ${currentCount}`);
          if (currentCount < 50) {
            console.log(`ℹ️ Note: This category appears to have ${currentCount} products. Some categories may have fewer products than others.`);
          }
        }

        // Extract products (this code runs for both search and category modes)
        console.log("🔍 Extracting product details using optimized batch processing...");
        
        // Get all product cards
        const productCards = await page.$$('div.tw-flex.tw-w-full.tw-flex-col');
        console.log(`📋 Found ${productCards.length} product cards to extract`);

        // Debug: Check first few product cards for out-of-stock elements
        console.log("🔍 Debugging stock status detection...");
        for (let i = 0; i < Math.min(3, productCards.length); i++) {
          const card = productCards[i];
          const outOfStockEl = await card.$('div[data-pf="reset"]');
          if (outOfStockEl) {
            const text = await outOfStockEl.textContent();
            console.log(`🔍 Product ${i + 1}: Found out-of-stock element with text: "${text.trim()}"`);
          } else {
            console.log(`🔍 Product ${i + 1}: No out-of-stock element found`);
          }
        }

        // Check if "Showing related products" section exists (only for search mode)
        let validProductCards = productCards;
        
        if (mode === 'search') {
          const relatedProductsElement = await page.$('div.tw-text-400.tw-font-bold.tw-line-clamp-2:text("Showing related products")');
          
          if (relatedProductsElement) {
            console.log("🏁 Found 'Showing related products' section, filtering products...");
            // Get the position of the "Showing related products" section
            const relatedProductsPosition = await relatedProductsElement.evaluate(node => {
              const rect = node.getBoundingClientRect();
              return rect.top + window.pageYOffset;
            });
            
            // Filter product cards to only include those before the "Showing related products" section
            validProductCards = [];
            for (const card of productCards) {
              const cardPosition = await card.evaluate(node => {
                const rect = node.getBoundingClientRect();
                return rect.top + window.pageYOffset;
              });
              
              if (cardPosition < relatedProductsPosition) {
                validProductCards.push(card);
              }
            }
            console.log(`📋 Filtered to ${validProductCards.length} products (before 'Showing related products' section)`);
          } else {
            console.log("✅ No 'Showing related products' section found, extracting all products");
          }
        } else {
          console.log("🟢 Category mode: Extracting all products without 'Showing related products' filtering");
        }

        // Use batch evaluation to extract all product data at once (much faster)
        console.log("⚡ Using batch extraction for maximum speed...");
        
        // Extract products - use all cards but filter results based on mode
        const extractedProducts = await page.$$eval('div.tw-flex.tw-w-full.tw-flex-col', (cards, args) => {
          return cards.map((card, index) => {
            try {
              const nameEl = card.querySelector('.tw-text-300.tw-font-semibold.tw-line-clamp-2');
              const priceEl = card.querySelector('.tw-text-200.tw-font-semibold');
              const quantityEl = card.querySelector('.tw-text-200.tw-font-medium.tw-line-clamp-1');
              
              if (nameEl && priceEl && quantityEl) {
                return {
                  Name: nameEl.textContent.trim(),
                  Quantity: quantityEl.textContent.trim(),
                  Price: priceEl.textContent.trim(),
                  Category: args.mode === 'category' ? args.categoryName : args.searchTerm,
                  Location: args.selectedLocation,
                  Pincode: args.isPincode ? args.locationInput : '',
                  Date: args.extractionTime,
                  index: index // Add index for filtering
                };
              }
              return null;
            } catch (err) {
              return null;
            }
          }).filter(product => product !== null);
        }, {
          mode,
          categoryName,
          searchTerm,
          selectedLocation,
          locationInput,
          isPincode,
          extractionTime
        });
        
        // Filter products based on mode and valid indices
        if (mode === 'search' && validProductCards.length < productCards.length) {
          // For search mode, only keep products that are in validProductCards
          const validIndices = validProductCards.map((_, index) => index);
          products = extractedProducts.filter(product => validIndices.includes(product.index));
          // Remove index from final products
          products = products.map(product => {
            const { index, ...rest } = product;
            return rest;
          });
        } else {
          // For category mode or when no filtering needed, use all products
          products = extractedProducts.map(product => {
            const { index, ...rest } = product;
            return rest;
          });
        }

        if (products.length === 0) {
          console.log("⚠️ No products found. Taking screenshot for debugging...");
          await page.screenshot({ path: 'debug-screenshot.png' });
          console.log("📸 Screenshot saved as debug-screenshot.png");
        } else {
          console.log(`✅ Successfully extracted ${products.length} products`);
        }

        if (products.length > 0) {
          // Remove any fields not in your Supabase table (like index)
          const supabaseProducts = products.map(({ Name, Quantity, Price, Category, Location, Pincode, Date }) => ({
            name: Name,
            quantity: Quantity,
            price: Price,
            category: Category,
            location: Location,
            pincode: Pincode,
            date: Date
          }));

          const { data, error } = await supabase
            .from('products')
            .insert(supabaseProducts);

          if (error) {
            console.error('❌ Error inserting into Supabase:', error.message);
          } else {
            console.log(`✅ Inserted ${supabaseProducts.length} products into Supabase. Data:`, data);
          }
        }

        // Step 7: Save to file
        const output = {
          extractedAt: extractionTime,
          location: locationInput,
          searchTerm: searchTerm,
          products: products
        };
        fs.writeFileSync('products_560037.json', JSON.stringify(output, null, 2));
        console.log("💾 Data saved to products_560037.json");
        // Save to Excel
        allProducts = allProducts.concat(products);
      } else {
        throw new Error("No location options found in dropdown");
      }
    } catch (error) {
      scrapeFailed = true;
      scrapeErrorMessage = error.message;
      console.error("❌ Error occurred:", error.message);
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log("📸 Error screenshot saved as error-screenshot.png");
    } finally {
      await page.waitForTimeout(1000); // Reduced from 3000ms to 1000ms for faster completion
      await browser.close();
      console.log("🔚 Browser closed");
      if (scrapeFailed) {
        console.log(`❌ Scrape failed: ${scrapeErrorMessage}`);
        process.exit(1); // Exit with error code
      }
    }
  }

  // After the loop, write allProducts to Excel with optimized performance
  console.log(`📊 Writing ${allProducts.length} products to Excel file...`);
  // Remove 'index' property from all products before writing to Excel
  const allProductsNoIndex = allProducts.map(({ index, ...rest }) => rest);
  const worksheet = XLSX.utils.json_to_sheet(allProductsNoIndex, { header: ['Name', 'Quantity', 'Price', 'Category', 'Location', 'Pincode', 'Date'] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  
  // Use optimized writing options
  const writeOptions = {
    bookType: 'xlsx',
    bookSST: false,
    type: 'buffer'
  };
  
  XLSX.writeFile(workbook, 'products_560037.xlsx', writeOptions);
  console.log("📊 Data successfully saved to products_560037.xlsx");
  // Print total products summary for dashboard parsing
  console.log(`✅ Successfully extracted TOTAL products: ${allProducts.length}`);
};

main(); 