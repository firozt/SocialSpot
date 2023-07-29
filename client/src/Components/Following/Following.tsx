import axios, { AxiosResponse } from 'axios'
import React, { useEffect, useState } from 'react'
import FollowingResponse from '../../interfaces/FollowingResponse'

type Props = {}

const Following: React.FC<Props> = ({}) => {
	const [following, setFollowing] = useState<string[]>([]);


	// gets users following
	useEffect(() => {
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
		fetchFollowing()
	}, [])

	const unfollow = async (username: string): Promise<void> => {
		axios.post(
			`http://127.0.0.1:3000/unfollow/${username}`,
			{
				headers: {
					
				}
			}
		)
	}

  return (
		<div>
			{!following ? (
				<p>User not currently following anyone</p>
			) : (
				<table>
					<tbody>
						{following.map((item: string, index: number) => (
							<tr key={index}>
								<td>{item}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
  )
}

export default Following