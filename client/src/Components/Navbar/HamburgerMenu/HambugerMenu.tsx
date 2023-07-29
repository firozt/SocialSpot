// components/HamburgerMenu.js

import React, { useState } from 'react';
import { Box, IconButton, useDisclosure, VStack, Button, Divider } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link, useNavigate } from 'react-router-dom';

const HamburgerMenu = () => {
  const { isOpen, onToggle } = useDisclosure();
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <Box>
      <IconButton
        icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
        // pos={'fixed'}
        onClick={onToggle}
        aria-label="Toggle Menu"
				zIndex={1000}
				size={'lg'}
      />

      {isOpen && (
        <VStack
					pos="fixed"
          top="0"
          right="0"
          h="100vh"
					w="100vw"
          p={4}
          spacing={4}
          bg="rgb(92, 76, 180)"
          color="white"
          zIndex="999"
        >
          {/* menu items */}
          <Box w={'100%'}>
            <Link to="/profile"><Button w={'100%'} mt={10}>Profile</Button></Link>
            <Link  to="/feed"><Button w={'100%'} >Feed</Button></Link>
            <Link  to="/settings"><Button w={'100%'} mt={0}>Settings</Button></Link>
          </Box>
          <Divider />
          <Button w={'100%'} onClick={() => logout()}>Logout</Button>
        </VStack>
      )}
    </Box>
  );
};

export default HamburgerMenu;
