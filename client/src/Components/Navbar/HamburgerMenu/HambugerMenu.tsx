// components/HamburgerMenu.js

import React, { useState } from 'react';
import { Box, IconButton, useDisclosure, VStack, Button, Divider, Icon } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiLogOut, FiSettings, FiUser, FiUsers } from 'react-icons/fi';

const HamburgerMenu = () => {
  const { isOpen, onToggle } = useDisclosure();
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('spotify_token')
    localStorage.removeItem('atoken')
    localStorage.removeItem('rtoken')
    navigate('/')
  }

  return (
    <Box>
      <IconButton
        icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
        pos={'absolute'}
        top={0}
        onClick={onToggle}
        aria-label="Toggle Menu"
				zIndex={1000}
				size={'lg'}
      />

      {isOpen && (
        <VStack
          top="0"
          right="0"
          h="100vh"
					w="50px"
          p={4}
          spacing={4}
          bg="rgb(92, 76, 180)"
          color="white"
          zIndex="999"
        >
          {/* menu items */}
          <Box>
            <Link to="/profile">
              <Button w={'100%'} mt={10}>
                <Icon as={FiHome} boxSize="20px" />
              </Button>
            </Link>
            <Link  to="/feed">
              <Button w={'100%'}>
                <Icon as={FiUsers} boxSize="20px" />
              </Button>
            </Link>
            <Link to="/settings">
              <Button w={'100%'} mt={0}>
                <Icon as={FiSettings} boxSize="20px" />
              </Button>
            </Link>
          </Box>
          {/* <Divider /> */}
          <Button w={'100%'} onClick={() => logout()}>
            <Icon as={FiLogOut} boxSize="20px" />
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default HamburgerMenu;
