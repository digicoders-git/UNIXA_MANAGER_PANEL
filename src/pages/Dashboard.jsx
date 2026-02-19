import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Heading,
  Text,
  Flex,
  Icon,
  useColorModeValue,
  Badge,
  HStack,
  VStack,
  Button,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react';
import { FiTrendingUp, FiClipboard, FiActivity, FiUsers, FiCheckCircle } from 'react-icons/fi';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useNavigate } from 'react-router-dom';
import http from '../apis/http';

// Premium Stat Card Component
const StatCard = ({ title, stat, icon, helpText, type, color, onClick }) => {
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
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-4px)', shadow: 'md', borderColor: 'blue.500', cursor: 'pointer' }}
      onClick={onClick}
    >
      <Flex justifyContent="space-between" align="center">
        <Box>
          <StatLabel fontWeight="semibold" color="gray.500" fontSize="sm">
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">
            {stat}
          </StatNumber>
          <StatHelpText mb={0} display="flex" alignItems="center">
            <StatArrow type={type} />
            <Text as="span" fontWeight="medium" color={type === 'increase' ? 'green.500' : 'red.500'} fontSize="sm">
              {helpText}
            </Text>
          </StatHelpText>
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
          <Icon as={icon} w={6} h={6} />
        </Flex>
      </Flex>
    </Stat>
  );
};

export default function Dashboard() {
  const cardBg = useColorModeValue('white', 'gray.800');
  const gridColor = useColorModeValue('#EDF2F7', '#2D3748');
  const activityHoverBg = useColorModeValue('gray.50', 'gray.700');
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    totalLeads: 0,
    totalEmployees: 0
  });
  const [chartData, setChartData] = useState({
    categories: [],
    series: []
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Assuming API base URL is set in axios defaults or we use full path
      // Since Login uses full path, I will use full path here too for consistency, 
      // though creating an axios instance or setting base URL
      setLoading(true);
      const response = await http.get('/manager-dashboard/stats');
      const { stats, chart, recentActivity } = response.data;
      
      setStats(stats);
      setChartData(chart);
      setRecentActivity(recentActivity);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error fetching data",
        description: "Could not load dashboard stats.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Highcharts Configuration for Weekly Performance
  const chartOptions = {
    chart: { 
      type: 'areaspline', 
      backgroundColor: 'transparent',
      height: 350,
      style: { fontFamily: 'Inter, sans-serif' }
    },
    title: { text: null },
    xAxis: {
      categories: chartData.categories,
      gridLineWidth: 0,
      labels: { style: { color: '#A0AEC0', fontSize: '12px' } },
      lineWidth: 0,
    },
    yAxis: {
      title: { text: null },
      gridLineColor: gridColor,
      labels: { style: { color: '#A0AEC0' } }
    },
    tooltip: {
      shared: true,
      backgroundColor: useColorModeValue('#fff', '#1A202C'),
      borderColor: '#3182CE',
      borderRadius: 10,
      style: { color: useColorModeValue('#1A202C', '#fff') }
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.1
      },
      series: {
        marker: { enabled: false },
        lineWidth: 3
      }
    },
    series: chartData.series,
    credits: { enabled: false },
    legend: { 
      itemStyle: { color: useColorModeValue('#2D3748', '#A0AEC0') },
      verticalAlign: 'top' 
    }
  };

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
        <Heading size="lg" fontWeight="extrabold" letterSpacing="tight">
          Manager Overview 
        </Heading>
        <Text color="gray.500">Track team performance and metrics in real-time.</Text>
      </VStack>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title="Total Tickets"
          stat={stats.totalTickets}
          icon={FiTrendingUp}
          helpText="Total Complaints"
          type="increase"
          color="blue"
          onClick={() => navigate('/assign-ticket')} 
        />
        <StatCard
          title="Total Leads"
          stat={stats.totalLeads}
          icon={FiUsers}
          helpText="New Enquiries"
          type="increase"
          color="teal"
          onClick={() => navigate('/manage-lead')} 
        />
        <StatCard
          title="Pending Tickets"
          stat={stats.pendingTickets}
          icon={FiClipboard}
          helpText="Needs Action"
          type="decrease"
          color="red"
          onClick={() => navigate('/assign-ticket?status=pending')} // In future, handle filters or just navigate
        />
        <StatCard
          title="Total Employees"
          stat={stats.totalEmployees}
          icon={FiUsers}
          helpText="Active Staff"
          type="increase"
          color="orange"
           onClick={() => navigate('/monitor-employee')} 
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        {/* Weekly Performance Section */}
        <Box bg={cardBg} p={6} rounded="2xl" shadow="sm" border="1px solid" borderColor={useColorModeValue('gray.100', 'gray.700')}>
          <Flex justify="space-between" align="center" mb={6}>
            <VStack align="start" spacing={0}>
              <Heading size="md" fontWeight="bold">Weekly Performance</Heading>
              <Text fontSize="sm" color="gray.500">Tickets & Leads tracking</Text>
            </VStack>
            <Badge colorScheme="blue" variant="subtle" rounded="full" px={3} py={1}>
              Last 7 Days
            </Badge>
          </Flex>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </Box>

        {/* Recent Activity Section (Previously Team Activity) */}
        <Box bg={cardBg} p={6} rounded="2xl" shadow="sm" border="1px solid" borderColor={useColorModeValue('gray.100', 'gray.700')}>
          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="md">Recent Activity</Heading>
          </Flex>
          <VStack spacing={4} align="stretch">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, i) => (
                <Flex key={i} justify="space-between" align="center" p={3} _hover={{ bg: activityHoverBg }} rounded="xl" transition="0.2s cursor: pointer">
                  <HStack spacing={4}>
                    <Box w={2} h={2} rounded="full" bg={`${item.color}.500`} />
                    <Box>
                      <Text fontSize="sm"><Text as="span" fontWeight="bold">{item.name}</Text> {item.action}</Text>
                      <Text fontSize="xs" color="gray.500">{item.time}</Text>
                    </Box>
                  </HStack>
                  <Icon as={FiActivity} color="gray.300" />
                </Flex>
              ))
            ) : (
                <Text fontSize="sm" color="gray.500">No recent activity.</Text>
            )}
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
