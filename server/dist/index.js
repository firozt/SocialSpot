"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const user_model_js_1 = __importDefault(require("./models/user.model.js"));
const express_1 = __importDefault(require("express"));
// Setting up connections and middleware
mongoose_1.default.connect('mongodb://localhost:27017/MernTest');
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ----------------------- HELPER FUNCTIONS ------------------------  //
// verifies Basic Auth credentials then returns
const checkBasicAuth = (req, res) => {
    console.log('in2');
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).send('Authorization header not provided');
    }
    const encodedCredentials = authHeader.split(' ')[1]; // decode credentials
    const credentials = atob(encodedCredentials).split(':');
    return { name: credentials[0], password: credentials[1] };
};
const hashPassword = async (password, saltRounds = 10) => {
    return bcrypt_1.default.hash(password, saltRounds);
};
console.log('SERVER STARTING');
// ------------------------- API ENDPOINTS -------------------------  //
app.get('/', (req, res) => {
    res.send('working');
});
app.post('/register', async (req, res) => {
    try {
        const validatedData = checkBasicAuth(req, res);
        validatedData['password'] = await hashPassword(validatedData['password']);
        const userDocument = await user_model_js_1.default.create(validatedData);
        const newUser = {
            name: userDocument['name'],
            password: userDocument['password'],
        };
        return res.status(200).json({ msg: `User registered successfully ${newUser}` });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
});
app.post('/login', async (req, res) => {
    try {
        const validatedData = checkBasicAuth(req, res);
        const query = await user_model_js_1.default.find({ name: validatedData['name'] });
        if (query.length === 0) {
            return res.status(404).json({ msg: 'user not found' });
        }
        // cast document type to user type by extracting name, password, id, v
        const user = {
            name: query[0]['name'],
            password: query[0]['password'],
            _id: query[0]['_id'],
            __v: query[0]['__v'],
        };
        const passwordMatches = await bcrypt_1.default.compare(validatedData['password'], user['password']);
        if (passwordMatches) {
            return res.status(200).json({ msg: 'success', user: user });
        }
        else {
            return res.status(404).json({ msg: 'user not found' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: 'server error' });
    }
});
// ------------------------------ END ------------------------------  //
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
//# sourceMappingURL=index.js.map