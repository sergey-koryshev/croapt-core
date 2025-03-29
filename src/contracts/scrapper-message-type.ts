/**
 * Type of Scrapper Message
 */
export enum ScrapperMessageType {
  // Apartment was added.
  APARTMENT_ADDED = 'apartment_added',

  // Rent price was changed.
  PRICE_CHANGED = 'price_changed',

  // Apartment was updated after a while.
  APARTMENT_BUMPED = 'apartment_bumped',
}