import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
} from '@chakra-ui/react';
import { FiUser, FiMail, FiPhone, FiCamera, FiCheck, FiShield, FiBriefcase, FiEdit2, FiUpload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadProfilePicture } from '../apis/employee';

export default function Profile() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    location: '',
    workingArea: ''
  });
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        designation: user.designation || '',
        location: user.location || '',
        workingArea: user.workingArea || ''
      });
    }
  }, [user]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.900');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
      onOpen();
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!selectedFile) return;
    
    setUploadLoading(true);
    try {
      const response = await uploadProfilePicture(user.id, selectedFile);
      const updatedUser = { ...user, profilePicture: response.profilePicture };
      login(updatedUser, localStorage.getItem('managerToken'));
      
      toast({
        title: 'Profile Picture Updated!',
        description: 'Your profile picture has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload profile picture',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(user.id, formData);
      const updatedUser = { ...user, ...formData };
      login(updatedUser, localStorage.getItem('managerToken'));
      setIsEditing(false);
      toast({
        title: 'Profile Updated!',
        description: 'Your changes have been saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="1000px" mx="auto">
      {/* Page Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" fontWeight="extrabold" letterSpacing="tight">
            My Profile
          </Heading>
          <Text color="gray.500">Manage your personal information and account settings.</Text>
        </VStack>
        {!isEditing && (
          <Button
            leftIcon={<FiEdit2 />}
            colorScheme="blue"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </Flex>

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
                  name={user?.name || 'Manager'} 
                  src={user?.profilePicture}
                  border="4px solid white"
                  shadow="lg"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
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
                  onClick={handleCameraClick}
                />
              </Box>
              
              <VStack spacing={2}>
                <Heading size="lg" fontWeight="800" color={useColorModeValue('gray.800', 'white')}>
                  {user?.name || 'Manager'}
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
                  {user?.role?.toUpperCase() || 'MANAGER'}
                </Badge>
              </VStack>

              <Divider my={6} />

              <VStack align="start" spacing={4} w="full">
                <HStack color="gray.500" spacing={3}>
                  <Icon as={FiShield} />
                  <Text fontSize="sm" fontWeight="medium">Manager Portal</Text>
                </HStack>
                <HStack color="gray.500" spacing={3}>
                  <Icon as={FiBriefcase} />
                  <Text fontSize="sm" fontWeight="medium">{user?.designation || 'Manager'}</Text>
                </HStack>
                {user?.location && (
                  <HStack color="gray.500" spacing={3}>
                    <Icon as={FiMail} />
                    <Text fontSize="sm" fontWeight="medium">{user.location}</Text>
                  </HStack>
                )}
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
                <FormControl isRequired gridColumn={{ md: "span 2" }}>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">FULL NAME</FormLabel>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                    readOnly={!isEditing}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">EMAIL ADDRESS</FormLabel>
                  <Input 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    type="email" 
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                    readOnly={!isEditing}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">PHONE NUMBER</FormLabel>
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                    readOnly={!isEditing}
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
                    value={formData.designation} 
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                    readOnly={!isEditing}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">ROLE</FormLabel>
                  <Input 
                    value={user?.role || ''} 
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                    readOnly
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">LOCATION</FormLabel>
                  <Input 
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., New Delhi, India"
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                    readOnly={!isEditing}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="700" color="gray.600" fontSize="xs">WORKING AREA</FormLabel>
                  <Input 
                    value={formData.workingArea} 
                    onChange={(e) => setFormData({...formData, workingArea: e.target.value})}
                    placeholder="e.g., North Delhi"
                    borderRadius="xl" 
                    bg={inputBg} 
                    h="50px" 
                    focusBorderColor="blue.500" 
                    border="0"
                    readOnly={!isEditing}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            {isEditing && (
              <Flex justify="space-between" pt={4}>
                <Button 
                  variant="outline"
                  colorScheme="gray"
                  size="lg" 
                  px={10} 
                  borderRadius="2xl"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      designation: user?.designation || '',
                      location: user?.location || '',
                      workingArea: user?.workingArea || ''
                    });
                  }}
                >
                  Cancel
                </Button>
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
                  Save Changes
                </Button>
              </Flex>
            )}
          </Stack>
        </Box>
      </SimpleGrid>

      {/* Profile Picture Upload Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" overflow="hidden">
          <ModalHeader bg="blue.500" color="white" textAlign="center">
            <Icon as={FiCamera} mr={2} />
            Update Profile Picture
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={8}>
            <VStack spacing={6}>
              {previewUrl && (
                <Box>
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    boxSize="200px"
                    objectFit="cover"
                    borderRadius="full"
                    border="4px solid"
                    borderColor="blue.100"
                    shadow="lg"
                  />
                </Box>
              )}
              
              <Text textAlign="center" color="gray.600" fontSize="sm">
                This will be your new profile picture. Make sure it's clear and professional.
              </Text>
              
              <HStack spacing={4} w="full">
                <Button
                  variant="outline"
                  colorScheme="gray"
                  flex={1}
                  borderRadius="xl"
                  onClick={() => {
                    onClose();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  flex={1}
                  borderRadius="xl"
                  leftIcon={<FiUpload />}
                  isLoading={uploadLoading}
                  loadingText="Uploading..."
                  onClick={handleUploadProfilePicture}
                  shadow="blue-md"
                  _hover={{ transform: 'translateY(-1px)', shadow: 'blue-lg' }}
                >
                  Upload
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
