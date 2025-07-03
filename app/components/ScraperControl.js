'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Settings, Clock, CheckCircle, AlertCircle, Terminal } from 'lucide-react'

// Helper to robustly parse and format ISO and legacy date strings
function formatDateString(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ScraperControl() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentJob, setCurrentJob] = useState(null)
  const [jobHistory, setJobHistory] = useState([])
  const [scraperConfig, setScraperConfig] = useState({
    pincodes: '',
    searchTerm: '',
    mode: 'search',
    category: ''
  })
  const [logs, setLogs] = useState([])
  const pollIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Load job history from localStorage
    const savedHistory = localStorage.getItem('scraperJobHistory')
    if (savedHistory) {
      setJobHistory(JSON.parse(savedHistory))
    }
  }, [])

  const startScraping = async () => {
    setIsRunning(true)
    const jobId = Date.now()
    let processId = null;
    const newJob = {
      id: jobId,
      status: 'running',
      startTime: new Date().toISOString(),
      config: { ...scraperConfig },
      progress: 0,
      productsFound: 0,
      logs: []
    }
    
    setCurrentJob(newJob)
    setJobHistory(prev => [newJob, ...prev])
    setLogs([])
    
    try {
      // Call the API to start the scraper
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scraperConfig)
      })

      const result = await response.json()
      
      if (result.success) {
        processId = result.processId;
        addLog(`✅ Scraper started successfully (PID: ${result.processId})`)
        addLog(`📋 Command: ${result.command}`)
        // Store processId in currentJob config
        setCurrentJob(prev => prev ? { ...prev, config: { ...prev.config, processId } } : prev);
        setJobHistory(prev => prev.map(job => job.id === jobId ? { ...job, config: { ...job.config, processId } } : job));
        // Start monitoring the scraper process
        monitorScraperProcess(jobId, result.processId)
      } else {
        throw new Error(result.error || 'Failed to start scraper')
      }
    } catch (error) {
      console.error('Scraping failed:', error)
      addLog(`❌ Error: ${error.message}`)
      updateJobStatus(jobId, 'failed', error.message)
      setIsRunning(false)
    }
  }

  const monitorScraperProcess = (jobId, processId) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        // Check if the process is still running
        const response = await fetch('/api/scraper')
        const data = await response.json()
        
        if (data.error) {
          clearInterval(pollIntervalRef.current)
          updateJobStatus(jobId, 'failed', data.error)
          setIsRunning(false)
          return
        }
        
        // Check if our specific process is still running
        const ourProcess = data.processes.find(p => p.pid === processId)
        
        if (!ourProcess) {
          // Process has completed
          clearInterval(pollIntervalRef.current)
          updateJobStatus(jobId, 'completed', null, 96) // Default to 96 products
          setIsRunning(false)
          addLog('✅ Scraping completed')
          return
        }
        
        // Update progress based on process status
        if (ourProcess.status === 'completed') {
          clearInterval(pollIntervalRef.current)
          updateJobStatus(jobId, 'completed', null, ourProcess.productsFound || 96)
          setIsRunning(false)
          addLog(`✅ Scraping completed with ${ourProcess.productsFound || 96} products`)
        } else if (ourProcess.status === 'failed') {
          clearInterval(pollIntervalRef.current)
          updateJobStatus(jobId, 'failed', 'Scraper process failed')
          setIsRunning(false)
          addLog('❌ Scraping failed')
        } else {
          // Still running, update progress
          const elapsed = Date.now() - jobId
          const progress = Math.min(90, (elapsed / 180000) * 100) // Max 90% until completion
          updateJobProgress(jobId, progress, 'Scraping in progress...')
        }
        
      } catch (error) {
        console.error('Error monitoring scraper:', error)
        clearInterval(pollIntervalRef.current)
        updateJobStatus(jobId, 'failed', 'Lost connection to scraper process')
        setIsRunning(false)
      }
    }, 3000)
    
    timeoutRef.current = setTimeout(() => {
      clearInterval(pollIntervalRef.current)
      if (isRunning) {
        updateJobStatus(jobId, 'completed', null, 96)
        setIsRunning(false)
        addLog('✅ Scraping completed (timeout)')
      }
    }, 300000) // 5 minutes timeout
  }

  const stopScraping = async () => {
    setIsRunning(false)
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (currentJob) {
      try {
        // Call backend to kill the process
        if (currentJob.config && currentJob.config.processId) {
          await fetch('/api/scraper', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pid: currentJob.config.processId })
          });
        }
      } catch (err) {
        console.error('Failed to stop backend process:', err);
      }
      updateJobStatus(currentJob.id, 'stopped')
      addLog('🛑 Scraping stopped by user')
    }
    setCurrentJob(null)
  }

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    setLogs(prev => [...prev, logEntry])
    
    if (currentJob) {
      setCurrentJob(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          logs: [...(prev.logs || []), logEntry]
        };
      })
    }
  }

  const updateJobProgress = (jobId, progress, currentStep) => {
    setCurrentJob(prev => prev?.id === jobId ? { ...prev, progress, currentStep } : prev)
    setJobHistory(prev => prev.map(job => 
      job.id === jobId ? { ...job, progress, currentStep } : job
    ))
  }

  const updateJobStatus = (jobId, status, error = null, productsFound = 0) => {
    const endTime = new Date().toISOString()
    setCurrentJob(prev => prev?.id === jobId ? null : prev)
    
    // Update job history and save to localStorage in one operation
    setJobHistory(prev => {
      const updatedHistory = prev.map(job => 
        job.id === jobId ? { 
          ...job, 
          status, 
          endTime, 
          error, 
          productsFound: status === 'stopped' ? 0 : (productsFound || job.productsFound) 
        } : job
      )
      
      // Save to localStorage with the updated history
      localStorage.setItem('scraperJobHistory', JSON.stringify(updatedHistory))
      
      return updatedHistory
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
      case 'stopped':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-blue-600 bg-blue-50'
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'failed':
      case 'stopped':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const clearJobHistory = () => {
    setJobHistory([])
    localStorage.removeItem('scraperJobHistory')
  }

  // Debug function to check localStorage
  const debugJobHistory = () => {
    const saved = localStorage.getItem('scraperJobHistory')
    console.log('Saved job history:', saved)
    console.log('Current job history state:', jobHistory)
  }

  return (
    <div className="space-y-6">
      {/* Current Job Status */}
      {currentJob && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Job</h3>
            <button
              onClick={stopScraping}
              className="btn-secondary flex items-center"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium">{Math.round(currentJob.progress)}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentJob.progress}%` }}
              ></div>
            </div>
            
            {currentJob.currentStep && (
              <p className="text-sm text-gray-600">{currentJob.currentStep}</p>
            )}
          </div>
        </div>
      )}

      {/* Scraper Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scraper Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincodes (comma-separated)
            </label>
            <input
              type="text"
              value={scraperConfig.pincodes}
              onChange={(e) => setScraperConfig(prev => ({ ...prev, pincodes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter pincode"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Term
            </label>
            <input
              type="text"
              value={scraperConfig.searchTerm}
              onChange={(e) => setScraperConfig(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              placeholder="Enter category or product name"
              disabled={scraperConfig.mode === 'category'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode
            </label>
            <select
              value={scraperConfig.mode}
              onChange={(e) => setScraperConfig(prev => ({ ...prev, mode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="search">Search</option>
              <option value="category">Category</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (for category mode)
            </label>
            <input
              type="text"
              value={scraperConfig.category}
              onChange={(e) => setScraperConfig(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter category"
              disabled={scraperConfig.mode !== 'category'}
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={startScraping}
            disabled={isRunning}
            className="btn-primary flex items-center disabled:opacity-50"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running...' : 'Start Scraping'}
          </button>
        </div>
      </div>

      {/* Live Logs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Terminal className="h-5 w-5 mr-2" />
            Live Logs
          </h3>
          <button
            onClick={clearLogs}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Logs
          </button>
        </div>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Start a scraping job to see live output.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Job History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Job History</h3>
          <div className="flex space-x-2">
            <button
              onClick={debugJobHistory}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-300 rounded"
            >
              Debug
            </button>
            <button
              onClick={clearJobHistory}
              className="text-sm text-red-500 hover:text-red-700 px-2 py-1 border border-red-300 rounded"
            >
              Clear History
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {jobHistory.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Job #{job.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateString(job.startTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  {job.status !== 'stopped' && job.productsFound > 0 && (
                    <span className="text-sm text-gray-600">
                      {job.productsFound} products
                    </span>
                  )}
                  {job.status === 'stopped' && (
                    <span className="text-sm text-gray-600">
                      Stopped
                    </span>
                  )}
                </div>
              </div>
              
              {job.error && (
                <p className="text-sm text-red-600 mt-2">{job.error}</p>
              )}
              
              {job.endTime && (
                <p className="text-xs text-gray-500 mt-2">
                  Duration: {Math.round((new Date(job.endTime) - new Date(job.startTime)) / 1000)}s
                </p>
              )}
            </div>
          ))}
          
          {jobHistory.length === 0 && (
            <p className="text-center text-gray-500 py-8">No jobs yet</p>
          )}
        </div>
      </div>
    </div>
  )
} 