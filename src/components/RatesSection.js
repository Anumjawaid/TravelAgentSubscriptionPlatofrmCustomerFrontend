import Link from 'next/link';
import { formatMoney } from '@/lib/format';
import { pricingLabel } from '@/lib/pricing';
import { ArrowRightIcon } from './Icons';

/** "Our rates" grid on the landing page. Each card pre-fills the hero search via the URL. */
export default function RatesSection({ rates, tag }) {
  return (
    <section className="section" id="rates" aria-labelledby="rates-title">
      <div className="container">
        <p className="eyebrow">Fixed prices</p>
        <h2 className="section__title" id="rates-title">Our transfer rates</h2>
        <p className="section__lead">Choose a route and book in a minute. The price you see is the price you pay.</p>

        <ul className="rates">
          {rates.map((rate) => {
            const params = new URLSearchParams({ pickup: rate.pickupLocation, dropoff: rate.dropoffLocation });
            if (tag) params.set('tag', tag);
            return (
              <li key={rate.id} className="rate-card">
                <div className="rate-card__route">
                  <span>{rate.pickupLocation}</span>
                  <ArrowRightIcon width={18} height={18} />
                  <span>{rate.dropoffLocation}</span>
                </div>
                <div className="rate-card__bottom">
                  <p className="rate-card__price">
                    {formatMoney(rate.price, rate.currency)}
                    <small> {pricingLabel(rate)}</small>
                  </p>
                  <Link href={`/?${params.toString()}#book`} scroll className="btn btn--ghost btn--sm">Book</Link>
                </div>
                <p className="rate-card__meta">Up to {rate.maxPassengers} passengers</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
