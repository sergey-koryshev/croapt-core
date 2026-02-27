import pino from 'pino'

/**
 * Factory class for creating pino loggers with customizable configurations.
 */
export class LoggerFactory {
  private static loggerConfig: pino.LoggerOptions = {
    level: 'info'
  }

  private static loggerStream?: pino.DestinationStream

  /**
   * Sets the global logger configuration.
   */
  public static set config(config: pino.LoggerOptions) {
    LoggerFactory.loggerConfig = config
  }

  /**
   * Sets the global logger stream.
   */
  public static set stream(stream: pino.DestinationStream) {
    LoggerFactory.loggerStream = stream
  }

  /**
   * Creates and returns a pino logger with the specified options merged with the global configuration.
   * @param options Partial pino logger options to customize the logger.
   * @param stream Optional pino destination stream to override the global stream for this logger instance.
   * @returns A pino logger instance.
   */
  public static getLogger(options: Partial<pino.LoggerOptions>, stream?: pino.DestinationStream): pino.Logger {
    return pino(
      {
        ...LoggerFactory.loggerConfig,
        ...options
      },
      stream ?? LoggerFactory.loggerStream
    )
  }
}