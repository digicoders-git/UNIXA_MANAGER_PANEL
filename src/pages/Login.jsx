import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import http from '../apis/http';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast(); // Needs import from chakra-ui

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await http.post('/employees/login', {
        email,
        password
      });

      if (response.data.token) {
        // Optional: Check if role is Manager
        /*
        if (response.data.user.role !== 'Manager' && response.data.user.role !== 'System Admin') {
           toast({
             title: 'Access Denied',
             description: 'You do not have manager privileges.',
             status: 'error',
             duration: 5000,
             isClosable: true,
           });
           setLoading(false);
           return;
        }
        */
        
        login(response.data.user, response.data.token);
        toast({
          title: 'Login Successful',
          description: "Welcome to Manager Panel",
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast({
        title: 'Login Failed',
        description: error.response?.data?.message || 'Invalid email or password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue('gray.50', 'gray.900')}
      p={4}
    >
      <Container maxW="md">
        <Box
          rounded="2xl"
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow="2xl"
          p={{ base: 8, md: 10 }}
          border="1px solid"
          borderColor={useColorModeValue('gray.100', 'gray.700')}
        >
          <Stack spacing={8}>
            <Stack align="center" spacing={3}>
              <Heading fontSize="3xl" fontWeight="extrabold" color="blue.600">
                Welcome Back
              </Heading>
            </Stack>

            <Stack spacing={5} as="form" onSubmit={handleLogin}>
              <FormControl id="email" isRequired>
                <FormLabel fontWeight="600">Email Address</FormLabel>
                <Input 
                  type="email" 
                  placeholder="name@company.com" 
                  size="lg" 
                  borderRadius="xl"
                  focusBorderColor="blue.500"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel fontWeight="600">Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    borderRadius="xl"
                    focusBorderColor="blue.500"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement width="3rem">
                    <IconButton
                      h="1.75rem"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Stack spacing={6} pt={4}>
                <Button
                  type="submit"
                  bg="blue.500"
                  color="white"
                  size="lg"
                  borderRadius="xl"
                  fontSize="md"
                  isLoading={loading}
                  loadingText="Signing In..."
                  _hover={{
                    bg: 'blue.600',
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                  _active={{
                    bg: 'blue.700',
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s"
                >
                  Sign In
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
