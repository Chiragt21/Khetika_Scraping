# Blinkit Scraper Dashboard

A modern web dashboard for managing and monitoring your Blinkit product scraper. Built with Next.js, React, and Supabase.

## Features

### 📊 Dashboard Overview
- Real-time statistics and metrics
- Interactive charts and graphs
- Product count trends
- Category distribution analysis

### 🗄️ Data Management
- View all scraped products in a searchable table
- Filter by category, location, and search terms
- Export data to CSV format
- Pagination for large datasets

### 🎮 Scraper Control
- Start/stop scraping jobs
- Configure scraping parameters
- Real-time job progress monitoring
- Job history and status tracking

### ⚙️ Settings Panel
- Database configuration
- Scraper settings (timeouts, retries, etc.)
- Notification preferences
- Connection testing

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project
- Playwright (for the scraper)

## Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file in the root directory:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Install Playwright browsers:**
```bash
npx playwright install
```

## Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Create the products table:**
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  quantity TEXT,
  price TEXT,
  category TEXT,
  location TEXT,
  pincode TEXT,
  date TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_location ON products(location);
CREATE INDEX idx_products_date ON products(date);
```

## Usage

### Starting the Dashboard
```bash
npm run dev
```
The dashboard will be available at `http://localhost:3000`

### Running the Scraper
```bash
# Search mode
npm run scrape "560037,400001" "rice" --mode=search

# Category mode
npm run scrape "560037" "" --mode=category --category="Paan Corner"
```

### Building for Production
```bash
npm run build
npm start
```

## Dashboard Sections

### Overview Tab
- **Statistics Cards**: Total products, locations, categories, last scrape
- **Product Distribution Chart**: Bar chart showing products by category
- **Category Distribution**: Pie chart of category breakdown
- **Trend Chart**: Line chart showing product count over time

### Data Management Tab
- **Search & Filter**: Find products by name, category, or location
- **Data Table**: Paginated table with all product data
- **Export Function**: Download filtered data as CSV
- **Actions**: View, edit, or delete individual products

### Scraper Control Tab
- **Job Configuration**: Set pincodes, search terms, and mode
- **Real-time Monitoring**: Live progress updates during scraping
- **Job History**: Track all previous scraping jobs
- **Status Management**: Start, stop, and monitor jobs

### Settings Tab
- **Database Settings**: Configure Supabase connection
- **Scraper Settings**: Timeouts, retries, headless mode
- **Notifications**: Email and webhook configurations

## API Endpoints

### GET /api/products
Fetch products with filtering and pagination:
```
/api/products?page=1&limit=20&search=rice&category=all&location=all
```

### GET /api/stats
Fetch dashboard statistics and chart data:
```
/api/stats
```

## Customization

### Adding New Charts
1. Create a new component in `app/components/`
2. Use Recharts library for visualization
3. Add to the DashboardOverview component

### Extending Scraper Features
1. Modify `scraper_experiment.js` for new scraping logic
2. Update the ScraperControl component for new parameters
3. Add new API endpoints if needed

### Styling
- Uses Tailwind CSS for styling
- Custom components defined in `app/globals.css`
- Responsive design for mobile and desktop

## Troubleshooting

### Common Issues

**Dashboard not loading data:**
- Check Supabase connection in Settings
- Verify environment variables are set correctly
- Test database connection using the "Test Connection" button

**Scraper not working:**
- Ensure Playwright is installed: `npx playwright install`
- Check browser compatibility
- Verify pincodes are valid

**Performance issues:**
- Add database indexes for frequently queried columns
- Implement caching for dashboard statistics
- Use pagination for large datasets

### Error Logs
- Check browser console for frontend errors
- Monitor terminal for scraper errors
- Review Supabase logs for database issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed information

---

**Note**: This dashboard is designed to work with the existing Blinkit scraper. Make sure your scraper is properly configured and your Supabase database is set up before using the dashboard. 