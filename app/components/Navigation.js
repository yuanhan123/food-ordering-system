'use client'

import {
    Box,
    Flex,
    Button,
    Stack,
    Collapse,
    Icon,
    IconButton,
    useColorModeValue,
    useDisclosure,
    Image
} from '@/providers'

import { RxHamburgerMenu } from 'react-icons/rx'
import { AiOutlineClose, AiOutlineUser, AiOutlineShoppingCart } from 'react-icons/ai'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function TopNavigation({ itemsCount, handleClickCart, handleClickOrder, children }) {
    const { isOpen, onToggle } = useDisclosure();
    const [cartCount, setCartCount] = useState(itemsCount);
    const [userRole, setUserRole] = useState("");

    const router = useRouter();
    const { data: session } = useSession();
    const isAuthenticated = session && Object.keys(session.user).length;

    const logout = () => signOut();

    const signIn = () => router.push('/login');

    // update items count in cart
    useEffect(() => {
        setCartCount(itemsCount)
    }, [itemsCount])

    useEffect(() => {
        if (isAuthenticated) setUserRole(session.user.role)
    }, [isAuthenticated])

    return (
        <Box position='sticky' top={0} zIndex={100}>
            <Flex
                className='bg-white'
                color={useColorModeValue('gray.600', 'white')}
                minH={'60px'}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderBottom={1}
                borderStyle={'solid'}
                borderColor={useColorModeValue('gray.200', 'gray.900')}
                align={'center'}>
                <Flex
                    flex={{ base: 1, md: 'auto' }}
                    ml={{ base: -2 }}
                    display={{ base: 'flex', md: 'none' }}>
                    <IconButton
                        onClick={onToggle}
                        icon={isOpen ? <Icon as={AiOutlineClose} w={3} h={3} /> : <Icon as={RxHamburgerMenu} w={5} h={5} />}
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    />
                </Flex>
                <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align='center'>
                    <Link href="/">
                        <Image
                            src="/logo-nav.jpg"
                            alt="Logo"
                            width={100}
                            height={16}
                            objectFit='cover'
                        />
                    </Link>
                </Flex>

                <Flex grow={1} justifyContent='center'>
                    {children}
                </Flex>

                {/* desktop nav */}
                <Stack
                    display={{ base: 'none', md: 'flex' }}
                    justify={'flex-end'}
                    direction={'row'}
                    spacing={6}>
                    {isAuthenticated ? (
                        // Render this button when the user is authenticated
                        <Button
                            variant={'ghost'}
                            rightIcon={<Icon as={AiOutlineUser} w={6} h={6} />}
                            onClick={logout}
                            data-testid="sign-label">
                            Sign Out
                        </Button>
                    ) : (
                        // Render a different button or nothing when the user is not authenticated
                        // For example, you can render a "Sign In" button here
                        <Button variant={'ghost'} onClick={signIn} data-testid="sign-label">
                            Sign In
                        </Button>
                    )}
                    <Stack direction={'row'} spacing={2} pos="relative">
                        <Button
                            variant={'ghost'}
                            onClick={handleClickOrder}>
                            Order
                        </Button>
                        {userRole === "customer" &&
                            <>
                                <Button
                                    data-testid="cart-button"
                                    variant={'ghost'}
                                    rightIcon={<Icon as={AiOutlineShoppingCart} w={6} h={6} />}
                                    onClick={handleClickCart}>
                                    Cart
                                </Button>
                                <Box pos="absolute" top={0} right={-1} bg="teal.500" color="white" w={6} h={6} textAlign="center" rounded="full">{cartCount}</Box>
                            </>
                        }
                    </Stack>
                </Stack >
            </Flex >

            {/* mobile nav */}

            <Collapse in={isOpen} animateOpacity>
                <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
                    <Stack spacing={4}>
                        {isAuthenticated ? (
                            // Render this button when the user is authenticated
                            <Button
                                variant={'ghost'}
                                rightIcon={<Icon as={AiOutlineUser} w={6} h={6} />}
                                onClick={logout}>
                                Sign Out
                            </Button>
                        ) : (
                            // Render a different button or nothing when the user is not authenticated
                            // For example, you can render a "Sign In" button here
                            <Button variant={'ghost'} onClick={signIn}>
                                Sign In
                            </Button>
                        )}
                        <Button variant={'ghost'} onClick={handleClickOrder}>
                            Order
                        </Button>
                        <Stack direction={'row'} justify='center' spacing={2} pos="relative">
                            {userRole === "customer" &&
                            <>
                                <Button
                                    variant={'ghost'}
                                    rightIcon={<Icon as={AiOutlineShoppingCart} w={6} h={6} />}
                                    onClick={handleClickCart}>
                                    Cart
                                    <Box pos="absolute" top={0} right={-1} bg="teal.500" color="white" w={6} h={6} textAlign="center" fontSize='sm' pt={1} rounded="full">{cartCount}</Box>
                                </Button>
                            </>
                            }
                        </Stack>
                    </Stack>
                </Stack>
            </Collapse>
        </Box>
    )
}