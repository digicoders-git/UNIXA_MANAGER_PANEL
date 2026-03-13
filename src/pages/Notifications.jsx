import React, { useState, useEffect } from 'react';
import http from '../apis/http';
import {
  Box,
  Heading,
  VStack,
  Text,
  HStack,
  Icon,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  useColorModeValue,
  Button,
  Divider,
} from '@chakra-ui/react';
import { FiBell, FiMoreVertical, FiCheck, FiTrash2, FiMessageSquare, FiUserPlus, FiAlertCircle, FiInfo } from 'react-icons/fi';

const initialNotifications = [
  {
    id: 1,
    title: 'New Account Created',
    desc: 'Amit Kumar has successfully joined the support team.',
    time: '2 minutes ago',
    type: 'user',
    isRead: false,
    priority: 'medium'
  },
  {
    id: 2,
    title: 'Urgent Ticket Assigned',
    desc: 'You have been assigned to Ticket #4521 regarding Server Downtime.',
    time: '15 minutes ago',
    type: 'alert',
    isRead: false,
    priority: 'high'
  },
  {
    id: 3,
    title: 'Lead Converted',
    desc: 'Rohan Gupta just converted a high-value lead from Website.',
    time: '1 hour ago',
    type: 'success',
    isRead: true,
    priority: 'low'
  },
  {
    id: 4,
    title: 'Report Ready',
    desc: 'The weekly performance report for Jan 2024 is now available.',
    time: '3 hours ago',
    type: 'info',
    isRead: true,
    priority: 'low'
  },
  {
    id: 5,
    title: 'System Update',
    desc: 'Server maintenance scheduled for tonight at 12:00 AM.',
    time: 'Yesterday',
    type: 'info',
    isRead: true,
    priority: 'medium'
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await http.get('/manager-dashboard/notifications');
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const unreadBg = useColorModeValue('blue.50', 'rgba(49, 130, 206, 0.1)');

  const getIcon = (type) => {
    switch (type) {
      case 'user': return FiUserPlus;
      case 'alert': return FiAlertCircle;
      case 'success': return FiCheck;
      case 'info': return FiInfo;
      default: return FiMessageSquare;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'user': return 'blue.500';
      case 'alert': return 'red.500';
      case 'success': return 'green.500';
      case 'info': return 'teal.500';
      default: return 'gray.500';
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <Box maxW="1000px" mx="auto">
      {/* Header */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb={8} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" fontWeight="extrabold" letterSpacing="tight">
            Notifications
          </Heading>
          <Text color="gray.500">Stay updated with the latest activities and alerts.</Text>
        </VStack>
        
        <HStack spacing={3}>
          <Button 
            leftIcon={<FiCheck />} 
            variant="ghost" 
            size="sm" 
            borderRadius="xl"
            onClick={markAllRead}
          >
            Mark all as read
          </Button>
          <IconButton 
            icon={<FiTrash2 />} 
            variant="ghost" 
            size="sm" 
            aria-label="Clear all" 
            borderRadius="xl"
            onClick={() => setNotifications([])}
          />
        </HStack>
      </Flex>

      {/* Notifications List */}
      <VStack spacing={4} align="stretch">
        {notifications.map((notif) => (
          <Box
            key={notif.id}
            p={5}
            bg={notif.isRead ? cardBg : unreadBg}
            border="1px solid"
            borderColor={notif.isRead ? borderColor : 'blue.200'}
            rounded="2xl"
            shadow="sm"
            transition="0.2s"
            _hover={{ shadow: 'md', transform: 'translateX(4px)' }}
          >
            <Flex justify="space-between" align="start">
              <HStack spacing={4} align="start">
                <Box 
                  p={3} 
                  bg={getIconColor(notif.type).replace('500', '50')} 
                  color={getIconColor(notif.type)} 
                  rounded="xl"
                >
                  <Icon as={getIcon(notif.type)} w={5} h={5} />
                </Box>
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Text fontWeight="bold" fontSize="md">{notif.title}</Text>
                    {!notif.isRead && (
                      <Badge colorScheme="blue" variant="solid" rounded="full" fontSize="10px" px={2}>
                        NEW
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="sm" color="gray.600">{notif.desc || notif.description}</Text>
                  <Text fontSize="xs" color="gray.400" mt={1}>{notif.time}</Text>
                </VStack>
              </HStack>
              
              <Menu>
                <MenuButton as={IconButton} icon={<FiMoreVertical />} size="sm" variant="ghost" borderRadius="lg" />
                <MenuList borderRadius="xl" shadow="xl" border="1px solid" borderColor={borderColor}>
                  {!notif.isRead && <MenuItem icon={<FiCheck />} onClick={() => setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n))}>Mark as read</MenuItem>}
                  <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => deleteNotification(notif.id)}>Delete</MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </Box>
        ))}

        {notifications.length === 0 && (
          <VStack py={20} spacing={4}>
            <Box p={6} bg="gray.50" rounded="full">
              <Icon as={FiBell} w={12} h={12} color="gray.300" />
            </Box>
            <Text color="gray.400" fontSize="lg" fontWeight="medium">No notifications yet</Text>
            <Button variant="link" colorScheme="blue" onClick={() => setNotifications(initialNotifications)}>
              Load Sample Data
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
