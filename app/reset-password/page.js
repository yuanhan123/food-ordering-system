'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import LoginLayout from '@/components/LoginLayout';
import AlertItem from '@/components/AlertItem';
import { HiEye, HiEyeOff } from 'react-icons/hi'
import {
    Container,
    Box,
    FormControl,
    FormLabel,
    Stack,
    Button,
    Heading,
    Image,
    IconButton,
    Text,
    InputRightElement,
    Input,
    InputGroup,
    Progress,
    List,
    ListItem,
} from '@chakra-ui/react'
import { zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import { matcherPwnedFactory } from '@zxcvbn-ts/matcher-pwned'

export default function ResetPassword() {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [cfmPassword, setCfmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showCfmPassword, setCfmShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordSuggestions, setPasswordSuggestions] = useState([]);
    const [passwordReasons, setPasswordReasons] = useState();
    const [email, setEmail] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('')
    const pattern = /^[stfgSTFG]\d{7}[A-Za-z]$/; // Regex pattern for S or T followed by 7 digits and any letter

    const matcherPwned = matcherPwnedFactory(fetch, zxcvbnOptions)

    const options = {
        translations: zxcvbnEnPackage.translations,
        graphs: zxcvbnCommonPackage.adjacencyGraphs,
        dictionary: {
            ...zxcvbnCommonPackage.dictionary,
            ...zxcvbnEnPackage.dictionary,
        },
    }

    useEffect(() => {
        zxcvbnOptions.addMatcher('pwned', matcherPwned)
        zxcvbnOptions.setOptions(options)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const gatherUserInfo = async () => {
            try {
                // Send email verification request to the server
                const res = await axios.post(`/api/verify-password/`, { token: tokenFromUrl });

                if (res.status === 200) {
                    setEmail(res.data.email);
                    setUsername(res.data.username)
                    setFirstName(res.data.firstName);
                    setLastName(res.data.lastName);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                router.push('/login');
            }
        };

        // Check if the token is present in the URL
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            gatherUserInfo();
        }
    }, []);

    const handlePasswordChange = (newPassword) => {
        const emailUsername = email.split('@')[0]; // Extracting username part from the email
        const containsInvalidSubstring =
            (username && newPassword.toLowerCase().includes(username.toLowerCase())) ||
            (firstName && newPassword.toLowerCase().includes(firstName.toLowerCase())) ||
            (lastName && newPassword.toLowerCase().includes(lastName.toLowerCase())) ||
            (email && newPassword.toLowerCase().includes(emailUsername.toLowerCase()));
        if (newPassword.length < 8) {
            setPasswordStrength(0)
            setPasswordSuggestions(['Password is too short.']);
            setPasswordReasons('Password must have at least 8 characters.');
        } else if (pattern.test(newPassword)) {
            setPasswordStrength(0);
            setPasswordSuggestions(['Use a different password.'])
            setPasswordReasons('Password should not be NRIC number.')
        } else if (containsInvalidSubstring) {
            setPasswordStrength(0)
            setPasswordSuggestions(['Avoid using your username, first name, last name or email username in the password.'])
            setPasswordReasons('Password contains invalid substrings.')
        } else {
            zxcvbnAsync(newPassword).then((result) => {
                setPasswordStrength(result.score);
                setPasswordSuggestions(result.feedback.suggestions);
                setPasswordReasons(result.feedback.warning)
            })
            // const result = zxcvbn(newPassword);

        }
        setPassword(newPassword);
    };
    const handlePasswordReset = async () => {
        // clear error message
        setErrorMessage('');

        try {
            if (password === cfmPassword && passwordStrength >= 3) {
                const res = await axios.post(`/api/verify-token/`, { token, password });
                // if failed
                if (!res.data.success) {
                    if (res.data.samePassword) {
                        setErrorMessage('Passwords do not match or the new password is the same as the previous one!');
                    }
                    // if not valid, direct user to main page
                    if ('isValid' in res.data && !res.data.isValid) {
                        alert(res.data.message);
                        router.push('/');
                    }
                }
                else {
                    // redirect to login
                    router.push('/login');
                }
            }
            else if (passwordStrength < 3) {
                setErrorMessage('Password is too weak! Please try again!');
            } else {
                setErrorMessage('Please make sure both passwords match and choose a new password.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('Error resetting password.');
        }
    };

    return (
        <LoginLayout>
            <div className="absolute top-0" maxw="md">
            {errorMessage &&
                <AlertItem
                    status='error'
                    message={errorMessage}
                    onClose={() => setErrorMessage()}
                />
            }
            </div>
            <Container maxw="lg" py={{ base: '5' }} px={{ base: '0', sm: '8' }}>
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
                            <Heading className="text-xl font-semibold" size={{ base: 'xs', md: 'sm' }}>
                                Reset Password
                            </Heading>
                        </Stack>
                    </Stack>
                    <Box py={{ base: '0', sm: '8', }} px={{ base: '4', sm: '10', }} bg={{ base: '#FFFFFF', sm: 'bg.surface', }}
                        boxShadow={{ base: 'none', sm: 'md', }} borderRadius={{ base: 'none', sm: 'xl', }}>
                        <FormControl isRequired>
                            <FormLabel>New Password</FormLabel>
                            <InputGroup>
                                <Input marginBottom="2"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
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
                                    onChange={(e) => setCfmPassword(e.target.value)}
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
                            <Button style={{ backgroundColor: '#004225', color: '#FFFFFF' }}
                                onClick={handlePasswordReset}>
                                Reset Password
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </Container>
        </LoginLayout>
    );
};
