'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react'

// Helper to robustly parse ISO and legacy date strings
function parseDateString(dateStr) {
  if (!dateStr) return null;
  // If ISO with space, convert to ISO with T
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(dateStr)) {
    return new Date(dateStr.replace(' ', 'T'));
  }
  // Otherwise, let Date handle it
  return new Date(dateStr);
}

// Helper to format ISO date strings for display
function formatDateString(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata'
  });
}

export default function DataTable() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory, selectedLocation, selectedDate])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      // Build query parameters (no page/limit)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedLocation !== 'all') params.append('location', selectedLocation)
      if (selectedDate) {
        params.append('date', selectedDate)
      }
      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      if (response.ok && !data.error) {
        const products = data.data || []
        setProducts(products)
        setFilteredProducts(products)
        // Restore: extract unique categories and locations from products
        const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))].sort()
        const uniqueLocations = [...new Set(products.map(p => p.location).filter(Boolean))].sort()
        setCategories(uniqueCategories)
        setLocations(uniqueLocations)
      } else {
        setError(data.error || 'Failed to fetch products.')
        setProducts([])
        setFilteredProducts([])
        setCategories([])
        setLocations([])
      }
    } catch (error) {
      setError('Error fetching products: ' + error.message)
      setProducts([])
      setFilteredProducts([])
      setCategories([])
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Name', 'Quantity', 'Price', 'Category', 'Location', 'Pincode', 'Date'],
      ...filteredProducts.map(p => [p.name, p.quantity, p.price, p.category, p.location, p.pincode, p.date])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'blinkit_products.csv'
    a.click()
  }

  if (loading && products.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 border border-red-200">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          
          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded"
            />
          </div>
          
          <button
            onClick={exportData}
            className="btn-primary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
                >
                  Pincode
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-normal break-words max-w-xs">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.pincode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.date ? formatDateString(product.date) : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 