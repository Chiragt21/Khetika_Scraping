'use client'

import { useState } from 'react'

export default function TestPage() {
  const [testData] = useState({
    totalProducts: 1250,
    totalLocations: 8,
    lastScrape: new Date().toISOString(),
    totalCategories: 15
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <div className="h-6 w-6 text-blue-600">📦</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{testData.totalProducts.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-50">
                <div className="h-6 w-6 text-green-600">📍</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Locations</p>
                <p className="text-2xl font-bold text-gray-900">{testData.totalLocations}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-50">
                <div className="h-6 w-6 text-purple-600">📈</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{testData.totalCategories}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-50">
                <div className="h-6 w-6 text-orange-600">⏰</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Scrape</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date(testData.lastScrape).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Check</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-700">✅ Next.js server running</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-700">✅ Tailwind CSS loaded</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-700">✅ React components working</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-yellow-700">⚠️ Supabase connection needs testing</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="btn-primary inline-flex items-center"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
} 