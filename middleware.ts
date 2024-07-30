export { auth as middleware } from "@/lib/auth"


// export const config = {
//     matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// export default auth((req) => {
//     if (!req.auth && req.nextUrl.pathname === "/") {
//         const newUrl = new URL("/signin", req.nextUrl)
//         return Response.redirect(newUrl)
//     }
// });
