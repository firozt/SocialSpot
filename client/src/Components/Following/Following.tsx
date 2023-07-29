import axios, { AxiosResponse } from 'axios'
import React, { useEffect, useState } from 'react'
import FollowingResponse from '../../interfaces/FollowingResponse'
import { Button } from '@chakra-ui/react'

type Props = {}

const Following: React.FC<Props> = ({}) => {
	const [following, setFollowing] = useState<string[]>([]);

	// gets users following
	useEffect(() => {
		fetchFollowing()
	}, [])

	const fetchFollowing = async () => {
		const token: string  = localStorage.getItem('token') || 'null';

		try {
			const response: AxiosResponse<FollowingResponse> = await axios.get(
				'http://127.0.0.1:3000/following',
				{
					headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
					},
				})
			setFollowing(response.data.following)
		} catch (error) {
			console.error(error)
		}
	}

	const unfollow = async (username: string): Promise<void> => {
    const token: string  = localStorage.getItem('token') || 'null';

		try {
			const response: AxiosResponse = await axios.post(
				`http://127.0.0.1:3000/unfollow/${username}`, 
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				})
			fetchFollowing()
		} catch (error: any) {
			console.error(error)
			alert('error occured')
		}
	}

  return (
		<div>
			{following.length == 0 ? (
				<p>User not currently following anyone</p>
			) : (
				<table>
					<tbody>
						{following.map((item: string, index: number) => (
							<tr key={index}>
								<td>{item}</td>
								<td>
									<Button 
									onClick={() => unfollow(item)}
									>unfollow</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
  )
}

export default Following