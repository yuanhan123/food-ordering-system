'use client'

import {
    Box,
    Container,
    Heading,
    Image,
    Button,
    Checkbox,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Stack,
    InputGroup,
    InputRightElement,
    IconButton,
    Link,
} from '@/providers';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import AlertItem from '@/components/AlertItem';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from '@/lib/axios';

export default function LoginForm({ isCustomer = false, children }) {
    const router = useRouter();
    const [recaptchaValue, setRecaptchaValue] = useState(null);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [errorMessage, setErrorMessage] = useState();
    const recaptchaRef = useRef(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // reset error message
        setErrorMessage('');

        if (failedAttempts >= 5 && !recaptchaValue) {
            return;
        }

        if (recaptchaValue) {
            // clear reCAPTCHA value
            setRecaptchaValue(null);
        }

        const loginData = await axios.post("/api/auth/login", {
            username: formData.username,
            password: formData.password,
            recaptchaValue: recaptchaValue,
            role: isCustomer ? 'customer' : 'seller'
        })
        
        // if fail
        if (!loginData.data.success) {
            let result = loginData.data;
            setErrorMessage(result.message);
            setFailedAttempts(result.loginAttempts);

            if (result.loginAttempts >= 5) {
                if (recaptchaRef.current) {
                    recaptchaRef.current.reset(); // Reset reCAPTCHA
                }
            }
        } else {
            try {
                const otpData = await axios.post('/api/otp', { username: formData.username, isCustomer: isCustomer });
                if (otpData.status === 200 && otpData.data.email) {
                    const sessionId = encodeURIComponent(otpData.data.session);
                    router.push(`/otp-verification?session=${sessionId}&role=${isCustomer ? 'customer' : 'seller'}`);
                    alert(otpData.data.message);
                } else {
                    router.push('/login');
                    alert('Failed to send OTP. Customer not found.');
                }
            } catch (error) {
                router.push('/login');
                alert('Failed to send OTP. An error occurred.');
            }
        }
    }

    const handleRecaptchaChange = (value) => {
        setRecaptchaValue(value);
    };

    const handleRecaptchaExpired = () => {
        // Called when reCAPTCHA challenge expires (after a successful completion)
        setRecaptchaValue(null);
    }

    return (
        <>
            {errorMessage ? (
                <div className="absolute top-0" maxw="md" data-testid="modalStatus">
                    <AlertItem
                        status='error'
                        message={errorMessage}
                        onClose={() => setErrorMessage()}
                    />
                </div>
            ) : null}
            <Container maxw="lg" px={{ base: '0', sm: '8' }} mb={{ base: '0', sm: '8' }}>
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
                        <Stack spacing={{ base: '2', md: '3', }} textAlign="center">
                            <Heading className="text-xl font-semibold" size={{ base: 'xs', md: 'sm', }}>
                                Welcome Back to Malaysia Chiak!
                            </Heading>
                        </Stack>
                    </Stack>
                    <Box py={{ base: '0', sm: '8', }} px={{ base: '4', sm: '10', }} bg={{ base: '#FFFFFF', sm: 'bg.surface', }}
                        boxShadow={{ base: 'none', sm: 'md', }} borderRadius={{ base: 'none', sm: 'xl', }}>
                        <form onSubmit={handleSubmit} data-testid='login-form'>
                            <Stack spacing="6">
                                <Stack spacing="5">
                                    <FormControl>
                                        <FormLabel htmlFor="username">Username</FormLabel>
                                        <Input
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                        />
                                        <FormLabel>Password</FormLabel>
                                        <InputGroup>
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={handleInputChange}
                                            />
                                            <InputRightElement h={'full'}>
                                                <IconButton
                                                    variant="text"
                                                    onClick={() => setShowPassword((showPassword) => !showPassword)}
                                                    icon={showPassword ? <HiEye /> : <HiEyeOff />}>
                                                </IconButton>
                                            </InputRightElement>
                                        </InputGroup>
                                    </FormControl>
                                </Stack>
                                <HStack justify="space-between">
                                    <Checkbox defaultChecked>Remember me</Checkbox>
                                    <Link href="/forget-password" size="sm" className='text-custom-green'>Forgot password?</Link>
                                </HStack>
                                <Stack spacing="6">
                                    <Button type='submit' isDisabled={!formData.username || !formData.password} className='text-white bg-custom-green hover:bg-custom-green' data-testid='signin'>Sign In</Button>
                                </Stack>
                            </Stack>
                        </form>
                        {failedAttempts >= 5 && (
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey="6LfF_bkoAAAAAIEMViwNDeWv2cR5xx_Pss5nKw9y"
                                onChange={handleRecaptchaChange}
                                onExpired={handleRecaptchaExpired}
                            />
                        )}
                    </Box>
                    {children}
                </Stack>
            </Container>
        </>
    );
}
