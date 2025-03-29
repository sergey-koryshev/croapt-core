/**
 * Represents Message Broker configuration
 */
export interface MessageBrokerConfig {
  // Url of the Message Broker server, e.g. 'localhost:5672'
  brokerUrl: string

  // User name to authenticate on the Message Broker server.
  brokerUsername: string

  // Password for the user to authenticate on the Message Broker server.
  brokerPassword: string

  // Name of target Message Broker's queue to work with.
  brokerQueueName: string

  // Interval in milliseconds between reconnection attempts in case if
  // connection to the Message Broker server has interrupted.
  brokerReconnectionIntervalMs: number

  // Life time in milliseconds for sent messages to be expired.
  brokerMessageExpirationMs?: number
}