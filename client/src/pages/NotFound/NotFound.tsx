import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

import { Button } from '@/components/ui/button';

function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-serif text-6xl text-burgundy mb-2">404</p>
        <p className="font-serif text-xl text-burgundy tracking-wide mb-2">Vivi Macau</p>
        <h1 className="font-serif text-2xl text-foreground mb-3">找不到此頁面</h1>
        <p className="text-muted-foreground mb-8">
          你造訪的頁面不存在或已被移除，請返回首頁繼續探索。
        </p>
        <Button asChild className="bg-burgundy text-primary-foreground">
          <Link to="/">
            <Home className="size-4" />
            返回首頁
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
