import { verifyJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

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
        
        if (decodedToken.customerId){
            const orders = await prisma.orders.findMany({
                where: { customerId : decodedToken.customerId},
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

            return new NextResponse(JSON.stringify({
                data: maskedOrders
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

    } catch (error){

        return new NextResponse(JSON.stringify({
            error: "unauthorized",
        }),
            {
                status: 401,
            }
        )

    }

}