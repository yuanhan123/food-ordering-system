import {
    PaymentElement,
    useStripe,
    useElements,
    AddressElement
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { Button, Spinner, useToast } from "@/providers";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

/* 
    Test card numbers for stripe payment:
    Success: 4242 4242 4242 4242
    Decline: 4000 0000 0000 0002
    Insufficient Funds: 4000 0000 0000 9995

    Note: use any 3 digits CVC with any future date
*/

export default function CheckoutForm({ userData, clientSecret, cart }) {
    const stripe = useStripe();
    const elements = useElements();
    const toast = useToast();
    const router = useRouter();

    const { customerId, fullname } = userData;

    const [address, setAddress] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);

    const addressElementOptions = {
        mode: "billing",
        allowedCountries: ['SG'],
        fields: {
            phone: 'always',
        },
        validation: {
            phone: {
                required: 'always',
            },
        },
        defaultValues: {
            name: fullname,
            phone: '88888888',
            address: {
                line1: 'Blk 666 Ang Mo Kio Street 6',
                line2: '#01-66',
                postal_code: '666666',
                country: 'SG',
            }
        }
    };

    const paymentElementOptions = {
        layout: "tabs"
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // stripe.js not yet loaded
        if (!stripe || !elements) return;

        setIsPaymentLoading(true);

        // try {
        //     const { paymentIntent } = await stripe.confirmPayment({
        //         elements,
        //         redirect: 'if_required'
        //     });

        //     if (paymentIntent.status == 'succeeded') {
        //         const { line1, line2, postal_code } = address;
        //         const fullAddress = line1.concat(' ', line2, ' ', postal_code);
        //         // update order with full address

        //     }

        //     setIsPaymentLoading(false);
        // } catch (err) {
        //     if (err.type === "card_error" || err.type === "validation_error") {
        //         setErrorMessage(err.message);
        //     } else {
        //         setErrorMessage("An unexpected error occurred.");
        //     }

        //     setIsPaymentLoading(false);
        // }
        stripe.confirmPayment({
            elements,
            redirect: 'if_required'
        }).then(res => {
            const { paymentIntent, error } = res;

            if (error) {
                if (res.error.type === "card_error" || res.error.type === "validation_error") {
                    setErrorMessage(res.error.message);
                } else {
                    setErrorMessage("An unexpected error occurred.");
                }
                setIsPaymentLoading(false);
            }

            if (paymentIntent.status == 'succeeded') {
                const { line1, line2, postal_code } = address;
                const fullAddress = line1.concat(' ', line2, ' ', postal_code);
                const newData = {
                    customerId: customerId,
                    address: fullAddress,
                    items: cart
                }
                // create customer order with full address
                axios.post('api/order/create', newData)
                    .then(response => {
                        const { success } = response.data;
                        if (success) {
                            router.push('/payment-success');
                        }
                    })
                    .catch(err => console.error(err));
            }

        }).catch(err => console.error(err));
    };

    useEffect(() => {
        errorMessage && toast({
            title: errorMessage,
            status: 'error',
            duration: 3000,
            isClosable: true,
        })
    }, [errorMessage])

    useEffect(() => {
        if (!stripe) {
            return;
        }

        if (!clientSecret) {
            return;
        }

        setIsLoading(false);
    }, [stripe]);

    return (
        (!isLoading ?
            <form id="payment-form" onSubmit={handleSubmit}>
                <AddressElement options={addressElementOptions} onChange={(e) => { if (e.complete) setAddress(e.value.address) }} />
                <PaymentElement id="payment-element" options={paymentElementOptions} />
                <Button
                    data-testid='place-order'
                    type='submit'
                    colorScheme="teal"
                    size="lg"
                    fontSize="md"
                    rightIcon={isPaymentLoading && <Spinner />}
                    isDisabled={isPaymentLoading || !stripe || !elements}
                >
                    Place Order
                </Button>
            </form>
            :
            <div id="spinner" className="spinner" />
        )
    );
}