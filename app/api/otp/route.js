import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import randomstring from 'randomstring';
import crypto from 'crypto';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

async function sendEmail(email) {
    const otp = randomstring.generate({ length: 6, charset: 'numeric' });
    const OTPHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpkey = `otp:${email}`;
    const attemptsKey = `attempts:${email}`;

    await redis.set(attemptsKey, 0, 'ex', 240);
    await redis.set(otpkey, OTPHash, 'ex', 240);

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: email,
        subject: 'OTP Verification',
        text: `Dear User,\n\nYour OTP for verification is: ${otp}\n\nPlease use this OTP to complete the verification process on our platform. Note that this OTP is valid for a limited time and should not be shared with anyone.\n\nIf you didn't request this OTP, please ignore this message.\n\nBest regards,\nMalaysia Chiak Support Team`,
        html: `
            <p>Dear User,</p>
            <p>Your OTP for verification is: <strong>${otp}</strong></p>
            <p>Please use this OTP to complete the verification process on our platform. Note that this OTP is valid for a 4 minutes and should not be shared with anyone.</p>
            <p>If you didn't request this OTP, please ignore this message.</p>
            <p>Best regards,<br/>Malaysia Chiak Support Team</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

async function checkCustomer(username) {
    try {
        const customerInfo = await prisma.customer.findUnique({
        where: {
            username: username,
        },
        select: {
            username: true,
            email: true,
        },
        });

        return customerInfo;
    } catch (error) {
        console.error('Error checking customer:', error);
        throw new Error('Error checking customer.');
    }
}

async function checkSeller(username) {
    try {
        const sellerInfo = await prisma.seller.findUnique({
        where: {
            username: username,
        },
        select: {
            username: true,
            email: true,
        },
        });

        return sellerInfo;
    } catch (error) {
        console.error('Error checking seller:', error);
        throw new Error('Error checking seller.');
    }
}

export async function POST(request) {
    const requestData = await request.json();
    const { username, email, isCustomer } = requestData;
    if (username) {
        try{
            let userInfo;
            if (isCustomer) {
                userInfo = await checkCustomer(username);
            }
            else userInfo = await checkSeller(username);
            // const customerInfo = await checkCustomer(username);
            if (userInfo){
                const email = userInfo.email;
                const sessionId = randomBytes(64).toString('hex');
                const sessionKey = `session:${sessionId}`;
                await redis.set(sessionKey, email, 'ex', 240);
                const emailSent = await sendEmail(email)
                if (emailSent){
                    return new NextResponse(JSON.stringify({
                        message: 'OTP verification email sent successfully!',
                        email: email,
                        session: sessionId,
                    }), {
                        status: 200,
                    });
                } else {
                return new NextResponse(JSON.stringify({
                    message: 'Customer not found.',
                    email: null,
                }), {
                    status: 400,
                });
            }}} catch (error) {
                console.log(error);
                return new NextResponse(JSON.stringify({
                    message: 'Internal Server Error',
                    email: null,
                }), {
                    status: 500,
                }
            );
        }
    }
    else if (email){
        try{
            const emailSent = await sendEmail(email)
            if(emailSent){
                return new NextResponse(JSON.stringify({
                    message: 'OTP verification email sent successfully!',
                    email: email,
                }), {
                    status: 200,
                });
            } else {
                return new NextResponse(JSON.stringify({
                    message: 'Customer not found.',
                    email: null,
                }), {
                    status: 400,
                });
            }} catch (error) {
                console.log(error);
                return new NextResponse(JSON.stringify({
                    message: 'Internal Server Error',
                    email: null,
                }), {
                    status: 500,
                }
            );
        }
    }
}