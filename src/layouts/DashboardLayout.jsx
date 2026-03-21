import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  IconButton,
  Avatar,
  HStack,
  VStack,
  Text,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Tooltip,
  Button,
  Divider,
  Badge,
} from '@chakra-ui/react';
import {
  FiHome,
  FiTrendingUp,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiUsers,
  FiClipboard,
  FiActivity,
  FiFileText,
  FiLock,
  FiUser,
  FiLogOut,
  FiShoppingCart,
  FiBox,
  FiTool,
  FiShield,
  FiMessageSquare
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import http, { getMediaUrl } from '../apis/http';

const LinkItems = [
  { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
  { name: 'Assign Ticket', icon: FiClipboard, path: '/assign-ticket' },
  { name: 'Service Requests', icon: FiTool, path: '/service-requests' },
  { name: 'AMC Management', icon: FiShield, path: '/amc-management' },
  { name: 'Manage Lead', icon: FiTrendingUp, path: '/manage-lead' },
  { name: 'Manage Orders', icon: FiShoppingCart, path: '/manage-orders' },
  { name: 'Monitor Employee', icon: FiActivity, path: '/monitor-employee' },
  { name: 'Manage Employee', icon: FiUsers, path: '/manage-employee' },
  { name: 'Generate Report', icon: FiFileText, path: '/generate-report' },
  { name: 'My Assets', icon: FiBox, path: '/my-assets' },
  { name: 'Profile', icon: FiUser, path: '/profile' },
  { name: 'Change Password', icon: FiLock, path: '/change-password' },
  { name: 'SMS Center', icon: FiMessageSquare, path: '/sms-center' },
];

export default function DashboardLayout({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.950')}>
      <SidebarContent
        onClose={onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="xs">
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 64 }} p={{ base: 3, sm: 4, md: 6 }} transition="0.3s ease">
        {children}
      </Box>
    </Box>
  );
}

const SidebarContent = ({ onClose, ...rest }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'gray.800');

  return (
    <Box
      transition="0.3s ease"
      bg={bg}
      borderRight="1px"
      borderRightColor={borderColor}
      w={{ base: 'full', md: 64 }}
      pos="fixed"
      h="100vh"
      zIndex={{ base: 20, md: 'auto' }}
      display="flex"
      flexDirection="column"
      {...rest}>
      <Flex h="36" alignItems="center" mx="8" justifyContent="center">
        <HStack spacing={3} justify="center">
          <VStack spacing={1} align="center">
            <Box>
              <img src="/favicon.png" alt="UNIXA Logo" style={{ width: '112px', height: '112px', objectFit: 'contain' }} />
            </Box>
            <Text fontSize="xs" fontWeight="800" color="blue.500" textTransform="uppercase" letterSpacing="wide">
              Manager Panel
            </Text>
          </VStack>
        </HStack>
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onClose}
          variant="ghost"
          aria-label="close menu"
          icon={<FiMenu />}
        />
      </Flex>
      <Flex direction="column" flex="1" overflow="hidden" justify="space-between" pb={8}>
        <VStack spacing={1} align="stretch" px={4} overflowY="auto" flex="1" maxH="calc(100vh - 160px)">
          {LinkItems.map((link) => (
            <NavItem
              key={link.name}
              icon={link.icon}
              path={link.path}
              active={location.pathname === link.path}
            >
              {link.name}
            </NavItem>
          ))}
        </VStack>

        <Box px={4}>
          <Divider mb={4} borderColor={borderColor} />
          <Flex
            align="center"
            p="3"
            mx="2"
            borderRadius="xl"
            role="group"
            cursor="pointer"
            color="red.500"
            fontWeight="700"
            transition="all 0.2s"
            _hover={{
              bg: useColorModeValue('red.50', 'rgba(255, 0, 0, 0.1)'),
              transform: 'translateX(4px)',
            }}
            onClick={logout}
          >
            <Icon mr="4" fontSize="18" as={FiLogOut} />
            <Text fontSize="sm" letterSpacing="wide">LOGOUT</Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

const NavItem = ({ icon, children, path, active, ...rest }) => {
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.800');
  const hoverColor = useColorModeValue('blue.600', 'blue.200');

  return (
    <Link to={path} style={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        p="3"
        mx="2"
        borderRadius="xl"
        role="group"
        cursor="pointer"
        bg={active ? activeBg : 'transparent'}
        color={active ? activeColor : inactiveColor}
        fontWeight={active ? "700" : "500"}
        transition="all 0.2s"
        _hover={{
          bg: active ? activeBg : hoverBg,
          color: active ? activeColor : hoverColor,
          transform: 'translateX(4px)',
        }}
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontSize="18"
            as={icon}
            transition="all 0.2s"
          />
        )}
        <Text fontSize="sm">{children}</Text>
      </Flex>
    </Link>
  );
};

const MobileNav = ({ onOpen, ...rest }) => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await http.get('/manager-dashboard/notifications');
        const unread = data.notifications?.filter(n => n.status === 'unread').length || 0;
        setUnreadCount(unread);
      } catch (err) {
        // Silently fail for header
      }
    };
    fetchUnread();
  }, []);

  return (
    <Flex
      ml={{ base: 0, md: 64 }}
      px={{ base: 4, md: 8 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.100', 'gray.800')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      pos="sticky"
      top="0"
      zIndex="10"
      {...rest}>
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <HStack spacing={3} display={{ base: 'flex', md: 'none' }}>
        <Box>
          <img src="/favicon.png" alt="UNIXA Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        </Box>
        <Text fontSize="lg" fontWeight="extrabold">UNIXA</Text>
      </HStack>

      <HStack spacing={{ base: '2', md: '6' }}>
        <Tooltip label="Notifications">
          <Link to="/notifications" style={{ position: 'relative' }}>
            <IconButton
              size="lg"
              variant="ghost"
              aria-label="open menu"
              icon={<FiBell />}
              borderRadius="full"
            />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="2"
                right="2"
                colorScheme="red"
                variant="solid"
                borderRadius="full"
                fontSize="10px"
                minW="18px"
                textAlign="center"
                border="2px solid white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Link>
        </Tooltip>
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: 'none' }}>
              <HStack spacing={3}>
                <Avatar
                  size={'sm'}
                  name={user?.name || "Manager"}
                  src={getMediaUrl(user?.profilePicture) || 'https://images.unsplash.com/photo-1619946769363-107a671448b7?auto=format&fit=crop&w=116&q=80'}
                  border="2px solid"
                  borderColor="blue.500"
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="0"
                  ml="2">
                  <Text fontSize="sm" fontWeight="bold">{user?.name || "Manager Name"}</Text>
                  <Text fontSize="xs" color="gray.500">{user?.role || "Manager"}</Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.900')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              boxShadow="xl"
              borderRadius="xl">
              <MenuItem as={Link} to="/profile" icon={<FiUser />}>Profile</MenuItem>
              <MenuItem as={Link} to="/change-password" icon={<FiLock />}>Settings</MenuItem>
              <MenuDivider />
              <MenuItem onClick={logout} icon={<FiLogOut />} color="red.500">Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};
