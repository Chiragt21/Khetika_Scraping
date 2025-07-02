'use client'

import { useState, useEffect } from 'react'
import { Save, Database, Key, Globe, Bell } from 'lucide-react'

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    supabase: {
      url: 'https://aczcololiedppabxmsmb.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjemNvbG9saWVkcHBhYnhtc21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNTE0NjcsImV4cCI6MjA2NjgyNzQ2N30.NTlpkbn4PIdHO4xwV0J60ylNDB3RYawJa54LIteCpDo'
    },
    scraper: {
      timeout: 10000,
      maxRetries: 3,
      headless: false,
      autoExport: true
    },
    notifications: {
      email: '',
      webhook: '',
      onJobComplete: true,
      onJobError: true
    }
  })

  const [activeTab, setActiveTab] = useState('database')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('dashboardSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem('dashboardSettings', JSON.stringify(settings))
      
      // Here you would typically save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    try {
      // Test Supabase connection
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(settings.supabase.url, settings.supabase.key)
      
      const { data, error } = await supabase
        .from('products')
        .select('count')
        .limit(1)
      
      if (error) throw error
      
      alert('Database connection successful!')
    } catch (error) {
      console.error('Connection test failed:', error)
      alert('Database connection failed: ' + error.message)
    }
  }

  const tabs = [
    { id: 'database', name: 'Database', icon: Database },
    { id: 'scraper', name: 'Scraper', icon: Key },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ]

  return (
    <div className="space-y-6">
      {/* Settings Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
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
        </nav>
      </div>

      {/* Database Settings */}
      {activeTab === 'database' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase URL
              </label>
              <input
                type="url"
                value={settings.supabase.url}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  supabase: { ...prev.supabase, url: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://your-project.supabase.co"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase Anon Key
              </label>
              <input
                type="password"
                value={settings.supabase.key}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  supabase: { ...prev.supabase, key: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your-anon-key"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={testConnection}
                className="btn-secondary"
              >
                Test Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scraper Settings */}
      {activeTab === 'scraper' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scraper Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout (ms)
              </label>
              <input
                type="number"
                value={settings.scraper.timeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  scraper: { ...prev.scraper, timeout: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="1000"
                max="60000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Retries
              </label>
              <input
                type="number"
                value={settings.scraper.maxRetries}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  scraper: { ...prev.scraper, maxRetries: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="1"
                max="10"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="headless"
                checked={settings.scraper.headless}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  scraper: { ...prev.scraper, headless: e.target.checked }
                }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="headless" className="ml-2 block text-sm text-gray-900">
                Run in headless mode
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoExport"
                checked={settings.scraper.autoExport}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  scraper: { ...prev.scraper, autoExport: e.target.checked }
                }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="autoExport" className="ml-2 block text-sm text-gray-900">
                Auto-export after completion
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={settings.notifications.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={settings.notifications.webhook}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, webhook: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://your-webhook-url.com"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="onJobComplete"
                  checked={settings.notifications.onJobComplete}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, onJobComplete: e.target.checked }
                  }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="onJobComplete" className="ml-2 block text-sm text-gray-900">
                  Notify on job completion
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="onJobError"
                  checked={settings.notifications.onJobError}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, onJobError: e.target.checked }
                  }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="onJobError" className="ml-2 block text-sm text-gray-900">
                  Notify on job errors
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="btn-primary flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
} 