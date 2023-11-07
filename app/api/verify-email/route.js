import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { session } = await request.json();
    try{
        const sessionKey = `session:${session}`
        const email = await redis.get(sessionKey);
        
        if(email !== null){
            return new NextResponse(JSON.stringify({
                message: 'OTP sent successfully!',
                email: email,
            }), {
                status: 200,
            });
        } else {
            await redis.del(sessionKey);
            return new NextResponse(JSON.stringify({
                message: 'Customer not found.',
                email: null,
            }), {
                status: 400,
            });
        }} catch (error) {
            await redis.del(sessionKey);
            return new NextResponse(JSON.stringify({
                message: 'Internal Server Error',
                email: null,
            }), {
                status: 500,
            }
        );
    }
};
