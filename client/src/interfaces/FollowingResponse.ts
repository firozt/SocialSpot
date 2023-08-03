import User from "./User";

interface FollowingResponse {
    msg : string,
    following: User[],
}

export default FollowingResponse