import * as fs from 'fs'
import * as path from 'path'

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'

export interface LoggerConfig {
  level: LogLevel
  transport: 'console' | 'file' | 'stderr' | 'none'
  filePath?: string
  enableColors?: boolean
  enableTimestamp?: boolean
}

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
}

const LOG_COLORS: Record<LogLevel, string> = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  debug: '\x1b[90m', // Gray
  trace: '\x1b[35m', // Magenta
}

const RESET_COLOR = '\x1b[0m'

export class Logger {
  private config: LoggerConfig
  private fileHandle: fs.WriteStream | null = null

  constructor(config: LoggerConfig) {
    this.config = {
      enableColors: true,
      enableTimestamp: true,
      ...config
    }
    
    if (this.config.transport === 'file' && this.config.filePath) {
      // Ensure directory exists
      const dir = path.dirname(this.config.filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      // Create file write stream
      this.fileHandle = fs.createWriteStream(this.config.filePath, { 
        flags: 'a', // append mode
        encoding: 'utf8' 
      })
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    let formatted = ''
    
    // Add timestamp if enabled
    if (this.config.enableTimestamp) {
      formatted += `[${new Date().toISOString()}] `
    }
    
    // Add level with color if enabled
    const levelUpper = level.toUpperCase().padEnd(5)
    if (this.config.enableColors && this.config.transport !== 'file') {
      formatted += `${LOG_COLORS[level]}${levelUpper}${RESET_COLOR} `
    } else {
      formatted += `${levelUpper} `
    }
    
    // Add message
    formatted += message
    
    // Add arguments
    if (args.length > 0) {
      const formattedArgs = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      formatted += ` ${formattedArgs}`
    }
    
    return formatted
  }

  private writeLog(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return
    
    const formatted = this.formatMessage(level, message, ...args)
    
    switch (this.config.transport) {
      case 'console':
        console.log(formatted)
        break
      case 'stderr':
        // Use stderr for logging to avoid interfering with STDIO transport
        console.error(formatted)
        break
      case 'file':
        if (this.fileHandle) {
          this.fileHandle.write(formatted + '\n')
        }
        break
      case 'none':
        // No-op
        break
    }
  }

  // Cleanup method
  close(): void {
    if (this.fileHandle) {
      this.fileHandle.end()
      this.fileHandle = null
    }
  }

  error(message: string, ...args: any[]): void {
    this.writeLog('error', message, ...args)
  }

  warn(message: string, ...args: any[]): void {
    this.writeLog('warn', message, ...args)
  }

  info(message: string, ...args: any[]): void {
    this.writeLog('info', message, ...args)
  }

  debug(message: string, ...args: any[]): void {
    this.writeLog('debug', message, ...args)
  }

  trace(message: string, ...args: any[]): void {
    this.writeLog('trace', message, ...args)
  }

  // Specific logging methods for different components
  http(level: LogLevel, message: string, data?: any): void {
    const prefix = '🌐 HTTP'
    this.writeLog(level, `${prefix} ${message}`, data)
  }

  api(level: LogLevel, message: string, data?: any): void {
    const prefix = '🥒 API'
    this.writeLog(level, `${prefix} ${message}`, data)
  }

  mcp(level: LogLevel, message: string, data?: any): void {
    const prefix = '📡 MCP'
    this.writeLog(level, `${prefix} ${message}`, data)
  }

  transport(level: LogLevel, message: string, data?: any): void {
    const prefix = '🚌 TRANSPORT'
    this.writeLog(level, `${prefix} ${message}`, data)
  }
}

// Factory function to create logger based on transport type
export function createLogger(transportType: 'stdio' | 'http' | 'streamable-http', config?: Partial<LoggerConfig>): Logger {
  const baseConfig: LoggerConfig = {
    level: (process.env.LOG_LEVEL as LogLevel) || 'info',
    transport: 'stderr', // Default to stderr
    enableColors: true,
    enableTimestamp: true,
    ...config
  }

  // For STDIO transport, we need to be careful not to interfere with the protocol
  if (transportType === 'stdio') {
    baseConfig.transport = process.env.LOG_FILE ? 'file' : 'stderr'
    if (baseConfig.transport === 'file' && !baseConfig.filePath) {
      baseConfig.filePath = process.env.LOG_FILE || './logs/mcp-server.log'
    }
  }

  return new Logger(baseConfig)
}