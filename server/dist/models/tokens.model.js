"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserTokensSchema = new mongoose_1.default.Schema({
    userid: { type: String, required: true, unique: true },
    refreshToken: { type: String, required: false, unique: false },
    accessToken: { type: String, required: false, unique: false },
}, { collection: 'tokens' });
const model = mongoose_1.default.model('UserTokens', UserTokensSchema);
exports.default = model;
//# sourceMappingURL=tokens.model.js.map