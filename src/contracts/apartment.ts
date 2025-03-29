/**
 * Represents apartment.
 */
export interface Apartment {
  // Identification number.
  id: number

  // Identification number from external source.
  apartmentExternalId: number

  // Url of the apartment in external source.
  url: string

  // Name of the apartment.
  name: string

  // Last date when the apartment was updated.
  lastUpdateDate: Date

  // Location of the apartment.
  location: string

  // Living size of the apartment.
  size: string

  // Rent price of the apartment.
  price: number
}