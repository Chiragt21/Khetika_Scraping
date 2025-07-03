import { spawn } from 'child_process'
import { NextResponse } from 'next/server'

// Store active scraper processes
const activeProcesses = new Map()

export async function POST(request) {
  try {
    const body = await request.json()
    const { pincodes, searchTerm, mode, category } = body

    // Validate input
    if (!pincodes || !pincodes.trim()) {
      return NextResponse.json({ error: 'Pincodes are required' }, { status: 400 })
    }

    // Build the command
    let command = 'node'
    let args = ['scraper_experiment.js', pincodes]

    if (searchTerm) {
      args.push(searchTerm)
    } else {
      args.push('rice') // default search term
    }

    if (mode) {
      args.push(`--mode=${mode}`)
    }

    if (category && mode === 'category') {
      args.push(`--category="${category}"`)
    }

    console.log('Starting scraper with command:', command, args.join(' '))

    // Start the scraper process
    const scraperProcess = spawn(command, args, {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    })

    const processInfo = {
      pid: scraperProcess.pid,
      startTime: new Date().toISOString(),
      command: `${command} ${args.join(' ')}`,
      status: 'running',
      output: '',
      errorOutput: '',
      productsFound: 0
    }

    // Store process info
    activeProcesses.set(scraperProcess.pid, processInfo)

    // Collect output
    scraperProcess.stdout.on('data', (data) => {
      const output = data.toString()
      processInfo.output += output
      console.log('Scraper output:', output)
      
      // Try to extract total products found from summary line
      const totalMatch = output.match(/✅ Successfully extracted TOTAL products: (\d+)/)
      if (totalMatch) {
        processInfo.productsFound = parseInt(totalMatch[1])
      } else {
        // Fallback: extract from old per-pincode line
        const productsMatch = output.match(/✅ Successfully extracted (\d+) products/)
        if (productsMatch) {
          processInfo.productsFound = parseInt(productsMatch[1])
        }
      }
    })

    scraperProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString()
      processInfo.errorOutput += errorOutput
      console.error('Scraper error:', errorOutput)
    })

    // Handle process completion
    scraperProcess.on('close', (code) => {
      console.log(`Scraper process exited with code ${code}`)
      processInfo.status = code === 0 ? 'completed' : 'failed'
      processInfo.endTime = new Date().toISOString()
      
      // Remove from active processes after a delay
      setTimeout(() => {
        activeProcesses.delete(scraperProcess.pid)
      }, 60000) // Keep for 1 minute after completion
    })

    // Return immediate response with process ID
    return NextResponse.json({
      success: true,
      message: 'Scraper started successfully',
      processId: scraperProcess.pid,
      command: `${command} ${args.join(' ')}`
    })

  } catch (error) {
    console.error('Error starting scraper:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Return information about active scraper processes
    const activeProcessesList = Array.from(activeProcesses.values()).map(process => ({
      pid: process.pid,
      startTime: process.startTime,
      status: process.status,
      productsFound: process.productsFound,
      command: process.command
    }))
    
    return NextResponse.json({
      running: activeProcessesList.length > 0,
      processes: activeProcessesList,
      count: activeProcessesList.length
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { pid } = await request.json();
    const processInfo = activeProcesses.get(pid);
    if (processInfo && processInfo.pid) {
      try {
        process.kill(processInfo.pid);
      } catch (err) {
        // Ignore if already killed
      }
      activeProcesses.delete(pid);
      return NextResponse.json({ success: true, message: `Process ${pid} killed` });
    } else {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 