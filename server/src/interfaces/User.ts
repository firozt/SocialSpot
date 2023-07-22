import mongoose, { Document } from 'mongoose';

interface User {
    name: string,
    password: string,
    _id?: mongoose.Types.ObjectId;
    __v?: number,
}

export default User