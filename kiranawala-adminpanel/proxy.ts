import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if authenticated user has completed registration (has store_admin record)
  let hasCompletedRegistration = false
  if (user) {
    const { data: adminData } = await supabase
      .from("store_admins")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
    
    hasCompletedRegistration = !!adminData
  }

  // Redirect unauthenticated users trying to access protected routes to login
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect authenticated users without registration to complete registration
  if (user && !hasCompletedRegistration && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/register", request.url))
  }

  // Redirect authenticated users with registration away from login to dashboard
  if (user && hasCompletedRegistration && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect authenticated users with registration away from register to dashboard
  if (user && hasCompletedRegistration && request.nextUrl.pathname === "/register") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect root to appropriate page based on auth status
  if (request.nextUrl.pathname === "/") {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    } else if (hasCompletedRegistration) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/register", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
