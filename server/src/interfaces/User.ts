import mongoose, { Document } from 'mongoose';

interface User {
    username: string,
    _id: mongoose.Types.ObjectId;
    email?: string,
    password?: string,
    following?: string[],
    __v?: number,
}

export default User