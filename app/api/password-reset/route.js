import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { BASE_URL } from '@/lib/axios';
import { redis } from '@/lib/redis';

async function checkEmailExistence(email) {
    try {
      const user = await prisma.customer.findUnique({
        where: {
          email: email,
        },
        select: {
            username: true,
        },
      });
  
      // If user is found, return true (email exists), else return false
      return !!user;
    } catch (error) {
      // Handle errors, e.g., database connection issues
      throw new Error("Error checking email existence: " + error.message);
    }
  }

export async function POST(request) {
    try {
        const { email } = await request.json();
        console.log(email)
        console.log(checkEmailExistence(email))
        if(await checkEmailExistence(email) === true){
            const resetToken = randomBytes(64).toString('hex');
            const tokenKey = `reset:${resetToken}`; 
            await redis.set(tokenKey, email, 'EX', 15);
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_EMAIL, 
                    pass: process.env.GMAIL_PASSWORD 
                }
            });
            const mailOptions = {
                from: process.env.GMAIL_EMAIL,// insert email here
                to: email,
                subject: 'Reset Password',
                text: 'Click the link to reset password',
                html: `
                <p>Dear User,</p>
                <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
                <p>Click the link below to reset your password:</p>
                <p><a href="${BASE_URL}reset-password?token=${resetToken}">Reset Password</a></p>
                <p>If you have any trouble with the link above, you can copy and paste the following URL into your browser:</p>
                <p><code>${BASE_URL}reset-password?token=${resetToken}</code></p>
                <p>This link will expire in 15 minutes for security reasons.</p>
                <p>If you need further assistance, please contact our support team at <a href="mailto:support@example.com">support@example.com</a>.</p>
                <p>Best regards,<br/>Malaysia Chiak Support Team</p>
            `,
            };
            await transporter.sendMail(mailOptions);
            return new NextResponse(JSON.stringify({
                message: 'Email sent successfully',
            }), {
                status: 200,
            });
        } else {
            return new NextResponse(JSON.stringify({
                message: 'User does not exists',
            }), {
                status: 404,
            });
        }
        
    } catch (error) {
        return new NextResponse(JSON.stringify({
            message: 'Failed to send email.',
        }), {
            status: 500, // Internal Server Error
        });
    }
}
