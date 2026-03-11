import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Input,
  Select,
  HStack,
  VStack,
  Flex,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Textarea
} from '@chakra-ui/react';
import { FaShieldAlt, FaSearch, FaUser, FaPhone, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaSms } from 'react-icons/fa';
import { Bell } from 'lucide-react';
import http from '../apis/http';
import Swal from 'sweetalert2';

const StatCard = ({ title, value, icon: IconComponent, color }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Stat
      px={6}
      py={5}
      shadow="sm"
      border="1px solid"
      borderColor={borderColor}
      rounded="2xl"
      bg={bg}
    >
      <Flex justifyContent="space-between" align="center">
        <Box>
          <StatLabel fontWeight="semibold" color="gray.500" fontSize="sm">
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">
            {value}
          </StatNumber>
        </Box>
        <Flex
          w={12}
          h={12}
          bg={`${color}.50`}
          color={`${color}.500`}
          rounded="xl"
          align="center"
          justify="center"
        >
          <Icon as={IconComponent} w={6} h={6} />
        </Flex>
      </Flex>
    </Stat>
  );
};

export default function AMCManagement() {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [userAmcs, setUserAmcs] = useState([]);
  const [dueAmcs, setDueAmcs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, revenue: 0, dueServices: 0 });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAmc, setSelectedAmc] = useState(null);
  const [assignmentData, setAssignmentData] = useState({ employee: '', priority: 'Medium', date: new Date().toISOString().split('T')[0], desc: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserAmcs();
    fetchDueAmcs();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await http.get('/employees');
      setEmployees(data.filter(emp => emp.role !== 'Manager'));
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchUserAmcs = async () => {
    setLoading(true);
    try {
      const { data } = await http.get('/manager-dashboard/user-amcs');
      console.log('User AMCs Response:', data);
      const amcs = data.amcs || [];
      setUserAmcs(amcs);

      // Calculate stats
      let activeCount = 0;
      let expiredCount = 0;
      let expiringSoonCount = 0;
      let totalRevenue = 0;

      amcs.forEach(a => {
        const isDateExpired = new Date(a.endDate) < new Date();
        const isServicesExhausted = (a.servicesUsed || 0) >= (a.servicesTotal || 4);
        const isActuallyExpired = a.status === 'Expired' || isDateExpired || isServicesExhausted;

        const daysLeft = Math.ceil((new Date(a.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        const servicesRemaining = (a.servicesTotal || 4) - (a.servicesUsed || 0);

        if (isActuallyExpired) {
          expiredCount++;
        } else if (a.status === 'Active') {
          activeCount++;
          // Expiring soon if: date within 30 days OR only 1 service remaining
          if ((daysLeft > 0 && daysLeft <= 30) || (servicesRemaining === 1)) {
            expiringSoonCount++;
          }
        }
        totalRevenue += (a.amcPlanPrice || 0);
      });

      setStats(prev => ({
        ...prev,
        total: amcs.length,
        active: activeCount,
        expired: expiredCount,
        expiringSoon: expiringSoonCount,
        revenue: totalRevenue
      }));
    } catch (err) {
      console.error('Error fetching user AMCs:', err);
      toast({
        title: 'Error',
        description: 'Failed to load AMC data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDueAmcs = async () => {
    try {
      const { data } = await http.get('/manager-dashboard/due-amcs');
      setDueAmcs(data.amcs || []);
      setStats(prev => ({
        ...prev,
        dueServices: (data.amcs || []).length
      }));
    } catch (err) {
      console.error("Error fetching due AMCs:", err);
    }
  };

  const handleOpenAssign = (amc) => {
    setSelectedAmc(amc);
    setAssignmentData({
      employee: '',
      priority: 'Medium',
      date: new Date().toISOString().split('T')[0],
      desc: `Regular AMC Service #${amc.nextServiceNumber || amc.servicesUsed + 1} for ${amc.productName}.`
    });
    onOpen();
  };

  const handleAssignSubmit = async () => {
    if (!assignmentData.employee) {
      toast({ title: 'Please select an employee', status: 'warning', duration: 2000 });
      return;
    }

    setIsSubmitting(true);
    try {
      const managerData = JSON.parse(localStorage.getItem('manager-data') || '{}');
      await http.post('/assigned-tickets', {
        title: `AMC Service - ${selectedAmc.userId?.firstName} ${selectedAmc.userId?.lastName}`,
        ticketType: 'service_request',
        customerName: `${selectedAmc.userId?.firstName} ${selectedAmc.userId?.lastName}`,
        customerPhone: selectedAmc.userId?.phone,
        customerEmail: selectedAmc.userId?.email,
        description: assignmentData.desc,
        priority: assignmentData.priority,
        status: 'Pending',
        assignedBy: managerData.name || 'Manager',
        assignedTo: assignmentData.employee,
        amcId: selectedAmc._id,
        userId: selectedAmc.userId?._id,
        dueDate: assignmentData.date
      });

      toast({ title: 'Service ticket assigned successfully', status: 'success', duration: 3000 });
      onClose();
      fetchDueAmcs();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({ title: 'Failed to assign ticket', status: 'error', duration: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotifyUser = async (amc) => {
    const servicesRemaining = (amc.servicesTotal || 4) - (amc.servicesUsed || 0);
    const isServicesExhausted = servicesRemaining === 0;
    const daysLeft = Math.ceil((new Date(amc.endDate) - new Date()) / (1000 * 60 * 60 * 24));

    let defaultMessage = '';
    if (amc.nextServiceNumber) {
      defaultMessage = `Dear ${amc.userId?.firstName}, your scheduled AMC Service visit #${amc.nextServiceNumber} for ${amc.productName} is now due. Our technician will contact you shortly for the site visit.`;
    } else if (isServicesExhausted) {
      defaultMessage = `Dear ${amc.userId?.firstName}, your AMC for ${amc.productName} has exhausted all ${amc.servicesTotal} services. Please renew to continue enjoying our services. Contact us for renewal.`;
    } else if (servicesRemaining === 1) {
      defaultMessage = `Dear ${amc.userId?.firstName}, your AMC for ${amc.productName} has only 1 service remaining out of ${amc.servicesTotal}. Consider renewing soon to avoid service interruption.`;
    } else if (daysLeft <= 30) {
      defaultMessage = `Dear ${amc.userId?.firstName}, your AMC for ${amc.productName} is expiring in ${daysLeft} days. Renew now to continue uninterrupted service.`;
    }

    const result = await Swal.fire({
      title: 'Notify Customer',
      html: `
        <div style="text-align: left; margin-bottom: 1rem; font-size: 14px;">
          <p><strong>Customer:</strong> ${amc.userId?.firstName} ${amc.userId?.lastName}</p>
          <p><strong>Phone:</strong> ${amc.userId?.phone}</p>
          <p><strong>Product:</strong> ${amc.productName}</p>
          <p><strong>Services:</strong> ${amc.servicesUsed}/${amc.servicesTotal} used (${servicesRemaining} left)</p>
        </div>
        <textarea 
          id="notify-message" 
          style="width: 100%; padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 13px;"
          rows="5"
          placeholder="Enter notification message..."
        >${defaultMessage}</textarea>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Send SMS',
      denyButtonText: 'Call Customer',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#38A169',
      denyButtonColor: '#3182CE',
      preConfirm: () => {
        const message = document.getElementById('notify-message').value;
        if (!message) {
          Swal.showValidationMessage('Please enter a message');
        }
        return { message, action: 'sms' };
      },
      preDeny: () => {
        return { action: 'call' };
      }
    });

    if (result.isConfirmed) {
      try {
        await http.post('/sms/send', {
          mobile: amc.userId?.phone,
          message: result.value.message
        });

        await http.post('/notifications/user-notifications', {
          userId: amc.userId?._id,
          title: 'AMC Renewal Reminder',
          message: result.value.message,
          type: 'AMC'
        });

        Swal.fire('Sent!', 'SMS and notification sent successfully', 'success');
      } catch (err) {
        console.error('Failed to send notification:', err);
        Swal.fire('Error', 'Failed to send notification: ' + (err.response?.data?.message || 'Server Error'), 'error');
      }
    } else if (result.isDenied) {
      window.location.href = `tel:${amc.userId?.phone}`;
    }
  };

  const filteredAmcs = statusFilter === 'Due for Service' ? dueAmcs : userAmcs.filter(amc => {
    const isDateExpired = new Date(amc.endDate) < new Date();
    const isServicesExhausted = (amc.servicesUsed || 0) >= (amc.servicesTotal || 4);
    const actualStatus = (amc.status === 'Expired' || isDateExpired || isServicesExhausted) ? 'Expired' : amc.status;

    const daysLeft = Math.ceil((new Date(amc.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    const servicesRemaining = (amc.servicesTotal || 4) - (amc.servicesUsed || 0);
    const isExpiringSoon = actualStatus === 'Active' && (daysLeft > 0 && daysLeft <= 30 || servicesRemaining === 1);

    let matchesStatus = false;
    if (statusFilter === 'All') {
      matchesStatus = true;
    } else if (statusFilter === 'Expiring Soon') {
      matchesStatus = isExpiringSoon;
    } else {
      matchesStatus = actualStatus === statusFilter;
    }

    const matchesSearch =
      amc.productName?.toLowerCase().includes(search.toLowerCase()) ||
      amc.amcPlanName?.toLowerCase().includes(search.toLowerCase()) ||
      amc.userId?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      amc.userId?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      amc.userId?.phone?.includes(search);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <Center h="80vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box>
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" fontWeight="extrabold" letterSpacing="tight" display="flex" alignItems="center" gap={2}>
          <Icon as={FaShieldAlt} color="green.500" />
          User AMC Management
        </Heading>
        <Text color="gray.500">Monitor and manage customer AMC subscriptions.</Text>
      </VStack>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={8}>
        <StatCard title="Total AMCs" value={stats.total} icon={FaShieldAlt} color="blue" />
        <StatCard title="Active" value={stats.active} icon={FaCheckCircle} color="green" />
        <StatCard title="Expired" value={stats.expired} icon={FaTimesCircle} color="red" />
        <StatCard title="Due Service" value={stats.dueServices} icon={FaClock} color="orange" />
        <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={FaClock} color="yellow" />
        <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={FaCalendarAlt} color="purple" />
      </SimpleGrid>

      {/* Filters */}
      <Box bg={bg} p={6} rounded="2xl" shadow="sm" border="1px solid" borderColor={borderColor} mb={6}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} justify="space-between">
          <HStack spacing={2} flexWrap="wrap">
            {['All', 'Active', 'Due for Service', 'Expiring Soon', 'Expired', 'Cancelled'].map(status => (
              <Box
                key={status}
                as="button"
                onClick={() => setStatusFilter(status)}
                px={4}
                py={2}
                fontSize="sm"
                rounded="md"
                transition="all 0.2s"
                mb={2}
                bg={statusFilter === status ? 'blue.500' : 'transparent'}
                color={statusFilter === status ? 'white' : 'gray.600'}
                _hover={{ bg: statusFilter === status ? 'blue.600' : 'gray.100' }}
              >
                {status}
              </Box>
            ))}
          </HStack>

          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by name, phone, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Flex>
      </Box>

      {/* Table */}
      <Box bg={bg} rounded="2xl" shadow="sm" border="1px solid" borderColor={borderColor} overflow="hidden">
        <TableContainer>
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
              <Tr>
                <Th>Customer</Th>
                <Th>Product</Th>
                <Th>Plan</Th>
                <Th>Price</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th>Status</Th>
                <Th>Services</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredAmcs.length === 0 ? (
                <Tr>
                  <Td colSpan="9" textAlign="center" py={8} color="gray.500">
                    No AMC subscriptions found
                  </Td>
                </Tr>
              ) : (
                filteredAmcs.map(amc => {
                  const daysLeft = Math.ceil((new Date(amc.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                  const servicesRemaining = (amc.servicesTotal || 4) - (amc.servicesUsed || 0);
                  const isExpiringSoon = amc.status === 'Active' && (daysLeft > 0 && daysLeft <= 30 || servicesRemaining === 1);
                  const isDateExpired = new Date(amc.endDate) < new Date();
                  const isServicesExhausted = (amc.servicesUsed || 0) >= (amc.servicesTotal || 4);
                  const displayStatus = (isDateExpired || isServicesExhausted) ? 'Expired' : amc.status;

                  const isDueForService = dueAmcs.some(d => d._id === amc._id);
                  const dueInfo = isDueForService ? dueAmcs.find(d => d._id === amc._id) : null;

                  return (
                    <Tr key={amc._id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" fontSize="sm">
                            {amc.userId?.firstName} {amc.userId?.lastName}
                          </Text>
                          <HStack spacing={1}>
                            <Icon as={FaPhone} size="10px" color="gray.400" />
                            <Text fontSize="xs" color="gray.500">{amc.userId?.phone}</Text>
                          </HStack>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" fontSize="sm">{amc.productName}</Text>
                          <Text fontSize="xs" color="gray.500">{amc.productType || 'Product'}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" color="blue.500" fontSize="sm">{amc.amcPlanName}</Text>
                          {isDueForService && (
                            <Text fontSize="10px" color="red.500" fontWeight="bold">
                              Next Due: {new Date(dueInfo.nextServiceDueDate).toLocaleDateString()}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontWeight="bold" color="green.500">₹{amc.amcPlanPrice?.toLocaleString()}</Text>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Icon as={FaCalendarAlt} color="green.500" size="12px" />
                          <Text fontSize="xs">{new Date(amc.startDate).toLocaleDateString('en-IN')}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Icon as={FaCalendarAlt} color="red.500" size="12px" />
                          <Text fontSize="xs">{new Date(amc.endDate).toLocaleDateString('en-IN')}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            displayStatus === 'Active' ? 'green' :
                              displayStatus === 'Expired' ? 'red' :
                                displayStatus === 'Cancelled' ? 'gray' : 'yellow'
                          }
                          variant="subtle"
                          fontSize="xs"
                        >
                          {displayStatus === 'Active' ? <FaCheckCircle /> : <FaTimesCircle />}
                          <Text ml={1}>{displayStatus}</Text>
                        </Badge>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" fontSize="sm">{amc.servicesUsed || 0}/{amc.servicesTotal || 4}</Text>
                          <Text fontSize="xs" color="gray.500">{(amc.servicesTotal || 4) - (amc.servicesUsed || 0)} left</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={2}>
                          {isDueForService && (
                            <Button
                              size="xs"
                              colorScheme="orange"
                              w="full"
                              onClick={() => handleOpenAssign(dueInfo)}
                            >
                              Assign Service
                            </Button>
                          )}
                          {(isServicesExhausted || servicesRemaining === 1 || isExpiringSoon || isDueForService) && (
                            <Button
                              size="xs"
                              colorScheme="blue"
                              variant="outline"
                              leftIcon={<Icon as={FaSms} />}
                              w="full"
                              onClick={() => handleNotifyUser(amc)}
                            >
                              Notify
                            </Button>
                          )}
                          {!isDueForService && amc.status === 'Active' && !isServicesExhausted && servicesRemaining > 1 && !isExpiringSoon && (
                            <Text fontSize="xs" color="gray.400" fontStyle="italic">Next service later</Text>
                          )}
                        </VStack>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* Assignment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Assign Service Ticket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Select Employee</FormLabel>
                <Select
                  placeholder="Choose employee"
                  value={assignmentData.employee}
                  onChange={(e) => setAssignmentData({ ...assignmentData, employee: e.target.value })}
                >
                  {employees.map(emp => (
                    <option key={emp._id} value={emp.name}>{emp.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Due Date</FormLabel>
                <Input
                  type="date"
                  value={assignmentData.date}
                  onChange={(e) => setAssignmentData({ ...assignmentData, date: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Priority</FormLabel>
                <Select
                  value={assignmentData.priority}
                  onChange={(e) => setAssignmentData({ ...assignmentData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Instructions</FormLabel>
                <Textarea
                  value={assignmentData.desc}
                  onChange={(e) => setAssignmentData({ ...assignmentData, desc: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button
              colorScheme="orange"
              isLoading={isSubmitting}
              onClick={handleAssignSubmit}
            >
              Assign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}