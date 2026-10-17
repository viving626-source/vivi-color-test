import { Outlet, Link, useLocation } from 'react-router-dom';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';
import { Mail, Phone } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isReport = location.pathname.startsWith('/report');
  const showHeader = !isReport;

  return (
    <div className="min-h-screen bg-cream text-foreground font-sans">
      {showHeader && (
        <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-border/60">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-burgundy tracking-tight">
                Vivi Macau
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-burgundy transition-colors">
                首頁
              </Link>
              <Link to="/upload" className="text-muted-foreground hover:text-burgundy transition-colors">
                開始測試
              </Link>
              <UniversalLink
                to="#theory"
                className="text-muted-foreground hover:text-burgundy transition-colors"
              >
                理論依據
              </UniversalLink>
              {isAdmin && (
                <Link to="/admin" className="text-burgundy font-medium">
                  管理後台
                </Link>
              )}
            </nav>
          </div>
        </header>
      )}
      <main className={isReport ? '' : ''}>
        <Outlet />
      </main>
      {!isReport && (
        <footer className="border-t border-border/60 bg-cream-light mt-20">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-serif text-xl font-bold text-burgundy mb-3">Vivi Macau</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  2027 最新韓流色彩/妝容風格測試 · 線上版
                  <br />
                  致力於為澳門及港澳女性提供專業個人色彩與風格診斷
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-3 text-sm tracking-wide">關於我們</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>品牌故事</li>
                  <li>服務介紹</li>
                  <li>預約線下諮詢</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-3 text-sm tracking-wide">聯絡方式</h4>
                <ul className="text-sm text-muted-foreground space-y-3">
                  <li className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-burgundy shrink-0 mt-0.5" />
                    <UniversalLink
                      to="mailto:vivigroupmacau@gmail.com"
                      className="hover:text-burgundy transition-colors break-all"
                    >
                      vivigroupmacau@gmail.com
                    </UniversalLink>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-burgundy shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <UniversalLink
                        to="tel:+85363229396"
                        className="hover:text-burgundy transition-colors block"
                      >
                        澳門 +853 6322 9396
                      </UniversalLink>
                      <UniversalLink
                        to="tel:+8618163229396"
                        className="hover:text-burgundy transition-colors block"
                      >
                        內地 +86 181 6322 9396
                      </UniversalLink>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border/60 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
              <span>© 2027 Vivi Macau. All rights reserved.</span>
              <span>參考韓國 PCS 16型體系 · 歐美四季色彩理論 · 法式 Colorimétrie</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
