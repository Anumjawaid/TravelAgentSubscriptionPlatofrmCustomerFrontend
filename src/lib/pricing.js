/**
 * Display-only price maths. It mirrors the API (integer cents, per_vehicle vs per_passenger) so the
 * price shown on screen matches what the server will store. The server always recomputes it anyway.
 */
export function calculateTotal(rate, passengers) {
  const cents = Math.round(rate.price * 100);
  const multiplier = rate.pricingType === 'per_passenger' ? Math.max(1, passengers) : 1;
  return (cents * multiplier) / 100;
}

export const pricingLabel = (rate) => (rate.pricingType === 'per_passenger' ? 'per passenger' : 'per vehicle');
