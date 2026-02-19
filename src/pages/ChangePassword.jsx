import React, { useState } from 'react';
import {
  Box,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  VStack,
  Text,
  InputGroup,
  InputRightElement,
  IconButton,
  Icon,
  useColorModeValue,
  Divider,
  HStack,
  List,
  ListItem,
  ListIcon,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiShield, FiAlertCircle } from 'react-icons/fi';

export default function ChangePassword() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.900');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Security Updated',
        description: "Your password has been successfully updated.",
        status: 'success',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
    }, 1500);
  };

  return (
    <Box maxW="1000px" mx="auto">
      {/* Header */}
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" fontWeight="extrabold" letterSpacing="tight">
          Security Settings
        </Heading>
        <Text color="gray.500">Update your password regularly to keep your account safe.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, lg: 5 }} spacing={8}>
        {/* Left Side: Instructions */}
        <Box gridColumn={{ lg: "span 2" }}>
          <VStack align="stretch" spacing={6}>
            <Box p={6} bg="orange.50" border="1px solid" borderColor="orange.100" rounded="2xl" color="orange.800">
              <HStack mb={3}>
                <Icon as={FiAlertCircle} />
                <Text fontWeight="bold" fontSize="sm">Password Requirements</Text>
              </HStack>
              <List spacing={2}>
                <ListItem fontSize="xs" display="flex" alignItems="center">
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  At least 8 characters long
                </ListItem>
                <ListItem fontSize="xs" display="flex" alignItems="center">
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Include one uppercase letter
                </ListItem>
                <ListItem fontSize="xs" display="flex" alignItems="center">
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Include one special character
                </ListItem>
                <ListItem fontSize="xs" display="flex" alignItems="center">
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Different from last password
                </ListItem>
              </List>
            </Box>

            <Box p={6} bg={cardBg} border="1px solid" borderColor={borderColor} rounded="2xl" shadow="sm">
              <VStack align="start" spacing={3}>
                <HStack color="blue.500">
                  <Icon as={FiShield} />
                  <Text fontWeight="bold" fontSize="sm">Privacy Tip</Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Avoid using common words or birthday dates. Always use a combination of numbers and symbols.
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>

        {/* Right Side: Form */}
        <Box 
          gridColumn={{ lg: "span 3" }} 
          p={{ base: 6, md: 8 }} 
          bg={cardBg} 
          shadow="sm" 
          rounded="3xl" 
          border="1px solid" 
          borderColor={borderColor}
        >
          <Stack spacing={6} as="form" onSubmit={handlePasswordChange}>
            <HStack color="blue.500" mb={2}>
              <Icon as={FiLock} />
              <Text fontWeight="bold" fontSize="sm" textTransform="uppercase" letterSpacing="widest">Change Account Password</Text>
            </HStack>

            <FormControl isRequired>
              <FormLabel fontWeight="700" color="gray.600" fontSize="xs">CURRENT PASSWORD</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showOld ? 'text' : 'password'}
                  placeholder="Enter current password"
                  borderRadius="xl"
                  bg={inputBg}
                  border="0"
                  focusBorderColor="blue.500"
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    onClick={() => setShowOld(!showOld)}
                    icon={showOld ? <FiEyeOff /> : <FiEye />}
                    aria-label="Toggle password"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Divider />

            <FormControl isRequired>
              <FormLabel fontWeight="700" color="gray.600" fontSize="xs">NEW PASSWORD</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Create strong password"
                  borderRadius="xl"
                  bg={inputBg}
                  border="0"
                  focusBorderColor="blue.500"
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    onClick={() => setShowNew(!showNew)}
                    icon={showNew ? <FiEyeOff /> : <FiEye />}
                    aria-label="Toggle password"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="700" color="gray.600" fontSize="xs">CONFIRM NEW PASSWORD</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  borderRadius="xl"
                  bg={inputBg}
                  border="0"
                  focusBorderColor="blue.500"
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    onClick={() => setShowConfirm(!showConfirm)}
                    icon={showConfirm ? <FiEyeOff /> : <FiEye />}
                    aria-label="Toggle password"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Box pt={4}>
              <Button 
                type="submit" 
                colorScheme="blue" 
                size="lg" 
                width="full" 
                borderRadius="2xl" 
                shadow="blue-md"
                isLoading={loading}
                loadingText="Updating Security..."
                _hover={{ transform: 'translateY(-2px)', shadow: 'blue-lg' }}
              >
                Apply New Password
              </Button>
            </Box>
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
