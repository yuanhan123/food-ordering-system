import { verifyJwt } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }){
    const accesstoken = request.headers.get("Authorization")
    const orderId = params.orderId

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
        
        const orginalId = atob(orderId)

        const orders = await prisma.orderitems.findMany({
            where: { ordersId: orginalId },
            select: {
                orders: true,
                menuitem: true,
                quantity: true,
                totalPrice: true,
            }
        });

        const maskedOrders = orders.map(item => ({
            ...item,
            orders: {
              ...item.orders,
              ordersId: btoa(item.orders.ordersId)
            }
          }));

        return new NextResponse(JSON.stringify({
            data: maskedOrders
        }),
            {
                status: 200,
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

export async function PATCH(request, { params }){
    const accesstoken = request.headers.get("Authorization")
    const bodyStatus = await request.json();
    const orderId = params.orderId

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
        console.log("updating")
        if (decodedToken.role === "seller"){
            console.log("seller updating")
            if (["pending", "confirmed", "delivered"].includes(bodyStatus)) {
                const orginalId = atob(orderId)

                const updatedOrder = await prisma.orders.update({
                    where: { ordersId : orginalId },
                    data: {
                        status: bodyStatus
                    },
                });

                console.log(updatedOrder)
                return new NextResponse(
                    {
                        status: 200,
                    }
                )
            } else {
                console.error("Invlid status value");
            }
        }

        return new NextResponse(JSON.stringify({
            message: "Bad Request"
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