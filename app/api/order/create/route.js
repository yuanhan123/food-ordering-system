import { getCurrentTimestamp } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
    const { customerId, address, items } = await request.json();

    try {
        // get current timestamp
        const formattedTimestamp = getCurrentTimestamp();
        // create an order based on customerId
        const order = await prisma.orders.create({
            data: {
                customerId: customerId,
                timestamp: formattedTimestamp,
                status: 'pending',
                deliveryAddress: address
            }
        })
        console.log("ordersId", order.ordersId);

        // loop through the array and set the common ordersId
        const itemsWithOrdersId = items.map((item) => {
            const { menuItemId, quantity, totalPrice } = item;
            return {
                menuItemId, 
                quantity, 
                totalPrice,
                ordersId: order.ordersId,
            };
        });

        // create multiple order items based one order
        const allItems = await prisma.orderitems.createMany({
            data: itemsWithOrdersId,
        })
        console.log('added order items', allItems);

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err) {
        console.log("Error creating orders", err);
        return NextResponse.json(
            {
                message: err.message,
                success: false
            },
            {
                status: 400
            }
        );
    }
}