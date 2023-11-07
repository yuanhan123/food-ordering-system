import { NextResponse } from "next/server";
import { getUserByEmail } from "@/api/user/route";
import { signJwtAcessToken, signJwtRefreshToken } from "@/lib/jwt";
import { redis } from "@/lib/redis";

export async function POST(request) {
    const { email, isCustomer, session } = await request.json();

    try {
        const user = await getUserByEmail(email, isCustomer);

        if (user) {
            const { customerId, sellerId, username, firstName, lastName } = user;
            const fullname = firstName.concat(" ", lastName);
            let tokenData;
            if (isCustomer) {
                tokenData = {
                    customerId: customerId,
                    username: username,
                    fullname: fullname,
                    role: 'customer'
                }
            }
            else {
                tokenData = {
                    sellerId: sellerId,
                    username: username,
                    fullname: fullname,
                    role: 'seller'
                }
            }

            const accessToken = signJwtAcessToken(tokenData);
            const refreshToken = signJwtRefreshToken(tokenData);
            const userData = {
                ...tokenData,
                accessToken,
                refreshToken,
                redirect: false
            }
            // delete redis session
            const sessionKey = `session:${session}`
            await redis.del(sessionKey);

            return NextResponse.json({ userData, success: true }, { status: 200 });
        } else {
            return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
        }
    }
    catch (err) {
        console.error("Error", err);
        return NextResponse.json(
            { message: err.message, success: false },
            { status: 400 }
        );
    }
}
