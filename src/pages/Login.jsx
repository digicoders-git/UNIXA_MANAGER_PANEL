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
      console.log('🔄 Login attempt:', { email, apiUrl: import.meta.env.VITE_API_BASE_URL });
      
      const response = await http.post('/api/employees/login', {
        email,
        password
      });

      console.log('✅ Response:', response.data);

      if (response.data.token) {
        login(response.data.user, response.data.token);
        toast({
          title: 'Login Successful',
          description: `Welcome ${response.data.user.name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      const errorMsg = error.response?.data?.message || error.message || 'Invalid email or password';
      
      toast({
        title: 'Login Failed',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      alert(`❌ Login Failed\n\nError: ${errorMsg}\n\nCheck console (F12) for details`);
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
                  autoComplete="email"
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
                    autoComplete="current-password"
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
