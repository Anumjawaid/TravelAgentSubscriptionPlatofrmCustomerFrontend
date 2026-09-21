import Link from 'next/link';
import BookingFlow from '@/components/BookingFlow';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { fetchRates } from '@/lib/api';

export const metadata = { title: 'Book your transfer' };

const first = (value) => (Array.isArray(value) ? value[0] : value);

export default async function BookingPage({ searchParams }) {
  const params = await searchParams;
  const rateId = first(params.rateId) ?? '';

  let rate = null;
  let loadFailed = false;
  try {
    // The rate list is cached for 60s, so this is cheap; we look the chosen rate up by id.
    const rates = await fetchRates();
    rate = rates.find((r) => r.id === rateId) ?? null;
  } catch {
    loadFailed = true;
  }

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          {rate ? (
            <BookingFlow
              key={rate.id}
              rate={rate}
              initialDate={first(params.date) ?? ''}
              initialPassengers={first(params.passengers) ?? 1}
            />
          ) : (
            <div className="card empty">
              <h1>{loadFailed ? 'We could not load your route' : 'This route is not available'}</h1>
              <p>
                {loadFailed
                  ? 'The booking service is temporarily unavailable. Please try again in a few minutes.'
                  : 'The route you selected may have changed. Please choose your transfer again.'}
              </p>
              <Link href="/#book" className="btn btn--primary">Choose a route</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
