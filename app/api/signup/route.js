import { getCurrentTimestamp } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import * as bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from "next/server";

async function verifyRecaptcha(clientResponse) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
            body: new URLSearchParams({
                secret: secretKey,
                response: clientResponse,
            }),
        });

        if (response.status === 200) {
            const data = await response.json();
            if (data.success) {
                console.log('reCAPTCHA verification success');
                return true;
            } else {
                console.log('reCAPTCHA verification failed');
                return false;
            }
        } else {
            console.log('Failed to verify reCAPTCHA');
            return false;
        }
    } catch (error) {
        console.error('Error while verifying reCAPTCHA:', error);
        return false;
    }
}

// create new user with hashed password
export async function POST(request){
    const body = await request.json();
    
    try{
        const recaptchaValue = body.recaptchaValue;
        let isRecaptchaValid = false;
        if(recaptchaValue == 'null' || recaptchaValue == '' || recaptchaValue == null){
            isRecaptchaValid = true
        }else{
            isRecaptchaValid = await verifyRecaptcha(recaptchaValue);
        }
        const hashedPassword = await bcrypt.hash(body.password, 10);
        if (!isRecaptchaValid) {
            return new NextResponse(JSON.stringify({ message: 'reCAPTCHA verification failed' }), { status: 400 });
        }
        const formattedTimestamp = getCurrentTimestamp(); 

        const user = await prisma.customer.create({
            data:{
                firstName: body.firstName,
                lastName: body.lastName,
                username: body.username,
                password:  hashedPassword,
                email: body.email,
                phoneNo: body.phoneNo,
                lastLogin: formattedTimestamp,
                loginAttempts: 0
            }
        })

        const {password, ...result} = user
        return new NextResponse(JSON.stringify(result));
    } catch (error){
        console.error('Error creating user', error);
        return new NextResponse({status: 500});
    }
}
