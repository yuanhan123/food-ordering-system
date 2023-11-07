import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request, _next){
    const { pathname } = request.nextUrl;

    const sellerProtectedPaths = ["/seller"];
    const matchesSellerProtectedPath = sellerProtectedPaths.some((path) =>
        pathname.startsWith(path) && pathname !== "/seller/login"
    )

    if (matchesSellerProtectedPath){
        const token = await getToken({req: request});
        if (!token) {
            const url = request.nextUrl.clone()
            url.pathname = '/seller/login'
            return NextResponse.redirect(url)          
        }

        if (token.role !== 'seller'){
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
          
        }
    }
}