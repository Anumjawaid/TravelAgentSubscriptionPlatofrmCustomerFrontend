'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBooking } from '@/lib/api';
import { todayIso } from '@/lib/format';
import { validateBooking } from '@/lib/validation';
import BookingSummary from './BookingSummary';
import { ArrowRightIcon, CheckIcon, MailIcon } from './Icons';
import { AGENT_EMAIL } from '@/lib/config';

// Order used to focus the first invalid field.
const FIELD_ORDER = ['pickupDate', 'pickupTime', 'passengers', 'name', 'email', 'phone', 'flightNumber', 'comments'];

function Field({ id, label, error, hint, children }) {
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && <p className="field__error" role="alert">{error}</p>}
    </div>
  );
}

/**
 * The booking page body: the form on the left, the live summary on the right.
 * After a successful POST /bookings it swaps to the confirmation screen.
 */
export default function BookingFlow({ rate, initialDate = '', initialPassengers = 1 }) {
  const startPassengers = Math.min(rate.maxPassengers, Math.max(1, Number(initialPassengers) || 1));

  const [values, setValues] = useState({
    pickupDate: /^\d{4}-\d{2}-\d{2}$/.test(initialDate) ? initialDate : '',
    pickupTime: '',
    passengers: startPassengers,
    name: '',
    email: '',
    phone: '',
    flightNumber: '',
    comments: '',
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [minDate, setMinDate] = useState('');

  useEffect(() => setMinDate(todayIso()), []);
  useEffect(() => {
    if (result) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [result]);

  const set = (name) => (event) => {
    const value = event.target.value;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  const changePassengers = (delta) =>
    setValues((v) => ({ ...v, passengers: Math.min(rate.maxPassengers, Math.max(1, Number(v.passengers) + delta)) }));

  function focusFirstError(errs) {
    const first = FIELD_ORDER.find((key) => errs[key]);
    if (first) document.getElementById(first)?.focus();
  }

  /** Turn the API's error response into inline field messages + a banner. */
  function showApiError(err) {
    const fieldErrors = {};
    for (const detail of err.details ?? []) {
      if (detail.location === 'body' && detail.field) fieldErrors[detail.field] = detail.message;
    }
    if (err.code === 'PICKUP_TOO_SOON' || err.code === 'INVALID_PICKUP_DATETIME') fieldErrors.pickupTime = err.message;
    if (err.code === 'PASSENGER_LIMIT_EXCEEDED') fieldErrors.passengers = err.message;

    setErrors(fieldErrors);
    setBanner(Object.keys(fieldErrors).length > 0 ? 'Please check the highlighted fields.' : err.message);
    focusFirstError(fieldErrors);
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) return; // ignore double-clicks

    const validation = validateBooking(values, { maxPassengers: rate.maxPassengers, today: todayIso() });
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setBanner('Please check the highlighted fields.');
      focusFirstError(validation);
      return;
    }

    setBanner('');
    setSubmitting(true);
    try {
      const flightNumber = values.flightNumber.trim().toUpperCase();
      const comments = values.comments.trim();
      const data = await createBooking({
        rateId: rate.id,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        pickupDate: values.pickupDate,
        pickupTime: values.pickupTime,
        passengers: Number(values.passengers),
        ...(flightNumber ? { flightNumber } : {}),
        ...(comments ? { comments } : {}),
        ...(AGENT_EMAIL ? { agentEmail: AGENT_EMAIL } : {}), // from NEXT_PUBLIC_AGENT_EMAIL in .env
      });
      setResult(data);
    } catch (err) {
      showApiError(err);
    } finally {
      setSubmitting(false);
    }
  }

  // ───────────── Confirmation screen ─────────────
  if (result) {
    return (
      <div className="booking-layout">
        <section className="card confirm" aria-live="polite">
          <span className="confirm__icon"><CheckIcon width={30} height={30} /></span>
          <h1 className="confirm__title">Booking received</h1>
          <p className="confirm__ref">Your reference</p>
          <p className="confirm__code">{result.reference}</p>
          <p className="confirm__text">
            <MailIcon width={18} height={18} /> We have emailed a confirmation to <strong>{values.email.trim().toLowerCase()}</strong>.
            Keep your reference handy if you need to contact us.
          </p>
          <div className="confirm__actions">
            <Link href="/" className="btn btn--primary">Back to home</Link>
            <Link href="/#book" className="btn btn--ghost">Book another transfer</Link>
          </div>
        </section>

        <BookingSummary
          rate={rate}
          pickupDate={result.pickupDate}
          pickupTime={result.pickupTime}
          passengers={result.passengers}
          totalOverride={result.pricing.total}
        />
      </div>
    );
  }

  // ───────────── Booking form ─────────────
  return (
    <div className="booking-layout">
      <form className="card form" onSubmit={onSubmit} noValidate>
        <h1 className="form__title">Complete your booking</h1>
        <p className="form__lead">Just a few details and your transfer is booked.</p>

        {banner && <div className="alert" role="alert">{banner}</div>}

        <fieldset className="form__group">
          <legend>Trip details</legend>
          <div className="form__row">
            <Field id="pickupDate" label="Pickup date" error={errors.pickupDate}>
              <input id="pickupDate" type="date" value={values.pickupDate} min={minDate || undefined} onChange={set('pickupDate')} aria-invalid={Boolean(errors.pickupDate)} />
            </Field>
            <Field id="pickupTime" label="Pickup time" error={errors.pickupTime} hint="24-hour clock, local time">
              <input id="pickupTime" type="time" step="300" value={values.pickupTime} onChange={set('pickupTime')} aria-invalid={Boolean(errors.pickupTime)} />
            </Field>
          </div>

          <Field id="passengers" label={`Passengers (max ${rate.maxPassengers})`} error={errors.passengers}>
            <div className="control control--stepper control--plain">
              <button type="button" className="stepper__btn" onClick={() => changePassengers(-1)} disabled={values.passengers <= 1} aria-label="Fewer passengers">−</button>
              <input id="passengers" type="number" value={values.passengers} readOnly />
              <button type="button" className="stepper__btn" onClick={() => changePassengers(1)} disabled={values.passengers >= rate.maxPassengers} aria-label="More passengers">+</button>
            </div>
          </Field>

          <Field id="flightNumber" label="Flight number (optional)" error={errors.flightNumber} hint="Helps us track delays, e.g. BA117">
            <input id="flightNumber" type="text" autoComplete="off" maxLength={12} value={values.flightNumber} onChange={set('flightNumber')} aria-invalid={Boolean(errors.flightNumber)} />
          </Field>
        </fieldset>

        <fieldset className="form__group">
          <legend>Your details</legend>
          <Field id="name" label="Full name" error={errors.name}>
            <input id="name" type="text" autoComplete="name" value={values.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} />
          </Field>
          <div className="form__row">
            <Field id="email" label="Email" error={errors.email}>
              <input id="email" type="email" autoComplete="email" value={values.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} />
            </Field>
            <Field id="phone" label="Phone" error={errors.phone}>
              <input id="phone" type="tel" autoComplete="tel" placeholder="+44 7700 900123" value={values.phone} onChange={set('phone')} aria-invalid={Boolean(errors.phone)} />
            </Field>
          </div>
          <Field id="comments" label="Additional comments (optional)" error={errors.comments}>
            <textarea id="comments" rows={4} maxLength={1000} placeholder="Luggage, child seats, special requests…" value={values.comments} onChange={set('comments')} aria-invalid={Boolean(errors.comments)} />
          </Field>
        </fieldset>

        <button type="submit" className="btn btn--primary btn--lg form__submit" disabled={submitting}>
          {submitting ? 'Booking…' : (<>Confirm booking <ArrowRightIcon /></>)}
        </button>
        <p className="form__legal">By booking you agree to be contacted about this transfer.</p>
      </form>

      <div className="booking-side">
        <BookingSummary rate={rate} pickupDate={values.pickupDate} pickupTime={values.pickupTime} passengers={values.passengers} />
        <Link href="/#book" className="link-back">← Change route</Link>
      </div>
    </div>
  );
}
