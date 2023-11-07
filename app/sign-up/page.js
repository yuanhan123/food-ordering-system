'use client'

import {
    Container,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    HStack,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    IconButton,
    Link,
    Progress,
    List,
    ListItem,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import LoginLayout from '@/components/LoginLayout'
import ReCAPTCHA from 'react-google-recaptcha';
import axios from '@/lib/axios'
import AlertItem from '@/components/AlertItem'
import { zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import { matcherPwnedFactory } from '@zxcvbn-ts/matcher-pwned'

export default function Signup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phoneNo: '',
        password: '',
        cfmPassword: '',
        recaptchaValue: '',
    })
    const { password, cfmPassword } = formData;
    const [showPassword, setShowPassword] = useState(false);
    const [showCfmPassword, setCfmShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordSuggestions, setPasswordSuggestions] = useState([]);
    const [passwordReasons, setPasswordReasons] = useState();
    const [errorMessage, setErrorMessage] = useState('')

    const matcherPwned = matcherPwnedFactory(fetch, zxcvbnOptions)
    const pattern = /^[stfgSTFG]\d{7}[A-Za-z]$/; // Regex pattern for S or T followed by 7 digits and any letter
    const options = {
        translations: zxcvbnEnPackage.translations,
        graphs: zxcvbnCommonPackage.adjacencyGraphs,
        dictionary: {
            ...zxcvbnCommonPackage.dictionary,
            ...zxcvbnEnPackage.dictionary,
        },
    }
    const handleChange = (e) => {
        const { name, value } = e.target;
        const emailUsername = formData.email.split('@')[0]; // Extracting username part from the email
        const containsInvalidSubstring =
            (formData.username && value.toLowerCase().includes(formData.username.toLowerCase())) ||
            (formData.firstName && value.toLowerCase().includes(formData.firstName.toLowerCase())) ||
            (formData.lastName && value.toLowerCase().includes(formData.lastName.toLowerCase())) ||
            (formData.email && value.toLowerCase().includes(emailUsername.toLowerCase()));
        if (name === 'password') {
            if (value.length < 8) {
                setPasswordStrength(0);
                setPasswordSuggestions(['Password is too short.']);
                setPasswordReasons('Password must have at least 8 characters.');
            }
            else if (pattern.test(value)) {
                setPasswordStrength(0)
                setPasswordSuggestions(['Use a different password.'])
                setPasswordReasons('Password should not be NRIC number.')
            } else if (containsInvalidSubstring) {
                setPasswordStrength(0)
                setPasswordSuggestions(['Avoid using your username, first name, last name, phone number or email username in the password.'])
                setPasswordReasons('Password contains invalid substrings.')
            } else {
                zxcvbnAsync(value, [
                    formData.firstName,
                    formData.lastName,
                    formData.username,
                    formData.phoneNo,
                    emailUsername]).then((result) => {
                        setPasswordStrength(result.score);
                        setPasswordSuggestions(result.feedback.suggestions);
                        setPasswordReasons(result.feedback.warning)
                    })
            }
        }
        setFormData({ ...formData, [name]: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // clear error message
        setErrorMessage('');

        try {
            if (password === cfmPassword && passwordStrength >= 3) {
                if (!formData.recaptchaValue) {
                    setErrorMessage('Try again!');
                    return;
                }
                const response = await axios.post('/api/signup', formData);
                if (response.data) {
                    router.push('/login');
                } else {
                    setErrorMessage('Error signing up! Please try again!');
                }
            }
            else if (passwordStrength < 3) {
                setErrorMessage('Password is too weak! Please try again!');
            } else {
                setErrorMessage('Please make sure both passwords match and choose a new password.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleRecaptchaChange = (value) => {
        setFormData({ ...formData, recaptchaValue: value }); // Update formData with reCAPTCHA response
    };

    const handleRecaptchaExpired = () => {
        // Called when reCAPTCHA challenge expires (after a successful completion)
        setRecaptchaValue(null);
    };

    useEffect(() => {
        zxcvbnOptions.addMatcher('pwned', matcherPwned)
        zxcvbnOptions.setOptions(options)
    }, [])

    return (
        <LoginLayout >
            <div className="absolute top-0" maxw="md">
                {errorMessage &&
                    <AlertItem
                        status='error'
                        message={errorMessage}
                        onClose={() => setErrorMessage()}
                    />
                }
            </div>
            <Container className="mt-[-110px]" maxw="xl" py={{ base: '12' }} px={{ base: '0', sm: '3' }}>
                <Stack spacing="4">
                    <Stack spacing="4">
                        <Stack spacing={{ base: '2', md: '3', }} textAlign="center">
                            <Heading className="text-xl font-semibold" size={{ base: 'xs', md: 'sm', }}>
                                Sign Up
                            </Heading>
                        </Stack>
                    </Stack>
                    <Box py={{ base: '0', sm: '8', }} px={{ base: '4', sm: '10', }} bg={{ base: '#FFFFFF', sm: 'bg.surface', }}
                        boxShadow={{ base: 'none', sm: 'md', }} borderRadius={{ base: 'none', sm: 'xl', }}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing="4">
                                <HStack>
                                    <Box>
                                        <FormControl isRequired>
                                            <FormLabel>First Name</FormLabel>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                type="text"
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box>
                                        <FormControl >
                                            <FormLabel>Last Name</FormLabel>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                type="text"
                                            />
                                        </FormControl>
                                    </Box>
                                </HStack>
                                <FormControl isRequired>
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        type="text"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Email address</FormLabel>
                                    <Input
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Phone Number</FormLabel>
                                    <Input
                                        id="phoneNo"
                                        name="phoneNo"
                                        value={formData.phoneNo}
                                        onChange={handleChange}
                                        type="tel"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Password</FormLabel>
                                    <InputGroup>
                                        <Input marginBottom="2"
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={password}
                                            onChange={handleChange}
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
                                <FormControl isRequired>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <InputGroup>
                                        <Input
                                            type={showCfmPassword ? 'text' : 'password'}
                                            id="cfmPassword"
                                            name="cfmPassword"
                                            value={cfmPassword}
                                            onChange={handleChange}
                                        />
                                        <InputRightElement h={'full'}>
                                            <IconButton
                                                variant="text"
                                                onClick={() => setCfmShowPassword((showCfmPassword) => !showCfmPassword)}
                                                icon={showCfmPassword ? <HiEye /> : <HiEyeOff />}>
                                            </IconButton>
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>
                                <Stack spacing={2} pt={2}>
                                    <Progress size="sm" value={passwordStrength * 25} colorScheme={
                                        passwordStrength >= 4 ? 'green' :
                                            passwordStrength >= 3 ? 'yellow' : 'red'
                                    } />
                                    {password && (
                                        <Box p={2} borderRadius="md" borderWidth={1} borderColor="gray.300" bg="white">
                                            <Text fontSize="sm" fontWeight="bold" color={
                                                passwordStrength >= 4 ? 'green.500' :
                                                    passwordStrength >= 3 ? 'yellow.500' : 'red.500'
                                            }>
                                                {passwordStrength >= 4 ? 'Very Strong Password' :
                                                    passwordStrength >= 3 ? 'Strong Password' : 'Weak Password, please choose a stronger password.'}
                                            </Text>
                                            {passwordStrength < 4 && (
                                                <Box mt={2}>
                                                    <Text fontSize="sm" fontWeight="bold" color={
                                                        passwordStrength >= 3 ? 'yellow.500' : 'red.500'
                                                    }>
                                                        Password Suggestions:
                                                    </Text>
                                                    <List styleType="disc" listStylePos="inside" fontSize="sm" color={
                                                        passwordStrength >= 3 ? 'yellow.500' : 'red.500'
                                                    }>
                                                        {passwordStrength === 3 ? (
                                                            <>
                                                                <ListItem>Your password is strong, but it could be better.</ListItem>
                                                                {passwordSuggestions.map((suggestion, index) => (
                                                                    <ListItem key={index}>{suggestion}</ListItem>
                                                                ))}
                                                            </>
                                                        ) : (
                                                            passwordSuggestions.map((suggestion, index) => (
                                                                <ListItem key={index}>{suggestion}</ListItem>
                                                            ))
                                                        )}
                                                    </List>
                                                </Box>
                                            )}
                                            {passwordReasons && (
                                                <Box mt={2}>
                                                    <Text fontSize="sm" fontWeight="bold" color={
                                                        passwordStrength >= 4 ? 'green.500' :
                                                            passwordStrength >= 3 ? 'yellow.500' : 'red.500'
                                                    }>
                                                        Reason: {passwordReasons}
                                                    </Text>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Stack>

                                <FormControl isRequired>
                                    <FormLabel>reCAPTCHA</FormLabel>
                                    <ReCAPTCHA
                                        sitekey="6LfF_bkoAAAAAIEMViwNDeWv2cR5xx_Pss5nKw9y"
                                        onChange={handleRecaptchaChange}
                                        onExpired={handleRecaptchaExpired}
                                    />
                                </FormControl>

                                <Stack spacing={10} pt={2}>
                                    <Button type='submit' style={{ backgroundColor: '#004225', color: '#FFFFFF' }}>
                                        Sign up
                                    </Button>
                                </Stack>
                                <Stack pt={6}>
                                    <Text align={'center'}>
                                        Already a user? <Link href="/login" className='text-custom-green'>Login</Link>
                                    </Text>
                                </Stack>
                            </Stack>
                        </form>
                    </Box>
                </Stack>
            </Container>
        </LoginLayout>
    )
}
