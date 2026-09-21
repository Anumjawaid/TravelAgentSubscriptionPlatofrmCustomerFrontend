import { BRAND_NAME } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__brand">{BRAND_NAME}</span>
        <span className="footer__copy">© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</span>
      </div>
    </footer>
  );
}
