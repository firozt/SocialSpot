import User from "./User"

interface LoginResponse {
    msg: string,
    token: string,
    user: User,
}

export default LoginResponse;