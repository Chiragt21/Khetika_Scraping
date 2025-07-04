'use client'

import { useState, useEffect } from 'react'
import { 
  // BarChart3, 
  Database, 
  Settings, 
  Play, 
  Package,
  // Download, 
  // MapPin,
  // TrendingUp,
  // Clock
} from 'lucide-react'
import ScraperControl from './components/ScraperControl'
import DataTable from './components/DataTable'
// import DashboardOverview from './components/DashboardOverview'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('data')
  // const [stats, setStats] = useState({
  //   totalProducts: 0,
  //   totalLocations: 0,
  //   lastScrape: null,
  //   totalCategories: 0
  // })
  // const [chartData, setChartData] = useState({
  //   categoryData: [],
  //   locationData: [],
  //   trendData: []
  // })
  // const [loading, setLoading] = useState(true)
  // const [chartLoading, setChartLoading] = useState(true)

  useEffect(() => {
    // Fetch dashboard stats and chart data
    // fetchStats()
    // fetchChartData()
  }, [])

  // const fetchStats = async () => {
  //   try {
  //     setLoading(true)
  //     const response = await fetch('/api/stats')
  //     if (response.ok) {
  //       const data = await response.json()
  //       console.log('API Response:', data)
  //       console.log('Stats from API:', data.stats)
  //       setStats(data.stats)
  //       if (data.charts) {
  //           setChartData(data.charts)
  //         }
  //     } else {
  //       console.error('Failed to fetch stats')
  //       // Fallback to mock data if API fails
  //       setStats({
  //         totalProducts: 1250,
  //         totalLocations: 8,
  //         lastScrape: new Date().toISOString(),
  //         totalCategories: 15
  //       })
  //     }
  //   } catch (error) {
  //     console.error('Error fetching stats:', error)
  //     // Fallback to mock data if API fails
  //       setStats({
  //         totalProducts: 1250,
  //         totalLocations: 8,
  //         lastScrape: new Date().toISOString(),
  //         totalCategories: 15
  //       })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // const fetchChartData = async () => {
  //   try {
  //     setChartLoading(true)
  //     const response = await fetch('/api/stats')
  //     if (response.ok) {
  //       const data = await response.json()
  //       if (data.charts) {
  //         setChartData(data.charts)
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching chart data:', error)
  //   } finally {
  //     setChartLoading(false)
  //   }
  // }

  // Helper function to format date properly
  // const formatLastScrape = (dateString) => {
  //   if (!dateString) return 'Never'
  //   
  //   try {
  //     // Try different date formats
  //     let date
  //     
  //     // Handle format like "30/6/2025, 9:02:32 am"
  //     if (dateString.includes('/') && dateString.includes(',')) {
  //       // Split by comma to separate date and time
  //       const [datePart, timePart] = dateString.split(', ')
  //       
  //       // Parse date part (DD/MM/YYYY)
  //       const dateParts = datePart.split('/')
  //       if (dateParts.length === 3) {
  //         const day = parseInt(dateParts[0])
  //         const month = parseInt(dateParts[1]) - 1 // Month is 0-indexed
  //         const year = parseInt(dateParts[2])
  //         
  //         // Parse time part (HH:MM:SS am/pm)
  //         let hours = 0
  //         let minutes = 0
  //         let seconds = 0
  //           
  //         if (timePart) {
  //           const timeMatch = timePart.match(/(\d+):(\d+):(\d+)\s*(am|pm)/i)
  //           if (timeMatch) {
  //             hours = parseInt(timeMatch[1])
  //             minutes = parseInt(timeMatch[2])
  //             seconds = parseInt(timeMatch[3])
  //             const isPM = timeMatch[4].toLowerCase() === 'pm'
  //               
  //             // Convert to 24-hour format
  //             if (isPM && hours !== 12) hours += 12
  //             if (!isPM && hours === 12) hours = 0
  //           }
  //         }
  //         
  //         date = new Date(year, month, day, hours, minutes, seconds)
  //       }
  //     }
  //     // Try parsing as ISO string
  //     else if (dateString.includes('T') || dateString.includes('Z')) {
  //       date = new Date(dateString)
  //     }
  //     // Try parsing DD/MM/YYYY format (without time)
  //     else if (dateString.includes('/')) {
  //       const parts = dateString.split('/')
  //       if (parts.length === 3) {
  //         // Assuming DD/MM/YYYY format
  //         date = new Date(parts[2], parts[1] - 1, parts[0])
  //       }
  //     }
  //     // Try parsing as timestamp
  //     else if (!isNaN(dateString)) {
  //       date = new Date(parseInt(dateString))
  //     }
  //     // Default parsing
  //     else {
  //       date = new Date(dateString)
  //     }
  //     
  //     // Check if date is valid
  //     if (isNaN(date.getTime())) {
  //       console.error('Invalid date format:', dateString)
  //       return 'Invalid Date'
  //     }
  //     
  //     return date.toLocaleDateString('en-US', {
  //       year: 'numeric',
  //       month: 'short',
  //       day: 'numeric',
  //       hour: '2-digit',
  //       minute: '2-digit'
  //     })
  //   } catch (error) {
  //     console.error('Error parsing date:', dateString, error)
  //     return 'Invalid Date'
  //   }
  // }

  // Helper function to render chart placeholder with data
  // const renderChartPlaceholder = (title, data, type = 'bar') => {
  //   if (chartLoading) {
  //     return (
  //       <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
  //       <div className="animate-pulse text-gray-500">Loading chart data...</div>
  //     </div>
  //   )
  // }

  //   if (!data || data.length === 0) {
  //     return (
  //       <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
  //         <p className="text-gray-500">No data available</p>
  //       </div>
  //     )
  //   }

  //   // Simple text-based chart representation
  //   return (
  //     <div className="h-64 overflow-y-auto p-4">
  //       <div className="space-y-3">
  //       {data.map((item, index) => (
  //         <div key={index} className="flex items-center justify-between">
  //           <span className="text-sm font-medium text-gray-700 truncate max-w-[60%]">
  //             {item.name}
  //           </span>
  //           <div className="flex items-center space-x-2">
  //             <div className="w-20 bg-gray-200 rounded-full h-2">
  //               <div 
  //                 className="bg-blue-600 h-2 rounded-full" 
  //                 style={{ 
  //                   width: `${Math.min(100, (item.products / Math.max(...data.map(d => d.products))) * 100)}%` 
  //                 }}
  //               ></div>
  //             </div>
  //             <span className="text-sm text-gray-600 min-w-[40px] text-right">
  //               {item.products}
  //             </span>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // )
  // }

  const tabs = [
    // { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'data', name: 'Data Management', icon: Database },
    { id: 'scraper', name: 'Scraper Control', icon: Play },
    { id: 'settings', name: 'Settings', icon: Settings },
  ]

  // const statCards = [
  //   {
  //     title: 'Total Products',
  //     value: stats.totalProducts.toLocaleString(),
  //     icon: Package,
  //     color: 'text-blue-600',
  //     bgColor: 'bg-blue-50'
  //   },
  //   {
  //     title: 'Active Locations',
  //     value: stats.totalLocations,
  //     icon: MapPin,
  //     color: 'text-green-600',
  //     bgColor: 'bg-green-50'
  //   },
  //   {
  //     title: 'Categories',
  //     value: stats.totalCategories,
  //     icon: TrendingUp,
  //     color: 'text-purple-600',
  //     bgColor: 'bg-purple-50'
  //   },
  //   {
  //     title: 'Last Scrape',
  //     value: formatLastScrape(stats.lastScrape),
  //     icon: Clock,
  //     color: 'text-orange-600',
  //     bgColor: 'bg-orange-50'
  //   }
  // ]

  // const renderOverview = () => (
  //   <DashboardOverview
  //     stats={stats}
  //     chartData={chartData.categoryData}
  //     categoryData={chartData.categoryData}
  //     trendData={chartData.trendData}
  //   />
  // )

  const renderDataManagement = () => <DataTable />

  const renderScraperControl = () => <ScraperControl />

  const renderSettings = () => (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
      <p className="text-gray-600">Settings panel will be loaded here.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Scraper Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* {activeTab === 'overview' && renderOverview()} */}
        {activeTab === 'data' && renderDataManagement()}
        {activeTab === 'scraper' && renderScraperControl()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  )
} 