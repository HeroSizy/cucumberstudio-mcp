import { DEFAULT_LOG_LEVEL } from '../constants.js'

import { LOG_COLORS as ANSI_COLORS } from './logger-constants.js'

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'

export interface Logger {
  error(message: string, meta?: Record<string, unknown>): void
  warn(message: string, meta?: Record<string, unknown>): void
  info(message: string, meta?: Record<string, unknown>): void
  debug(message: string, meta?: Record<string, unknown>): void
  trace(message: string, meta?: Record<string, unknown>): void
}

export interface LoggerConfig {
  level: LogLevel
  prefix?: string
  enableTimestamp?: boolean
  enableColors?: boolean
}

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
}

const LOG_COLORS: Record<LogLevel, string> = {
  error: ANSI_COLORS.ERROR,
  warn: ANSI_COLORS.WARN,
  info: ANSI_COLORS.INFO,
  debug: ANSI_COLORS.DEBUG,
  trace: ANSI_COLORS.DEBUG, // Using same as debug
}

const RESET_COLOR = ANSI_COLORS.RESET

/**
 * No-operation logger for testing - discards all log messages
 */
export class NoOpLogger implements Logger {
  error(): void {}
  warn(): void {}
  info(): void {}
  debug(): void {}
  trace(): void {}
}

/**
 * Logger implementation that outputs to stderr
 * Safe for use with STDIO MCP transport as it won't interfere with stdout protocol
 */
export class StderrLogger implements Logger {
  private config: LoggerConfig & { enableTimestamp: boolean; enableColors: boolean }

  constructor(config: LoggerConfig) {
    this.config = {
      enableTimestamp: true,
      enableColors: true,
      ...config,
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    let formatted = ''

    // Add timestamp if enabled
    if (this.config.enableTimestamp) {
      formatted += `[${new Date().toISOString()}] `
    }

    // Add level with color if enabled
    const levelUpper = level.toUpperCase().padEnd(5)
    if (this.config.enableColors) {
      formatted += `${LOG_COLORS[level]}${levelUpper}${RESET_COLOR} `
    } else {
      formatted += `${levelUpper} `
    }

    // Add prefix if configured
    if (this.config.prefix) {
      formatted += `${this.config.prefix} `
    }

    // Add message
    formatted += message

    // Add metadata
    if (meta !== undefined) {
      if (typeof meta === 'object') {
        formatted += ` ${JSON.stringify(meta)}`
      } else {
        formatted += ` ${String(meta)}`
      }
    }

    return formatted
  }

  private writeLog(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return

    const formatted = this.formatMessage(level, message, meta)
    console.error(formatted)
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.writeLog('error', message, meta)
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.writeLog('warn', message, meta)
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.writeLog('info', message, meta)
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.writeLog('debug', message, meta)
  }

  trace(message: string, meta?: Record<string, unknown>): void {
    this.writeLog('trace', message, meta)
  }
}

/**
 * No-op logger for testing or when logging is disabled
 */
export class NoopLogger implements Logger {
  error(): void {}
  warn(): void {}
  info(): void {}
  debug(): void {}
  trace(): void {}
}

/**
 * Helper to get log level from environment
 */
export function getLogLevel(): LogLevel {
  return (process.env.LOG_LEVEL as LogLevel) || (DEFAULT_LOG_LEVEL as LogLevel)
}
