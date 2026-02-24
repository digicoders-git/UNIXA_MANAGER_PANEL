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
  HStack,
  Text,
  VStack,
  useToast,
  Icon,
  Tooltip,
  useColorModeValue,
  Avatar,
  Select
} from '@chakra-ui/react';
import {
  FiSearch,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiBox,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiPackage,
  FiClock,
  FiRefreshCw
} from 'react-icons/fi';

import http from '../apis/http'; // Assuming http is configured with base URL

export default function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const toast = useToast();

  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const [viewingOrder, setViewingOrder] = useState(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const modalBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Admin route returns { orders: [...] }
      const response = await http.get('/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: 'Error fetching orders',
        description: 'Ensure you have permission to view orders.',
        status: 'error',
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'orange',
    confirmed: 'blue',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red',
    returned: 'pink',
    processing: 'yellow'
  };

  const handleView = (order) => {
    setViewingOrder(order);
    onViewOpen();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.phone?.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box maxW="1400px" mx="auto">
      {/* Header */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb={8} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" fontWeight="extrabold" letterSpacing="tight">
            Manage Orders
          </Heading>
          <Text color="gray.500">View and track all website and offline orders.</Text>
        </VStack>

        <HStack spacing={3} w={{ base: 'full', md: 'auto' }}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Box
              as="input"
              placeholder="Search Order ID, Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              pl={10}
              h="40px"
              w="100%"
              rounded="xl"
              border="1px solid"
              borderColor={borderColor}
              bg={cardBg}
              _focus={{ borderColor: 'blue.500', outline: 'none' }}
            />
          </InputGroup>

          <Select
            maxW="150px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            bg={cardBg}
            borderRadius="xl"
            borderColor={borderColor}
            h="40px"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </Select>

          <Button
            leftIcon={<FiRefreshCw />}
            onClick={fetchOrders}
            colorScheme="blue"
            variant="ghost"
            isLoading={loading}
            borderRadius="xl"
          >
            Refresh
          </Button>
        </HStack>
      </Flex>


      {/* Orders Table */}
      <Box bg={cardBg} shadow="sm" rounded="2xl" border="1px solid" borderColor={borderColor} overflow="hidden">
        <Table variant="simple">
          <Thead bg={tableHeaderBg}>
            <Tr>
              <Th py={5}>Order Info</Th>
              <Th py={5}>Customer</Th>
              <Th py={5}>Amount</Th>
              <Th py={5}>Status</Th>
              <Th py={5}>Source</Th>
              <Th py={5}>Date</Th>
              <Th py={5} textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentItems.map((order) => (
              <Tr key={order._id} _hover={{ bg: tableHeaderBg }} transition="0.2s">
                <Td py={5}>
                  <VStack align="start" spacing={0}>
                    <HStack>
                      <Text fontWeight="bold" fontSize="sm">#{order._id.slice(-6).toUpperCase()}</Text>
                      <Badge fontSize="10px" colorScheme="gray">{order.paymentMethod}</Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">{order.items.length} Items</Text>
                  </VStack>
                </Td>
                <Td py={5}>
                  <HStack spacing={3}>
                    <Avatar size="sm" name={order.shippingAddress?.name || 'Unknown'} src={order.user?.avatar} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">{order.shippingAddress?.name || 'Guest'}</Text>
                      <Text fontSize="xs" color="gray.500">{order.shippingAddress?.phone}</Text>
                    </VStack>
                  </HStack>
                </Td>
                <Td py={5}>
                  <Text fontWeight="bold" color="blue.600">
                    {formatCurrency(order.total)}
                  </Text>
                  <Badge variant="outline" colorScheme={order.paymentStatus === 'paid' ? 'green' : 'orange'} fontSize="xs" mt={1}>
                    {order.paymentStatus?.toUpperCase()}
                  </Badge>
                </Td>
                <Td py={5}>
                  <Badge colorScheme={statusColors[order.status] || 'gray'} variant="subtle" px={3} py={1} rounded="full">
                    {order.status?.toUpperCase()}
                  </Badge>
                </Td>
                <Td py={5}>
                  <Badge
                    variant={order.source === 'online' ? 'solid' : 'outline'}
                    colorScheme={order.source === 'online' ? 'cyan' : 'purple'}
                  >
                    {order.source?.toUpperCase() || 'ONLINE'}
                  </Badge>
                </Td>
                <Td py={5}>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Td>
                <Td py={5} textAlign="right">
                  <Tooltip label="View Details">
                    <IconButton
                      icon={<FiEye />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => handleView(order)}
                    />
                  </Tooltip>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {filteredOrders.length === 0 && (
          <VStack py={20}>
            <Icon as={FiShoppingBag} w={12} h={12} color="gray.200" mb={2} />
            <Text color="gray.400">No orders found.</Text>
          </VStack>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex px={6} py={4} align="center" justify="space-between" borderTop="1px solid" borderColor={borderColor}>
            <Text fontSize="sm" color="gray.500">
              Page {currentPage} of {totalPages}
            </Text>
            <HStack>
              <IconButton
                icon={<FiChevronLeft />}
                isDisabled={currentPage === 1}
                onClick={() => setCurrentPage(c => c - 1)}
                size="sm"
              />
              <IconButton
                icon={<FiChevronRight />}
                isDisabled={currentPage === totalPages}
                onClick={() => setCurrentPage(c => c + 1)}
                size="sm"
              />
            </HStack>
          </Flex>
        )}
      </Box>

      {/* Order Details Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Order #{viewingOrder?._id?.slice(-6).toUpperCase()}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {viewingOrder && (
              <VStack align="stretch" spacing={6}>
                {/* Status Tracker */}
                <Flex bg={modalBg} p={4} rounded="xl" justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">CURRENT STATUS</Text>
                    <Badge colorScheme={statusColors[viewingOrder.status]} fontSize="lg" mt={1}>
                      {viewingOrder.status.toUpperCase()}
                    </Badge>
                  </VStack>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">SOURCE</Text>
                    <Badge colorScheme="purple" variant="outline" mt={1}>
                      {viewingOrder.source?.toUpperCase() || 'ONLINE'}
                    </Badge>
                  </VStack>
                </Flex>

                {/* Items */}
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={3}>ITEMS ORDERED</Text>
                  <VStack align="stretch" spacing={3}>
                    {viewingOrder.items.map((item, idx) => (
                      <Flex key={idx} justify="space-between" align="center" p={3} border="1px solid" borderColor={borderColor} rounded="lg">
                        <HStack spacing={3}>
                          <Icon as={FiPackage} color="blue.500" />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="sm">{item.productName}</Text>
                            <Text fontSize="xs" color="gray.500">Qty: {item.quantity} | {item.amcPlan ? `+ ${item.amcPlan} AMC` : 'No AMC'}</Text>
                          </VStack>
                        </HStack>
                        <Text fontWeight="bold">
                          {formatCurrency((item.productPrice + (item.amcPrice || 0)) * item.quantity)}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Customer & Shipping */}
                <Flex justify="space-between" gap={6}>
                  <Box flex="1">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>CUSTOMER DETAILS</Text>
                    <VStack align="start" spacing={1} fontSize="sm">
                      <HStack><Icon as={FiUser} color="gray.400" /><Text>{viewingOrder.shippingAddress?.name}</Text></HStack>
                      <HStack><Icon as={FiMapPin} color="gray.400" /><Text>{viewingOrder.shippingAddress?.address}, {viewingOrder.shippingAddress?.city}</Text></HStack>
                      <Text pl={6} color="gray.500">{viewingOrder.shippingAddress?.state} - {viewingOrder.shippingAddress?.pincode}</Text>
                    </VStack>
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>PAYMENT INFO</Text>
                    <VStack align="start" spacing={1} fontSize="sm">
                      <HStack><Icon as={FiCheckCircle} color="gray.400" /><Text>Method: {viewingOrder.paymentMethod}</Text></HStack>
                      <HStack>
                        <Icon as={FiDollarSign} color="gray.400" />
                        <Text>Status: </Text>
                        <Badge colorScheme={viewingOrder.paymentStatus === 'paid' ? 'green' : 'orange'}>{viewingOrder.paymentStatus}</Badge>
                      </HStack>
                    </VStack>
                  </Box>
                </Flex>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close Details</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
