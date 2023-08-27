import mongoose from 'mongoose';
import UserTokensInterface from '../interfaces/UserTokens';

const UserTokensSchema = new mongoose.Schema({
    userid: { type: String, required: true, unique: true },
    refreshToken: { type: String, required: false, unique: false },
    accessToken: { type: String, required: false, unique: false },
}, { collection: 'tokens' })

const model = mongoose.model<UserTokensInterface & mongoose.Document>('UserTokens', UserTokensSchema);
export default model;
