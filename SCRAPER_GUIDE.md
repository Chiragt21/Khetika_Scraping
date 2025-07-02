# Blinkit Scraper Control Guide

## 🎯 Overview

The Scraper Control tab in your dashboard allows you to manage and monitor your Blinkit scraper directly from the web interface. You can start, stop, and monitor scraping jobs with real-time progress updates.

## 🚀 How to Use Scraper Control

### 1. **Access Scraper Control**
- Open your dashboard at `http://localhost:3000`
- Click on the **"Scraper Control"** tab in the navigation

### 2. **Configure Scraping Parameters**

#### **Pincodes**
- Enter comma-separated pincodes (e.g., `560037,400001,110001`)
- These are the delivery locations to scrape
- **Required field**

#### **Search Term**
- Enter the product to search for (e.g., `rice`, `dal`, `oil`)
- Default: `rice`
- Used in search mode

#### **Mode**
- **Search Mode**: Searches for specific products
- **Category Mode**: Scrapes entire categories

#### **Category** (for Category Mode only)
- Enter category name (e.g., `Paan Corner`)
- Only active when mode is set to "category"

### 3. **Start Scraping**

1. **Fill in the configuration** with your desired parameters
2. **Click "Start Scraping"** button
3. **Monitor progress** in real-time:
   - Progress bar shows completion percentage
   - Current step is displayed
   - Live logs show detailed output

### 4. **Monitor Progress**

#### **Current Job Status**
- Shows active scraping job
- Progress bar with percentage
- Current step being executed
- Stop button to halt the process

#### **Live Logs**
- Real-time console output
- Timestamped log entries
- Green terminal-style display
- Clear logs button to reset

#### **Job History**
- List of all previous scraping jobs
- Status indicators (running, completed, failed, stopped)
- Duration and product count for completed jobs
- Error messages for failed jobs

## 📋 Example Configurations

### **Search Mode Examples**

#### Basic Search
```
Pincodes: 560037
Search Term: rice
Mode: search
Category: (leave empty)
```

#### Multiple Locations
```
Pincodes: 560037,400001,110001
Search Term: dal
Mode: search
Category: (leave empty)
```

### **Category Mode Examples**

#### Single Category
```
Pincodes: 560037
Search Term: (leave empty)
Mode: category
Category: Paan Corner
```

#### Multiple Categories (run separate jobs)
```
Pincodes: 560037
Search Term: (leave empty)
Mode: category
Category: Beverages
```

## 🔧 Technical Details

### **API Endpoint**
- **POST** `/api/scraper` - Start a new scraping job
- **GET** `/api/scraper` - Check running processes

### **Process Management**
- Each scraping job runs as a separate Node.js process
- Process ID is displayed in logs
- Jobs can be stopped via the dashboard

### **Data Storage**
- Scraped data is saved to Supabase database
- Job history is stored in browser localStorage
- Logs are displayed in real-time

## 🚨 Troubleshooting

### **Common Issues**

#### **Scraper Won't Start**
- Check if pincodes are entered
- Verify Node.js is installed
- Ensure `scraper_experiment.js` exists in project root

#### **Browser Not Opening**
- Check if Playwright browsers are installed: `npx playwright install`
- Verify internet connection
- Check if Blinkit website is accessible

#### **No Data Found**
- Verify pincodes are valid
- Check if search terms exist on Blinkit
- Ensure category names are correct

#### **Process Hangs**
- Use the Stop button to halt the process
- Check logs for error messages
- Restart the dashboard if needed

### **Error Messages**

#### **"Pincodes are required"**
- Enter at least one pincode in the configuration

#### **"Failed to start scraper"**
- Check if `scraper_experiment.js` exists
- Verify Node.js installation
- Check console for detailed errors

#### **"Browser initialization failed"**
- Install Playwright browsers: `npx playwright install`
- Check system resources
- Verify internet connection

## 📊 Monitoring and Analytics

### **Job Statistics**
- Total jobs run
- Success/failure rates
- Average duration
- Products scraped per job

### **Performance Metrics**
- Time per location
- Products found per search
- Error frequency
- System resource usage

## 🔄 Best Practices

### **Efficient Scraping**
1. **Start with small batches** (1-2 pincodes)
2. **Use specific search terms** for better results
3. **Monitor logs** for any issues
4. **Stop jobs** if they're taking too long

### **Data Management**
1. **Export data regularly** from Data Management tab
2. **Check job history** for failed attempts
3. **Verify data quality** in Supabase
4. **Backup important data**

### **System Maintenance**
1. **Restart dashboard** if it becomes unresponsive
2. **Clear logs** periodically to improve performance
3. **Update dependencies** regularly
4. **Monitor disk space** for large datasets

## 🆘 Support

If you encounter issues:

1. **Check the logs** in the Live Logs section
2. **Review job history** for error patterns
3. **Test with simple configurations** first
4. **Restart the dashboard** if needed
5. **Check the README.md** for setup instructions

## 🎉 Success Indicators

Your scraper is working correctly when you see:
- ✅ "Scraper started successfully" in logs
- ✅ Progress bar advancing through steps
- ✅ "Products extracted" messages
- ✅ Data appearing in Supabase database
- ✅ Job marked as "completed" in history

---

**Happy Scraping! 🚀** 