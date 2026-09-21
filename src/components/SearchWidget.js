'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchRates } from '@/lib/api';
import { API_BASE_URL } from '@/lib/config';
import { formatMoney, todayIso } from '@/lib/format';
import { calculateTotal, pricingLabel } from '@/lib/pricing';
import { ArrowRightIcon, CalendarIcon, FlagIcon, PinIcon, UsersIcon } from './Icons';

const unique = (list) => [...new Set(list)];
const isDev = process.env.NODE_ENV !== 'production';

/**
 * The hero search box. It is ALWAYS shown. If the server could not load the rates, the box loads
 * them again from the browser and, if that fails too, explains why and offers a retry button.
 *
 * Choose a rate (pickup + drop-off), a date and the passenger count, see the price, press Continue
 * and you are sent to /booking with those choices in the URL.
 */
export default function SearchWidget({ initialRates = [], initialPickup = '', initialDropoff = '', tag = '' }) {
  const router = useRouter();

  const [rates, setRates] = useState(initialRates);
  // loading | ready | empty | error
  const [status, setStatus] = useState(initialRates.length > 0 ? 'ready' : 'loading');
  const [loadError, setLoadError] = useState(null);

  const [pickup, setPickup] = useState(
    initialRates.some((r) => r.pickupLocation === initialPickup) ? initialPickup : '',
  );
  const [dropoff, setDropoff] = useState(
    initialRates.some((r) => r.pickupLocation === initialPickup && r.dropoffLocation === initialDropoff)
      ? initialDropoff
      : '',
  );
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [minDate, setMinDate] = useState(''); // set after mount so server and browser HTML match
  const [errors, setErrors] = useState({});

  useEffect(() => setMinDate(todayIso()), []);

  const loadRates = useCallback(async () => {
    setStatus('loading');
    setLoadError(null);
    try {
      const data = await fetchRates({ tag });
      setRates(data);
      setStatus(data.length > 0 ? 'ready' : 'empty');
      // honour a pre-selected route from the URL (the "Book" buttons on the rate cards)
      if (data.some((r) => r.pickupLocation === initialPickup)) {
        setPickup(initialPickup);
        if (data.some((r) => r.pickupLocation === initialPickup && r.dropoffLocation === initialDropoff)) {
          setDropoff(initialDropoff);
        }
      }
    } catch (err) {
      setLoadError(err);
      setStatus('error');
    }
  }, [tag, initialPickup, initialDropoff]);

  // The server could not give us any rates? Try from the browser.
  useEffect(() => {
    if (initialRates.length === 0) loadRates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ready = status === 'ready';
  const pickups = useMemo(() => unique(rates.map((r) => r.pickupLocation)), [rates]);
  const dropoffs = useMemo(
    () => unique(rates.filter((r) => r.pickupLocation === pickup).map((r) => r.dropoffLocation)),
    [rates, pickup],
  );
  const rate = rates.find((r) => r.pickupLocation === pickup && r.dropoffLocation === dropoff) ?? null;
  const maxPassengers = rate ? rate.maxPassengers : Math.max(1, ...rates.map((r) => r.maxPassengers));

  function onPickupChange(value) {
    setPickup(value);
    const options = unique(rates.filter((r) => r.pickupLocation === value).map((r) => r.dropoffLocation));
    setDropoff(options.length === 1 ? options[0] : ''); // only one choice? select it for them
    setErrors((e) => ({ ...e, pickup: undefined, dropoff: undefined }));
  }

  function onDropoffChange(value) {
    setDropoff(value);
    const selected = rates.find((r) => r.pickupLocation === pickup && r.dropoffLocation === value);
    if (selected) setPassengers((p) => Math.min(p, selected.maxPassengers));
    setErrors((e) => ({ ...e, dropoff: undefined }));
  }

  const changePassengers = (delta) => setPassengers((p) => Math.min(maxPassengers, Math.max(1, p + delta)));

  function onSubmit(event) {
    event.preventDefault();
    if (!ready) return;
    const next = {};
    if (!pickup) next.pickup = 'Choose a pickup location';
    if (!dropoff) next.dropoff = 'Choose a drop-off location';
    if (!date) next.date = 'Choose a date';
    else if (minDate && date < minDate) next.date = 'Date cannot be in the past';
    setErrors(next);
    if (Object.keys(next).length > 0 || !rate) return;

    const params = new URLSearchParams({ rateId: rate.id, date, passengers: String(passengers) });
    if (tag) params.set('tag', tag);
    router.push(`/booking?${params.toString()}`);
  }

  const pickupPlaceholder = { loading: 'Loading routes…', empty: 'No routes available', error: 'Routes unavailable', ready: 'Select pickup' }[status];

  return (
    <form className="widget" onSubmit={onSubmit} noValidate aria-label="Find your transfer">
      {status === 'error' && (
        <div className="widget__alert" role="alert">
          <p>
            <strong>We couldn&apos;t load the routes.</strong> Please check your connection and try again.
          </p>
          {isDev && (
            <p className="widget__debug">
              Developer info: tried <code>{API_BASE_URL}/rates</code>
              {loadError?.message ? <> — {loadError.message}</> : null}
              {loadError?.code === 'NETWORK_ERROR' && (
                <> Is the API running? Is this site&apos;s address (e.g. http://localhost:3000) listed in the API&apos;s <code>CORS_ORIGINS</code>?</>
              )}
            </p>
          )}
          <button type="button" className="btn btn--ghost btn--sm" onClick={loadRates}>Try again</button>
        </div>
      )}
      {status === 'empty' && (
        <div className="widget__alert" role="status">
          <p><strong>No routes are available right now.</strong> Please check back soon.</p>
          {isDev && (
            <p className="widget__debug">
              Developer info: the API returned an empty list{tag ? <> for tag <code>{tag}</code></> : null}. Add rates with{' '}
              <code>npm run seed</code> or <code>POST /api/v1/admin/rates</code> in the API project.
            </p>
          )}
        </div>
      )}

      <div className="widget__grid">
        <div className="field">
          <label htmlFor="pickup">Pickup</label>
          <div className="control">
            <PinIcon />
            <select id="pickup" value={pickup} onChange={(e) => onPickupChange(e.target.value)} disabled={!ready} aria-invalid={Boolean(errors.pickup)}>
              <option value="">{pickupPlaceholder}</option>
              {pickups.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          {errors.pickup && <p className="field__error" role="alert">{errors.pickup}</p>}
        </div>

        <div className="field">
          <label htmlFor="dropoff">Drop-off</label>
          <div className="control">
            <FlagIcon />
            <select
              id="dropoff"
              value={dropoff}
              onChange={(e) => onDropoffChange(e.target.value)}
              disabled={!ready || !pickup}
              aria-invalid={Boolean(errors.dropoff)}
            >
              <option value="">{pickup ? 'Select drop-off' : 'Choose pickup first'}</option>
              {dropoffs.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {errors.dropoff && <p className="field__error" role="alert">{errors.dropoff}</p>}
        </div>

        <div className="field">
          <label htmlFor="date">Date</label>
          <div className="control">
            <CalendarIcon />
            <input
              id="date"
              type="date"
              value={date}
              min={minDate || undefined}
              onChange={(e) => {
                setDate(e.target.value);
                setErrors((er) => ({ ...er, date: undefined }));
              }}
              aria-invalid={Boolean(errors.date)}
            />
          </div>
          {errors.date && <p className="field__error" role="alert">{errors.date}</p>}
        </div>

        <div className="field">
          <label htmlFor="passengers">Passengers</label>
          <div className="control control--stepper">
            <UsersIcon />
            <button type="button" className="stepper__btn" onClick={() => changePassengers(-1)} disabled={passengers <= 1} aria-label="Fewer passengers">−</button>
            <input id="passengers" type="number" inputMode="numeric" value={passengers} min={1} max={maxPassengers} readOnly aria-live="polite" />
            <button type="button" className="stepper__btn" onClick={() => changePassengers(1)} disabled={passengers >= maxPassengers} aria-label="More passengers">+</button>
          </div>
        </div>

        <button type="submit" className="btn btn--primary btn--lg widget__submit" disabled={!ready}>
          Continue <ArrowRightIcon />
        </button>
      </div>

      <div className="widget__foot" aria-live="polite">
        {rate ? (
          <p className="widget__price">
            Total <strong>{formatMoney(calculateTotal(rate, passengers), rate.currency)}</strong>
            <span> · {pricingLabel(rate)} · up to {rate.maxPassengers} passengers</span>
          </p>
        ) : (
          <p className="widget__hint">{ready ? 'Choose your route to see the fixed price.' : ' '}</p>
        )}
      </div>
    </form>
  );
}