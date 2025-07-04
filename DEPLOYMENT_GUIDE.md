# 🚀 Blinkit Scraper Dashboard - Deployment Guide

## 📋 **Prerequisites**
- ✅ GitLab repository with your project
- ✅ Supabase database configured
- ✅ Environment variables ready

## 🎯 **Recommended: Vercel Deployment**

### **Step 1: Prepare Environment Variables**
Create a `.env.local` file in your project root:
```env
SUPABASE_URL=https://aczcololiedppabxmsmb.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### **Step 2: Deploy to Vercel**

#### **Option A: Using Vercel CLI**
```bash
# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: blinkit-scraper-dashboard
# - Directory: ./
# - Override settings? No
```

#### **Option B: Using Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitLab account
3. Click "New Project"
4. Import your GitLab repository
5. Configure environment variables in Vercel dashboard
6. Deploy!

### **Step 3: Configure Environment Variables in Vercel**
1. Go to your project dashboard on Vercel
2. Navigate to Settings → Environment Variables
3. Add:
   - `SUPABASE_URL`: `https://aczcololiedppabxmsmb.supabase.co`
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

## 🌐 **Alternative Deployment Options**

### **2. Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build your project
npm run build

# Deploy
netlify deploy --prod
```

### **3. Railway**
1. Go to [railway.app](https://railway.app)
2. Connect your GitLab repository
3. Add environment variables
4. Deploy automatically

### **4. Render**
1. Go to [render.com](https://render.com)
2. Connect your GitLab repository
3. Choose "Web Service"
4. Configure environment variables
5. Deploy

### **5. DigitalOcean App Platform**
1. Go to [digitalocean.com](https://digitalocean.com)
2. Create new App
3. Connect your GitLab repository
4. Configure environment variables
5. Deploy

## 🔧 **Pre-Deployment Checklist**

### **✅ Code Preparation**
- [ ] All environment variables are in `.env.local`
- [ ] No hardcoded secrets in code
- [ ] API routes are working locally
- [ ] Database connection is tested

### **✅ Supabase Configuration**
- [ ] Database is properly set up
- [ ] RLS (Row Level Security) is configured if needed
- [ ] API keys are secure
- [ ] Database connection is tested

### **✅ Build Testing**
```bash
# Test build locally
npm run build

# Test production build
npm start
```

## 🚨 **Important Notes**

### **Environment Variables**
Make sure these are set in your deployment platform:
```env
SUPABASE_URL=https://aczcololiedppabxmsmb.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key
```

### **Scraper Limitations**
- **Browser automation won't work** on serverless platforms (Vercel, Netlify)
- **Scraper functionality** will only work locally or on VPS
- **Dashboard will work** but scraper control will need server setup

### **Database Security**
- ✅ Use Supabase RLS policies
- ✅ Keep API keys secure
- ✅ Monitor database usage

## 🎯 **Recommended Setup**

### **For Full Functionality (Including Scraper)**
1. **Deploy dashboard** to Vercel (for web interface)
2. **Set up VPS** (DigitalOcean, AWS, etc.) for scraper backend
3. **Configure API endpoints** to communicate between dashboard and scraper server

### **For Dashboard Only**
1. **Deploy to Vercel** (recommended)
2. **Configure Supabase** environment variables
3. **Test all features** except scraper control

## 📊 **Post-Deployment**

### **Testing Checklist**
- [ ] Dashboard loads correctly
- [ ] Data Management tab works
- [ ] Settings tab works
- [ ] Database connection is working
- [ ] Environment variables are set correctly

### **Monitoring**
- Monitor Vercel/Netlify logs
- Check Supabase dashboard for database activity
- Set up error tracking (Sentry, etc.)

## 🔗 **Quick Deploy Commands**

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

### **Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod
```

## 🎉 **Success Indicators**
- ✅ Dashboard loads without errors
- ✅ Data Management shows products
- ✅ Settings panel works
- ✅ No console errors
- ✅ Database queries work

---

**🚀 Your Blinkit Scraper Dashboard is ready for deployment!** 