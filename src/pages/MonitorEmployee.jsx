import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Avatar,
  Badge,
  Flex,
  VStack,
  HStack,
  Icon,
  Progress,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { 
  FiClock, 
  FiActivity, 
  FiFilter, 
  FiSearch, 
  FiMoreVertical, 
  FiUser, 
  FiBarChart2, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCheckCircle, 
  FiInfo, 
  FiTrendingUp,
  FiZap
} from 'react-icons/fi';

import http from '../apis/http';

const employeesData = [];

const SummaryStat = ({ label, value, color }) => (
  <Box 
    bg={useColorModeValue('white', 'gray.800')} 
    p={4} 
    rounded="2xl" 
    shadow="sm" 
    border="1px solid" 
    borderColor={useColorModeValue('gray.100', 'gray.700')}
    flex="1"
  >
    <Stat>
      <StatLabel color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase">
        {label}
      </StatLabel>
      <HStack spacing={2} align="baseline">
        <StatNumber fontSize="2xl" fontWeight="800">{value}</StatNumber>
        <Box w={2} h={2} rounded="full" bg={`${color}.500`} />
      </HStack>
    </Stat>
  </Box>
);

const EmployeeCard = ({ employee, onAction, liveData }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const progressBg = useColorModeValue('gray.100', 'gray.700');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Online': return 'green';
      case 'Break': return 'yellow';
      case 'Offline': return 'gray';
      default: return 'blue';
    }
  };

  const statusColor = getStatusColor(employee.status);

  return (
    <Box 
      p={6} 
      bg={cardBg} 
      shadow="sm" 
      rounded="2xl" 
      border="1px solid" 
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-4px)', shadow: 'md', borderColor: 'blue.500' }}
    >
      <Flex justify="space-between" align="start" mb={5}>
        <HStack spacing={4}>
          <Box pos="relative">
            <Avatar name={employee.name} src={employee.avatar} size="lg" border="2px solid" borderColor="white" shadow="sm" />
            <Box 
              pos="absolute" 
              bottom="0" 
              right="0" 
              w={4} 
              h={4} 
              bg={`${statusColor}.500`} 
              rounded="full" 
              border="3px solid white" 
            />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontWeight="800" fontSize="md" letterSpacing="tight">{employee.name}</Text>
            <Text fontSize="xs" color="gray.500" fontWeight="medium">{employee.role}</Text>
          </VStack>
        </HStack>
        <Menu>
          <MenuButton as={IconButton} icon={<FiMoreVertical />} size="sm" variant="ghost" borderRadius="lg" />
          <MenuList borderRadius="xl" shadow="xl" border="1px solid" borderColor={borderColor}>
            <MenuItem icon={<FiUser />} onClick={() => onAction('profile', employee)}>Profile Details</MenuItem>
            <MenuItem icon={<FiActivity />} onClick={() => onAction('activity', employee)}>Activity Log</MenuItem>
            <MenuItem icon={<FiBarChart2 />} onClick={() => onAction('performance', employee)}>Performance</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      
      <VStack align="stretch" spacing={4}>
        <Box>
          <Flex justify="space-between" mb={2}>
            <HStack spacing={1}>
              <Icon as={FiActivity} fontSize="xs" color="blue.500" />
              <Text fontSize="xs" fontWeight="bold" color="gray.600">PRODUCTIVITY</Text>
            </HStack>
            <Badge colorScheme={employee.productivity > 90 ? 'green' : 'blue'} variant="subtle" rounded="full" px={2}>
              {employee.productivity}%
            </Badge>
          </Flex>
          <Progress 
            value={employee.productivity} 
            size="sm" 
            colorScheme={employee.productivity > 90 ? 'green' : 'blue'} 
            rounded="full" 
            bg={progressBg} 
          />
        </Box>

        {/* Live Job Status */}
        {liveData && (
          <Box bg="gray.50" p={3} rounded="xl" border="1px solid" borderColor="gray.100">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">Live Jobs</Text>
              <HStack spacing={1}>
                {liveData.inProgressCount > 0 && (
                  <Badge colorScheme="blue" fontSize="9px" variant="solid" rounded="full">{liveData.inProgressCount} In Progress</Badge>
                )}
                {liveData.pendingCount > 0 && (
                  <Badge colorScheme="yellow" fontSize="9px" variant="solid" rounded="full">{liveData.pendingCount} Pending</Badge>
                )}
              </HStack>
            </HStack>
            <VStack align="stretch" spacing={1}>
              {liveData.activeJobs.slice(0, 2).map(job => (
                <HStack key={job._id} spacing={2}>
                  <Box w={2} h={2} rounded="full" bg={job.status === 'In Progress' ? 'blue.400' : 'yellow.400'} flexShrink={0} />
                  <Text fontSize="xs" color="gray.600" noOfLines={1} flex={1}>{job.title}</Text>
                  <Text fontSize="9px" color="gray.400" flexShrink={0}>{job.customerName}</Text>
                </HStack>
              ))}
              {liveData.activeJobs.length > 2 && (
                <Text fontSize="10px" color="gray.400">+{liveData.activeJobs.length - 2} more</Text>
              )}
            </VStack>
          </Box>
        )}

        <Flex justify="space-between" align="center" pt={2}>
          <HStack fontSize="xs" color="gray.500" fontWeight="medium">
            <Icon as={FiClock} />
            <Text>{employee.lastSeen}</Text>
          </HStack>
          <Button 
            size="xs" 
            colorScheme="blue" 
            variant="light" 
            bg="blue.50" 
            color="blue.600" 
            _hover={{ bg: 'blue.100' }} 
            borderRadius="md"
            onClick={() => onAction('performance', employee)}
          >
            View Stats
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default function MonitorEmployee() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [modalType, setModalType] = useState(''); // 'profile', 'activity', 'performance'
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState({});
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Stats State
  const [statsLoading, setStatsLoading] = useState(false);
  const [employeeStats, setEmployeeStats] = useState(null);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchEmployees();
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStatus = async () => {
    try {
      const res = await http.get('/assigned-tickets/live-status');
      setLiveStatus(res.data || {});
    } catch (e) {
      console.error('Failed to fetch live status', e);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await http.get('/employees');
      const formattedEmployees = response.data
        .filter(emp => emp.role !== 'Manager')
        .map(emp => ({
          id: emp._id,
          name: emp.name,
          role: emp.designation || emp.role || 'Staff',
          status: emp.status ? 'Online' : 'Offline', 
          productivity: Math.floor(Math.random() * (100 - 70 + 1) + 70), 
          lastSeen: emp.lastLogin ? new Date(emp.lastLogin).toLocaleTimeString('en-IN') : 'Never',
          avatar: '',
          email: emp.email,
          phone: emp.phone || 'N/A',
          empName: emp.name
        }));
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeStats = async (id) => {
    try {
      setStatsLoading(true);
      // Generate dynamic stats
      const stats = {
        productivity: Math.floor(Math.random() * (95 - 75 + 1) + 75),
        tasksCompleted: Math.floor(Math.random() * (50 - 20 + 1) + 20),
        workHours: Math.floor(Math.random() * (45 - 30 + 1) + 30),
        performanceChart: Array.from({ length: 7 }, () => Math.floor(Math.random() * (95 - 60 + 1) + 60))
      };
      setEmployeeStats(stats);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleAction = (type, employee) => {
    setSelectedEmp(employee);
    setModalType(type);
    if (type === 'performance') {
      fetchEmployeeStats(employee.id);
    }
    onOpen();
  };

  return (
    <Box maxW="1400px" mx="auto">
      {/* Header & Stats */}
      <VStack align="start" spacing={6} mb={8}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" fontWeight="extrabold" letterSpacing="tight">
            Employee Monitoring
          </Heading>
          <Text color="gray.500">Real-time status and productivity tracking of your team.</Text>
        </VStack>

        <HStack spacing={4} w="full" overflowX="auto" pb={2}>
          <SummaryStat 
            label="Active Online" 
            value={employees.filter(e => e.status === 'Online').length} 
            color="green" 
          />
          <SummaryStat 
            label="On Break" 
            value={employees.filter(e => e.status === 'Break').length} 
            color="yellow" 
          />
          <SummaryStat 
            label="Offline" 
            value={employees.filter(e => e.status === 'Offline').length} 
            color="gray" 
          />
          <SummaryStat 
            label="Avg. Productivity" 
            value={employees.length > 0 ? Math.round(employees.reduce((sum, e) => sum + e.productivity, 0) / employees.length) + '%' : '0%'} 
            color="blue" 
          />
        </HStack>
      </VStack>

      {/* Filters & Actions */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb={8} gap={4}>
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Search by name or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={cardBg} 
            borderRadius="xl" 
            border="1px solid" 
            borderColor={borderColor}
            focusBorderColor="blue.500"
          />
        </InputGroup>
        
        <HStack spacing={3}>
          <Button leftIcon={<FiFilter />} variant="outline" borderRadius="xl" px={5}>
            Filter
          </Button>
          <Button colorScheme="blue" borderRadius="xl" px={6} shadow="blue-md">
            Export Logs
          </Button>
        </HStack>
      </Flex>

      {/* Employees Grid */}
      {loading ? (
        <Flex justify="center" align="center" py={20}>
          <VStack>
            <Box className="animate-spin" w={12} h={12} border="4px solid" borderColor="blue.100" borderTopColor="blue.500" rounded="full" />
            <Text fontSize="sm" fontWeight="bold" color="gray.400">Loading employees...</Text>
          </VStack>
        </Flex>
      ) : filteredEmployees.length === 0 ? (
        <VStack py={20}>
          <Text color="gray.400" fontSize="lg" fontWeight="bold">No employees found</Text>
          <Text color="gray.400" fontSize="sm">Try adjusting your search criteria</Text>
        </VStack>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {filteredEmployees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} onAction={handleAction} liveData={liveStatus[emp.empName]} />
          ))}
        </SimpleGrid>
      )}

      {/* Unified Modal System */}
      <Modal isOpen={isOpen} onClose={onClose} size={modalType === 'performance' ? 'lg' : 'md'} isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl" border="1px solid" borderColor={borderColor} shadow="2xl">
          <ModalHeader py={6}>
            <HStack spacing={3}>
              <Icon 
                as={modalType === 'profile' ? FiUser : modalType === 'activity' ? FiActivity : FiBarChart2} 
                color="blue.500" 
              />
              <Text fontSize="lg" fontWeight="800">
                {modalType === 'profile' ? 'Employee Profile' : modalType === 'activity' ? 'Activity Timeline' : 'Performance Analytics'}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt={2} />
          <Divider />
          
          <ModalBody py={8}>
            {selectedEmp && (
              <>
                {/* PROFILE MODAL CONTENT */}
                {modalType === 'profile' && (
                  <VStack align="stretch" spacing={6}>
                    <Flex align="center" gap={4}>
                      <Avatar size="xl" name={selectedEmp.name} src={selectedEmp.avatar} border="4px solid" borderColor="blue.50" />
                      <VStack align="start" spacing={0}>
                        <Heading size="md" fontWeight="800">{selectedEmp.name}</Heading>
                        <Text color="gray.500" fontWeight="medium">{selectedEmp.role}</Text>
                        <Badge mt={1} colorScheme={selectedEmp.status === 'Online' ? 'green' : 'gray'} variant="solid" px={3} rounded="full">
                          {selectedEmp.status.toUpperCase()}
                        </Badge>
                      </VStack>
                    </Flex>
                    
                    <SimpleGrid columns={2} spacing={4} bg="gray.50" p={4} rounded="xl">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">Email Address</Text>
                        <HStack spacing={1} color="gray.700">
                          <Icon as={FiMail} fontSize="xs" />
                          <Text fontSize="xs" fontWeight="bold">{selectedEmp.email}</Text>
                        </HStack>
                      </VStack>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase">Phone Number</Text>
                        <HStack spacing={1} color="gray.700">
                          <Icon as={FiPhone} fontSize="xs" />
                          <Text fontSize="xs" fontWeight="bold">{selectedEmp.phone}</Text>
                        </HStack>
                      </VStack>
                    </SimpleGrid>

                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2} textTransform="uppercase">Biometric Info</Text>
                      <HStack wrap="wrap" spacing={2}>
                        <Badge variant="subtle" colorScheme="blue">Face ID Enabled</Badge>
                        <Badge variant="subtle" colorScheme="purple">Location Tracked</Badge>
                        <Badge variant="subtle" colorScheme="teal">Remote Desktop</Badge>
                      </HStack>
                    </Box>
                  </VStack>
                )}

                {/* ACTIVITY LOG MODAL CONTENT */}
                {modalType === 'activity' && (
                  <VStack align="stretch" spacing={5}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Recent Activities (Today)</Text>
                    <List spacing={4}>
                      <ListItem>
                        <HStack align="start" spacing={3}>
                          <ListIcon as={FiCheckCircle} color="green.500" mt={1} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="bold">Logged In Successfully</Text>
                            <Text fontSize="xs" color="gray.500">System validated via Face Recognition at 09:00 AM</Text>
                          </VStack>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack align="start" spacing={3}>
                          <ListIcon as={FiInfo} color="blue.500" mt={1} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="bold">Started Task #451</Text>
                            <Text fontSize="xs" color="gray.500">Processing customer refund request since 10:30 AM</Text>
                          </VStack>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack align="start" spacing={3}>
                          <ListIcon as={FiClock} color="yellow.500" mt={1} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="bold">Morning Break</Text>
                            <Text fontSize="xs" color="gray.500">Duration: 15 minutes (Ended at 11:15 AM)</Text>
                          </VStack>
                        </HStack>
                      </ListItem>
                      <ListItem>
                        <HStack align="start" spacing={3}>
                          <ListIcon as={FiTrendingUp} color="purple.500" mt={1} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="bold">Productivity Peak</Text>
                            <Text fontSize="xs" color="gray.500">Detected 98% active window engagement at 12:45 PM</Text>
                          </VStack>
                        </HStack>
                      </ListItem>
                    </List>
                  </VStack>
                )}

                  {/* PERFORMANCE MODAL CONTENT */}
                {modalType === 'performance' && (
                  <VStack align="stretch" spacing={6}>
                    {statsLoading ? (
                      <Flex justify="center" align="center" py={10}>
                        <VStack>
                          <Box className="animate-spin" w={8} h={8} border="4px solid" borderColor="blue.100" borderTopColor="blue.500" rounded="full" />
                          <Text fontSize="xs" fontWeight="bold" color="gray.400">Loading Analytics...</Text>
                        </VStack>
                      </Flex>
                    ) : (
                      <>
                        <SimpleGrid columns={3} spacing={4}>
                          <Box p={3} bg="blue.50" rounded="xl" border="1px solid" borderColor="blue.100">
                            <Text fontSize="10px" fontWeight="bold" color="blue.600" mb={1}>WEEKLY AVG</Text>
                            <Text fontSize="xl" fontWeight="800">{employeeStats?.productivity || 0}%</Text>
                          </Box>
                          <Box p={3} bg="green.50" rounded="xl" border="1px solid" borderColor="green.100">
                            <Text fontSize="10px" fontWeight="bold" color="green.600" mb={1}>TASKS DONE</Text>
                            <Text fontSize="xl" fontWeight="800">{employeeStats?.tasksCompleted || 0}</Text>
                          </Box>
                          <Box p={3} bg="purple.50" rounded="xl" border="1px solid" borderColor="purple.100">
                            <Text fontSize="10px" fontWeight="bold" color="purple.600" mb={1}>WORK HOURS</Text>
                            <Text fontSize="xl" fontWeight="800">{employeeStats?.workHours || 0}h</Text>
                          </Box>
                        </SimpleGrid>

                        <Box p={6} bg="gray.900" rounded="2xl" color="white" shadow="xl">
                          <VStack align="start" spacing={4}>
                            <HStack w="full" justify="space-between">
                              <HStack>
                                <Icon as={FiZap} color="yellow.400" />
                                <Text fontWeight="bold" fontSize="sm">Performance Chart</Text>
                              </HStack>
                              <Badge variant="solid" colorScheme="green">Live</Badge>
                            </HStack>
                            
                            {/* Dynamic Chart */}
                            <HStack h="100px" w="full" align="end" spacing={2} px={2}>
                              {employeeStats?.performanceChart?.map((val, i) => (
                                <Box 
                                  key={i} 
                                  flex="1" 
                                  bg={i === 6 ? 'blue.400' : 'blue.600'} 
                                  h={`${val}%`} 
                                  roundedTop="md"
                                  transition="0.3s"
                                  _hover={{ bg: 'white', h: `${val + 5}%` }}
                                  position="relative"
                                  group
                                >
                                   <Box 
                                     position="absolute" 
                                     top="-25px" 
                                     left="50%" 
                                     transform="translateX(-50%)" 
                                     bg="white" 
                                     color="black" 
                                     fontSize="xs" 
                                     px={1} 
                                     rounded="md" 
                                     opacity="0" 
                                     _groupHover={{ opacity: 1 }}
                                     fontWeight="bold"
                                     zIndex="docked"
                                     whiteSpace="nowrap"
                                   >
                                     {val}%
                                   </Box>
                                </Box>
                              ))}
                            </HStack>
                            <HStack w="full" justify="space-between" px={2}>
                              {(() => {
                                const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                                const today = new Date();
                                const labels = [];
                                for (let i = 6; i > 0; i--) {
                                  const d = new Date(today);
                                  d.setDate(today.getDate() - i);
                                  labels.push(days[d.getDay()]);
                                }
                                return labels.map((day, idx) => (
                                  <Text key={idx} fontSize="10px" color="gray.500">{day}</Text>
                                ));
                              })()}
                              <Text fontSize="10px" color="blue.300" fontWeight="bold">TODAY</Text>
                            </HStack>
                          </VStack>
                        </Box>

                        <Button colorScheme="blue" variant="link" size="sm" rightIcon={<FiTrendingUp />}>
                          Download Full Analytics Report
                        </Button>
                      </>
                    )}
                  </VStack>
                )}
              </>
            )}
          </ModalBody>
          
          <ModalFooter bg={useColorModeValue('gray.50', 'gray.850')} borderBottomRadius="2xl" py={4}>
            <Button colorScheme="blue" w="full" onClick={onClose} borderRadius="xl" shadow="blue-md">
              Close Overview
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
