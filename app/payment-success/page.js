'use client'

import { Box, Heading, Text, Button } from "@/providers"
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PaymentSuccess() {
    const router = useRouter();
    const [redirectTimer, setRedirectTimer] = useState(5);

    // Start a countdown timer to redirect the user
    useEffect(() => {
        const timer = setInterval(() => {
            setRedirectTimer((prevTimer) => prevTimer - 1);
        }, 1000);

        // Redirect the user back to the home page when the timer reaches 0
        if (redirectTimer === 0) {
            clearInterval(timer);
            router.push('/');
        }

        return () => {
            clearInterval(timer);
        };
    }, [redirectTimer]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
        >
            <Heading as="h1" size="xl" mt={10}>
                Payment Successful
            </Heading>
            <Text mt={4}>Your order is placed successfully!</Text>
            <Text>
                You will be redirected to the home page in <Text as='span' fontWeight='bold'>{redirectTimer}</Text> seconds.
            </Text>
            <Button
                mt={4}
                colorScheme="teal"
                display={redirectTimer === 0 ? 'none' : 'block'}
            >
                Return to Home
            </Button>
        </Box>
    );
}