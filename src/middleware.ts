import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // 環境変数からユーザー名とパスワードを取得（未設定の場合はデフォルト値）
    const validUser = process.env.AUTH_USER || 'admin';
    const validPass = process.env.AUTH_PASS || 'password';

    if (user === validUser && pwd === validPass) {
      return NextResponse.next();
    }
  }

  // 認証に失敗した場合、または認証ヘッダーがない場合はダイアログを表示
  return new NextResponse('Auth Required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Library"',
    },
  });
}

// すべてのパスに適用（ただし静的ファイルなどは除外することも可能）
export const config = {
  matcher: ['/((?!api/public|_next/static|_next/image|favicon.ico).*)'],
};
