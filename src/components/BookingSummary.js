import { formatDate, formatMoney } from '@/lib/format';
import { calculateTotal, pricingLabel } from '@/lib/pricing';
import { CalendarIcon, ClockIcon, UsersIcon } from './Icons';

/**
 * The order summary shown next to the form (and again on the confirmation screen).
 * `totalOverride` lets the confirmation screen show the price the SERVER stored.
 */
export default function BookingSummary({ rate, pickupDate, pickupTime, passengers, totalOverride, reference }) {
  const count = Math.max(1, Number(passengers) || 1);
  const total = totalOverride ?? calculateTotal(rate, count);
  const perPassenger = rate.pricingType === 'per_passenger';

  return (
    <aside className="summary" aria-label="Booking summary">
      <h2 className="summary__title">Your transfer</h2>
      {reference && <p className="summary__ref">Reference <strong>{reference}</strong></p>}

      <ol className="route">
        <li>
          <span className="route__dot" />
          <span className="route__label">Pickup</span>
          <span className="route__place">{rate.pickupLocation}</span>
        </li>
        <li>
          <span className="route__dot route__dot--end" />
          <span className="route__label">Drop-off</span>
          <span className="route__place">{rate.dropoffLocation}</span>
        </li>
      </ol>

      <dl className="summary__list">
        <div>
          <dt><CalendarIcon width={18} height={18} /> Date</dt>
          <dd>{pickupDate ? formatDate(pickupDate) : '—'}</dd>
        </div>
        <div>
          <dt><ClockIcon width={18} height={18} /> Time</dt>
          <dd>{pickupTime || '—'}</dd>
        </div>
        <div>
          <dt><UsersIcon width={18} height={18} /> Passengers</dt>
          <dd>{count}</dd>
        </div>
      </dl>

      <div className="summary__price">
        <div className="summary__line">
          <span>{perPassenger ? `${formatMoney(rate.price, rate.currency)} × ${count} passenger${count > 1 ? 's' : ''}` : `Transfer (${pricingLabel(rate)})`}</span>
          <span>{formatMoney(total, rate.currency)}</span>
        </div>
        <div className="summary__total">
          <span>Total</span>
          <strong>{formatMoney(total, rate.currency)}</strong>
        </div>
        <p className="summary__note">Fixed price. Taxes and fees included.</p>
      </div>
    </aside>
  );
}
