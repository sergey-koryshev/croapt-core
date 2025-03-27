import { Apartment } from './apartment'
import { ScrapperMessageType } from './scrapper-message-type'

export interface ScrapperMessage {
  type: ScrapperMessageType
}

export interface NewApartmentScrapperMessage extends ScrapperMessage, Apartment {
  type: ScrapperMessageType.APARTMENT_ADDED
}

export interface BumpedApartmentScrapperMessage extends ScrapperMessage, Apartment {
  type: ScrapperMessageType.APARTMENT_BUMPED
  lastBumpDate: Date
}

export interface PriceChangedScrapperMessage extends ScrapperMessage, Apartment {
  type: ScrapperMessageType.PRICE_CHANGED
  oldPrice: number
}

export type ApartmentScrapperMessage = NewApartmentScrapperMessage | BumpedApartmentScrapperMessage | PriceChangedScrapperMessage