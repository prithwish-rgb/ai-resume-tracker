// middleware.ts
export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // protect these routes
}
// This middleware will ensure that only authenticated users can access the dashboard and profile routes.