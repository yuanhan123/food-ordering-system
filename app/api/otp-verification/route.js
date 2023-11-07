import { redis } from '@/lib/redis';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { otp , email} = await request.json();
    const otpkey = `otp:${email}`
    const maxAttempts = 3; // Maximum number of OTP attempts allowed
    const attemptsKey = `attempts:${email}`;
    const attempts = await redis.get(attemptsKey) || 0;

    try {

        // Retrieve the stored hashed OTP from Redis
        if (attempts >= maxAttempts) {
            await redis.del(otpkey);
            await redis.del(attemptsKey);
        }
        else {
        const storedOTPHash = await redis.get(otpkey);
    
            if (!storedOTPHash) {
            return {
                status: 401,
                body: { success: false, message: 'Invalid email or OTP.' },
            };
            }
        
            // Hash the provided OTP for comparison
            const OTPHash = crypto.createHash('sha256').update(otp).digest('hex');
        
            if (storedOTPHash === OTPHash) {
                await redis.del(otpkey);
                await redis.del(attemptsKey);
                return new NextResponse(JSON.stringify({
                    success: true, message: 'OTP verified successfully.' ,
                }),{
                    status: 200
                });
            } else {
                await redis.incr(attemptsKey);
                return new NextResponse(JSON.stringify({
                    success: false, message: 'Invalid OTP.' ,
                }),{
                    status: 401
                });
            }
        }
      } catch (error) {
        await redis.incr(attemptsKey);
        console.error('Error verifying OTP:', error);
        return new NextResponse(JSON.stringify({
            success: false, message: 'Internal server error.' ,
        }),{
            status: 500
        });
      }
};
