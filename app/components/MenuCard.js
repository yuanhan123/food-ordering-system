import {
    Box,
    AspectRatio,
    Stack,
    Button,
    Text,
    Badge,
    Image
} from '@/providers'

export default function MenuCard(props) {
    const { image, name, price, popular, addToCart, addToCartButton = true, editMenu } = props;

    return (
        <Box position="relative" data-testid="menu-Item">
            <AspectRatio ratio={4 / 3} overflow='hidden' rounded="3xl">
                <Image data-testid="menu-image" src={image} alt={name} />
            </AspectRatio>
            {popular == 1 &&
                <Badge variant='subtle' colorScheme='green' position='absolute' top={3} left={3}>
                    Most ordered
                </Badge>
            }
            <Stack mt={4}>
                <Text data-testid="menu-name" fontWeight='normal' fontSize='xl'>{name}</Text>
                <Text data-testid="menu-price" fontWeight='bold' fontSize='lg'>{price.toFixed(2)}</Text>
                {
                    addToCartButton &&
                    <Button data-testid="add-cart-button" fontWeight='bold' fontSize='lg' colorScheme='teal' onClick={addToCart}>Add To Cart</Button>
                }
                {
                    editMenu &&
                    <Button fontWeight='bold' fontSize='lg' colorScheme='teal' onClick={editMenu}>Edit</Button>
                }
            </Stack>
        </Box>
    )
}