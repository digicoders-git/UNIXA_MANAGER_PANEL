import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  Flex,
  Divider,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Stack,
  HStack,
  Text,
  VStack,
  InputRightElement,
  useToast,
  Icon,
  Tooltip,
  useColorModeValue,
  Avatar,
} from '@chakra-ui/react';
import {
  FiSend,
  FiUser,
  FiFileText,
  FiActivity,
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiFilter,
  FiInbox,
  FiCalendar,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiClock
} from 'react-icons/fi';

import http from '../apis/http';

const initialTickets = [];

export default function AssignTicket() {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const toast = useToast();

  // Modal Controls
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  // State for Form
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [formData, setFormData] = useState({
    ticketType: 'service_request',
    title: '',
    employee: '',
    priority: 'Medium',
    date: '',
    desc: '',
    serviceRequestId: '',
    orderId: ''
  });

  const [serviceRequests, setServiceRequests] = useState([]);
  const [orders, setOrders] = useState([]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');

  // Handle Create/Edit
  useEffect(() => {
    fetchTickets();
    fetchEmployees();
    fetchServiceRequests();
    fetchOrders();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await http.get('/employees');
      const filteredEmployees = response.data.filter(emp => emp.role !== 'Manager');
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const response = await http.get('/admin/service-requests');
      const openRequests = response.data.filter(req => req.status === 'Open');
      setServiceRequests(openRequests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await http.get('/orders');
      const confirmedOrders = response.data.filter(order => order.status === 'confirmed');
      setOrders(confirmedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await http.get('/assigned-tickets');

      const formattedTickets = response.data.map(ticket => ({
        id: ticket._id,
        ticketType: ticket.ticketType || 'service_request',
        title: ticket.title || 'Service Request',
        employee: ticket.assignedTo || 'Unassigned',
        priority: ticket.priority || 'Medium',
        date: new Date(ticket.dueDate || ticket.createdAt).toISOString().split('T')[0],
        status: ticket.status || 'Pending',
        desc: ticket.description || 'No description provided.',
        customerName: ticket.customerName
      }));

      formattedTickets.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTickets(formattedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({ title: 'Error fetching tickets', status: 'error', isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = JSON.parse(localStorage.getItem('manager-data') || '{}');
      const managerName = userData.name || 'Manager';

      const ticketData = {
        ticketType: formData.ticketType,
        title: formData.title,
        assignedTo: formData.employee,
        assignedBy: managerName,
        priority: formData.priority,
        dueDate: formData.date,
        description: formData.desc,
        status: 'Pending'
      };

      if (formData.ticketType === 'service_request' && formData.serviceRequestId) {
        const selectedRequest = serviceRequests.find(req => req._id === formData.serviceRequestId);
        if (selectedRequest) {
          ticketData.serviceRequestId = selectedRequest._id;
          ticketData.userId = selectedRequest.userId;
          ticketData.amcId = selectedRequest.amcId;
          ticketData.customerName = selectedRequest.customerName;
          ticketData.customerPhone = selectedRequest.customerPhone;
          ticketData.customerEmail = selectedRequest.customerEmail;
        }
      } else if (formData.ticketType === 'order' && formData.orderId) {
        const selectedOrder = orders.find(order => order._id === formData.orderId);
        if (selectedOrder) {
          ticketData.orderId = selectedOrder._id;
          ticketData.userId = selectedOrder.userId;
          ticketData.customerName = selectedOrder.shippingAddress?.name;
          ticketData.customerPhone = selectedOrder.shippingAddress?.phone;
          ticketData.customerEmail = selectedOrder.shippingAddress?.email;
          ticketData.address = `${selectedOrder.shippingAddress?.addressLine1}, ${selectedOrder.shippingAddress?.city}`;
        }
      }

      if (editingTicket) {
        await http.put(`/assigned-tickets/${editingTicket.id}`, ticketData);
        toast({ title: "Ticket Updated", status: "success", position: "top-right" });
      } else {
        await http.post('/assigned-tickets', ticketData);
        toast({ title: "Ticket Created", status: "success", position: "top-right" });
      }
      fetchTickets();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast({ title: "Failed to save ticket. Make sure backend server is running.", status: "error", position: "top-right" });
    }
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      ticketType: ticket.ticketType || 'service_request',
      title: ticket.title,
      employee: ticket.employee,
      priority: ticket.priority,
      date: ticket.date,
      desc: ticket.desc || '',
      serviceRequestId: '',
      orderId: ''
    });
    onFormOpen();
  };

  const handleView = (ticket) => {
    setViewingTicket(ticket);
    onViewOpen();
  };

  const handleDelete = (id) => {
    setTickets(tickets.filter(t => t.id !== id));
    toast({ title: "Ticket Deleted", status: "error", position: "top-right" });
  };

  const handleCloseForm = () => {
    setEditingTicket(null);
    setFormData({ ticketType: 'service_request', title: '', employee: '', priority: 'Medium', date: '', desc: '', serviceRequestId: '', orderId: '' });
    onFormClose();
  };

  // Pagination & Search Logic
  const filteredTickets = useMemo(() => {
    return tickets.filter(t =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employee.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tickets, searchTerm]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'red';
      case 'Medium': return 'orange';
      case 'Low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Box maxW="1400px" mx="auto">
      {/* Header Section */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb={8} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" fontWeight="extrabold" letterSpacing="tight">
            Assigned Tickets
          </Heading>
          <Text color="gray.500">Manage and track service tasks for your team members.</Text>
        </VStack>

        <HStack spacing={3} w={{ base: 'full', md: 'auto' }}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              bg={cardBg}
              borderRadius="xl" focusBorderColor="blue.500" borderColor={borderColor}
            />
          </InputGroup>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onFormOpen} borderRadius="xl" px={6} shadow="blue-md">
            New Ticket
          </Button>
        </HStack>
      </Flex>

      {/* Modern Table Container */}
      <Box bg={cardBg} shadow="sm" rounded="2xl" border="1px solid" borderColor={borderColor} overflow="hidden">
        <Table variant="simple">
          <Thead bg={tableHeaderBg}>
            <Tr>
              <Th py={5}>Task Information</Th>
              <Th py={5}>Type</Th>
              <Th py={5}>Assigned To</Th>
              <Th py={5}>Priority</Th>
              <Th py={5}>Deadline</Th>
              <Th py={5}>Status</Th>
              <Th py={5} textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentItems.map((ticket) => (
              <Tr key={ticket.id} _hover={{ bg: tableHeaderBg }} transition="0.2s">
                <Td py={5}>
                  <HStack spacing={3}>
                    <Box p={2} bg="blue.50" color="blue.500" rounded="lg">
                      <Icon as={FiFileText} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">{ticket.title}</Text>
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>{ticket.desc || 'No description provided'}</Text>
                    </VStack>
                  </HStack>
                </Td>
                <Td py={5}>
                  <Badge 
                    colorScheme={ticket.ticketType === 'service_request' ? 'purple' : 'cyan'} 
                    variant="subtle" 
                    px={2} 
                    py={0.5} 
                    rounded="full"
                    fontSize="10px"
                  >
                    {ticket.ticketType === 'service_request' ? 'AMC Service' : 'Installation'}
                  </Badge>
                </Td>
                <Td py={5}>
                  <HStack spacing={3}>
                    <Avatar size="xs" name={ticket.employee} />
                    <Text fontSize="sm" fontWeight="medium">{ticket.employee}</Text>
                  </HStack>
                </Td>
                <Td py={5}>
                  <Badge colorScheme={getPriorityColor(ticket.priority)} variant="subtle" px={2} py={0.5} rounded="full">
                    {ticket.priority}
                  </Badge>
                </Td>
                <Td py={5}>
                  <HStack fontSize="sm" color="gray.500">
                    <Icon as={FiCalendar} />
                    <Text>{ticket.date}</Text>
                  </HStack>
                </Td>
                <Td py={5}>
                  <Badge colorScheme={ticket.status === 'Completed' ? 'green' : 'yellow'} variant="solid" fontSize="10px" px={2} rounded="full">
                    {ticket.status.toUpperCase()}
                  </Badge>
                </Td>
                <Td py={5} textAlign="right">
                  <HStack justify="flex-end" spacing={1}>
                    <Tooltip label="View Details">
                      <IconButton icon={<FiEye />} size="sm" variant="ghost" colorScheme="teal" onClick={() => handleView(ticket)} />
                    </Tooltip>
                    <Tooltip label="Edit Ticket">
                      <IconButton icon={<FiEdit2 />} size="sm" variant="ghost" colorScheme="blue" onClick={() => handleEdit(ticket)} />
                    </Tooltip>
                    <Tooltip label="Delete Ticket">
                      <IconButton icon={<FiTrash2 />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(ticket.id)} />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {filteredTickets.length === 0 && (
          <VStack py={20}>
            <Icon as={FiInbox} w={12} h={12} color="gray.200" mb={2} />
            <Text color="gray.400">No tickets found.</Text>
          </VStack>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <Flex px={6} py={4} align="center" justify="space-between" borderTop="1px solid" borderColor={borderColor}>
            <Text fontSize="sm" color="gray.500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTickets.length)} of {filteredTickets.length} results
            </Text>
            <HStack spacing={2}>
              <IconButton
                icon={<FiChevronLeft />}
                size="sm"
                isDisabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  colorScheme={currentPage === i + 1 ? "blue" : "gray"}
                  variant={currentPage === i + 1 ? "solid" : "ghost"}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <IconButton
                icon={<FiChevronRight />}
                size="sm"
                isDisabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              />
            </HStack>
          </Flex>
        )}
      </Box>

      {/* New/Edit Ticket Modal */}
      <Modal isOpen={isFormOpen} onClose={handleCloseForm} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" border="1px solid" borderColor={borderColor}>
          <ModalHeader py={6}>
            <HStack>
              <Icon as={editingTicket ? FiEdit2 : FiPlus} color="blue.500" />
              <Text>{editingTicket ? 'Edit Ticket' : 'Assign New Ticket'}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt={2} />
          <Divider />
          <form onSubmit={handleSubmit}>
            <ModalBody py={6}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="600">Ticket Type</FormLabel>
                  <Select
                    borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}
                    value={formData.ticketType}
                    onChange={(e) => setFormData({ ...formData, ticketType: e.target.value, serviceRequestId: '', orderId: '' })}
                  >
                    <option value="service_request">Service Request (AMC)</option>
                    <option value="order">Order Installation</option>
                  </Select>
                </FormControl>

                {formData.ticketType === 'service_request' && (
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Select Service Request</FormLabel>
                    <Select
                      placeholder="Choose service request"
                      borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.serviceRequestId}
                      onChange={(e) => {
                        const selected = serviceRequests.find(req => req._id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          serviceRequestId: e.target.value,
                          title: selected ? `${selected.type} - ${selected.customerName}` : ''
                        });
                      }}
                    >
                      {serviceRequests.map(req => (
                        <option key={req._id} value={req._id}>
                          {req.ticketId} - {req.customerName} - {req.type}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {formData.ticketType === 'order' && (
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Select Order</FormLabel>
                    <Select
                      placeholder="Choose order"
                      borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.orderId}
                      onChange={(e) => {
                        const selected = orders.find(order => order._id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          orderId: e.target.value,
                          title: selected ? `Order Installation - ${selected.shippingAddress?.name}` : ''
                        });
                      }}
                    >
                      {orders.map(order => (
                        <option key={order._id} value={order._id}>
                          Order #{order._id.slice(-6)} - {order.shippingAddress?.name} - ₹{order.total}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <FormControl isRequired>
                  <FormLabel fontWeight="600">Task Title</FormLabel>
                  <Input
                    placeholder="e.g. Server Maintenance"
                    borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="600">Assign To (Employee)</FormLabel>
                  <Select
                    placeholder="Select team member" borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}
                    value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  >
                    {employees.map(emp => (
                      <option key={emp._id} value={emp.name}>
                        {emp.name} - {emp.designation || emp.role}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <HStack>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Priority</FormLabel>
                    <Select
                      borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Due Date</FormLabel>
                    <Input
                      type="date" borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </FormControl>
                </HStack>
                <FormControl>
                  <FormLabel fontWeight="600">Task Instructions</FormLabel>
                  <Textarea
                    placeholder="Provide details about the task..."
                    borderRadius="xl" rows={3} bg={useColorModeValue('gray.50', 'gray.900')}
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter py={6} bg={useColorModeValue('gray.50', 'gray.850')} borderBottomRadius="2xl">
              <Button variant="ghost" mr={3} onClick={handleCloseForm} borderRadius="xl">Cancel</Button>
              <Button type="submit" colorScheme="blue" borderRadius="xl" px={8} leftIcon={<FiSend />}>
                {editingTicket ? 'Update Changes' : 'Assign Ticket'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* View Ticket Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="sm" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" border="1px solid" borderColor={borderColor}>
          <ModalHeader py={6}>
            <HStack>
              <Icon as={FiFileText} color="teal.500" />
              <Text>Ticket Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            {viewingTicket && (
              <VStack align="start" spacing={5}>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Title</Text>
                  <Text fontWeight="bold" fontSize="lg">{viewingTicket.title}</Text>
                </Box>
                <HStack w="full" justify="space-between">
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Assigned To</Text>
                    <HStack spacing={2} mt={1}>
                      <Avatar size="xs" name={viewingTicket.employee} />
                      <Text fontSize="sm">{viewingTicket.employee}</Text>
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Priority</Text>
                    <Badge colorScheme={getPriorityColor(viewingTicket.priority)} mt={1}>{viewingTicket.priority}</Badge>
                  </Box>
                </HStack>
                <HStack w="full" justify="space-between">
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Due Date</Text>
                    <HStack spacing={1} mt={1}>
                      <Icon as={FiClock} color="gray.400" />
                      <Text fontSize="sm">{viewingTicket.date}</Text>
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Status</Text>
                    <Badge colorScheme="blue" variant="solid" mt={1}>{viewingTicket.status}</Badge>
                  </Box>
                </HStack>
                <Box w="full">
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Full Description</Text>
                  <Box p={3} bg="gray.50" rounded="xl" mt={1} border="1px solid" borderColor="gray.100">
                    <Text fontSize="sm">{viewingTicket.desc || 'No additional instructions provided for this task.'}</Text>
                  </Box>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" w="full" onClick={onViewClose} borderRadius="xl">Close Preview</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
