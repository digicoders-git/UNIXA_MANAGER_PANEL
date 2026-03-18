import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  Icon,
  Badge,
  Button,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Avatar,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
} from '@chakra-ui/react';
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaShieldAlt,
  FaHistory,
  FaChevronLeft,
  FaRocket,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from 'react-icons/fa';
import http, { getMediaUrl } from '../apis/http';

const InfoCard = ({ title, value, icon: IconComponent, color }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      px={6}
      py={5}
      shadow="sm"
      border="1px solid"
      borderColor={borderColor}
      rounded="2xl"
      bg={bg}
    >
      <Flex align="center">
        <Flex
          w={10}
          h={10}
          bg={`${color}.50`}
          color={`${color}.500`}
          rounded="xl"
          align="center"
          justify="center"
          mr={4}
        >
          <Icon as={IconComponent} w={5} h={5} />
        </Flex>
        <Box>
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" mb={1}>
            {title}
          </Text>
          <Text fontSize="md" fontWeight="bold">
            {value}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default function UserHistory() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const tableHeadBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userAmcs, setUserAmcs] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Assignment Modal State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAmc, setSelectedAmc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchUserData();
    fetchEmployees();
  }, [userId]);

  const fetchEmployees = async () => {
    try {
      const { data } = await http.get('/employees');
      setEmployees(data.filter(emp => emp.role !== 'Manager'));
    } catch (err) {
      console.error("Error fetching employees", err);
    }
  };

  const handleOpenAssign = (amc) => {
    setSelectedAmc(amc);
    onOpen();
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignmentData.employee) {
      toast({ title: 'Please select an employee', status: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const customerDetails = {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phone || 'Customer',
        phone: user.phone || 'N/A',
        address: user.address || 'N/A'
      };

      await http.post('/assigned-tickets', {
        ticketType: 'service_request',
        title: `Extra Service - ${customerDetails.name}`,
        description: `Extra service requested. AMC: ${selectedAmc.amcPlanName}. ${assignmentData.notes}`,
        assignedBy: 'Manager',
        assignedTo: assignmentData.employee,
        amcId: selectedAmc._id,
        userId: user._id,
        dueDate: assignmentData.date,
        visitType: 'SERVICE_REQUEST', 
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        address: customerDetails.address
      });

      toast({ title: 'Service assigned successfully', status: 'success' });
      onClose();
      // Refresh tickets
      fetchUserData();
    } catch (err) {
      console.error("Error assigning service", err);
      toast({ title: 'Assignment failed', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUserData = async () => {
    if (!userId || userId === 'undefined') {
      setLoading(false);
      toast({ title: 'Invalid User ID', status: 'error' });
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching history for identifier:', userId);
      
      const { data } = await http.get(`/manager-dashboard/user-amcs`);
      const allAmcs = data.amcs || [];
      
      const filteredAmcs = allAmcs.filter(amc => {
        const mongoId = amc.userId?._id || (typeof amc.userId === 'string' ? amc.userId : null);
        const phone = amc.customerPhone || amc.userId?.phone;
        
        return String(mongoId) === String(userId) || String(phone) === String(userId);
      });
      
      console.log('Filtered AMCs for user:', filteredAmcs);
      
      if (filteredAmcs.length > 0) {
        // Use the most complete user object available
        const userObj = filteredAmcs[0].userId || {
          firstName: filteredAmcs[0].customerPhone || 'Offline',
          lastName: 'Customer',
          phone: filteredAmcs[0].customerPhone,
          email: '',
          profilePicture: ''
        };
        setUser({
          ...userObj,
          profilePicture: getMediaUrl(userObj.profilePicture)
        });
        setUserAmcs(filteredAmcs);
      } else {
        // If no AMCs found, we might need another way to get user details
        // For now, let's try to get all users or at least notify
        // But since we are coming from AMC Management, they should have AMCs
        toast({
          title: 'User not found',
          description: 'No AMC records found for this user',
          status: 'warning',
          duration: 3000,
        });
      }

      // Fetch service requests for this user if endpoint exists
      try {
        const srRes = await http.get(`/assigned-tickets`);
        const allSr = srRes.data || [];
        const userSr = allSr.filter(sr => sr.userId === userId || sr.userId?._id === userId);
        setServiceRequests(userSr);
      } catch (e) {
        console.error("Error fetching service requests", e);
      }

    } catch (err) {
      console.error('Error fetching user data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load user history',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="80vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h="80vh" flexDirection="column">
        <Heading size="md" mb={4}>User Data Not Found</Heading>
        <Button leftIcon={<FaChevronLeft />} onClick={() => navigate(-1)}>Go Back</Button>
      </Center>
    );
  }

  return (
    <Box pb={10}>
      <HStack mb={6} justify="space-between">
        <VStack align="start" spacing={1}>
          <Breadcrumb fontSize="sm" color="gray.500">
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/amc-management')}>AMC Management</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>User History</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading size="lg" fontWeight="extrabold">
            Customer Profile & History
          </Heading>
        </VStack>
        <Button 
          leftIcon={<FaChevronLeft />} 
          variant="outline" 
          onClick={() => navigate(-1)}
          rounded="xl"
        >
          Back
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
        {/* User Profile Card */}
        <Box 
          bg={bg} 
          p={8} 
          rounded="3xl" 
          shadow="sm" 
          border="1px solid" 
          borderColor={borderColor}
          gridColumn={{ lg: "span 1" }}
        >
          <VStack spacing={6}>
            <Avatar 
              size="2xl" 
              name={`${user.firstName} ${user.lastName}`} 
              src={user.profilePicture}
              border="4px solid"
              borderColor="blue.500"
            />
            <VStack spacing={1}>
              <Heading size="md">{user.firstName} {user.lastName}</Heading>
            {(user._id || user.phone) && (
              <Badge colorScheme="blue" variant="subtle" px={3} py={1} rounded="full">
                Customer ID: {String(user._id || user.phone).slice(-6).toUpperCase()}
              </Badge>
            )}
            </VStack>
            
            <Divider />
            
            <VStack align="start" w="full" spacing={4}>
              <HStack>
                <Icon as={FaPhone} color="blue.500" />
                <Text fontSize="sm" fontWeight="medium">{user.phone}</Text>
              </HStack>
              
              {user.email && (
                <HStack>
                  <Icon as={FaEnvelope} color="blue.500" />
                  <Text fontSize="sm" fontWeight="medium">{user.email}</Text>
                </HStack>
              )}
              
              {user.address && (
                <HStack align="start">
                  <Icon as={FaMapMarkerAlt} color="blue.500" mt={1} />
                  <Text fontSize="sm" fontWeight="medium">{user.address}</Text>
                </HStack>
              )}
              
              {user.createdAt && !isNaN(new Date(user.createdAt).getTime()) && (
                <HStack>
                  <Icon as={FaCalendarAlt} color="blue.500" />
                  <Text fontSize="sm" fontWeight="medium">
                    Member since: {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </HStack>
              )}
            </VStack>
          </VStack>
        </Box>

        {/* Stats Column */}
        <Box gridColumn={{ lg: "span 2" }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <InfoCard title="Total AMCs" value={userAmcs.length} icon={FaShieldAlt} color="blue" />
            <InfoCard title="Active Plans" value={userAmcs.filter(a => a.status === 'Active').length} icon={FaCheckCircle} color="green" />
            <InfoCard title="Service Requests" value={serviceRequests.length} icon={FaRocket} color="orange" />
            <InfoCard title="Pending Services" value={serviceRequests.filter(s => s.status === 'Pending').length} icon={FaClock} color="red" />
          </SimpleGrid>

          {/* AMC History Table */}
          <Box bg={bg} p={6} rounded="3xl" shadow="sm" border="1px solid" borderColor={borderColor}>
            <HStack mb={4} justify="space-between">
              <Heading size="sm" display="flex" alignItems="center" gap={2}>
                <Icon as={FaShieldAlt} color="blue.500" />
                AMC Subscriptions
              </Heading>
            </HStack>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>Plan</Th>
                    <Th>Status</Th>
                    <Th>Expiry</Th>
                     <Th>Services</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {userAmcs.map(amc => (
                    <Tr key={amc._id}>
                      <Td fontWeight="medium">
                        <VStack align="start" spacing={0}>
                          <Text>{amc.productName}</Text>
                          <Text fontSize="xs" color="gray.500">{amc.productId?.name}</Text>
                        </VStack>
                      </Td>
                      <Td>{amc.amcPlanName}</Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Badge colorScheme={amc.status === 'Active' ? 'green' : 'red'}>
                            {amc.status}
                          </Badge>
                          {amc.status === 'Active' && amc.nextServiceDueDate && new Date(amc.nextServiceDueDate) <= new Date() && (
                            <Badge colorScheme="orange" variant="solid" fontSize="10px">
                              SERVICE DUE
                            </Badge>
                          )}
                        </VStack>
                      </Td>
                      <Td>{new Date(amc.endDate).toLocaleDateString()}</Td>
                      <Td>{amc.servicesUsed || 0}/{amc.servicesTotal || 4}</Td>
                      <Td>
                        <Button 
                          size="xs" 
                          colorScheme="purple" 
                          leftIcon={<Icon as={FaRocket} />}
                          onClick={() => handleOpenAssign(amc)}
                          isDisabled={amc.status !== 'Active'}
                        >
                          Service
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </SimpleGrid>

      {/* Service Request History */}
      <Box bg={bg} p={8} rounded="3xl" shadow="sm" border="1px solid" borderColor={borderColor}>
        <HStack mb={6} justify="space-between">
          <Heading size="md" display="flex" alignItems="center" gap={2}>
            <Icon as={FaHistory} color="orange.500" />
            Service History & Tickets
          </Heading>
        </HStack>
        
        {serviceRequests.length === 0 ? (
          <Center py={10} flexDirection="column">
            <Icon as={FaHistory} w={10} h={10} color="gray.200" mb={4} />
            <Text color="gray.500">No service history found for this user.</Text>
          </Center>
        ) : (
          <TableContainer>
            <Table variant="simple">
              <Thead bg={tableHeadBg}>
                <Tr>
                  <Th>Ticket ID</Th>
                  <Th>Title/Description</Th>
                  <Th>Date</Th>
                  <Th>Assigned To</Th>
                  <Th>Status</Th>
                  <Th>Priority</Th>
                </Tr>
              </Thead>
              <Tbody>
                {serviceRequests.map(sr => (
                  <Tr key={sr._id} _hover={{ bg: hoverBg }}>
                    <Td fontSize="xs" fontWeight="bold">#{sr._id?.slice(-6).toUpperCase()}</Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm">{sr.title}</Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>{sr.description}</Text>
                      </VStack>
                    </Td>
                    <Td fontSize="sm">{new Date(sr.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <Badge variant="outline" colorScheme="purple">{sr.assignedTo || 'Unassigned'}</Badge>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={
                          sr.status === 'Completed' ? 'green' : 
                          sr.status === 'Pending' ? 'yellow' : 'blue'
                        }
                      >
                        {sr.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={
                          sr.priority === 'High' ? 'red' : 
                          sr.priority === 'Medium' ? 'orange' : 'green'
                        }
                      >
                        {sr.priority}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>
      {/* Assignment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.400" />
        <ModalContent rounded="2xl" border="1px solid" borderColor={borderColor} shadow="2xl">
          <form onSubmit={handleAssignSubmit}>
            <ModalHeader borderBottom="1px solid" borderColor={borderColor} py={4}>
              <HStack spacing={3}>
                <Flex w={8} h={8} bg="purple.50" color="purple.500" rounded="lg" align="center" justify="center">
                  <Icon as={FaRocket} />
                </Flex>
                <VStack align="start" spacing={0}>
                  <Text fontSize="md">Assign Ad-hoc Service</Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="normal">This will NOT count towards AMC quota</Text>
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton mt={2} />
            <ModalBody py={6}>
              <VStack spacing={4}>
                {selectedAmc && (
                  <Box w="full" p={3} bg="gray.50" rounded="xl" fontSize="sm">
                    <HStack justify="space-between" mb={1}>
                      <Text color="gray.500">Product:</Text>
                      <Text fontWeight="bold">{selectedAmc.productName}</Text>
                    </HStack>
                    <HStack justify="space-between" mb={1}>
                      <Text color="gray.500">Plan:</Text>
                      <Text fontWeight="bold">{selectedAmc.amcPlanName}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">Quota Used:</Text>
                      <Text fontWeight="bold">{selectedAmc.servicesUsed || 0}/{selectedAmc.servicesTotal || 4}</Text>
                    </HStack>
                  </Box>
                )}

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Assign Employee</FormLabel>
                  <Select 
                    placeholder="Select technician" 
                    rounded="xl"
                    value={assignmentData.employee}
                    onChange={(e) => setAssignmentData({...assignmentData, employee: e.target.value})}
                  >
                    {employees.map(emp => (
                      <option key={emp._id} value={emp.name}>{emp.name} ({emp.department})</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Service Date</FormLabel>
                  <Input 
                    type="date" 
                    rounded="xl"
                    value={assignmentData.date}
                    onChange={(e) => setAssignmentData({...assignmentData, date: e.target.value})}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Special Notes</FormLabel>
                  <Textarea 
                    placeholder="Any specific instructions for the technician..." 
                    rounded="xl"
                    fontSize="sm"
                    value={assignmentData.notes}
                    onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3} pb={6}>
              <Button variant="ghost" onClick={onClose} rounded="xl">Cancel</Button>
              <Button 
                type="submit" 
                colorScheme="purple" 
                rounded="xl" 
                px={8}
                isLoading={isSubmitting}
              >
                Assign Service
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}
