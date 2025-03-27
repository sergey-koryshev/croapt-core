export interface MessageBrokerConfig {
  brokerUrl: string
  brokerUsername: string
  brokerPassword: string
  brokerQueueName: string
  brokerReconnectionInterval: number
  brokerMessageExpirationMs?: number
}