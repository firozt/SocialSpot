import axios, { AxiosResponse } from 'axios';
import User from './interfaces/User';
interface Response {
    msg: string,
    user: User,
}
export const getUser = async (): Promise<User> => {
    const token: string  = localStorage.getItem('token') || 'null';
    try {
        const response: AxiosResponse<Response> = await axios.get(
            'http://localhost:3000/get_user',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })
        return response.data.user
    } catch (error: unknown) {
        console.error(error)
        throw new Error(`error: ${error}`);
    }
};