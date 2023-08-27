import mongoose from 'mongoose';
import User from '../interfaces/User';

// Define schema of Mongodb
const User = new mongoose.Schema({
    email: { type: String, required: true, unique: true},
    password: { type: String, require: true, unique: false},
    username: { type: String, require: false, unique: true},
    following: { type: Array<String>, require: false, unique: false, default: []},
}, { collection: 'users'})

const model = mongoose.model<User & Document>('UserData', User)
export default model;

