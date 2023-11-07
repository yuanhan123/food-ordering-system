import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    const { email, username, isCustomer } = await request.json();

    try {
        if (!email && !username) {
            return NextResponse.json(
                { message: "Either email or username must be provided", success: false },
                { status: 400 }
            );
        }

        let user;

        if (email) {
            user = await getUserByEmail(email, isCustomer);
        }
        if (username) {
            user = await getUserByUsername(username, isCustomer);
        }

        if (user) {
            return NextResponse.json({ user, success: true }, { status: 200 });
        } else {
            return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
        }
    } catch (err) {
        console.error("Error", err);
        return NextResponse.json(
            { message: err.message, success: false },
            { status: 400 }
        );
    }
}

export async function getUserByUsername(username, isCustomer) {
    let db;

    // set corresponding db
    if (isCustomer) db = prisma.customer
    else db = prisma.seller;

    const user = await db.findUnique({
        where: {
            username: username
        }
    })
    return user
}

export async function getUserByEmail(email, isCustomer) {
    let db;

    // set corresponding db
    if (isCustomer) db = prisma.customer
    else db = prisma.seller;

    const user = await db.findUnique({
        where: {
            email: email
        }
    })
    return user
}