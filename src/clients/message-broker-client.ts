import { connect, Channel, ChannelModel, ConsumeMessage, Replies } from 'amqplib'
import { MessageBrokerConfig, ScraperMessage } from '../contracts'
import { LoggerFactory } from '../helpers'

export type MessageHandler = (message: ConsumeMessage, channel: Channel) => Promise<void>
export type QueuePreparationHandler = (queue: Replies.AssertQueue, channel: Channel) => Promise<void>

/**
 * Class to work with Message Broker based on AMQP
 */
export class MessageBrokerClient {
  private readonly logger = LoggerFactory.getLogger({ name: 'MessageBrokerClient' })

  private connection?: ChannelModel
  private channel?: Channel
  private queue?: Replies.AssertQueue
  private reconnectionTimeout?: NodeJS.Timeout
  
  private isBrokerReconnecting: boolean = false
  private consumerTag?: string
  private isProcessing = false

  /**
   * Creates new instance of class _MessageBrokerClient_.
   * @param config Configuration of Message Broker.
   * @param handleIncomingMessage Handler for incoming message.
   * @param handleQueuePreparation Handler for queue preparation.
   */
  constructor(private readonly config: MessageBrokerConfig, private readonly handleIncomingMessage?: MessageHandler, private readonly handleQueuePreparation?: QueuePreparationHandler) {}

  /**
   * Establishing connection with Message Broker.
   * @returns A promise that resolves when the operation is complete.
   */
  public async initialize(): Promise<void> {
    if (this.reconnectionTimeout != null) {
      clearTimeout(this.reconnectionTimeout)
      this.reconnectionTimeout = undefined
    }

    try {
      this.logger.info(`Connecting to Message Broker instance '${this.config.brokerUrl}'...`)
      
      this.connection = await connect(`amqp://${this.config.brokerUsername}:${this.config.brokerPassword}@${this.config.brokerUrl}`)
      this.connection.on('error', (error) => this.handleConnectionFaulted(error))
      this.connection.on('blocked', (reason) => this.logger.warn(`Connection was blocked by Message Broker instance by the following reason: ${reason}`))
      this.connection.on('unblocked', () => this.logger.info('Connection was unblocked by Message Broker instance.'))
      
      this.isBrokerReconnecting = false
      this.isProcessing = false
      this.consumerTag = undefined
    } catch(error: unknown) {
      this.logger.error(error, 'Error has occurred while connecting to Message Broker instance')
      this.reconnect(true)
      return Promise.resolve()
    }

    this.logger.info('Initializing channel...')
    this.channel = await this.connection.createChannel()
    this.channel.on('error', (error) => this.handleChannelFaulted(error))
    this.channel.on('close', () => this.handleChannelClosed())

    this.logger.info(`Ensuring that queue '${this.config.brokerQueueName}' exists...`)
    this.queue = await this.channel.assertQueue(this.config.brokerQueueName, { durable: true })

    if (this.handleIncomingMessage != null) {
      await this.setUpConsumer()
    }

    this.logger.info('Connection with the Message Broker instance was established.')
  }

  /**
   * Disposing current instance of _MessageBrokerClient_. It waits for ongoing message
   * processing if any.
   * @returns A promise that resolves when the operation is complete.
   */
  public async dispose(): Promise<void> {
    this.logger.info('Disposing broker client instance...')

    if (this.reconnectionTimeout != null) {
      clearTimeout(this.reconnectionTimeout)
      this.reconnectionTimeout = undefined
    }

    if (this.channel != null && this.consumerTag != null) {
      await this.channel.cancel(this.consumerTag)
      this.logger.info('Cancelled receiving messages')
    }

    if (this.channel != null && this.isProcessing) {
      this.logger.info('Wait for consumer to stop processing current message')
      const checkProcessing = async () => {
        if (this.isProcessing) {
            await new Promise(resolve => setTimeout(resolve, 500))
            return checkProcessing()
        }
        return true
      }
      await checkProcessing()
    }

    this.channel?.removeAllListeners()
    this.connection?.removeAllListeners()

    try {
      await this.channel?.close()
      await this.connection?.close()
    } catch (error: unknown) {
      this.logger.error(error, 'Error has occurred while closing broker\'s connection')
    }
  }

  /**
   * Sends message to Message Broker's queue specified in configuration.
   * @param message Message to be sent.
   * @returns A promise that resolves when the operation is complete.
   */
  public async sendMessage(message: ScraperMessage) {
    if (this.channel == null) {
      throw Error('Message failed to be delivered because channel is not created yet.')
    }

    if (this.queue == null) {
      throw Error('Message failed to be delivered because queue is not created yet.')
    }

    this.channel.sendToQueue(this.config.brokerQueueName, Buffer.from(JSON.stringify(message)), {
      expiration: this.config.brokerMessageExpirationMs
    })
  }

  /**
   * Checks if connection with Message Broker is healthy.
   * @returns _true_ if connection with Message Broker is healthy, otherwise - _false_.
   */
  public healthCheck() {
    return this.isBrokerReconnecting !== true &&
           this.channel?.connection.sentSinceLastCheck == true
  }

  private async setUpConsumer(): Promise<void> {
    if (this.handleIncomingMessage == null) {
      throw Error('Handler for incoming messages is not provided')
    }
    
    if (this.channel == null) {
      throw Error('Consumer can\'t be created because channel is not created yet.')
    }

    if (this.queue == null) {
      throw Error('Consumer can\'t be created because queue is not created yet.')
    }

    if (this.consumerTag != null) {
      throw Error('Consumer already set up.')
    }

    if (this.handleQueuePreparation != null) {
      await this.handleQueuePreparation(this.queue, this.channel)
    }

    // makes the processing messages one by one
    this.channel.prefetch(1, true)

    this.logger.info('Setting up a consumer...')
    const consumer = await this.channel.consume(
      this.config.brokerQueueName,
      async (message) => {
        if (message == null) {
          throw new Error('Message is empty.')
        }

        try {
          this.isProcessing = true
          await this.handleIncomingMessage(message, this.channel)
        } catch(error: unknown) {
          this.logger.error(error, 'Error has occurred while handling incoming message')
        } finally {
          this.isProcessing = false
        }
      }
    )

    this.consumerTag = consumer.consumerTag 
    this.logger.info('The consumer was set up.')
  }

  private reconnect(force: boolean = false) {
    if (this.isBrokerReconnecting && !force) {
      this.logger.info('Reconnection will be skipped since there is ongoing one.')
      return
    }

    this.isBrokerReconnecting = true
    this.channel?.removeAllListeners()
    this.connection?.removeAllListeners()

    this.logger.info(`Wait for '${this.config.brokerReconnectionIntervalMs}' milliseconds before reconnection...`)
    this.reconnectionTimeout = setTimeout(() => this.initialize(), this.config.brokerReconnectionIntervalMs)
  }

  private handleChannelClosed() {
    this.logger.error('The channel was unexpectedly closed.')
    this.reconnect()
  }

  private handleChannelFaulted(error: unknown) {
    this.logger.error(error, 'Channel faulted with error')
    this.reconnect()
  }

  private handleConnectionFaulted(error: unknown) {
    this.logger.error(error, 'Connection to RabbitMQ instance was interrupted')
    this.reconnect()
  }
}