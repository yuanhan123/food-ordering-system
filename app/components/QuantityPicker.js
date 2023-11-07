import { Button, Stack, Text } from "@/providers";

export default function QuantityPicker({ quantity, onIncrease, onDecrease }) {
    return (
        <Stack direction='row' spacing={4} align='center'>
            <Button
                colorScheme="teal"
                size="sm"
                onClick={onDecrease}
                isDisabled={quantity === 1}
            >
                -
            </Button>
            <Text>{quantity}</Text>
            <Button
                colorScheme="teal"
                size="sm"
                onClick={onIncrease}
            >
                +
            </Button>
        </Stack>
    );
}