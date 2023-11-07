import { CloseButton, Flex, Text, useColorModeValue as mode } from '@/providers'
import CartProduct from './CartProduct'
import QuantityPicker from './QuantityPicker'

export default function CartItem(props) {
    const {
        menuItemId,
        name,
        quantity,
        image,
        totalPrice,
        onChangeQuantity,
        onClickDelete,
    } = props;

    return (
        <Flex
            direction={{
                base: 'column',
                md: 'row',
            }}
            justify="space-between"
            align="center"
        >
            <CartProduct
                name={name}
                // description={description}
                image={image}
            />

            {/* Desktop */}
            <Flex
                width="full"
                justify="space-between"
                align='center'
                display={{
                    base: 'none',
                    md: 'flex',
                }}
            >
                <QuantityPicker
                    quantity={quantity}
                    onIncrease={() => onChangeQuantity(menuItemId, quantity + 1)}
                    onDecrease={() => onChangeQuantity(menuItemId, quantity - 1)}
                />
                <Text
                    as="span"
                    fontWeight="medium"
                    color={mode('gray.700', 'gray.400')}
                >
                    ${totalPrice.toFixed(2)}
                </Text>
                <CloseButton aria-label={`Delete ${name} from cart`} onClick={onClickDelete} />
            </Flex>

            {/* Mobile */}
            <Flex
                mt="4"
                align="center"
                width="full"
                justify="space-between"
                display={{
                    base: 'flex',
                    md: 'none',
                }}
            >
                <QuantityPicker
                    quantity={quantity}
                    onIncrease={() => onChangeQuantity(menuItemId, quantity + 1)}
                    onDecrease={() => onChangeQuantity(menuItemId, quantity - 1)}
                />
                <Text
                    as="span"
                    fontWeight="medium"
                    color={mode('gray.700', 'gray.400')}
                >
                    ${totalPrice.toFixed(2)}
                </Text>
                <CloseButton aria-label={`Delete ${name} from cart`} onClick={onClickDelete} />
            </Flex>
        </Flex>
    )
}