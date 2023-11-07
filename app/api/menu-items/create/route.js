import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
    const { category, name, price, popular, image } = await request.json();

    try {
        const menuItem = await prisma.menuitem.create({
            data: {
                menuCategoryId: parseInt(category),
                name: name,
                price: String(price),
                popular: popular ? 1 : 0,
                image: image
            }
        })
        return NextResponse.json({ result: menuItem, success: true }, { status: 200 })
    } catch (err) {
        console.log("Error", err);
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