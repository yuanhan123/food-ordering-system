// to get all the orders
import { verifyJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request){
    
    const accesstoken = request.headers.get("Authorization")

    try{
        const decodedToken = verifyJwt(accesstoken);

        if(!accesstoken || !decodedToken){
            console.log("verify unsuccess")
            return new NextResponse(JSON.stringify({
                error: "unauthorized",
            }),
                {
                    status: 401,
                }
            )
        }

        if (decodedToken.role === "seller"){
            const orders = await prisma.orders.findMany({
                select: {
                    ordersId: true,
                    customerId: true,
                    timestamp: true,
                    status: true,
                }
            })

            const maskedOrders = orders.map(order => ({
                ...order,
                ordersId: btoa(order.ordersId)
            }))

            const sortedOrders = maskedOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return new NextResponse(JSON.stringify({
                data: sortedOrders
            }),
                {
                    status: 200,
                }
            )
        }

        return new NextResponse(JSON.stringify({
            error: "error request",
        }),
            {
                status: 400,
            }
        )

    }catch (error){

        return new NextResponse(JSON.stringify({
            error: "unauthorized",
        }),
            {
                status: 401,
            }
        )

    }
}