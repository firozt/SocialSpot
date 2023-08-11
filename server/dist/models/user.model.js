"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define schema of Mongodb
const User = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, require: true, unique: false },
    username: { type: String, require: false, unique: true },
    following: { type: (Array), require: false, unique: false, default: [] },
    refreshToken: { type: String, require: false, unique: false }
}, { collection: 'users' });
const model = mongoose_1.default.model('UserData', User);
exports.default = model;
//# sourceMappingURL=user.model.js.map