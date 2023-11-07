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
  Flex,
  Input,
  InputRightElement,
  InputGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  ModalFooter,
  Button,
  Select,
  Checkbox
} from '@/providers'
import CategoryCard from '@/components/CategoryCard'
import MenuGrid from '@/components/MenuGrid'
import MenuCard from '@/components/MenuCard'
import TopNavigation from '@/components/Navigation'
import React, { useState, useRef, useEffect } from 'react'
import { AiFillFire } from 'react-icons/ai'
import { MdOutlineCancel } from 'react-icons/md'
import axios from '@/lib/axios'
import Order from '@/components/Order'

// to sanitize inputs
import { sanitize } from "isomorphic-dompurify";

import S3 from 'react-aws-s3';

const s3Config = {
  bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
  dirName: 'menu',
  region: process.env.NEXT_PUBLIC_S3_REGION,
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_KEY
};

export default function Home() {
  const maxFileSize = 5 * 1024 * 1024 // 5MB;
  const emptyMenuFormData = {
    menuItemId: '', // to track selected item only
    category: 0,
    name: '',
    price: '',
    popular: false,
    image: ''
  };

  const toast = useToast();
  const menuRef = useRef();
  // create an array to hold category refs
  const categoryRefs = useRef([]);

  const [menuCategory, setMenuCategory] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedFile, setSelectedFile] = useState();
  const [fileErrorMessage, setFileErrorMessage] = useState();
  const [menuFormData, setMenuFormData] = useState(emptyMenuFormData);
  const [editMode, setEditMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const { isOpen: isOrderOpen, onOpen: onOrderOpen, onClose: onOrderClose } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

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

  const handleFileInput = (e) => {
    const file = e.target.files[0];

    if (file.size > maxFileSize) {
      setFileErrorMessage('File size exceeds the maximum allowed size (5MB).');
      setSelectedFile();
    }
    else {
      setFileErrorMessage('');
      setSelectedFile(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name == 'popular') setMenuFormData({ ...menuFormData, [name]: e.target.checked });
    else setMenuFormData({ ...menuFormData, [name]: value });
  };

  const getMenu = () => {
    axios.get('api/menu-items').then(res => {
      console.log(res.data);
      if (res.data.success) {
        setMenu(res.data.items);
      }
    }).catch(err => console.error(err));
  }

  // add or edit menu
  const addOrEditMenu = async (e) => {
    e.preventDefault();
    if (selectedFile) {
      const ReactS3Client = new S3(s3Config);
      ReactS3Client
        .uploadFile(selectedFile, selectedFile.name)
        .then(data => {
          // console.log("image path", data.location);
          let newData = { ...menuFormData };
          newData.image = data.location;

          // add menu
          if (!editMode) addToMenu(newData);
          // edit menu
          else editMenu(newData);
        })
        .catch(err => console.error(err));
    } else {
      console.error('No file selected for upload');
    }
  };

  const addToMenu = async (newData) => {
    axios.post('api/menu-items/create', newData)
      .then(response => {
        const { success, result } = response.data;
        if (success) {
          console.log("data updated", result);
          resetForm();
          getMenu();
          toast({
            title: `${result.name} is successfully added to menu.`,
            status: 'success',
            duration: 1500,
            isClosable: true,
          })
        }
      })
      .catch(err => console.error(err));
  }

  const editMenu = async (newData) => {
    axios.post('api/menu-items/update', newData)
      .then(response => {
        const { success, result } = response.data;
        if (success) {
          console.log("data updated", result);
          resetForm();
          getMenu();
          toast({
            title: `${result.name} is successfully updated in menu.`,
            status: 'success',
            duration: 1500,
            isClosable: true,
          })
        }
      })
      .catch(err => console.error(err));
  }

  const deleteFromMenu = async () => {
    axios.post('api/menu-items/delete', { menuItemId: menuFormData.menuItemId })
      .then(response => {
        const { success, result } = response.data;
        if (success) {
          console.log("data updated", result);
          resetForm();
          getMenu();
          toast({
            title: `${result.name} is successfully deleted from menu.`,
            status: 'success',
            duration: 1500,
            isClosable: true,
          })
        }
      })
      .catch(err => console.error(err));
  };

  const handleEditMenu = (item) => {
    setEditMode(true);
    const { menuItemId, menuCategoryId, name, price, popular, image } = item;
    setMenuFormData({
      menuItemId: menuItemId,
      category: menuCategoryId,
      name: name,
      price: price,
      popular: popular == '1' ? true : false,
      image: image
    })
    onModalOpen();
  }

  const resetForm = () => {
    onModalClose();
    setMenuFormData(emptyMenuFormData);
    setEditMode(false);
  }

  useEffect(() => {
    // set size of refs
    if (menuCategory.length) {
      categoryRefs.current = categoryRefs.current.slice(0, menuCategory.length);
    }
  }, [menuCategory])

  useEffect(() => {
    if (fileErrorMessage) {
      toast({
        title: "Image Upload Error",
        description: fileErrorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [fileErrorMessage])

  useEffect(() => {
    // get menu categories
    axios.get('api/menu-categories').then(res => {
      console.log(res.data);
      if (res.data.success) {
        setMenuCategory(res.data.categories);
      }
    }).catch(err => console.error(err));

    // get menu items
    getMenu();
  }, [])

  return (
    <div>
      <TopNavigation handleClickOrder={onOrderOpen}>
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
            Your favourite Malaysian delights
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

      <Flex px={4} mt={10} justify="space-between">
        <Text fontSize='4xl' fontWeight='bold'>What We Have</Text>
        <Button fontWeight='bold' fontSize='lg' colorScheme='teal' onClick={onModalOpen}>Add To Menu</Button>
      </Flex>
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
            addToCartButton={false}
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
                addToCartButton={false}
                editMenu={() => handleEditMenu(item)}
              />
            )}
          </MenuGrid>
        </React.Fragment>
      )}

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

      {/* food menu modal form */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
      >
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={addOrEditMenu}>
            <ModalHeader>{editMode ? 'Update' : 'New'} Food Item</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select placeholder='Select food category' name="category" value={menuFormData.category} onChange={handleInputChange}>
                  {menuCategory.length > 0 && menuCategory.map((category, i) =>
                    <option key={i} value={category.menuCategoryId}>{category.name}</option>
                  )}
                </Select>
              </FormControl>

              <FormControl isRequired mt={4}>
                <FormLabel>Name</FormLabel>
                <Input name="name" value={menuFormData.name} onChange={handleInputChange} />
              </FormControl>

              <FormControl isRequired mt={4}>
                <FormLabel>Price</FormLabel>
                <Input type='number' name="price" value={menuFormData.price} step="0.01" onChange={handleInputChange} />
              </FormControl>

              <Flex mt={4} spacing={2}>
                <FormLabel my={0}>Popularity</FormLabel>
                <Checkbox name="popular" isChecked={menuFormData.popular} onChange={handleInputChange} />
              </Flex>

              <FormControl isRequired={!editMode} mt={4}>
                <FormLabel>Image</FormLabel>
                {menuFormData.image && <Image src={menuFormData.image} alt="food item image" />}
                <Input type='file' accept="image/jpeg, image/jpg, image/png" onChange={handleFileInput} />
              </FormControl>

            </ModalBody>

            <ModalFooter>
              <Flex width='100%' justify={editMode ? 'space-between' : 'end'}>
                {editMode && <Button fontWeight='bold' fontSize='lg' colorScheme='red' onClick={deleteFromMenu}>Delete</Button>}
                <Button type='submit' fontWeight='bold' fontSize='lg' colorScheme='teal'>{editMode ? 'Update' : 'Add'}</Button>
              </Flex>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  )
}
