
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(request) {

  try {
    const items = await prisma.menuitem.findMany();

    // Create an object to store items by category
    let itemsByCategory = {};
    let res = []; 

    items.forEach(item => {
      const categoryId = item.menuCategoryId;

      if (!itemsByCategory[categoryId]) {
        // if the category doesn't exist in the object, create an empty array
        itemsByCategory[categoryId] = [];
      }
      // convert price to float
      item.price = parseFloat(item.price);
      // push the item into the corresponding category array
      itemsByCategory[categoryId].push(item);
      res = Object.values(itemsByCategory);
    });

    return NextResponse.json({ items: res, success: true }, { status: 200 })

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