import React, { useState } from 'react';
import {
  Box,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Button,
  SimpleGrid,
  Text,
  Flex,
  Icon,
  Divider,
  VStack,
  HStack,
  useColorModeValue,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { FiDownload, FiPieChart, FiBarChart, FiCalendar, FiFileText, FiCheckCircle, FiInfo } from 'react-icons/fi';
import http from '../apis/http';

const ReportTypeCard = ({ title, description, icon, active, onClick }) => {
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeBorder = useColorModeValue('blue.500', 'blue.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const descColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      p={6}
      bg={active ? activeBg : cardBg}
      border="2px solid"
      borderColor={active ? activeBorder : borderColor}
      rounded="2xl"
      cursor="pointer"
      transition="all 0.3s ease"
      position="relative"
      overflow="hidden"
      _hover={{ transform: 'translateY(-4px)', shadow: 'lg', borderColor: active ? activeBorder : 'blue.200' }}
      onClick={onClick}
    >
      {active && (
        <Box position="absolute" top={2} right={2} color="blue.500">
          <Icon as={FiCheckCircle} w={5} h={5} />
        </Box>
      )}
      <VStack spacing={4} align="start">
        <Flex
          w={12}
          h={12}
          bg={active ? 'blue.500' : useColorModeValue('gray.50', 'gray.700')}
          color={active ? 'white' : 'blue.500'}
          rounded="xl"
          align="center"
          justify="center"
          transition="0.3s"
        >
          <Icon as={icon} w={6} h={6} />
        </Flex>
        <Box>
          <Text fontWeight="800" fontSize="lg" color={textColor} mb={1}>{title}</Text>
          <Text fontSize="sm" color={descColor} lineHeight="short">{description}</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default function GenerateReport() {
  const [selectedType, setSelectedType] = useState('sales');
  const [timePeriod, setTimePeriod] = useState('last_30');
  const [exportFormat, setExportFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.950');

  const filterDataByTime = (data, dateField) => {
    const now = new Date();
    const subDays = (days) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
    
    let cutoffDate;
    if (timePeriod === 'last_7') cutoffDate = subDays(7);
    else if (timePeriod === 'last_30') cutoffDate = subDays(30);
    else if (timePeriod === 'this_month') cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else return data; // Custom or all

    return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= cutoffDate;
    });
  };

  const generateCSV = (data, filename) => {
    if (!data || !data.length) return null;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
        let rawData = [];
        let formattedData = [];

        // SALES REPORT
        if (selectedType === 'sales') {
            const { data } = await http.get('/api/orders');
            rawData = data.orders || [];
            const filtered = filterDataByTime(rawData, 'createdAt');
            
            formattedData = filtered.map(order => ({
                OrderID: order._id.slice(-8),
                Customer: order.shippingAddress?.name || 'Guest',
                Phone: order.shippingAddress?.phone || 'N/A',
                Amount: `₹${order.total}`,
                Status: order.status,
                Payment: order.paymentMethod,
                PaymentStatus: order.paymentStatus,
                Date: new Date(order.createdAt).toLocaleDateString('en-IN'),
                Items: order.items.length,
                Source: order.source || 'online'
            }));
        } 
        // TICKET ANALYTICS
        else if (selectedType === 'ticket') {
             const { data } = await http.get('/api/assigned-tickets');
             const filtered = filterDataByTime(data, 'createdAt');
             
             formattedData = filtered.map((t, idx) => ({
                 TicketNumber: `TKT-${String(idx + 1).padStart(4, '0')}`,
                 Title: t.title,
                 Customer: t.customerName || 'N/A',
                 Phone: t.customerPhone || 'N/A',
                 AssignedTo: t.assignedTo,
                 AssignedBy: t.assignedBy,
                 Priority: t.priority,
                 Status: t.status,
                 DueDate: new Date(t.dueDate).toLocaleDateString('en-IN'),
                 CreatedDate: new Date(t.createdAt).toLocaleDateString('en-IN')
             }));
        }
        // ACTIVITY REPORT (Employees)
        else if (selectedType === 'activity') {
            const { data } = await http.get('/api/employees');
            formattedData = data.map(emp => ({
                ID: emp._id.slice(-8),
                Name: emp.name,
                Email: emp.email,
                Phone: emp.phone || 'N/A',
                Role: emp.role,
                Designation: emp.designation || 'N/A',
                Department: emp.department || 'N/A',
                Status: emp.status ? 'Active' : 'Inactive',
                JoinDate: emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN') : 'N/A'
            }));
        }

        if (formattedData.length === 0) {
            toast({
                title: "No Data Found",
                description: "No records found for the selected criteria.",
                status: "warning",
                duration: 3000,
                position: "top-right",
            });
            return;
        }

        // Generate Download
        // Note: For now only CSV is implemented client-side for "Proper" dynamic without heavy libs
        generateCSV(formattedData, `${selectedType}_report`);

        toast({
            title: "Report Downloaded",
            description: `Successfully generated ${selectedType} report with ${formattedData.length} records.`,
            status: "success",
            duration: 3000,
            position: "top-right",
        });

    } catch (error) {
        console.error("Report Generation Failed:", error);
        toast({
            title: "Generation Failed",
            description: "Could not fetch data for report. Please try again.",
            status: "error",
            duration: 3000,
            position: "top-right",
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Box maxW="1200px" mx="auto">
      {/* Header */}
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" fontWeight="extrabold" letterSpacing="tight">
          Analytics & Reports
        </Heading>
        <Text color="gray.500">Generate detailed business insights and performance metrics.</Text>
      </VStack>

      {/* Step 1: Select Type */}
      <Box mb={10}>
        <HStack mb={5} spacing={2} color="blue.500">
          <Icon as={FiPieChart} />
          <Text fontWeight="bold" fontSize="sm" textTransform="uppercase" letterSpacing="widest">Step 1: Select Report Type</Text>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <ReportTypeCard 
            title="Sales Report" 
            description="Detailed revenue, product sales, and transaction history."
            icon={FiBarChart} 
            active={selectedType === 'sales'} 
            onClick={() => setSelectedType('sales')}
          />
          <ReportTypeCard 
            title="Ticket Analytics" 
            description="Resolution times, agent performance, and support volume."
            icon={FiFileText} 
            active={selectedType === 'ticket'} 
            onClick={() => setSelectedType('ticket')}
          />
          <ReportTypeCard 
            title="Team Activity" 
            description="Monitor employee check-ins, tasks, and productivity logs."
            icon={FiCalendar} 
            active={selectedType === 'activity'} 
            onClick={() => setSelectedType('activity')}
          />
        </SimpleGrid>
      </Box>

      {/* Step 2: Configuration */}
      <Box 
        bg={cardBg} 
        p={{ base: 6, md: 10 }} 
        rounded="3xl" 
        shadow="sm" 
        border="1px solid" 
        borderColor={borderColor}
      >
        <HStack mb={8} spacing={2} color="blue.500">
          <Icon as={FiDownload} />
          <Text fontWeight="bold" fontSize="sm" textTransform="uppercase" letterSpacing="widest">Step 2: Configuration & Export</Text>
        </HStack>

        <Stack spacing={8}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <FormControl>
              <FormLabel fontWeight="700" color="gray.600" fontSize="sm">Time Period</FormLabel>
              <Select 
                h="50px" borderRadius="xl" focusBorderColor="blue.500" bg={sectionBg}
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
              >
                <option value="last_7">Last 7 Days</option>
                <option value="last_30">Last 30 Days</option>
                <option value="this_month">This Month</option>
                <option value="all_time">All Time</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="700" color="gray.600" fontSize="sm">Export Format</FormLabel>
              <Select 
                h="50px" borderRadius="xl" focusBorderColor="blue.500" bg={sectionBg}
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="csv">CSV File (.csv)</option>
                <option value="excel">Excel Sheet (.xlsx) - (CSV)</option>
                <option value="pdf">PDF Document (.pdf) - (CSV)</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          <Box p={4} bg="blue.50" rounded="2xl" border="1px dashed" borderColor="blue.200">
            <HStack align="start" spacing={3}>
              <Icon as={FiInfo} color="blue.500" mt={1} />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="blue.700">Report Preview</Text>
                <Text fontSize="xs" color="blue.600">
                    Generating <strong>{selectedType.toUpperCase()}</strong> report for <strong>{timePeriod.replace('_', ' ').toUpperCase()}</strong>.
                </Text>
              </VStack>
            </HStack>
          </Box>

          <Divider />
          
          <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
            <Badge colorScheme="blue" variant="subtle" px={4} py={2} rounded="full">
              Ready to process {selectedType} data
            </Badge>
            <Button 
              leftIcon={<FiDownload />} 
              colorScheme="blue" 
              size="lg" 
              px={10} 
              borderRadius="2xl"
              isLoading={loading}
              loadingText="Processing..."
              onClick={handleGenerate}
              shadow="blue-md"
              _hover={{ transform: 'translateY(-2px)', shadow: 'blue-lg' }}
            >
              Generate & Download
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}
