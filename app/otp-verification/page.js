'use client';
import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import LoginLayout from '@/components/LoginLayout';
import {
    Container,
    Box,
    FormControl,
    FormLabel,
    HStack,
    Stack,
    Button,
    Heading,
    Image,
    PinInput,
    Link,
    Text,
    PinInputField,
    Spinner
} from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation';
import AlertItem from '@/components/AlertItem';
import { signIn } from 'next-auth/react';

const maskEmail = (email) => {
    const [username, domain] = email.split('@');
    let maskedUsername
    if (username.length % 2 == 0) {
        maskedUsername =
            username.charAt(0) +
            '*'.repeat(username.length / 2 - 2) + username.charAt(username.length / 2 - 1) + username.charAt(username.length / 2) +
            '*'.repeat(username.length / 2 - 2) +
            username.slice(-1);
    }
    else {
        maskedUsername =
            username.charAt(0) +
            '*'.repeat(username.length / 2 - 2) + username.charAt(username.length / 2 - 1) + username.charAt(username.length / 2) +
            '*'.repeat(username.length / 2 - 1) +
            username.slice(-1);
    }
    const [domainName, ...domainParts] = domain.split('.');
    const maskedDomainName =
        domainName.charAt(0) +
        '*'.repeat(domainName.length - 1);
    const maskedDomainExtension =
        domainParts.map(part => '*'.repeat(part.length - 1) + part.charAt(part.length - 1)).join('.');
    return maskedUsername + '@' + maskedDomainName + '.' + maskedDomainExtension;
};

export default function VerificationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [isOpen, setIsOpen] = useState(false);
    const [attempts, setAttempts] = useState(3);
    const [loading, setLoading] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);

    const session = searchParams.get('session');
    const role = searchParams.get('role');

    useEffect(() => {
        if (session && role) {
            // if valid role
            if (role == 'customer' || role == 'seller') {
                const verifyEmail = async () => {
                    try {
                        // Send email verification request to the server
                        const res = await axios.post('/api/verify-email', { session });
                        if (res.status === 200 && res.data.email) {
                            setEmail(res.data.email)
                            const masked = maskEmail(res.data.email);
                            setMaskedEmail(masked);
                        } else {
                            router.push('/login')
                        }
                    } catch (error) {
                        router.push('/login')
                    } finally {
                        // Set loading state to false when the verification process is complete
                        setLoading(false);
                    }
                };

                // Set loading state to true when the verification process starts
                setLoading(true);
                verifyEmail();
            }
            else router.push('/login');
        }
        else router.push('/login');
    }, []);

    const handleVerification = async (e) => {
        e.preventDefault();
        // close alert
        setIsOpen(false);
        const otp = otpDigits.join('');
        try {
            const response = await axios.post('/api/otp-verification', { email, otp });
            if (response.data.success) {
                alert(response.data.message); // Show a success message
                let isCustomer = role == 'customer';
                // complete login after 2FA
                const { data } = await axios.post('/api/complete-login', { email, isCustomer, session });
                if (data.success) {
                    // set session with auth signIn
                    const result = await signIn(isCustomer ? "customer-credentials" : "seller-credentials", data.userData)
                    if (result.error) {
                        console.error("Error login", result.error);
                    } else {
                        isCustomer ? router.push('/') : router.push('/seller');
                    }
                }
                else {
                    console.error("error", data.message)
                }
            } else {
                setAttempts(attempts - 1);
                setIsOpen(true);
            }
        } catch (error) {
            setAttempts(attempts - 1);
            setIsOpen(true);
            console.error("Error verifying OTP", error);
        }
    };
    const handleOTPRequest = async () => {
        // close alert
        setIsOpen(false);

        if (failedAttempts >= 3) {
            alert("Request limit for resend OTP reached! You will be redirected to login");
            router.push('/login');
        } else {
            try {
                setFailedAttempts(failedAttempts + 1)
                const res = await axios.post('/api/otp', { email, isCustomer: role == 'customer' });
                // email is sent successfully
                if (res.data.email) {
                    // clear input
                    setOtpDigits(['', '', '', '', '', '']);
                    alert(res.data.message);
                }
                else alert(res.data.message);
            } catch (error) {
                console.error("Error", error)
            }
        }
    };
    const handleDigitChange = (index, value) => {
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = value;
        setOtpDigits(newOtpDigits);
    };
    const closeAlert = () => {
        setIsOpen(false);
    }

    return (
        <LoginLayout>
            {isOpen ? (
                <div className="absolute top-0" maxw="md">
                    <AlertItem
                        status='error'
                        message={attempts <= 0 ? 'Verification failed. Please request another OTP.' : `Verification failed. You have ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'} remaining. Please try again.`}
                        onClose={closeAlert}
                    />
                </div>
            ) : null}
            <Container maxw="lg" px={{ base: '0', sm: '8' }}>
                <Stack spacing="5">
                    <Stack spacing="6">
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                src="/logo.jpg"
                                alt="Logo"
                                width={100}
                                height={100}
                                objectFit='cover'
                            />
                        </div>
                        <Stack spacing={{ base: '2', md: '3' }} textAlign="center" marginBottom="6">
                            <Heading className="text-xl font-semibold" size={{ base: 'xs', md: 'sm', }}>
                                Verification Required!
                            </Heading>
                        </Stack>
                    </Stack>

                    <Box py={{ base: '0', sm: '8', }} px={{ base: '4', sm: '10', }} bg={{ base: '#FFFFFF', sm: 'bg.surface', }} pt={2}
                        boxShadow={{ base: 'none', sm: 'md', }} borderRadius={{ base: 'none', sm: 'xl', }}>
                        <form onSubmit={handleVerification}>
                            <Stack>
                                <HStack justifyContent='center'>
                                    <Box>
                                        <FormControl isRequired >
                                            <FormLabel marginBottom="4" textAlign="center">
                                                Enter the OTP that we have emailed to {maskedEmail}
                                            </FormLabel>
                                            <HStack justifyContent="center" alignItems="center" >

                                                <PinInput size="lg" otp placeholder=' ' >
                                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                                        <PinInputField fontWeight={'bold'}
                                                            key={index}
                                                            value={otpDigits[index]}
                                                            onChange={(e) => handleDigitChange(index, e.target.value)}
                                                        />
                                                    ))}
                                                </PinInput>
                                            </HStack>
                                        </FormControl>
                                    </Box>
                                </HStack>
                            </Stack>
                            <Stack spacing={10} pt={5} px={{ base: '4', sm: '16', }}>
                                <Button
                                    type='submit'
                                    style={{ backgroundColor: '#004225', color: '#FFFFFF' }}
                                    rightIcon={loading && <Spinner />}
                                    isDisabled={loading}
                                >
                                    {!loading && 'Verify'}
                                </Button>
                            </Stack>
                        </form>
                    </Box>
                    <Stack spacing="6" textAlign="center">
                        <Text color="fg.muted">
                            <Link onClick={handleOTPRequest} className='text-custom-green'>Resend OTP</Link>
                        </Text>
                    </Stack>
                </Stack>
            </Container>
        </LoginLayout>
    );
};
