import React, { useEffect, useState } from 'react'
import { Box, Button, Center, Heading, Table, Tbody, Td, Text, Tr } from '@chakra-ui/react'
import Navbar from '../Components/Navbar/Navbar'

type Props = {
	isMobile: boolean
}

const SettingsPage: React.FC<Props> = ({isMobile}) => {
  return (
    <Table>
      <Tbody>
        <Tr>
          <Td w={isMobile ? '2rem' : 'min(25vw,250px)'}>
            <Navbar isMobile={isMobile} />
          </Td>
          <Td>
            <Center>
              <Text>Hello</Text>
            </Center>
          </Td>
        </Tr>
      </Tbody>
  </Table>
  )
}

export default SettingsPage