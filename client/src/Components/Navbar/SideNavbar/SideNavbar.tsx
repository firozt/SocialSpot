import React, { CSSProperties, useState } from 'react';
import { Box, Center, Divider, Flex, Heading, Icon , Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { FiHome, FiLogOut, FiMusic, FiSettings, FiUsers } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const SideNavbar: React.FC = () => {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('spotify_token')
    localStorage.removeItem('atoken')
    localStorage.removeItem('rtoken')
    navigate('/')
  }


  return (
    <Box
      pos={'fixed'}
      h={"100vh"}
      w={'min(25vw,250px)'}
      top={'0'}
      p={4}
			bgColor={'#1f1f1f'}
      color={'white'}
      borderRight="2px solid"
      borderColor={'gray.900'}
    >
      <Icon as={FiMusic} boxSize={'min(20vw,200px)'} color={'gray.300'} mb={'3rem'}/>
      <Center>
        <Flex  align="center" mb={4}>
          <Heading textAlign={'center'} fontSize={'3xl'} fontWeight="bold">
            Social Spotify
          </Heading>
        </Flex>
      </Center>
      <Center>
        <VStack w={'100%'} spacing={4} alignItems="flex-start"> {/* Align the items to the start (left) */}
        <br/>
          <Link to="/profile" className='nav-button'>
            <Flex align="center">
              <Icon as={FiHome} boxSize="20px" />
              <Text ml={2}>Profile</Text>
            </Flex>
          </Link>
          <Link to="/feed" className='nav-button'>
            <Flex align="center">
              <Icon as={FiUsers} boxSize="20px" />
              <Text ml={2}>Feed</Text>
            </Flex>
          </Link>
          <Link to="/settings" className='nav-button'>
            <Flex align="center">
              <Icon as={FiSettings} boxSize="20px" />
              <Text ml={2}>Settings</Text>
            </Flex>
          </Link>
          <Divider />
          <Flex color={'red'} align="center" className='nav-button'>
            <Icon as={FiLogOut} boxSize="20px" />
            <Text onClick={() => logout()} ml={2}>Logout</Text>
          </Flex>
        </VStack>
      </Center>
    </Box>
  );
};

export default SideNavbar;
