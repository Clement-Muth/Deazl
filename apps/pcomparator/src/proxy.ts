import { cookies } from "next/headers";
import { type NextRequest, NextResponse, userAgent } from "next/server";
import { AVAILABLE_LOCALES } from "~/core/locale";

const locales = ["en", "fr"];

export default async (request: NextRequest) => {
  const locale = (await cookies()).get("locale")?.value ?? AVAILABLE_LOCALES.fr;
  const { device } = userAgent(request);
  const viewport = device.type === "mobile" ? "mobile" : "desktop";

  const { pathname, origin } = request.nextUrl;

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}`) && pathname !== `/${locale}`
  );

  const headers = {
    "x-device": viewport
  };

  if (pathnameIsMissingLocale) {
    const newUrl = new URL(`/${locale}${pathname}`, origin);

    if (newUrl.pathname.endsWith("/") && newUrl.pathname !== "/")
      newUrl.pathname = newUrl.pathname.slice(0, -1);

    return NextResponse.redirect(newUrl, {
      headers: headers
    });
  }

  return NextResponse.next({
    headers: headers
  });
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest|static/*|robots|sw|workbox-*).*)"]
};
