import React, { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Text,
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Stack,
  useToast,
  Flex,
  Icon,
  Divider,
  HStack,
  Badge,
  useColorModeValue,
  AvatarBadge,
  IconButton,
} from '@chakra-ui/react';
import { FiUser, FiMail, FiPhone, FiCamera, FiCheck, FiShield, FiBriefcase } from 'react-icons/fi';

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.900');

  const handleUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Profile Updated Successfully!',
        description: "Your changes have been saved to the cloud.",
        status: 'success',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
    }, 1500);
  };

  return (
    <Box maxW="1000px" mx="auto">
      {/* Page Header */}
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" fontWeight="extrabold" letterSpacing="tight">
          My Profile
        </Heading>
        <Text color="gray.500">Manage your personal information and account settings.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
        {/* Left Column: Profile Card */}
        <Box gridColumn={{ lg: "span 1" }}>
          <VStack spacing={6} align="stretch">
            <Box 
              bg={cardBg} 
              p={10} 
              shadow="sm" 
              rounded="3xl" 
              border="1px solid" 
              borderColor={borderColor} 
              textAlign="center"
            >
              <Box position="relative" display="inline-block" mb={6}>
                <Avatar 
                  size="2xl" 
                  name="John Doe" 
                  src="https://images.unsplash.com/photo-1619946769363-107a671448b7?auto=format&fit=crop&w=256&q=80"
                  border="4px solid white"
                  shadow="lg"
                />
                <IconButton
                  aria-label="Change photo"
                  icon={<FiCamera />}
                  size="md"
                  colorScheme="blue"
                  rounded="full"
                  position="absolute"
                  bottom="1"
                  right="1"
                  shadow="xl"
                  border="4px solid white"
                  _hover={{ transform: 'scale(1.1)' }}
                  transition="0.2s"
                />
              </Box>
              
              <VStack spacing={2}>
                <Heading size="lg" fontWeight="800" color={useColorModeValue('gray.800', 'white')}>
                  John Doe
                </Heading>
                <Badge 
                  colorScheme="blue" 
                  variant="solid" 
                  px={4} 
                  py={1} 
                  rounded="full" 
                  fontSize="XS"
                  letterSpacing="wider"
                >
                  ADMINISTRATOR
                </Badge>
              </VStack>

              <Divider my={6} />

              <VStack align="start" spacing={4} w="full">
                <HStack color="gray.500" spacing={3}>
                  <Icon as={FiShield} />
                  <Text fontSize="sm" fontWeight="medium">Super Admin Portal</Text>
                </HStack>
                <HStack color="gray.500" spacing={3}>
                  <Icon as={FiBriefcase} />
                  <Text fontSize="sm" fontWeight="medium">Project Manager</Text>
                </HStack>
              </VStack>
            </Box>

            <Box bg="blue.500" p={6} rounded="3xl" color="white" shadow="blue-xl">
              <Text fontWeight="bold" fontSize="sm" mb={1}>Account Security</Text>
              <Text fontSize="xs" opacity={0.9} mb={4}>Your account security is 85%. Enable 2FA to improve it.</Text>
              <Button size="sm" colorScheme="whiteAlpha" bg="white" color="blue.500" borderRadius="xl">Enable 2FA</Button>
            </Box>
          </VStack>
        </Box>

        {/* Right Column: Profile Form */}
        <Box 
          gridColumn={{ lg: "span 2" }}
          bg={cardBg} 
          p={{ base: 6, md: 10 }} 
          shadow="sm" 
          rounded="3xl" 
          border="1px solid" 
          borderColor={borderColor}
        >
          <Stack spacing={8} as="form" onSubmit={handleUpdate}>
            <Box>
              <HStack mb={6} spacing={2} color="blue.500">
                <Icon as={FiUser} />
                <Text fontWeight="bold" fontSize="sm" textTransform="uppercase" letterSpacing="widest">Personal Details</Text>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">FIRST NAME</FormLabel>
                  <Input 
                    defaultValue="John" 
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">LAST NAME</FormLabel>
                  <Input 
                    defaultValue="Doe" 
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">EMAIL ADDRESS</FormLabel>
                  <Input 
                    defaultValue="john.doe@managerpro.com" 
                    type="email" 
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">PHONE NUMBER</FormLabel>
                  <Input 
                    defaultValue="+91 98765 43210" 
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider />

            <Box>
              <HStack mb={6} spacing={2} color="blue.500">
                <Icon as={FiBriefcase} />
                <Text fontWeight="bold" fontSize="sm" textTransform="uppercase" letterSpacing="widest">Professional Info</Text>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">DESIGNATION</FormLabel>
                  <Input 
                    defaultValue="Project Manager" 
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">DEPARTMENT</FormLabel>
                  <Input 
                    defaultValue="Administration" 
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            <Flex justify="flex-end" pt={4}>
              <Button 
                type="submit" 
                colorScheme="blue" 
                size="lg" 
                px={10} 
                borderRadius="2xl" 
                leftIcon={<FiCheck />}
                isLoading={loading}
                shadow="blue-md"
                _hover={{ transform: 'translateY(-2px)', shadow: 'blue-lg' }}
              >
                Save Profile
              </Button>
            </Flex>
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
