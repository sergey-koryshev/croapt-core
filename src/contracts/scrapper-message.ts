import { Apartment } from './apartment'
import { ScrapperMessageType } from './scrapper-message-type'

/**
 * Represents Scrapper Message
 */
export interface ScrapperMessage {
  // Type of the Scrapper Message.
  type: ScrapperMessageType
}

/**
 * Represents Scrapper Message for new apartment.
 */
export interface NewApartmentScrapperMessage extends ScrapperMessage, Apartment {
  type: ScrapperMessageType.APARTMENT_ADDED
}

/**
 * Represents Scrapper Message for the apartment updated after a while.
 */
export interface BumpedApartmentScrapperMessage extends ScrapperMessage, Apartment {
  type: ScrapperMessageType.APARTMENT_BUMPED

  // Previous date the apartments was updated.
  lastBumpDate: Date
}

/**
 * Represents Scrapper Message about changed rent price.
 */
export interface PriceChangedScrapperMessage extends ScrapperMessage, Apartment {
  type: ScrapperMessageType.PRICE_CHANGED

  // Previous rent price.
  oldPrice: number
}

/**
 * Represents Scrapper Message related to apartment.
 */
export type ApartmentScrapperMessage = NewApartmentScrapperMessage | BumpedApartmentScrapperMessage | PriceChangedScrapperMessage