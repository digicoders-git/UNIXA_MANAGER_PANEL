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
  Textarea,
  VStack,
  useToast,
  Icon,
  Tooltip,
  useColorModeValue,
  Avatar,
  Image,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
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
  FiInbox,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

import http from '../apis/http';

const initialLeads = [];

export default function ManageLead() {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedLeadForSchedule, setSelectedLeadForSchedule] = useState(null);
  const [scheduleData, setScheduleData] = useState({ scheduledDate: '', scheduleNote: '' });
  const [rawLeads, setRawLeads] = useState([]); // store raw leads with serviceSchedule
  const itemsPerPage = 5;
  const toast = useToast();

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);

  const [editingLead, setEditingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [selectedLeadForAssign, setSelectedLeadForAssign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    productInterest: '',
    source: 'Website',
    status: 'Warm'
  });

  const [assignData, setAssignData] = useState({
    employee: '',
    priority: 'Medium',
    dueDate: '',
    description: ''
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

  const getLeadTicketStatus = (leadId) => {
    const ticket = assignedTickets.find(t => {
      if (t.ticketType !== 'lead') return false;

      const ticketLeadId = typeof t.leadId === 'object' ? t.leadId?._id : t.leadId;

      return ticketLeadId === leadId ||
        ticketLeadId?.toString() === leadId?.toString() ||
        String(ticketLeadId) === String(leadId);
    });

    return ticket ? ticket.status : null;
  };

  const getTicketStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'yellow';
      case 'In Progress': return 'blue';
      case 'Completed': return 'green';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLeads(),
        fetchEmployees(),
        fetchAssignedTickets()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Auto-refresh assigned tickets every 5 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchAssignedTickets();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  const fetchEmployees = async () => {
    try {
      const response = await http.get('/employees');
      const filteredEmployees = response.data.filter(emp => emp.role !== 'Manager');
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await http.get('/leads');
      const leadsData = response.data.leads || response.data || [];
      setRawLeads(leadsData);
      const formattedLeads = leadsData.map(lead => ({
        id: lead._id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        productInterest: lead.productInterest,
        source: lead.source || 'Field Visit',
        status: lead.leadStatus || 'Warm',
        verified: lead.verified || false,
        serviceSchedule: lead.serviceSchedule || null,
        date: lead.createdAt ? new Date(lead.createdAt).toISOString().split('T')[0] : 'N/A'
      }));
      setLeads(formattedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({ title: 'Error fetching leads', status: 'error', isClosable: true });
    }
  };

  const handleVerify = async (lead) => {
    try {
      await http.patch(`/leads/${lead.id}/verify`);
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, verified: !l.verified } : l));
      toast({ title: `Lead ${lead.verified ? 'unverified' : 'verified'}`, status: 'success', position: 'top-right' });
    } catch (error) {
      toast({ title: 'Failed to update verification', status: 'error', position: 'top-right' });
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await http.patch(`/leads/${selectedLeadForSchedule.id}/schedule`, scheduleData);
      const updatedLead = response.data.lead;
      setLeads(prev => prev.map(l => l.id === selectedLeadForSchedule.id ? { ...l, serviceSchedule: updatedLead.serviceSchedule } : l));
      toast({ title: 'Service scheduled successfully', status: 'success', position: 'top-right' });
      setIsScheduleModalOpen(false);
      setScheduleData({ scheduledDate: '', scheduleNote: '' });
    } catch (error) {
      toast({ title: 'Failed to schedule service', status: 'error', position: 'top-right' });
    }
  };

  const handleScheduleStatusUpdate = async (leadId, scheduleStatus) => {
    try {
      const response = await http.patch(`/leads/${leadId}/schedule-status`, { scheduleStatus });
      const updatedLead = response.data.lead;
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, serviceSchedule: updatedLead.serviceSchedule } : l));
      toast({ title: `Marked as ${scheduleStatus}`, status: 'success', position: 'top-right' });
    } catch (error) {
      toast({ title: 'Failed to update status', status: 'error', position: 'top-right' });
    }
  };

  const fetchAssignedTickets = async () => {
    try {
      const response = await http.get('/assigned-tickets');
      const leadTickets = response.data.filter(t => t.ticketType === 'lead');
      console.log('Manager Panel - Lead Tickets:', leadTickets);
      setAssignedTickets(leadTickets);
      setTicketsLoaded(true);
    } catch (error) {
      console.error("Error fetching assigned tickets:", error);
      setAssignedTickets([]);
      setTicketsLoaded(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        productInterest: formData.productInterest,
        source: formData.source,
        leadStatus: formData.status
      };

      if (editingLead) {
        await http.put(`/leads/${editingLead.id}`, payload);
        toast({ title: 'Lead Updated Successfully', status: 'success', position: 'top-right' });
      } else {
        await http.post('/leads', payload);
        toast({ title: 'Lead Added Successfully', status: 'success', position: 'top-right' });
      }
      fetchLeads();
      handleCloseForm();
    } catch (error) {
      console.error("Operation Failed:", error);
      toast({ title: 'Operation Failed', description: error.response?.data?.message || "Server Error", status: 'error', position: 'top-right' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (isAssigning) return;
    
    try {
      setIsAssigning(true);
      if (!selectedLeadForAssign) return;

      const userData = JSON.parse(localStorage.getItem('manager-data') || '{}');
      const managerName = userData.name || 'Manager';

      const ticketData = {
        ticketType: 'lead',
        leadId: selectedLeadForAssign.id,
        title: `Lead Assignment: ${selectedLeadForAssign.name}`,
        assignedTo: assignData.employee,
        assignedBy: managerName,
        priority: assignData.priority,
        dueDate: assignData.dueDate ? new Date(assignData.dueDate) : null,
        description: assignData.description,
        status: 'Pending',
        customerName: selectedLeadForAssign.name,
        customerPhone: selectedLeadForAssign.phone,
        customerEmail: selectedLeadForAssign.email,
        address: selectedLeadForAssign.address || ""
      };

      await http.post('/assigned-tickets', ticketData);
      toast({ title: "Ticket Assigned Successfully", status: "success", position: "top-right" });
      onAssignClose();
      setAssignData({ employee: '', priority: 'Medium', dueDate: '', description: '' });
      setSelectedLeadForAssign(null);
      setTimeout(() => {
        fetchAssignedTickets();
      }, 500);
    } catch (error) {
      console.error('Error assigning lead:', error);
      const detail = error.response?.data?.error || error.response?.data?.message || error.message;
      toast({ title: "Assignment Failed", description: detail, status: "error", position: "top-right" });
    } finally {
      setIsAssigning(false);
    }
  };

  const openAssignModal = (lead) => {
    setSelectedLeadForAssign(lead);
    onAssignOpen();
  };

  const showLeadDetails = async (lead) => {
    try {
      console.log('Showing details for lead:', lead.id);
      console.log('Available tickets:', assignedTickets);
      
      const ticket = assignedTickets.find(t => {
        if (t.ticketType !== 'lead') return false;
        const ticketLeadId = typeof t.leadId === 'object' ? t.leadId?._id : t.leadId;
        const match = ticketLeadId === lead.id ||
          ticketLeadId?.toString() === lead.id?.toString() ||
          String(ticketLeadId) === String(lead.id);
        console.log(`Comparing ticket leadId: ${ticketLeadId} with lead id: ${lead.id}, match: ${match}`);
        return match;
      });
      
      console.log('Found ticket:', ticket);
      if (ticket) {
        console.log('Ticket completion data:', {
          completionPhotos: ticket.completionPhotos,
          visitPhotos: ticket.visitPhotos,
          completionRemark: ticket.completionRemark,
          employeeFeedback: ticket.employeeFeedback,
          status: ticket.status
        });
      }
      setSelectedLeadDetails({ lead, ticket });
      setIsShowModalOpen(true);
    } catch (error) {
      console.error('Error showing lead details:', error);
      toast({ title: 'Error', description: 'Failed to load lead details', status: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await http.delete(`/leads/${id}`);
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
      address: lead.address || '',
      productInterest: lead.productInterest || '',
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
    setFormData({ name: '', email: '', phone: '', address: '', productInterest: '', source: 'Website', status: 'Warm' });
    onFormClose();
  };

  const [productFilter, setProductFilter] = useState('All');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProduct = productFilter === 'All' || (lead.productInterest || '') === productFilter;
      return matchesSearch && matchesProduct;
    });
  }, [leads, searchTerm, productFilter]);

  const productCategories = ['All', 'Product', 'Part', 'Rent', 'AMC', 'Water Testing', 'Installation', 'Service Paid Type', 'Others', 'Demo'];
  const statsFiltered = productFilter === 'All' ? leads : leads.filter(l => (l.productInterest || '') === productFilter);
  const statsTotal = statsFiltered.length;
  const statsCompleted = statsFiltered.filter(l => getLeadTicketStatus(l.id) === 'Completed').length;
  const statsPending = statsFiltered.filter(l => getLeadTicketStatus(l.id) !== 'Completed').length;

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);

  const scheduledLeads = leads.filter(l => l.serviceSchedule?.scheduledDate);
  const upcomingCount = scheduledLeads.filter(l => l.serviceSchedule?.scheduleStatus === 'Upcoming').length;
  const completedScheduleCount = scheduledLeads.filter(l => l.serviceSchedule?.scheduleStatus === 'Completed').length;

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
          <Button leftIcon={<FiSend />} colorScheme="purple" onClick={onAssignOpen} borderRadius="xl" px={6} shadow="purple-md">
            Assign Lead
          </Button>
        </HStack>
      </Flex>

      <Tabs colorScheme="blue" mb={6}>
        <TabList>
          <Tab fontWeight="bold">Leads</Tab>
          <Tab fontWeight="bold">
            Schedule
            {upcomingCount > 0 && <Badge ml={2} colorScheme="orange" borderRadius="full">{upcomingCount}</Badge>}
          </Tab>
        </TabList>
        <TabPanels>
          {/* Leads Tab */}
          <TabPanel px={0}>

      {/* Product Filter + Stats */}
      <Box mb={6}>
        <HStack mb={4} spacing={2} flexWrap="wrap">
          {productCategories.map(cat => (
            <Button
              key={cat}
              size="sm"
              borderRadius="xl"
              fontSize="xs"
              fontWeight="bold"
              variant={productFilter === cat ? 'solid' : 'outline'}
              colorScheme={productFilter === cat ? 'blue' : 'gray'}
              onClick={() => { setProductFilter(cat); setCurrentPage(1); }}
            >
              {cat}
            </Button>
          ))}
        </HStack>
        <SimpleGrid columns={3} spacing={4}>
          <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={4} textAlign="center">
            <Text fontSize="2xl" fontWeight="black">{statsTotal}</Text>
            <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Total Leads</Text>
          </Box>
          <Box bg={cardBg} border="1px solid" borderColor="green.100" borderRadius="2xl" p={4} textAlign="center">
            <Text fontSize="2xl" fontWeight="black" color="green.500">{statsCompleted}</Text>
            <Text fontSize="xs" fontWeight="bold" color="green.400" textTransform="uppercase">Completed</Text>
          </Box>
          <Box bg={cardBg} border="1px solid" borderColor="orange.100" borderRadius="2xl" p={4} textAlign="center">
            <Text fontSize="2xl" fontWeight="black" color="orange.500">{statsPending}</Text>
            <Text fontSize="xs" fontWeight="bold" color="orange.400" textTransform="uppercase">Pending</Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Leads Table */}
      <Box bg={cardBg} shadow="sm" rounded="2xl" border="1px solid" borderColor={borderColor} overflow="hidden">
        <Table variant="simple">
          <Thead bg={tableHeaderBg}>
            <Tr>
              <Th py={5}>Contact Information</Th>
              <Th py={5}>Source</Th>
              <Th py={5}>Status</Th>
              <Th py={5}>Verified</Th>
              <Th py={5}>Ticket Status</Th>
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
                  <Badge colorScheme={lead.verified ? 'green' : 'gray'} variant="subtle" px={3} py={1} rounded="full">
                    {lead.verified ? 'Verified' : 'Pending'}
                  </Badge>
                </Td>
                <Td py={5}>
                  {(() => {
                    const ticketStatus = getLeadTicketStatus(lead.id);
                    return ticketStatus ? (
                      <Badge colorScheme={getTicketStatusColor(ticketStatus)} variant="subtle" px={3} py={1} rounded="full">
                        {ticketStatus}
                      </Badge>
                    ) : (
                      <Badge colorScheme="gray" variant="subtle" px={3} py={1} rounded="full">
                        Not Assigned
                      </Badge>
                    );
                  })()}
                </Td>
                <Td py={5}>
                  <HStack spacing={2} color="gray.500">
                    <Icon as={FiCalendar} />
                    <Text fontSize="sm">{lead.date}</Text>
                  </HStack>
                </Td>
                <Td py={5} textAlign="right">
                  <HStack justify="flex-end" spacing={1}>
                    <Tooltip label="Show Details">
                      <IconButton icon={<FiEye />} size="sm" variant="ghost" colorScheme="green" onClick={() => showLeadDetails(lead)} />
                    </Tooltip>
                    <Tooltip label={lead.verified ? 'Unverify' : 'Verify'}>
                      <IconButton
                        icon={lead.verified ? <FiCheckCircle /> : <FiCheckCircle />}
                        size="sm"
                        variant={lead.verified ? 'solid' : 'ghost'}
                        colorScheme="green"
                        onClick={() => handleVerify(lead)}
                      />
                    </Tooltip>
                    <Tooltip label="Schedule Service">
                      <IconButton
                        icon={<FiCalendar />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => { setSelectedLeadForSchedule(lead); setScheduleData({ scheduledDate: lead.serviceSchedule?.scheduledDate ? new Date(lead.serviceSchedule.scheduledDate).toISOString().split('T')[0] : '', scheduleNote: lead.serviceSchedule?.scheduleNote || '' }); setIsScheduleModalOpen(true); }}
                      />
                    </Tooltip>
                    <Tooltip label="Edit Lead">
                      <IconButton icon={<FiEdit2 />} size="sm" variant="ghost" colorScheme="blue" onClick={() => handleEdit(lead)} />
                    </Tooltip>
                    <Tooltip label={getLeadTicketStatus(lead.id) ? "Already assigned" : "Assign Lead"}>
                      <IconButton 
                        icon={<FiSend />} 
                        size="sm" 
                        variant="ghost" 
                        colorScheme="purple" 
                        onClick={() => openAssignModal(lead)}
                        isDisabled={!!getLeadTicketStatus(lead.id)}
                      />
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
          </TabPanel>

          {/* Schedule Tab */}
          <TabPanel px={0}>
            <StatGroup mb={6}>
              <Stat bg={cardBg} p={4} borderRadius="xl" border="1px solid" borderColor={borderColor} mr={4}>
                <StatLabel color="gray.500">Total Scheduled</StatLabel>
                <StatNumber>{scheduledLeads.length}</StatNumber>
              </Stat>
              <Stat bg={cardBg} p={4} borderRadius="xl" border="1px solid" borderColor={borderColor} mr={4}>
                <StatLabel color="orange.500">Upcoming</StatLabel>
                <StatNumber color="orange.500">{upcomingCount}</StatNumber>
              </Stat>
              <Stat bg={cardBg} p={4} borderRadius="xl" border="1px solid" borderColor={borderColor}>
                <StatLabel color="green.500">Completed</StatLabel>
                <StatNumber color="green.500">{completedScheduleCount}</StatNumber>
              </Stat>
            </StatGroup>

            <Box bg={cardBg} shadow="sm" rounded="2xl" border="1px solid" borderColor={borderColor} overflow="hidden">
              <Table variant="simple">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th py={5}>Customer</Th>
                    <Th py={5}>Phone</Th>
                    <Th py={5}>Scheduled Date</Th>
                    <Th py={5}>Note</Th>
                    <Th py={5}>Status</Th>
                    <Th py={5} textAlign="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {scheduledLeads.length === 0 ? (
                    <Tr><Td colSpan={6} textAlign="center" py={10} color="gray.400">No scheduled services</Td></Tr>
                  ) : (
                    [...scheduledLeads].sort((a, b) => new Date(a.serviceSchedule.scheduledDate) - new Date(b.serviceSchedule.scheduledDate)).map(lead => (
                      <Tr key={lead.id} _hover={{ bg: tableHeaderBg }}>
                        <Td fontWeight="bold">{lead.name}</Td>
                        <Td>{lead.phone}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Icon as={FiCalendar} color="blue.400" />
                            <Text>{new Date(lead.serviceSchedule.scheduledDate).toLocaleDateString('en-IN')}</Text>
                          </HStack>
                        </Td>
                        <Td fontSize="sm" color="gray.500">{lead.serviceSchedule.scheduleNote || '-'}</Td>
                        <Td>
                          <Badge
                            colorScheme={lead.serviceSchedule.scheduleStatus === 'Completed' ? 'green' : lead.serviceSchedule.scheduleStatus === 'Cancelled' ? 'red' : 'orange'}
                            variant="subtle" px={3} py={1} rounded="full"
                          >
                            {lead.serviceSchedule.scheduleStatus}
                          </Badge>
                        </Td>
                        <Td textAlign="right">
                          {lead.serviceSchedule.scheduleStatus === 'Upcoming' && (
                            <HStack justify="flex-end" spacing={1}>
                              <Tooltip label="Mark Completed">
                                <IconButton icon={<FiCheckCircle />} size="sm" variant="ghost" colorScheme="green" onClick={() => handleScheduleStatusUpdate(lead.id, 'Completed')} />
                              </Tooltip>
                              <Tooltip label="Cancel">
                                <IconButton icon={<FiXCircle />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleScheduleStatusUpdate(lead.id, 'Cancelled')} />
                              </Tooltip>
                            </HStack>
                          )}
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="600">Address</FormLabel>
                  <Input
                    placeholder="Enter address"
                    borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="600">Product Interest</FormLabel>
                  <Input
                    placeholder="What product/service are they interested in?"
                    borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                    value={formData.productInterest}
                    onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                  />
                </FormControl>
                <HStack>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Email</FormLabel>
                    <Input
                      type="email" placeholder="example@mail.com"
                      borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Phone</FormLabel>
                    <Input
                      placeholder="+91..."
                      borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </FormControl>
                </HStack>
                <HStack>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Source</FormLabel>
                    <Select
                      borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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
                    <FormLabel fontWeight="600">Lead Status</FormLabel>
                    <Select
                      borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Hot">Hot</option>
                      <option value="Warm">Warm</option>
                      <option value="Cold">Cold</option>
                    </Select>
                  </FormControl>
                </HStack>
              </Stack>
            </ModalBody>
            <ModalFooter py={6} bg={useColorModeValue('gray.50', 'gray.850')} borderBottomRadius="2xl">
              <Button variant="ghost" mr={3} onClick={handleCloseForm} borderRadius="xl" isDisabled={isSubmitting}>Cancel</Button>
              <Button type="submit" colorScheme="blue" borderRadius="xl" px={8} leftIcon={<FiSend />} isLoading={isSubmitting} isDisabled={isSubmitting}>
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
      {/* Assign Ticket Modal */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose} size="4xl" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" border="1px solid" borderColor={borderColor}>
          <ModalHeader py={6}>
            <HStack>
              <Icon as={FiSend} color="purple.500" />
              <Text>Assign Lead Ticket</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt={2} />
          <Divider />
          <form onSubmit={handleAssignSubmit}>
            <ModalBody py={6}>
              <Stack spacing={6}>
                <HStack spacing={6} align="start">
                  <VStack flex={1} align="stretch" spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="600">Select Lead</FormLabel>
                      <Select
                        placeholder="Choose a lead to assign"
                        borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}
                        value={selectedLeadForAssign?.id || ''}
                        onChange={(e) => {
                          const lead = leads.find(l => l.id === e.target.value);
                          setSelectedLeadForAssign(lead);
                        }}
                      >
                        {leads.filter(lead => !getLeadTicketStatus(lead.id)).map(lead => (
                          <option key={lead.id} value={lead.id}>
                            {lead.name} - {lead.phone} ({lead.status})
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="600">Assign To (Employee)</FormLabel>
                      <Select
                        placeholder="Select team member" borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}
                        value={assignData.employee}
                        onChange={(e) => setAssignData({ ...assignData, employee: e.target.value })}
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
                          value={assignData.priority}
                          onChange={(e) => setAssignData({ ...assignData, priority: e.target.value })}
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
                          value={assignData.dueDate}
                          onChange={(e) => setAssignData({ ...assignData, dueDate: e.target.value })}
                        />
                      </FormControl>
                    </HStack>
                  </VStack>

                  <VStack flex={1} align="stretch" spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="600">Task Instructions</FormLabel>
                      <Textarea
                        placeholder="Provide details about what the employee needs to do with this lead..."
                        borderRadius="xl" rows={8} bg={useColorModeValue('gray.50', 'gray.900')}
                        value={assignData.description}
                        onChange={(e) => setAssignData({ ...assignData, description: e.target.value })}
                      />
                    </FormControl>

                    {selectedLeadForAssign && (
                      <Box p={4} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.100">
                        <Text fontWeight="bold" fontSize="xs" color="purple.600" textTransform="uppercase" mb={2}>Selected Lead Info</Text>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm"><strong>Name:</strong> {selectedLeadForAssign.name}</Text>
                          <Text fontSize="sm"><strong>Phone:</strong> {selectedLeadForAssign.phone}</Text>
                          <Text fontSize="sm"><strong>Interest:</strong> {selectedLeadForAssign.productInterest || 'N/A'}</Text>
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </HStack>
              </Stack>
            </ModalBody>
            <ModalFooter py={6} bg={useColorModeValue('gray.50', 'gray.850')} borderBottomRadius="2xl">
              <Button variant="ghost" mr={3} onClick={onAssignClose} borderRadius="xl" isDisabled={isAssigning}>Cancel</Button>
              <Button type="submit" colorScheme="purple" borderRadius="xl" px={8} leftIcon={<FiSend />} isLoading={isAssigning} isDisabled={isAssigning}>
                Assign Ticket
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Schedule Service Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" border="1px solid" borderColor={borderColor}>
          <ModalHeader py={5}>
            <HStack spacing={3}>
              <Icon as={FiCalendar} color="blue.500" />
              <Text>Schedule Service</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt={2} />
          <Divider />
          <form onSubmit={handleScheduleSubmit}>
            <ModalBody py={6}>
              <Stack spacing={4}>
                {selectedLeadForSchedule && (
                  <Box p={3} bg="blue.50" borderRadius="xl">
                    <Text fontWeight="bold">{selectedLeadForSchedule.name}</Text>
                    <Text fontSize="sm" color="gray.600">{selectedLeadForSchedule.phone}</Text>
                  </Box>
                )}
                <FormControl isRequired>
                  <FormLabel fontWeight="600">Service Date</FormLabel>
                  <Input
                    type="date"
                    borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                    value={scheduleData.scheduledDate}
                    onChange={(e) => setScheduleData({ ...scheduleData, scheduledDate: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="600">Note (Optional)</FormLabel>
                  <Textarea
                    placeholder="Any special instructions..."
                    rows={3}
                    borderRadius="xl" focusBorderColor="blue.500" bg={useColorModeValue('gray.50', 'gray.900')}
                    value={scheduleData.scheduleNote}
                    onChange={(e) => setScheduleData({ ...scheduleData, scheduleNote: e.target.value })}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter py={5} bg={useColorModeValue('gray.50', 'gray.850')} borderBottomRadius="2xl">
              <Button variant="ghost" mr={3} onClick={() => setIsScheduleModalOpen(false)} borderRadius="xl">Cancel</Button>
              <Button type="submit" colorScheme="blue" borderRadius="xl" px={8} leftIcon={<FiCalendar />}>Schedule</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Show Lead Details Modal */}
      {isShowModalOpen && selectedLeadDetails && (
        <Modal isOpen={isShowModalOpen} onClose={() => setIsShowModalOpen(false)} size="6xl" isCentered>
          <ModalOverlay backdropFilter="blur(5px)" />
          <ModalContent borderRadius="2xl" border="1px solid" borderColor={borderColor}>
            <ModalHeader py={6}>
              <HStack spacing={3}>
                <Icon as={FiEye} color="green.500" />
                <Text>Lead Details - {selectedLeadDetails.lead.name}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <Divider />
            <ModalBody py={6}>
              <HStack spacing={8} align="start">
                {/* Lead Information */}
                <VStack flex={1} align="stretch" spacing={4}>
                  <Heading size="md" color="blue.500">Lead Information</Heading>
                  
                  <Stack spacing={3}>
                    <HStack justify="space-between">
                      <Text fontWeight="medium" opacity={0.7}>Name:</Text>
                      <Text fontWeight="bold">{selectedLeadDetails.lead.name}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="medium" opacity={0.7}>Phone:</Text>
                      <Text fontWeight="bold">{selectedLeadDetails.lead.phone}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="medium" opacity={0.7}>Email:</Text>
                      <Text fontWeight="bold">{selectedLeadDetails.lead.email || 'N/A'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="medium" opacity={0.7}>Address:</Text>
                      <Text fontWeight="bold">{selectedLeadDetails.lead.address || 'N/A'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="medium" opacity={0.7}>Product Interest:</Text>
                      <Text fontWeight="bold">{selectedLeadDetails.lead.productInterest || 'General'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="medium" opacity={0.7}>Lead Status:</Text>
                      <Badge colorScheme={getStatusColor(selectedLeadDetails.lead.status)} variant="subtle" px={3} py={1} rounded="full">
                        {selectedLeadDetails.lead.status?.toUpperCase()}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="medium" opacity={0.7}>Created:</Text>
                      <Text fontWeight="bold">{selectedLeadDetails.lead.date}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="medium" opacity={0.7}>Verified:</Text>
                      <Badge colorScheme={selectedLeadDetails.lead.verified ? 'green' : 'gray'} variant="subtle" px={3} py={1} rounded="full">
                        {selectedLeadDetails.lead.verified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </HStack>
                    {selectedLeadDetails.lead.serviceSchedule?.scheduledDate && (
                      <HStack justify="space-between">
                        <Text fontWeight="medium" opacity={0.7}>Scheduled Date:</Text>
                        <Text fontWeight="bold">
                          {new Date(selectedLeadDetails.lead.serviceSchedule.scheduledDate).toLocaleDateString('en-IN')}
                          {' '}({selectedLeadDetails.lead.serviceSchedule.scheduleStatus})
                        </Text>
                      </HStack>
                    )}
                  </Stack>
                </VStack>

                {/* Ticket Information */}
                <VStack flex={1} align="stretch" spacing={4}>
                  <Heading size="md" color="purple.500">Ticket Information</Heading>
                  
                  {selectedLeadDetails.ticket ? (
                    <Stack spacing={3}>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" opacity={0.7}>Assigned To:</Text>
                        <Text fontWeight="bold">{selectedLeadDetails.ticket.assignedTo}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" opacity={0.7}>Assigned By:</Text>
                        <Text fontWeight="bold">{selectedLeadDetails.ticket.assignedBy}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" opacity={0.7}>Priority:</Text>
                        <Text fontWeight="bold">{selectedLeadDetails.ticket.priority}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" opacity={0.7}>Status:</Text>
                        <Badge colorScheme={getTicketStatusColor(selectedLeadDetails.ticket.status)} variant="subtle" px={3} py={1} rounded="full">
                          {selectedLeadDetails.ticket.status}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" opacity={0.7}>Due Date:</Text>
                        <Text fontWeight="bold">{selectedLeadDetails.ticket.dueDate ? new Date(selectedLeadDetails.ticket.dueDate).toLocaleDateString('en-IN') : 'N/A'}</Text>
                      </HStack>
                      
                      {selectedLeadDetails.ticket.status === 'Completed' && (
                        <Box mt={6}>
                          <Heading size="sm" mb={4} color="green.500">Completion Details</Heading>
                          
                          {selectedLeadDetails.ticket.completedAt && (
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="medium" opacity={0.7}>Completed At:</Text>
                              <Text fontWeight="bold">{new Date(selectedLeadDetails.ticket.completedAt).toLocaleString('en-IN')}</Text>
                            </HStack>
                          )}
                          
                          {selectedLeadDetails.ticket.completionRemark && (
                            <Box mb={4}>
                              <Text fontWeight="medium" opacity={0.7} mb={2}>Completion Remark:</Text>
                              <Box p={3} bg="gray.50" borderRadius="lg">
                                <Text fontSize="sm">{selectedLeadDetails.ticket.completionRemark}</Text>
                              </Box>
                            </Box>
                          )}
                          
                          {selectedLeadDetails.ticket.employeeFeedback && (
                            <Box mb={4}>
                              <Text fontWeight="medium" opacity={0.7} mb={2}>Employee Feedback:</Text>
                              <Box p={3} bg="blue.50" borderRadius="lg">
                                <Text fontSize="sm">{selectedLeadDetails.ticket.employeeFeedback}</Text>
                              </Box>
                            </Box>
                          )}
                          
                          {(() => {
                            const photos = selectedLeadDetails.ticket.completionPhotos || 
                                          selectedLeadDetails.ticket.visitPhotos || 
                                          selectedLeadDetails.ticket.installationPhotos || 
                                          [];
                            console.log('Manager Panel - All photo fields:', {
                              completionPhotos: selectedLeadDetails.ticket.completionPhotos,
                              visitPhotos: selectedLeadDetails.ticket.visitPhotos,
                              installationPhotos: selectedLeadDetails.ticket.installationPhotos
                            });
                            
                            if (photos.length > 0) {
                              return (
                                <Box mb={4}>
                                  <Text fontWeight="medium" opacity={0.7} mb={2}>Completion Photos ({photos.length}):</Text>
                                  <SimpleGrid columns={2} spacing={2}>
                                    {photos.map((photo, index) => {
                                      console.log(`Manager Panel - Rendering photo ${index}:`, photo);
                                      return (
                                        <Image
                                          key={index}
                                          src={photo}
                                          alt={`Completion ${index + 1}`}
                                          w="full"
                                          h="32"
                                          objectFit="cover"
                                          borderRadius="lg"
                                          border="1px solid"
                                          borderColor={borderColor}
                                          cursor="pointer"
                                          onClick={() => window.open(photo, '_blank')}
                                          onError={(e) => {
                                            console.log('Manager Panel - Image load error:', photo);
                                            e.target.style.display = 'none';
                                          }}
                                          onLoad={() => {
                                            console.log('Manager Panel - Image loaded successfully:', photo);
                                          }}
                                        />
                                      );
                                    })}
                                  </SimpleGrid>
                                </Box>
                              );
                            } else {
                              return (
                                <Box mb={4}>
                                  <Text fontWeight="medium" opacity={0.7} mb={2} color="red.500">No completion photos found</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    completionPhotos: {JSON.stringify(selectedLeadDetails.ticket.completionPhotos)}<br/>
                                    visitPhotos: {JSON.stringify(selectedLeadDetails.ticket.visitPhotos)}<br/>
                                    installationPhotos: {JSON.stringify(selectedLeadDetails.ticket.installationPhotos)}
                                  </Text>
                                </Box>
                              );
                            }
                          })()}
                        </Box>
                      )}
                      
                      {selectedLeadDetails.ticket.description && (
                        <Box mt={4}>
                          <Text fontWeight="medium" opacity={0.7} mb={2}>Task Description:</Text>
                          <Box p={3} bg="gray.50" borderRadius="lg">
                            <Text fontSize="sm">{selectedLeadDetails.ticket.description}</Text>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  ) : (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500">No ticket assigned for this lead</Text>
                    </Box>
                  )}
                </VStack>
              </HStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setIsShowModalOpen(false)} borderRadius="xl">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
