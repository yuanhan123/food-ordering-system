'use client'

import {
  Text,
  Image,
  Box,
  Stack,
  Icon,
  useToast,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Heading,
  Flex,
  HStack,
  Input,
  InputRightElement,
  InputGroup
} from '@/providers'
import CategoryCard from '@/components/CategoryCard'
import MenuGrid from '@/components/MenuGrid'
import MenuCard from '@/components/MenuCard'
import TopNavigation from '@/components/Navigation'
import React, { useState, useRef, useEffect } from 'react'
import { AiFillFire } from 'react-icons/ai'
import { FaArrowLeft } from 'react-icons/fa'
import { MdOutlineCancel } from 'react-icons/md'
import CartItem from '@/components/CartItem'
import CartOrderSummary from '@/components/CartOrderSummary'
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import axios from '@/lib/axios'
import CheckoutForm from '@/components/CheckoutForm'
import Order from '@/components/Order'

// to sanitize inputs
import { sanitize } from "isomorphic-dompurify";
import { useSession } from 'next-auth/react'

const stripePromise = loadStripe("pk_test_51NuJ6EK7BZdJltQnk9Xs9Tjd3rj0quR3RegQKYe43Yd1y2d1FoF3eIgYw9yYU0Zc8tgT7X19yGn4N25Q8zf7uZeq00hTCRqqw1");

export default function Home() {
  const { data: session } = useSession();
  const isAuthenticated = session && Object.keys(session.user).length;

  const toast = useToast();
  const menuRef = useRef();
  // create an array to hold category refs
  const categoryRefs = useRef([]);

  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [menuCategory, setMenuCategory] = useState([]);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [clientSecret, setClientSecret] = useState();
  const [userData, setUserData] = useState({
    customerId: '',
    fullname: ''
  });
  // drawer control
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [paymentMode, setPaymentMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const stripeAppearance = {
    theme: 'stripe',
  };
  const { isOpen: isOrderOpen, onOpen: onOrderOpen, onClose: onOrderClose } = useDisclosure();

  // scroll to food menu contents
  const scrollToOrder = () => {
    if (menuRef.current) {
      menuRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const handleCategoryClick = (index) => {
    if (categoryRefs.current) {
      // get selected ref
      let selectedRef = categoryRefs.current[index];
      // scroll to section
      selectedRef.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const handleAddCartItem = (item) => {
    const { menuItemId, name, price } = item;
    const existingItem = cart.find((item) => item.menuItemId === menuItemId);

    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.menuItemId === menuItemId ? {
          ...item,
          quantity: item.quantity + 1, // new quantity
          totalPrice: item.price * (item.quantity + 1) // new total
        } : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        ...item,
        quantity: 1,
        totalPrice: price
      }]);
    }

    toast({
      title: `${name} added to cart.`,
      // description: "You can check new food items added in the cart.",
      status: 'success',
      duration: 1500,
      isClosable: true,
    })
  }

  const handleUpdateQuantity = (menuItemId, newQuantity) => {
    const updatedCart = cart.map((item) =>
      item.menuItemId === menuItemId ? {
        ...item,
        quantity: newQuantity,
        totalPrice: newQuantity * item.price
      } : item
    );
    setCart(updatedCart);
  }

  const handleRemoveItem = (menuItemId, name) => {
    const updatedCart = cart.filter((item) => item.menuItemId !== menuItemId);
    setCart(updatedCart);

    toast({
      title: `${name} removed from cart.`,
      status: 'success',
      duration: 1500,
      isClosable: true,
    })
  };

  const handleCheckout = async (e) => {
    // check if user is logged in
    if (!isAuthenticated) {
      toast({
        title: "Please sign in first to checkout",
        // description: "You can check new food items added in the cart.",
        status: 'error',
        duration: 1500,
        isClosable: true,
      })
      return;
    }
    try {
      const response = await axios.post("api/payment-intent", {
        amount: totalPrice
      });

      if (response.data.success) {
        setClientSecret(response.data.clientSecret);
        setPaymentMode(true);
      }

    } catch (err) {
      console.log(err);
    }
  }

  const goBackToCart = () => setPaymentMode(false);

  useEffect(() => {
    if (isAuthenticated) {
      const { customerId, fullname } = session.user;
      setUserData({ customerId, fullname });
    }
  }, [isAuthenticated])

  useEffect(() => {
    // console.log("new cart", cart);
    // calculate total price and quantity
    let totalPrice = cart.reduce((acc, item) => {
      return acc + item.totalPrice;
    }, 0);
    let totalQuantity = cart.reduce((acc, item) => {
      return acc + item.quantity;
    }, 0);
    setTotalPrice(totalPrice);
    setTotalQuantity(totalQuantity);
    // console.log('new total', totalPrice);
  }, [cart])

  useEffect(() => {
    // set size of refs
    if (menuCategory.length) {
      categoryRefs.current = categoryRefs.current.slice(0, menuCategory.length);
    }
  }, [menuCategory])

  useEffect(() => {
    // get menu categories
    axios.get('api/menu-categories').then(res => {
      // console.log(res.data);
      if (res.data.success) {
        setMenuCategory(res.data.categories);
      }
    }).catch(err => console.error(err));

    // get menu items
    axios.get('api/menu-items').then(res => {
      // console.log(res.data);
      if (res.data.success) {
        setMenu(res.data.items);
      }
    }).catch(err => console.error(err));
  }, [])

  return (
    <div>
      <TopNavigation itemsCount={totalQuantity} handleClickCart={onOpen} handleClickOrder={onOrderOpen}>
        <InputGroup boxShadow='base' w='330px'>
          <Input placeholder="Search" value={searchValue} onFocus={() => handleCategoryClick(0)} onChange={(e) => setSearchValue(sanitize(e.target.value))} />
          <InputRightElement>
            {searchValue &&
              <Icon
                as={MdOutlineCancel}
                fontSize='lg'
                color="green.500"
                cursor="pointer"
                onClick={() => setSearchValue('')}
              />
            }
          </InputRightElement>
        </InputGroup>
      </TopNavigation>
      <Box position="relative">
        <Image src="/banner.jpg" width="100%" alt="Banner" />
        <Stack
          position="absolute"
          bottom={10}
          left={{ lg: 40, md: 20 }}
          right={{ lg: 40, md: 20 }}
          bg="white"
          w={{ lg: '750px', base: '90%' }}
          h={{ lg: '250px', base: '70%' }}
          pl={7}
          pt={{ lg: 10, md: 5 }}
          spacing={2}
        >
          <Text fontSize={{ lg: '5xl', md: '3xl', sm: 'xl' }} fontWeight="bold" color="teal.500">
            Malaysia Chiak
          </Text>
          <Text fontSize={{ lg: '4xl', md: '2xl', sm: 'lg' }} fontWeight="medium" fontStyle="italic">
            Your favourite Malaysian delights?
          </Text>
          <Text
            as="u"
            fontSize={{ lg: '2xl', md: 'xl', sm: 'md' }}
            fontWeight="medium"
            fontStyle="underline"
            cursor="pointer"
            onClick={scrollToOrder}
          >
            Order Now
          </Text>
        </Stack>
      </Box>

      <Text px={4} mt={10} fontSize='4xl' fontWeight='bold'>What We Have</Text>
      <MenuGrid col={menuCategory.length}>
        {menuCategory.length > 0 && menuCategory.map((category, i) =>
          <CategoryCard
            key={i}
            imageUrl={category.image}
            catName={category.name}
            categoryClick={() => handleCategoryClick(i)}
          />
        )}
      </MenuGrid>

      <Stack direction='row' alignItems='center' px={4} mt={10}>
        <Text ref={menuRef} fontSize='4xl' fontWeight='bold'>Hot Picks</Text>
        <Icon as={AiFillFire} w={10} h={10} color='red.500' />
      </Stack>
      <MenuGrid>
        {menu.length > 0 && menu.flat().map((item, i) =>
          item.popular == 1 &&
          <MenuCard 
            key={i}
            {...item}
            addToCart={() => handleAddCartItem(item)}
          />
        )}
      </MenuGrid>

      {menu.length > 0 && menuCategory.length > 0 && menu.map((category, categoryIndex) =>
        // display item by category
        <React.Fragment key={categoryIndex}>
          <Text
            ref={el => categoryRefs.current[categoryIndex] = el}
            px={4}
            mt={10}
            fontSize='4xl'
            fontWeight='bold'
          >
            {menuCategory[categoryIndex].name}
          </Text>
          <MenuGrid>
            {category.map((item, itemIndex) =>
              (!searchValue || item.name.toLowerCase().includes(searchValue)) &&
              <MenuCard
                key={itemIndex}
                {...item}
                addToCart={() => handleAddCartItem(item)}
              />
            )}
          </MenuGrid>
        </React.Fragment>
      )}

      {/* shopping cart summary */}
      <Drawer placement='top' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth='1px'>Shopping Cart</DrawerHeader>
          <DrawerBody>
            <Box
              maxw={{
                base: '3xl',
                lg: '7xl',
              }}
              mx="auto"
              px={{
                base: '4',
                md: '8',
                lg: '12',
              }}
              py={{
                base: '6',
                md: '8',
                lg: '12',
              }}
            >
              <Stack
                direction={{
                  base: 'column',
                  lg: 'row',
                }}
                align={{
                  lg: 'flex-start',
                }}
                spacing={{
                  base: '8',
                  md: '16',
                }}
              >
                <Stack
                  spacing={{
                    base: '8',
                    md: '10',
                  }}
                  flex="2"
                >
                  {!clientSecret || !paymentMode ?
                    <>
                      <Heading fontSize="2xl" fontWeight="bold">
                        {cart.length} items
                      </Heading>

                      <Stack spacing="6">
                        {cart.map((item, i) => (
                          <CartItem key={i} {...item} onChangeQuantity={handleUpdateQuantity} onClickDelete={() => handleRemoveItem(item.menuItemId, item.name)} />
                        ))}
                      </Stack>
                    </>
                    :
                    <>
                      <HStack spacing={2} cursor="pointer" onClick={goBackToCart}>
                        <FaArrowLeft />
                        <Text _hover={{ color: 'blue', textDecoration: 'underline' }}>Back to Items</Text>
                      </HStack>
                      <Elements options={{
                        clientSecret,
                        stripeAppearance
                      }} stripe={stripePromise}>
                        <CheckoutForm userData={userData} clientSecret={clientSecret} cart={cart} />
                      </Elements>
                    </>
                  }
                </Stack>

                <Flex direction="column" align="center" flex="1">
                  <CartOrderSummary
                    paymentMode={paymentMode}
                    totalPrice={totalPrice}
                    totalQuantity={totalQuantity}
                    onClickCheckout={handleCheckout}
                  />
                  <HStack mt="6" fontWeight="semibold">
                    <p>or</p>
                    <Text color='teal' cursor='pointer' onClick={() => { onClose(); setPaymentMode(false); }}>Add MORE</Text>
                  </HStack>
                </Flex>
              </Stack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      { /* Order List */}
      <Drawer placement='top' onClose={onOrderClose} isOpen={isOrderOpen}>
        <DrawerOverlay />
        <DrawerContent maxH={'2xl'}>
          <DrawerHeader borderBottomWidth='1px'>Orders</DrawerHeader>
          <DrawerBody>
            <Order>
            </Order>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
