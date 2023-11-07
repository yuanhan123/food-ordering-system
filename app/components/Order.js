"use client"

import {Box, Text, Icon, Heading, Button} from '@/providers' 
import { useState, useEffect, useCallback } from 'react';
import { AiOutlineShoppingCart } from 'react-icons/ai'
import OrderCard from './OrderCard'
import useAxiosAuth from '@/lib/hooks/useAxiosAuth'
import { useSession } from 'next-auth/react'

export default function Order(){
    const [currentOrders, setCurrentOrders] = useState("active");
    const [orders, setOrders] = useState([]);
    const [isEmpty, setIsEmpty] = useState(true);

    const axiosAuth = useAxiosAuth();

    const { data: session } = useSession();
    const isAuthenticated = session && Object.keys(session.user).length;
      
      useEffect(() => {
        if (isAuthenticated) {
            const customerLoadOrder = async () => {
                const res = await axiosAuth.get("/api/order/customer");

                if (res.status === 200){
                    const orderList = res.data.data
                    const sortedOrders = orderList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    setOrders(sortedOrders)
                    
                    orderList.forEach((order) => {
                        // console.log(order)
                        if (currentOrders === "active" && order.status != "delivered"){
                            setIsEmpty(false)
                        }
                        if (currentOrders === "pending" && order.status === "pending"){
                            setIsEmpty(false)
                        }
                    })
                } else {
                    console.error('Request failed with status: ', res.status);
                }

            };

            const loadSellerOrder = async() => {
                const res = await axiosAuth.get("/api/order");

                if (res.status === 200){
                    const orderList = res.data.data
                    setOrders(orderList)
                    
                    orderList.forEach((order) => {
                        // console.log(order)
                        if (currentOrders === "active" && order.status != "delivered"){
                            setIsEmpty(false)
                        }
                        if (currentOrders === "pending" && order.status === "pending"){
                            setIsEmpty(false)
                        }
                    })
                } else {
                    console.error('Request failed with status: ', res.status);
                }
            }

            if (session.user.role === "customer"){ 
                customerLoadOrder(); 
            } else if (session.user.role === "seller"){ 
                loadSellerOrder(); 
            }
        }
      }, [isAuthenticated, currentOrders, orders]);

    return(
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
            <Box display='flex' justifyContent='center' alignItems='center'>
                <Text
                className='text-custom-orange'
                textAlign='center'
                fontSize={'xl'}
                fontWeight={currentOrders === "pending" ? 600 : 300}
                mr={5}
                cursor='pointer'
                onClick={() => setCurrentOrders("pending")}
                >Pending</Text>

                <Text
                className='text-custom-orange'
                textAlign='center'
                fontSize={'xl'}
                fontWeight={currentOrders === "active" ? 600 : 300}
                mr={5}
                ml={5}
                cursor='pointer'
                onClick={() => setCurrentOrders("active")}
                >Active Orders</Text>
                
                <Text
                className='text-custom-orange'
                textAlign='center'
                fontSize={'xl'}
                fontWeight={currentOrders === "all" ? 600 : 300}
                ml={5}
                cursor='pointer'
                onClick={() => setCurrentOrders("all")}
                >All Orders</Text>
            </Box>
            <Box py={3} px={{ base: 3, md: 5, lg: 10 }} >
                {
                    orders.length > 0 ? orders.map((order, index) => {
                        if (currentOrders === "active") {
                            if (order.status != "delivered"){
                                return <OrderCard key={index} orderId={order.ordersId} />
                            }
                        } else if (currentOrders === "pending"){
                            if(order.status === "pending"){
                                return <OrderCard key={index} orderId={order.ordersId} />
                            }
                        } else {
                            return <OrderCard key={index} orderId={order.ordersId} />
                        }
                    })
                    :
                    <Box
                        display='flex'
                        justifyContent='center'
                        alignItems='center'
                        flexDirection='column'
                        mt={10}
                        p={3}
                        >
                        <Icon color='#314E89' fontSize={'5xl'} as={AiOutlineShoppingCart} />
                        <Heading textAlign='center' fontSize={'xl'} mt={8}  >You do not have any orders.</Heading>
                        <Text textAlign='center' fontSize={'xl'} mt={2} fontWeight={300} >Check out our bestsellers and find something for you!</Text>
                    </Box>
                }
                {
                    (currentOrders === "active" || currentOrders === "pending") &&
                    isEmpty &&
                    <Box
                        display='flex'
                        justifyContent='center'
                        alignItems='center'
                        flexDirection='column'
                        mt={10}
                        p={3}
                    >
                        <Icon color='#314E89' fontSize={'5xl'} as={AiOutlineShoppingCart} />
                        <Heading textAlign='center' fontSize={'xl'} mt={8}  >You do not have any active orders.</Heading>
                        <Text textAlign='center' fontSize={'xl'} mt={2} fontWeight={300} >Check out our bestsellers and find something for you!</Text>
                    </Box>
                }
            </Box>
        </Box>
    )
}
