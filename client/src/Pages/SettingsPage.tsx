import React, { useEffect, useState } from 'react'
import { Box, Button, Center, Heading, Table, Td, Text } from '@chakra-ui/react'
import Navbar from '../Components/Navbar/Navbar'

type Props = {
	isMobile: boolean
}

const SettingsPage: React.FC<Props> = ({isMobile}) => {
  return (
    <Table>
    <Td w={isMobile ? '2rem' : 'min(25vw,300px)'}>
      <Navbar isMobile={isMobile} />
    </Td>
    <Td>
      <Center>
        <Text>Hello</Text>
      </Center>
    </Td>
  </Table>
  )
}

export default SettingsPage