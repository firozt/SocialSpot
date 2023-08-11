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
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const axios_1 = __importDefault(require("axios"));
const console_1 = require("console");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
// Setting up connections and middleware
mongoose_1.default.connect('mongodb://localhost:27017/MernTest');
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
console.log('SERVER STARTING');
// ----------------------- HELPER FUNCTIONS ------------------------  //
// verifies Basic Auth credentials then returns
const checkBasicAuth = (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).send('Authorization header not provided');
        throw new Error('Authorization header not provided');
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
        res.status(401).json({ msg: 'auth header missing' });
        return;
    }
    const token = authHeader.split(' ')[1];
    jsonwebtoken_1.default.verify(token, secretKey, (err, user) => {
        if (err) {
            res.status(403).json({ msg: 'user does not have permission' });
            return;
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
const getFollowing = async (userId, res) => {
    let query;
    try {
        // find user making query
        query = await user_model_js_1.default.find({ _id: userId });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ msg: 'unable to fetch user database' });
        throw new Error('Unable to get following from users collection');
    }
    if (query.length === 0) {
        res
            .status(404)
            .json({ msg: 'user not found' });
        throw new Error('User not found in users collection');
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
        followingList.push({ username: username, _id: user['_id'] });
    }
    return followingList;
};
// ------------------------- API ENDPOINTS -------------------------  //
app.get('/', (req, res) => {
    res.send('working');
});
app.post('/set_name/:username', authenticateToken, async (req, res) => {
    const userid = String(req.user['_id']);
    console.log(req.params.username);
    try {
        const newUser = await user_model_js_1.default.findByIdAndUpdate(userid, { username: req.params.username }, { new: true });
        if (!newUser) {
            return res
                .status(401)
                .json({ msg: 'cant find user' });
        }
        console.log(newUser);
        const userToken = {
            _id: newUser['_id'],
            username: newUser['username'],
            email: newUser['email'],
        };
        const newToken = generateToken(userToken);
        return res
            .status(200)
            .json({ msg: 'success', token: newToken });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ msg: 'unable to lookup users collection' });
    }
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
        _id: query[0]['_id'],
    };
    // compare hashed pw 
    const passwordMatches = await bcrypt_1.default.compare(validatedData['password'], query[0]['password']);
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
    // check if user exists
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
        await user_model_js_1.default.findOneAndUpdate({ _id: req.user['_id'] }, { $addToSet: { following: friend['_id'] } } // push friend id to following list
        );
    }
    catch (error) {
        return res
            .status(500)
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
    const followingList = await getFollowing(String(req.user['_id']), res);
    return res
        .status(200)
        .json({ msg: 'success', following: followingList });
});
app.get('/search_users/:query', authenticateToken, async (req, res) => {
    const query = req.params.query;
    let queryOutput;
    // query all where 'query' exist inside name (SQL's LIKE keyword)
    try {
        queryOutput = await user_model_js_1.default.find({ username: { $regex: new RegExp(query, 'i') } }, // 'i' means case insesetive
        { username: 1, _id: 1 }); // only select username and _id
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ msg: 'could not fetch users tablwe' });
    }
    // parse only names and id
    queryOutput.map((item, index) => {
        return {
            username: item['username'],
            _id: item['_id'],
        };
    });
    // get users following data, currently stored as ids, translate to usernames
    const followingList = await getFollowing(String(req.user['_id']), res);
    const notFollowing = queryOutput.filter((item1) => {
        return (!followingList.some((item2) => item1.username === item2.username) &&
            item1.username !== req.user.username);
    });
    return res
        .status(200)
        .json({ msg: 'success', query: notFollowing });
});
// ---------------------------- SPOTIFY ----------------------------  //
app.get('/spotify', (req, res) => {
    const scopes = 'user-read-private user-read-email user-top-read';
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    // const redirect_uri =  `${process.env.API_URL}:${process.env.API_PORT}/callback`
    const redirect_uri = 'http://localhost:5173/callback';
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + client_id +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirect_uri));
});
// runs once per user, once ran will save refresh token to db and return tempoary access tokens
// takes auth code in headers as 'code'
app.get('/get_spotify_tokens', authenticateToken, async (req, res) => {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const redirect_uri = 'http://localhost:5173/callback';
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const code = String(req.headers.code) || '';
    // check if code is present in headerss
    if (code) {
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code',
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')),
            },
            json: true,
        };
        // request spotify endpoint to obtain refresh / access tokens
        try {
            const response = await request_promise_native_1.default.post(authOptions);
            if (response) {
                const access_token = response.access_token;
                const refresh_token = response.refresh_token;
                // now store refresh token in db
                const userid = String(req.user._id);
                const doc = await user_model_js_1.default.findByIdAndUpdate(userid, {
                    refreshToken: refresh_token
                }, {
                    new: true,
                    upsert: true,
                });
                console.log('doc: ', doc);
                // error checking db
                if (!doc) {
                    res.status(404)
                        .json({ msg: 'user not found' });
                    return;
                }
                console.log('success');
                res.status(200)
                    .json({ access_token: access_token, });
            }
            else {
                // auth token in header was invalid
                console.log('invalid token');
                res.status(400)
                    .json({ msg: 'invalid token' });
            }
        }
        catch (error) {
            // error calling spotify endpoint
            console.error(error);
            res.send({
                error: 'Something went wrong while retrieving the tokens',
            });
        }
    }
    else {
        // auth code not present in headers
        res.status(400)
            .json({ msg: 'no auth code in headers' });
    }
});
// takes refresh_token in header
const refreshTokens = async (username) => {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    let userid;
    // convert username to userid
    try {
        userid = await usernameToUserId(username);
    }
    catch (error) {
        throw new Error(error.message);
    }
    // obtain refreshtokens from db given userid
    let user;
    user = await user_model_js_1.default.findById(userid);
    if (!user) {
        throw (0, console_1.error)('user not found');
    }
    const refresh_token = user['refreshToken'];
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')),
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };
    let access_token;
    const response = await request_promise_native_1.default.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            access_token = body.access_token;
            return access_token;
        }
        else {
            throw new Error(`Error making request to spotify, ${error}, response ${JSON.stringify(response)}`);
        }
    });
    return response.access_token;
};
const validateAccessToken = async (req, res, next) => {
    // check if access token is valid
    const access_token = String(req.headers.access_token);
    axios_1.default.get('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }).then(async (response) => {
        if (response.status === 200) {
            req.headers.changed = '0';
            next();
        }
        else {
            throw new Error("Invalid status code"); // Handle non-200 status codes as errors
        }
    }).catch(async (error) => {
        const newAccessToken = await refreshTokens(req.user['username']);
        req.headers.access_token = newAccessToken;
        req.headers.changed = '1';
        next();
    });
};
// takes access_token, days in header, 
app.get('/top/:type', authenticateToken, validateAccessToken, async (req, res) => {
    // Extract access token from request headers, and query type from url
    const access_token = String(req.headers.access_token);
    const type = String(req.params.type);
    const days = String(req.headers.days);
    // error checking variables
    if (type != 'artists' && type != 'tracks') {
        res.status(400).json({ msg: 'Invalid query type' });
        return;
    }
    if (!Number(days)) {
        res.status(400).json({ msg: 'Days is missing or undefined' });
        return;
    }
    if (!access_token || access_token == 'undefined') {
        res.status(401).json({ msg: 'Access token missing from request headers' });
        return;
    }
    try {
        // Request top artists from Spotify's API
        const response = await request_promise_native_1.default.get(`https://api.spotify.com/v1/me/top/${type}?offset=${days}`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        if (req.headers.changed == '1') {
            res.status(200).json({ msg: 'success', data: response, newToken: true, access_token: access_token });
        }
        else {
            res.status(200).json({ msg: 'success', data: response });
        }
    }
    catch (error) {
        console.log('error in spotify endpoint');
        if (error?.statusCode == 401) {
            console.log('access token ran out');
            res.status(401).json({ msg: 'access token is not valid' });
        }
        else {
            // Something happened in setting up the request and triggered an Error
            // console.log('Error', error.message);
            console.log('error here!!!!!!!!!!!!!', error.statusCode);
            res.status(500).json({ msg: error });
        }
    }
});
// ------------------------------ END ------------------------------  //
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
//# sourceMappingURL=index.js.map