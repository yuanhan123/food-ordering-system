"use client"

import { useState, useEffect } from 'react'
import { Box, Text, Select, Divider, SimpleGrid, Flex} from "@/providers"
import { AiFillCloseCircle} from "react-icons/ai"
import { BiSolidError } from "react-icons/bi"
import useAxiosAuth from '@/lib/hooks/useAxiosAuth'
import { useSession } from 'next-auth/react'
import MenuCard from './MenuCard'
import axios from '@/lib/axios'

export default function OrderCard ({ orderId }) {
    const [itemId, setItemId] = useState("");
    const [orderItem, setOrderItem] = useState([]);
    const [orderStatus, setOrderStatus] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [date, setDate] = useState("");
    const statusOptions = ['pending', 'confirmed', 'delivered'];

    const axiosAuth = useAxiosAuth();

    const { data: session } = useSession();
    const isAuthenticated = session && Object.keys(session.user).length;

    const changeStatus = async (status) => {
        if (status != orderStatus){
            if (session.user.role === "seller"){
                const res = await axiosAuth.patch(`/api/order/${orderId}`, status);
                if (res.status === 200){
                    setOrderStatus(status)
                }else{
                    console.error('Request failed with status: ', res.status);
                }
            }
        }
    }

    useEffect(() => {
        const modifiedOrderId = orderId.slice(0, 5);
        setItemId(modifiedOrderId)

        if (isAuthenticated) {
            const getOrderItem = async () => {
                const res = await axiosAuth.get(`/api/order/${orderId}`);
                
                if (res.status === 200){
                    const order = res.data.data[0].orders
                    const formattedDateStr = new Date(order.timestamp).toLocaleString('en-US', { hour12: false }).replace(/, /, ' ');
                    setDate(formattedDateStr)
                    setOrderStatus(order.status)

                    const orderItemList = (res.data.data).map(item => {
                        return{
                            ... item.menuitem,
                            quantity: item.quantity,
                            totalPrice: item.totalPrice
                        }
                    });
                    setOrderItem(orderItemList)

                    setDeliveryAddress(order.deliveryAddress)

                } else {
                    console.error('Request failed with status: ', res.status);
                }
            }
            getOrderItem();
        }
    }, [orderId, orderStatus]);

    return (
        <>
            <Box bg='whitesmoke' my={5} p={3} maxw={'7xl'}>
                <Box display='flex' justifyContent='space-around' flexDirection={{ base: 'column', sm: 'row' }} >
                    <Text fontSize={'md'} p={2} fontWeight={300} color='facebook.500' >Order Id : {itemId}</Text>
                    {
                        session.user.role === "seller" ?
                        <Flex>
                            <Text fontSize={'md'} p={2} fontWeight={300} color='facebook.500' >Status : </Text>
                            <Select w="sm" color='facebook.500' placeholder='Select status' value={orderStatus} onChange={(e) => changeStatus(e.target.value)}>
                                {statusOptions.map((status, index) => {
                                    const currentIndex = statusOptions.indexOf(orderStatus)
                                    if (index >= currentIndex){
                                        return (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        );
                                    }
                                    return null;
                                })}
                            </Select>
                        </Flex>
                        :
                        <Text fontSize={'md'} p={2} fontWeight={300} color='facebook.500' >Status : {orderStatus}</Text>
                    }
                    <Text fontSize={'md'} p={2} fontWeight={300} color='facebook.500' >Order Date : {date}</Text>
                </Box>
                <Divider />
                <SimpleGrid my={3} columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={3} >
                    {
                        orderItem.map((orderItem, index) => {
                            const popular = orderItem.popular === 1 ? true : orderItem.popular === 0 ? false : value;
                            return orderItem !==null && 
                                <MenuCard 
                                    key={index} 
                                    image={orderItem.image} 
                                    name={orderItem.name} 
                                    price={parseFloat(orderItem.totalPrice)} 
                                    popular={popular} 
                                    addToCartButton={false}/>
                        })
                    }
                </SimpleGrid>
                <Divider />
                <Box display='flex' justifyContent='space-around' flexDirection={{ base: 'column', sm: 'row' }} >
                    <Text fontSize={'md'} p={2} fontWeight={300} color='facebook.500' >delivery address : {deliveryAddress}</Text>
                </Box>
            </Box>
        </>
    )
}