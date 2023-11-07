
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(request) {

  try {
    const categories = await prisma.menucategory.findMany();

    return NextResponse.json({ categories, success: true }, { status: 200 })

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