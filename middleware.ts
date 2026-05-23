export { authMiddleware as middleware } from "@/middleware/authMiddleware";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
