import { NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

async function customerInfo(email) {
  try {
    const customerInfo = await prisma.customer.findUnique({
      where: {
        email: email,
      },
      select: {
        password: true,
      },
    });

    if (!customerInfo) {
      throw new Error('Customer not found');
    }

    return customerInfo;
  } catch (error) {
    console.log("Error retrieving customer info", err);
    throw new Error(error.message);
  }
}

async function updatePassword(email, newPassword) {
  try {
    const updatedUser = await prisma.customer.update({
      where: {
        email: email,
      },
      data: {
        password: newPassword,
      },
    });
    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating password: ${error.message}`);
  }
}

export async function POST(request) {
  const { token, password } = await request.json();
  const resetToken = `reset:${token}`
  const storedEmail = await redis.get(resetToken);
  const customerData = await customerInfo(storedEmail);
  const isPasswordMatch = await bcrypt.compare(password, customerData.password);
  if (isPasswordMatch) {
    // Passwords match, handle accordingly
    return new NextResponse(JSON.stringify({
      success: false,
      samePassword: true,
      message: "Password is the same as the previous password."
    }));
  }
  else {
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!token) {
      console.log("Token is not provided.");
      return new NextResponse(JSON.stringify({
        success: false,
        isValid: false,
        message: "Token not provided"
      }), {
        status: 400,
        headers: {
          Location: `/`,
        },
      });
    }
    if (storedEmail === null) {
      console.log("Token is not provided.");
      return new NextResponse(JSON.stringify({
        success: false,
        isValid: false,
        message: "Invalid or expired token"
      }), {
        status: 400,
        headers: {
          Location: `/`,
        },
      });
    }
    updatePassword(storedEmail, hashedPassword)
    await redis.del(resetToken);
    return new NextResponse(JSON.stringify({
      success: true
    }), {
      status: 200,
    });
  }
}
