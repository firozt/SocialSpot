"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define schema of Mongodb
const UserTokens = new mongoose_1.default.Schema({
    userid: { type: String, require: true, unique: true },
    refreshToken: { type: String, require: false, unique: false },
    accessToken: { type: String, require: false, unique: false },
}, { collection: 'tokens' });
const model = mongoose_1.default.model('UserTokens', UserTokens);
exports.default = model;
//# sourceMappingURL=tokens.model.js.map