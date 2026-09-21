import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { CheckIcon, MailIcon, ShieldIcon, TagIcon } from '@/components/Icons';
import RatesSection from '@/components/RatesSection';
import SearchWidget from '@/components/SearchWidget';
import { fetchRates } from '@/lib/api';
import { DEFAULT_RATE_TAG } from '@/lib/config';

const first = (value) => (Array.isArray(value) ? value[0] : value);
// Same shape the API accepts for tags; anything else in the URL is ignored.
const cleanTag = (value) => (/^[a-z0-9][a-z0-9_-]{1,39}$/i.test(value ?? '') ? value.toLowerCase() : '');

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const tag = cleanTag(first(params.tag)) || DEFAULT_RATE_TAG;

   let rates = [];
  try {
    rates = await fetchRates({ tag });
  } catch (err) {
    // Not fatal: the search box (a client component) will try again from the browser.
    // The reason is printed in the terminal where `npm run dev` is running.
    console.error(`[rates] Could not load rates on the server: ${err.message}`);
  }

  return (
    <>
      <Header />
      <main>
        <section className="hero" id="book">
          <div className="container hero__inner">
            <p className="eyebrow">Airport &amp; city transfers</p>
            <h1 className="hero__title">
              Arrive in comfort.<br />
              <span>Book in minutes.</span>
            </h1>
            <p className="hero__lead">
              Choose your route, pick a date and see your fixed price straight away. No hidden charges, no waiting for a quote.
            </p>

                       <SearchWidget
              key={`${first(params.pickup) ?? ''}|${first(params.dropoff) ?? ''}`}
              initialRates={rates}
              initialPickup={first(params.pickup) ?? ''}
              initialDropoff={first(params.dropoff) ?? ''}
              tag={tag}
            />

            <ul className="trust">
              <li><CheckIcon width={18} height={18} /> Fixed, upfront prices</li>
              <li><CheckIcon width={18} height={18} /> Book online in under a minute</li>
              <li><CheckIcon width={18} height={18} /> Instant email confirmation</li>
            </ul>
          </div>
        </section>

        {rates.length > 0 && <RatesSection rates={rates} tag={tag} />}

        <section className="section section--alt" id="why" aria-labelledby="why-title">
          <div className="container">
            <p className="eyebrow">Why book with us</p>
            <h2 className="section__title" id="why-title">Simple, transparent, reliable</h2>
            <div className="features">
              <article className="feature">
                <span className="feature__icon"><TagIcon /></span>
                <h3>Fixed prices</h3>
                <p>See the exact price before you book. What you see is what you pay.</p>
              </article>
              <article className="feature">
                <span className="feature__icon"><ShieldIcon /></span>
                <h3>Handled by a dedicated agent</h3>
                <p>Every booking is assigned to a team member who looks after your transfer.</p>
              </article>
              <article className="feature">
                <span className="feature__icon"><MailIcon /></span>
                <h3>Confirmation by email</h3>
                <p>You receive your booking reference straight away, so you always have the details.</p>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
