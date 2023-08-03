import { Box, Button, Center, Flex, Icon, Table, Td, Text, Tr } from '@chakra-ui/react'
import React from 'react'
import { FiPlus } from 'react-icons/fi'

type Props = {
	username: string,
	onClick: () => void,
}

const UserCard: React.FC<Props> = ({username, onClick}) => {
  return (
    <Box id="usercard" display="flex" alignItems="center">
      <Text fontSize="2xl" id="text" flex="1" textAlign="left">
        {username}
      </Text>
      <Button id="button" onClick={onClick}>
        <Icon boxSize="20px" as={FiPlus} />
      </Button>
    </Box>
  )
}

export default UserCard