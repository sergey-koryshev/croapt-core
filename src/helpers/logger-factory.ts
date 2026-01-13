import pino from 'pino'

/**
 * Factory class for creating pino loggers with customizable configurations.
 */
export class LoggerFactory {
  private static loggerConfig: pino.LoggerOptions = {
    level: 'info'
  }

  /**
   * Sets the global logger configuration.
   */
  public static set config(config: pino.LoggerOptions) {
    LoggerFactory.loggerConfig = config
  }

  /**
   * Creates and returns a pino logger with the specified options merged with the global configuration.
   * @param options Partial pino logger options to customize the logger.
   * @returns A pino logger instance.
   */
  public static getLogger(options: Partial<pino.LoggerOptions>): pino.Logger {
    return pino(
      {
        ...LoggerFactory.loggerConfig,
        ...options
      }
    )
  }
}