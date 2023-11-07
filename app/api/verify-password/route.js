import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

async function customerInfo(email) {
  try {
    const customerInfo = await prisma.customer.findUnique({
      where: {
        email: email,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        username: true,
      },
    });

    if (!customerInfo) {
      throw new Error('Customer not found');
    }

    return customerInfo;
  } catch (error) {
    console.log("Error retrieving customer information", err);
    throw new Error(error.message);
  }
}

export async function POST(request) {
  const { token } = await request.json();
  
  const resetToken = `reset:${token}`;
  const storedEmail = await redis.get(resetToken);
  // const hashedPassword = await bcrypt.hash(password, 10);

  if (!token) {
    // Handle missing token
    return new NextResponse(JSON.stringify({
      isValid: false,
      message: "Token not provided"
    }), {
      status: 400,
    });
  }

  if (storedEmail === null) {
    // Handle invalid or expired token
    return new NextResponse(JSON.stringify({
      isValid: false,
      message: "Invalid or expired token"
    }), {
      status: 400,
    });
  }

  try {
    const customerData = await customerInfo(storedEmail);
    if (customerData) {
      const { firstName, lastName, username, email } = customerData;
      
      return new NextResponse(JSON.stringify({
        message: "Password successfully reset.",
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email
      }), {
        status: 200,
      });

    } else {
      // Customer not found, handle accordingly
      return new NextResponse(JSON.stringify({
        message: "Customer not found"
      }), {
        status: 404,
      });
    }
  } catch (error) {
    // Handle other errors
    console.error("Error:", error);
    return new NextResponse(JSON.stringify({
      message: "Internal server error"
    }), {
      status: 500,
    });
  }
}