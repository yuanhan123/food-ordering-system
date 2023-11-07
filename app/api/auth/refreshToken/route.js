import { NextResponse } from "next/server";
import { signJwtAcessToken, verifyJwtRefreshToken } from "@/lib/jwt";

export async function POST(request) {
    // console.log ("inside API route ")
    const body = await request.json();
    const storedRefreshToken = body.refresh;
  
    if (!storedRefreshToken) {
      // console.log("No stored refresh token provided");
      return new NextResponse(
        JSON.stringify({
          error: "unauthorized",
        }),
        {
          status: 401,
        }
      );
    }
  
    try {
      const isRefreshTokenValid = verifyJwtRefreshToken(storedRefreshToken);
  
      if (!isRefreshTokenValid) {
        // console.log("Refresh token verification failed");
        return new NextResponse(
          JSON.stringify({
            error: "unauthorized",
          }),
          {
            status: 401,
          }
        );
      }
  
      // console.log("Refresh token verified successfully");
  
      const decodedRefreshToken = verifyJwtRefreshToken(storedRefreshToken);
      const { refreshToken, accessToken, iat, exp, ...userData } = decodedRefreshToken;
  
      const newAccessToken = signJwtAcessToken(userData);
      
      return new NextResponse(
        JSON.stringify({
          accessToken: newAccessToken,
        }),
        {
          status: 200,
        }
      );

    } catch (error) {
      console.error("Error while processing refresh token:", error);
      return new NextResponse(
        JSON.stringify({
          error: "internal_server_error",
        }),
        {
          status: 500,
        }
      );
    }
  }