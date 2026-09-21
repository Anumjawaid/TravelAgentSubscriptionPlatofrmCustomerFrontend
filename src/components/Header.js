'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BRAND_NAME } from '@/lib/config';

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="header">
      <div className="container header__inner">
        {/* <Link href="/" className="brand" onClick={close} aria-label={`${BRAND_NAME} home`}>
          <span className="brand__mark">{BRAND_NAME.charAt(0).toUpperCase()}</span>
          <span className="brand__name">{BRAND_NAME}</span>
        </Link> */}
                <Link href="/" className="brand" onClick={close} aria-label={`${BRAND_NAME} home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={BRAND_NAME} className="brand__logo" />
        </Link>

        <button
          type="button"
          className="header__toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="main-nav" className={`nav ${open ? 'nav--open' : ''}`} aria-label="Main">
          <Link href="/" onClick={close}>Home</Link>
          <Link href="/#rates" onClick={close}>Rates</Link>
          <Link href="/#why" onClick={close}>Why us</Link>
          <Link href="/#book" className="btn btn--primary btn--sm" onClick={close}>Book now</Link>
        </nav>
      </div>
    </header>
  );
}
