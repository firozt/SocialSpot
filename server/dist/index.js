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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const envPath = path_1.default.resolve(__dirname, '../../.env'); // Adjust the path as needed
// Load the environment variables from the .env file
dotenv_1.default.config({ path: envPath });
// Setting up connections and middleware
mongoose_1.default.connect('mongodb://localhost:27017/MernTest');
const app = (0, express_1.default)();
const port = 3000;
// app.use(cors());
app.use((0, cors_1.default)({ origin: 'http://localhost:5173' }));
app.use(express_1.default.json());
// ----------------------- HELPER FUNCTIONS ------------------------  //
// verifies Basic Auth credentials then returns
const checkBasicAuth = (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).send('Authorization header not provided');
    }
    const encodedCredentials = authHeader.split(' ')[1]; // decode credentials
    const credentials = atob(encodedCredentials).split(':');
    return {
        email: credentials[0],
        password: credentials[1],
        username: null,
        _id: null // will be generated on creation
    };
};
// Hashes password using bcrypt, with salt value 10
const hashPassword = async (password, saltRounds = 10) => {
    return bcrypt_1.default.hash(password, saltRounds);
};
const secretKey = 'sekret';
// Creates JWT token
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: '1h' }); // Set the token expiration time (e.g., 1 hour)
};
// verifies jwt token, given by user header (bearer token)
// extracts user details from this and stores to req.user 
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res
            .status(401)
            .json({ msg: 'auth header missing' });
    }
    const token = authHeader.split(' ')[1];
    jsonwebtoken_1.default.verify(token, secretKey, (err, user) => {
        if (err) {
            return res
                .status(403)
                .json({ msg: 'user does not have permission' })
                .redirect(`${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}/login`);
        }
        req.user = user;
        next();
    });
};
// Returns username given userid
const userIdToUsername = async (userId) => {
    let query;
    try {
        query = await user_model_js_1.default.findById(userId);
    }
    catch (error) {
        console.error(error);
        throw new Error("unable to query db");
    }
    if (!query) {
        throw new Error("User not found");
    }
    return query['username'];
};
const usernameToUserId = async (username) => {
    let query;
    try {
        query = await user_model_js_1.default.find({ username: username });
    }
    catch (error) {
        console.error(error);
        throw new Error("unable to query db");
    }
    if (query.length === 0) {
        throw new Error("User not found");
    }
    return query[0]['_id'];
};
// ------------------------- API ENDPOINTS -------------------------  //
console.log('SERVER STARTING');
app.get('/', (req, res) => {
    res.send('working');
});
app.post('/register', async (req, res) => {
    try {
        const validatedData = checkBasicAuth(req, res);
        validatedData['password'] = await hashPassword(validatedData['password']);
        const userDocument = await user_model_js_1.default.create(validatedData);
        const newUser = {
            email: userDocument['email'],
            username: userDocument['username'],
            password: userDocument['password'],
            _id: userDocument['_id'],
        };
        return res.status(200).json({ msg: `User registered successfully ${newUser}` });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
});
app.post('/login', async (req, res) => {
    // validate header
    const validatedData = checkBasicAuth(req, res);
    let query;
    try {
        // find user in db
        query = await user_model_js_1.default.find({ email: validatedData['email'] });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: 'error fetching from users collection' });
    }
    if (query.length === 0) {
        return res.status(404).json({ msg: 'user not found' });
    }
    // load user in var to be returned (name,_id)
    const user = {
        email: query[0]['email'],
        username: query[0]['username'],
        password: query[0]['password'],
        _id: query[0]['_id'],
        __v: query[0]['__v'],
    };
    // compare hashed pw 
    const passwordMatches = await bcrypt_1.default.compare(validatedData['password'], user['password']);
    if (!passwordMatches) {
        return res.status(404).json({ msg: 'user not found (pw)' });
    }
    // create and return token
    const token = generateToken(user);
    return res
        .status(200)
        .json({ msg: 'success', user: { name: user['name'], _id: user['_id'] }, token: token });
});
app.get('/get_user', authenticateToken, (req, res) => {
    const user = {
        username: req.user['username'],
        email: req.user['email'],
        _id: req.user['_id'],
    };
    return res
        .status(200)
        .json({ msg: 'working', user: user });
});
app.post('/follow/:username', authenticateToken, async (req, res) => {
    const friendUsername = req.params.username;
    let query;
    try {
        // find user in collection
        query = await user_model_js_1.default.find({ username: friendUsername });
    }
    catch (error) {
        console.log(error);
        return res
            .status(404)
            .json({ msg: 'user not found' });
    }
    if (query.length === 0) {
        return res.status(404).json({ msg: 'user not found' });
    }
    // extract useful information
    const friend = {
        username: query[0]['username'],
        _id: query[0]['_id'],
    };
    try {
        // add userid of username to following list
        await user_model_js_1.default.findOneAndUpdate({ _id: req.user['_id'] }, { $addToSet: { following: friend['_id'] } } // push friend id to friends
        );
    }
    catch (error) {
        return res
            .status('500')
            .json({ msg: 'could not append friend to friends list' });
    }
    return res
        .status(200)
        .json({ msg: 'success' });
});
app.post('/unfollow/:username', authenticateToken, async (req, res) => {
    const userIdToRemove = await usernameToUserId(req.params.username);
    try {
        const updatedUser = await user_model_js_1.default.findOneAndUpdate({ _id: req.user['_id'] }, { $pull: { following: userIdToRemove } });
        if (!updatedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }
        return res
            .status(200)
            .json({ msg: 'success', usr: updatedUser });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ msg: 'could not search users db' });
    }
});
app.get('/following', authenticateToken, async (req, res) => {
    const userId = req.user['_id'];
    let query;
    try {
        // find user making query
        query = await user_model_js_1.default.find({ _id: userId });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ msg: 'unable to fetch user database' });
    }
    if (query.length === 0) {
        return res
            .status(404)
            .json({ msg: 'user not found' });
    }
    // load user into var
    const user = {
        username: query[0]['username'],
        _id: query[0]['_id'],
        following: query[0]['following'],
    };
    const followingList = [];
    for (const userId of user['following']) {
        const username = await userIdToUsername(userId);
        followingList.push(username);
    }
    return res
        .status(200)
        .json({ msg: 'succes', following: followingList });
});
// ---------------------------- SPOTIFY ----------------------------  //
app.get('/callback', (req, res) => {
    // const redirect_uri: string = `http://${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}/`
    if (!req.query.code) {
        return res
            .status(401)
            .json({ msg: 'unauthorized' });
    }
    return res.json({ msg: 'succes', spotify_token: req.query.code });
});
app.get('/spotify', authenticateToken, (req, res) => {
    const url = buildRequestURL();
    return res
        .status(200)
        .json({ 'msg': 'success', url: url });
});
// builds URL that we will redirect to to gain user access
const buildRequestURL = () => {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    // const redirect_uri: string = `${process.env.API_URL}:${process.env.API_PORT}/callback`
    const redirect_uri = `http://${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}/user`;
    console.log(redirect_uri);
    const AUTHORIZE = "https://accounts.spotify.com/authorize";
    // const client_secret: string = process.env.SPOTIFY_CLIENT_SECRET
    // localStorage.setItem("client_id", client_id);
    // localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    // scopes
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    return url; // Show Spotify's authorization screen
};
// ------------------------------ END ------------------------------  //
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
//# sourceMappingURL=index.js.map