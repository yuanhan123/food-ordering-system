import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcrypt';
import { getCurrentTimestamp } from "@/lib/helpers";
import nodemailer from 'nodemailer';
import { BASE_URL } from "@/lib/axios";
import { getUserByUsername } from "@/api/user/route";

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

export async function POST(request) {
    const body = await request.json();
    if (body.role != null || body.role != '') {
        const recaptchaValue = body.recaptchaValue;
        let isRecaptchaValid = false;

        if (recaptchaValue == 'null' || recaptchaValue == '' || recaptchaValue == null) {
            isRecaptchaValid = true
        } else {
            isRecaptchaValid = await verifyRecaptcha(recaptchaValue);
        }

        if (isRecaptchaValid) {
            let isCustomer = body.role == 'customer';
            const user = await getUserByUsername(body.username, isCustomer);

            // user is valid
            if (user) {
                let accDeactivateMsg = "This account has been deactivated, please contact our support team at support@example.com";

                // check if user account is active
                if (user.active) {
                    let db, updatedUser;
                    console.log("user is active!");
                    // set corresponding db
                    if (isCustomer) db = prisma.customer
                    else db = prisma.seller;

                    const correctPassword = await bcrypt.compare(String(body.password), user.password);
                    // password is correct
                    if (correctPassword) {
                        // update user with latest login and reset login attempts
                        updatedUser = await db.update({
                            where: {
                                username: body.username
                            },
                            data: {
                                loginAttempts: 0,
                                lastLogin: getCurrentTimestamp()
                            }
                        })

                        if (updatedUser) console.log("loginAttemps for", updatedUser.username, "is reset");

                        return new NextResponse(JSON.stringify({ success: true }));
                    }
                    else {
                        let newFailedAttempt = user.loginAttempts + 1;
                        // update user with login attempts
                        updatedUser = await db.update({
                            where: {
                                username: body.username
                            },
                            data: {
                                loginAttempts: newFailedAttempt, // increment login attempts
                                lastLogin: getCurrentTimestamp(),
                                active: newFailedAttempt >= 10 ? 0 : 1 // deactivate user's account
                            }
                        })

                        let message = "Password is incorrect!";
                        if (updatedUser) console.log("user login attempts incremented to", updatedUser.loginAttempts);
                        if (!updatedUser?.active) {
                            message = "Login Attempts Limit Reached! " + accDeactivateMsg;
                            // send email to user to reset pw
                            await sendResetEmail(updatedUser.email, updatedUser.username);
                        }

                        return new NextResponse(JSON.stringify({ success: false, message: message, loginAttempts: updatedUser.loginAttempts }));
                    }
                }
                else {
                    console.log('user not active');
                    return new NextResponse(JSON.stringify({ success: false, message: accDeactivateMsg }));
                }
            }
            else {
                return new NextResponse(JSON.stringify({ success: false, message: "Invalid User" }));
            }
        }
    }

    return new NextResponse.json(JSON.stringify({ success: false, message: "Something went wrong..." }));
}

async function sendResetEmail(email, username) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: email,
        subject: 'Account Lockout Notification',
        html: `
            <p>Dear ${username},</p>
            <p>We noticed multiple unsuccessful login attempts on your account. As a security measure, your account has been temporarily locked.</p>
            <p><strong>Account Lockout Details:</strong></p>
            <ul>
                <li>Username: ${username}</li>
                <li>Email: ${email}</li>
            </ul>
            <p>To reset your password and regain access to your account, please click the link below:</p>
            <p><a href="${BASE_URL}forget-password">Reset Password</a></p>
            <p>If you believe this lockout is in error or if you need further assistance, please contact our support team at <a href="mailto:support@example.com">support@example.com</a>.</p>
            <p>Thank you for your understanding.</p>
            <p>Best regards,<br/>Malaysia Chiak Support Team</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending lockout email:', error);
        return false;
    }
}