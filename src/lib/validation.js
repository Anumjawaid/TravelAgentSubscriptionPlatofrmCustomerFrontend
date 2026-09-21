// These rules mirror the API's validators so people get instant feedback; the API stays the source of truth.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9\s().-]{7,20}$/;
const FLIGHT = /^[A-Z0-9]{2,3}\s?\d{1,4}[A-Z]?$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Returns an object of { fieldName: 'message' }. Empty object = valid. */
export function validateBooking(values, { maxPassengers, today }) {
  const errors = {};
  const v = (key) => (values[key] ?? '').toString().trim();

  if (v('name').length < 2) errors.name = 'Please enter your full name.';
  if (!EMAIL.test(v('email'))) errors.email = 'Please enter a valid email address.';
  if (!PHONE.test(v('phone'))) errors.phone = 'Please enter a valid phone number (include the country code).';

  if (!DATE.test(v('pickupDate'))) errors.pickupDate = 'Please choose a pickup date.';
  else if (today && v('pickupDate') < today) errors.pickupDate = 'The pickup date cannot be in the past.';

  if (!TIME.test(v('pickupTime'))) errors.pickupTime = 'Please choose a pickup time.';

  const passengers = Number(values.passengers);
  if (!Number.isInteger(passengers) || passengers < 1) errors.passengers = 'At least 1 passenger.';
  else if (maxPassengers && passengers > maxPassengers) errors.passengers = `This route takes up to ${maxPassengers} passengers.`;

  if (v('flightNumber') && !FLIGHT.test(v('flightNumber').toUpperCase())) {
    errors.flightNumber = 'Use a format like BA117 or EK 601.';
  }
  if (v('comments').length > 1000) errors.comments = 'Please keep comments under 1000 characters.';

  return errors;
}
