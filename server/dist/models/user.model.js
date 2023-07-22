"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define schema of Mongodb
const User = new mongoose_1.default.Schema({
    name: { type: String, require: true },
    password: { type: String, require: true },
}, { collection: 'user-data' });
const model = mongoose_1.default.model('UserData', User);
exports.default = model;
//# sourceMappingURL=user.model.js.map