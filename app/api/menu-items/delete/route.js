import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
    const { menuItemId } = await request.json();

    try {
        const menuItem = await prisma.menuitem.delete({
            where: { menuItemId: menuItemId }
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