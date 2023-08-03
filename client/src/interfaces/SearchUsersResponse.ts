import User from "./User";

interface SearchUsersResponse {
    msg: string,
    query: User[],
}

export default SearchUsersResponse;