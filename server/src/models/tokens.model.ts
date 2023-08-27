import mongoose from 'mongoose';
import User from '../interfaces/User';
import UserTokens from '../interfaces/UserTokens';

// Define schema of Mongodb
const UserTokens = new mongoose.Schema({
    userid: { type: String, require: true, unique: true},
    refreshToken: { type: String, require: false, unique: false},
    accessToken: { type: String, require: false, unique: false},
}, { collection: 'tokens'})

const model = mongoose.model<UserTokens | Document>('UserTokens', UserTokens)
export default model;

