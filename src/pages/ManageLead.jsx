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
  Stack,
  HStack,
  Text,
  VStack,
  useToast,
  Icon,
  Tooltip,
  useColorModeValue,
  Avatar,
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiMail, 
  FiGlobe, 
  FiCalendar, 
  FiChevronLeft, 
  FiChevronRight,
  FiSend,
  FiUser,
  FiInbox
} from 'react-icons/fi';

import http from '../apis/http';

const initialLeads = [];

export default function ManageLead() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const toast = useToast();

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const [editingLead, setEditingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'new'
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'blue';
      case 'in-progress': return 'yellow';
      case 'contacted': return 'yellow'; // Fallback mapping
      case 'qualified': return 'purple'; // Fallback mapping
      case 'resolved': return 'green';
      case 'converted': return 'green'; // Fallback mapping
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await http.get('/enquiry'); 
      // The controller returns { enquiries: [...] }
      const formattedLeads = response.data.enquiries.map(lead => ({
        id: lead._id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.subject || 'Website', // Mapping subject to source
        status: lead.status || 'new',
        date: new Date(lead.createdAt).toISOString().split('T')[0]
      }));
      setLeads(formattedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({ title: 'Error fetching leads', status: 'error', isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.source, 
            message: 'Lead created/updated from Manager Panel',
            status: formData.status
        };

        if (editingLead) {
             await http.put(`/enquiry/${editingLead.id}`, payload);
             toast({ title: 'Lead Updated Successfully', status: 'success', position: 'top-right' });
        } else {
            await http.post('/enquiry', payload);
            toast({ title: 'Lead Added Successfully', status: 'success', position: 'top-right' });
        }
        fetchLeads(); // Refresh list
        handleCloseForm();
    } catch (error) {
         console.error("Operation Failed:", error);
         toast({ title: 'Operation Failed', description: error.response?.data?.message || "Server Error", status: 'error', position: 'top-right' });
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
        await http.delete(`/enquiry/${id}`);
        setLeads(leads.filter(l => l.id !== id));
        toast({ title: 'Lead Deleted', status: 'success', position: 'top-right' });
    } catch (error) {
        console.error("Delete Failed:", error);
        toast({ title: 'Delete Failed', status: 'error', position: 'top-right' });
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      source: lead.source,
      status: lead.status
    });
    onFormOpen();
  };

  const handleView = (lead) => {
    setViewingLead(lead);
    onViewOpen();
  };


  const handleCloseForm = () => {
    setEditingLead(null);
    setEditingLead(null);
    setFormData({ name: '', email: '', phone: '', source: 'Website', status: 'new' });
    onFormClose();
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box maxW="1400px" mx="auto">
      {/* Header Section */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb={8} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" fontWeight="extrabold" letterSpacing="tight">
            Manage Leads
          </Heading>
          <Text color="gray.500">Track, follow up, and convert potential clients into sales.</Text>
        </VStack>
        
        <HStack spacing={3} w={{ base: 'full', md: 'auto' }}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              bg={cardBg} 
              borderRadius="xl" focusBorderColor="blue.500" borderColor={borderColor}
            />
          </InputGroup>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onFormOpen} borderRadius="xl" px={6} shadow="blue-md">
            Add Lead
          </Button>
        </HStack>
      </Flex>

      {/* Leads Table */}
      <Box bg={cardBg} shadow="sm" rounded="2xl" border="1px solid" borderColor={borderColor} overflow="hidden">
        <Table variant="simple">
          <Thead bg={tableHeaderBg}>
            <Tr>
              <Th py={5}>Contact Information</Th>
              <Th py={5}>Source</Th>
              <Th py={5}>Status</Th>
              <Th py={5}>Created Date</Th>
              <Th py={5} textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentItems.map((lead) => (
              <Tr key={lead.id} _hover={{ bg: tableHeaderBg }} transition="0.2s">
                <Td py={5}>
                  <HStack spacing={3}>
                    <Avatar size="sm" name={lead.name} border="2px solid white" shadow="sm" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">{lead.name}</Text>
                      <HStack spacing={1} fontSize="xs" color="gray.500">
                        <Icon as={FiMail} />
                        <Text>{lead.email}</Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </Td>
                <Td py={5}>
                  <HStack spacing={2}>
                    <Icon as={FiGlobe} color="gray.400" />
                    <Text fontSize="sm" fontWeight="medium">{lead.source}</Text>
                  </HStack>
                </Td>
                <Td py={5}>
                  <Badge colorScheme={getStatusColor(lead.status)} variant="subtle" px={3} py={1} rounded="full">
                    {lead.status?.toUpperCase()}
                  </Badge>
                </Td>
                <Td py={5}>
                  <HStack spacing={2} color="gray.500">
                    <Icon as={FiCalendar} />
                    <Text fontSize="sm">{lead.date}</Text>
                  </HStack>
                </Td>
                <Td py={5} textAlign="right">
                  <HStack justify="flex-end" spacing={1}>
                    <Tooltip label="View Details">
                      <IconButton icon={<FiEye />} size="sm" variant="ghost" colorScheme="teal" onClick={() => handleView(lead)} />
                    </Tooltip>
                    <Tooltip label="Edit Lead">
                      <IconButton icon={<FiEdit2 />} size="sm" variant="ghost" colorScheme="blue" onClick={() => handleEdit(lead)} />
                    </Tooltip>
                    <Tooltip label="Delete Lead">
                      <IconButton icon={<FiTrash2 />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(lead.id)} />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {filteredLeads.length === 0 && (
          <VStack py={20}>
            <Icon as={FiInbox} w={12} h={12} color="gray.200" mb={2} />
            <Text color="gray.400">No leads found.</Text>
          </VStack>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <Flex px={6} py={4} align="center" justify="space-between" borderTop="1px solid" borderColor={borderColor}>
            <Text fontSize="sm" color="gray.500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLeads.length)} of {filteredLeads.length} results
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

      {/* Form Modal (Add/Edit) */}
      <Modal isOpen={isFormOpen} onClose={handleCloseForm} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" border="1px solid" borderColor={borderColor}>
          <ModalHeader py={6}>
            <HStack spacing={3}>
              <Icon as={editingLead ? FiEdit2 : FiPlus} color="blue.500" />
              <Text>{editingLead ? 'Edit Lead' : 'Add New Lead'}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt={2} />
          <Divider />
          <form onSubmit={handleSubmit}>
            <ModalBody py={6}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="600">Full Name</FormLabel>
                  <Input 
                    placeholder="Enter customer name" 
                    borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </FormControl>
                <HStack>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Email</FormLabel>
                    <Input 
                      type="email" placeholder="example@mail.com" 
                      borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Phone</FormLabel>
                    <Input 
                      placeholder="+91..." 
                      borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </FormControl>
                </HStack>
                <HStack>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Source</FormLabel>
                    <Select 
                      borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Google Ads">Google Ads</option>
                      {/* Handle dynamic sources from website forms */}
                      {!["Website", "Referral", "Facebook", "Instagram", "Cold Call", "Google Ads"].includes(formData.source) && formData.source && (
                        <option value={formData.source}>{formData.source}</option>
                      )}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Status</FormLabel>
                    <Select 
                      borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="new">New</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </Select>
                  </FormControl>
                </HStack>
              </Stack>
            </ModalBody>
            <ModalFooter py={6} bg={useColorModeValue('gray.50', 'gray.850')} borderBottomRadius="2xl">
              <Button variant="ghost" mr={3} onClick={handleCloseForm} borderRadius="xl">Cancel</Button>
              <Button type="submit" colorScheme="blue" borderRadius="xl" px={8} leftIcon={<FiSend />}>
                {editingLead ? 'Update Lead' : 'Save Lead'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="sm" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" border="1px solid" borderColor={borderColor}>
          <ModalHeader py={6}>
            <HStack spacing={3}>
              <Icon as={FiUser} color="teal.500" />
              <Text>Lead Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            {viewingLead && (
              <VStack align="stretch" spacing={5}>
                <VStack align="center" spacing={2} pb={2}>
                  <Avatar size="xl" name={viewingLead.name} border="4px solid" borderColor="teal.50" />
                  <Heading size="md">{viewingLead.name}</Heading>
                  <Badge colorScheme={getStatusColor(viewingLead.status)} variant="solid" px={3} rounded="full">
                    {viewingLead.status.toUpperCase()}
                  </Badge>
                </VStack>
                <Divider />
                <Stack spacing={4}>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Email Address</Text>
                    <HStack mt={1} spacing={2} color="gray.700">
                      <Icon as={FiMail} color="teal.500" />
                      <Text fontSize="sm" fontWeight="medium">{viewingLead.email}</Text>
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Phone Number</Text>
                    <HStack mt={1} spacing={2} color="gray.700">
                      <Icon as={FiSend} color="teal.500" transform="rotate(90deg)" />
                      <Text fontSize="sm" fontWeight="medium">{viewingLead.phone || 'N/A'}</Text>
                    </HStack>
                  </Box>
                  <HStack justify="space-between">
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Source</Text>
                      <HStack mt={1} spacing={2} color="gray.700">
                        <Icon as={FiGlobe} color="teal.500" />
                        <Text fontSize="sm" fontWeight="medium">{viewingLead.source}</Text>
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Created On</Text>
                      <HStack mt={1} spacing={2} color="gray.700">
                        <Icon as={FiCalendar} color="teal.500" />
                        <Text fontSize="sm" fontWeight="medium">{viewingLead.date}</Text>
                      </HStack>
                    </Box>
                  </HStack>
                </Stack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" w="full" onClick={onViewClose} borderRadius="xl">Close Profile</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
