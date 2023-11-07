'use client';
import React, { useState } from 'react';
import axios from '@/lib/axios';
import LoginLayout from '@/components/LoginLayout';
import {
  Container,
  Box,
  FormControl,
  FormLabel,
  Stack,
  Button,
  Heading,
  Image,
  Input,
  InputGroup,
} from '@chakra-ui/react'

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
 
  const handleResetRequest = async () => {
    try {
      const res = await axios.post('/api/password-reset',  { email: email });
      if(res.status === 200) {
        alert('Password reset email sent successfully.');
      }
      
    } catch (error) {
      console.error('Error sending password reset email:', error);
      alert('Error sending password reset email.');
    }
  };

  return (
    <LoginLayout>
      <Container maxw="lg" py={{ base: '5' }} px={{base: '0', sm: '8'}}>
      <Stack spacing="5">
      <Stack spacing="6">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Image
                src="/logo.jpg"
                alt="Logo"
                width={100}
                height={100}
                objectFit='cover'
            />
        </div>
        <Stack spacing={{base: '2', md: '3',}} textAlign="center">
        <Heading className="text-xl font-semibold" size={{base: 'xs', md: 'sm',}}>
            Reset Password
        </Heading>
        </Stack>
      </Stack>
      <Box py={{base: '0',sm: '8',}} px={{base: '4', sm: '10',}} bg={{base: '#FFFFFF', sm: 'bg.surface',}} 
                    boxShadow={{base: 'none', sm: 'md',}} borderRadius={{base: 'none', sm: 'xl',}}>
        <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <InputGroup>
        <Input marginBottom="2"
            type='email'
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />
        </InputGroup>
        </FormControl>
        <Button style={{backgroundColor: '#004225', color: '#FFFFFF'}}
          onClick={handleResetRequest}>
          Reset Password
        </Button>
      </Box>
      </Stack>
      </Container>
    </LoginLayout>
  );
};

export default ResetPasswordRequest;
