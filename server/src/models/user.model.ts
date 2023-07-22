import mongoose from 'mongoose';
import User from '../interfaces/User';

// Define schema of Mongodb
const User = new mongoose.Schema({
    name: { type: String, require: true},
    password: { type: String, require: true},
}, { collection: 'user-data'})

const model = mongoose.model<User & Document>('UserData', User)
export default model;

