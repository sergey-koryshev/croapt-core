import { Apartment } from './apartment'
import { ScraperMessageType } from './scraper-message-type'

/**
 * Represents Scraper Message
 */
export interface ScraperMessage {
  // Type of the Scraper Message.
  type: ScraperMessageType
}

/**
 * Represents Scraper Message for new apartment.
 */
export interface NewApartmentScraperMessage extends ScraperMessage, Apartment {
  type: ScraperMessageType.APARTMENT_ADDED
}

/**
 * Represents Scraper Message for the apartment updated after a while.
 */
export interface BumpedApartmentScraperMessage extends ScraperMessage, Apartment {
  type: ScraperMessageType.APARTMENT_BUMPED

  // Previous date the apartments was updated.
  lastBumpDate: Date
}

/**
 * Represents Scraper Message about changed rent price.
 */
export interface PriceChangedScraperMessage extends ScraperMessage, Apartment {
  type: ScraperMessageType.PRICE_CHANGED

  // Previous rent price.
  oldPrice: number
}

/**
 * Represents Scraper Message related to apartment.
 */
export type ApartmentScraperMessage = NewApartmentScraperMessage | BumpedApartmentScraperMessage | PriceChangedScraperMessage