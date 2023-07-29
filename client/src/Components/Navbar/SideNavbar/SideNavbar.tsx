import React from 'react';
import { Box, Flex, Icon , Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { FiHome, FiSettings, FiUsers } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const SideNavbar: React.FC = () => {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <Box
      shadow={'inner'}
      h="100vh"
      w={'100%'}
      p={4}
			bgColor={'gray.100'}

      borderRight="1px solid"
      borderColor={useColorModeValue('gray.300', 'gray.600')}
    >
      <Flex align="center" mb={4}>
        <Icon as={FiHome} boxSize="24px" />
        <Text ml={2} fontWeight="bold">
          Socail Spotify
        </Text>
      </Flex>
      <VStack spacing={4} alignItems="flex-start"> {/* Align the items to the start (left) */}
        <Link to="/profile">
          <Flex align="center">
            <Icon as={FiHome} boxSize="20px" />
            <Text ml={2}>Profile</Text>
          </Flex>
        </Link>
        <Link to="/feed">
          <Flex align="center">
            <Icon as={FiUsers} boxSize="20px" />
            <Text ml={2}>Feed</Text>
          </Flex>
        </Link>
        <Link to="/settings">
          <Flex align="center">
            <Icon as={FiSettings} boxSize="20px" />
            <Text ml={2}>Settings</Text>
          </Flex>
        </Link>
        <Flex align="center">
          <Icon as={FiSettings} boxSize="20px" />
          <Text onClick={() => logout()} ml={2}>Logout</Text>
        </Flex>
      </VStack>
    </Box>
  );
};

export default SideNavbar;
