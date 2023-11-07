import {
    Button,
    Flex,
    Heading,
    Stack,
    Text,
    useColorModeValue as mode,
} from '@/providers'
import { FaArrowRight } from 'react-icons/fa'

const OrderSummaryItem = (props) => {
    const { label, value, children } = props
    return (
        <Flex justify="space-between" fontSize="sm">
            <Text fontWeight="medium" color={mode('gray.600', 'gray.400')} >
                {label}
            </Text>
            {value ? <Text data-testid="label" fontWeight="medium">{value}</Text> : children}
        </Flex>
    )
}

export default function CartOrderSummary({ paymentMode, totalPrice, totalQuantity, onClickCheckout }) {
    return (
        <Stack spacing="8" borderWidth="1px" rounded="lg" padding="8" width="full">
            <Heading size="md">Order Summary</Heading>

            <Stack spacing="6">
                <OrderSummaryItem label="Quantity" value={totalQuantity} />
                <OrderSummaryItem label="Subtotal" value={'$' + totalPrice.toFixed(2)} />
                <OrderSummaryItem label="Promo Code">
                    <Text fontStyle='italic'>Not Available</Text>
                </OrderSummaryItem>
                <Flex justify="space-between">
                    <Text fontSize="lg" fontWeight="semibold">
                        Total
                    </Text>
                    <Text fontSize="xl" fontWeight="extrabold">
                        ${totalPrice.toFixed(2)}
                    </Text>
                </Flex>
            </Stack>
            <Button
                data-testid="checkout"
                colorScheme="teal"
                size="lg"
                fontSize="md"
                rightIcon={<FaArrowRight />}
                isDisabled={totalQuantity == 0 || paymentMode}
                onClick={onClickCheckout}
            >
                Checkout
            </Button>
        </Stack>
    )
}