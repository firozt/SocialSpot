"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const user_model_js_1 = __importDefault(require("./models/user.model.js"));
const tokens_model_js_1 = __importDefault(require("./models/tokens.model.js"));
const profile_model_js_1 = __importDefault(require("./models/profile.model.js"));
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
const userIdtoUsername = async (userid) => {
    let query;
    try {
        query = await user_model_js_1.default.findById(userid);
        if (!query) {
            throw new Error("User not found");
        }
        return query['username'];
    }
    catch (error) {
        throw new Error("unable to query db");
    }
};
const getFollowing = async (userId) => {
    let query;
    try {
        // find user making query
        query = await user_model_js_1.default.findById(userId);
        if (!query) {
            throw new Error('User not found in users collection');
        }
        // load user into var
        const user = {
            username: query['username'],
            _id: query['_id'],
            following: query['following'],
        };
        const followingList = [];
        for (const userId of user['following']) {
            const username = await userIdToUsername(userId);
            followingList.push({ username: username, _id: new mongodb_1.ObjectId(userId) });
        }
        return followingList;
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to get following from users collection');
    }
};
// ------------------------- API ENDPOINTS -------------------------  //
app.get('/', (req, res) => {
    res.send('working');
});
app.post('/set_name/:username', authenticateToken, async (req, res) => {
    const userid = String(req.user['_id']);
    try {
        const newUser = await user_model_js_1.default.findByIdAndUpdate(userid, { username: req.params.username }, { new: true });
        if (!newUser) {
            return res
                .status(401)
                .json({ msg: 'cant find user' });
        }
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
    try {
        const followingList = await getFollowing(String(req.user['_id']));
        return res
            .status(200)
            .json({ msg: 'success', following: followingList });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'error' });
    }
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
    try {
        const followingList = await getFollowing(String(req.user['_id']));
        const notFollowing = queryOutput.filter((item1) => {
            return (!followingList.some((item2) => item1.username === item2.username) &&
                item1.username !== req.user.username);
        });
        return res.status(200).json({ msg: 'success', query: notFollowing });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'error' });
    }
});
const getCurrentDateFormatted = () => {
    const date = new Date();
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
};
app.post('/update_user_profile', authenticateToken, async (req, res) => {
    const data = req.body.data;
    const userid = String(req.user._id);
    console.log(data);
    // error checking
    if (!data) {
        return res.status(400).json({ msg: 'no data has been presented in the body' });
    }
    try {
        // to be inserted to db
        const newData = {
            date: getCurrentDateFormatted(),
            userid: userid,
            data: data,
        };
        // see if user already has an entry and replace / create it
        const query = await profile_model_js_1.default.findOneAndUpdate({ userid: userid }, newData, { upsert: true, new: true });
        res.status(200).json({ msg: 'success', query: query });
    }
    catch (error) {
        res.status(500).json({ msg: 'error inserting into UserProfile collection' });
    }
});
app.get('/following_data', authenticateToken, async (req, res) => {
    const userid = String(req.user._id);
    // get users following
    try {
        const following = await getFollowing(userid);
        const profile_data = [];
        console.log(following);
        // search for each users profile data
        for (const user of following) {
            console.log(String(user._id));
            let profile = await profile_model_js_1.default.findOne({ userid: String(user._id) });
            if (profile) {
                let modifiedProfile = profile.toObject();
                modifiedProfile.username = user.username;
                profile_data.push(modifiedProfile);
            }
        }
        console.log('profile data:');
        console.log(profile_data);
        res.status(200).json(profile_data);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'error in following data' });
    }
});
// ---------------------------- SPOTIFY ----------------------------  //
// asks user for spotify access
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
// runs once per user, once ran will save refresh token and access token to token table
// takes auth code in headers as 'code'
app.get('/get_spotify_tokens', authenticateToken, async (req, res) => {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const redirect_uri = 'http://localhost:5173/callback';
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const code = String(req.headers.code);
    if (!code) {
        return res.status(400).json({ msg: 'no auth code in headers' });
    }
    try {
        const authOptions = {
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: `code=${code}&redirect_uri=${redirect_uri}&grant_type=authorization_code`
        };
        const response = await (0, axios_1.default)(authOptions);
        const access_token = response.data.access_token;
        const refresh_token = response.data.refresh_token;
        // Store refresh token + access token in db, as user is new we will need to create a new row
        const userid = String(req.user._id);
        try {
            await tokens_model_js_1.default.create({
                userid: userid,
                refreshToken: refresh_token,
                accessToken: access_token,
            });
        }
        catch (error) {
            console.log('error in adding new refreshtoken + accesstoken for this user');
            console.error(error);
        }
        res.status(200).json({ msg: 'successfull' });
    }
    catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('invalid token');
            return res.status(400).json({ msg: 'invalid token' });
        }
        console.error(error);
        return res.status(500).send({
            error: 'Something went wrong while retrieving the tokens',
        });
    }
});
// helper function that takes refesh token given username. outputs access token
const refreshTokens = async (username) => {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    // Convert username to userid
    const userid = await usernameToUserId(username);
    if (!userid) {
        throw new Error("User does not exist");
    }
    // Obtain refreshToken from DB given userid
    const userTokens = await tokens_model_js_1.default.findOne({ userid: userid });
    console.log(userTokens);
    if (!userTokens) {
        throw new Error("User not found or user doesn't have a refreshToken");
    }
    // Construct auth options
    const authOptions = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: `grant_type=refresh_token&refresh_token=${userTokens.refreshToken}`
    };
    // Make the request
    try {
        const response = await (0, axios_1.default)(authOptions);
        return response.data.access_token;
    }
    catch (error) {
        throw new Error(`Error making request to Spotify: ${error.message}`);
    }
};
// obtain access token assosciated to a userid
const getUserAccessToken = async (userid) => {
    // search db for token given userid
    const userToken = await tokens_model_js_1.default.findOne({ userid: userid });
    if (!userToken) {
        throw new Error(`Error: User does not exist in TokensDB`);
    }
    return userToken.accessToken;
};
// middleware to be called before any spotify api calls
const validateAccessToken = async (req, res, next) => {
    const access_token = await getUserAccessToken(String(req.user._id));
    // If there's no access token, we can directly throw an error or handle accordingly
    if (!access_token) {
        return res.status(401).json({ msg: 'Access token missing in database' });
    }
    // make call to a spotify endpoint , if it throws a 401, accesstoken has expired
    // else it will return a 200 and access-token is not expired yet. do nothing
    // if expired get a new one via refresh token
    try {
        const response = await axios_1.default.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        if (response.status === 200) {
            // token OK
            console.log('token OK');
            req.headers.changed = '0';
            next();
        }
        else {
            // token EXPIRED
            throw new Error('Invalid status code from Spotify API'); // move to catch block
        }
    }
    catch (error) {
        console.log('token INVALID, refreshing');
        if (error?.response?.status === 401) { // Token expired or unauthorized
            try {
                // create new token and changed headers of request 
                const newAccessToken = await refreshTokens(req.user?.username);
                // now store new access token to db
                await tokens_model_js_1.default.findOneAndUpdate({ userid: String(req.user._id) }, { $set: { accessToken: newAccessToken } });
            }
            catch (innerError) {
                console.error('inner error: ', innerError);
                return res.status(500).json({ msg: 'Error refreshing access token in validateAccessToken', innerError });
            }
        }
        else {
            // either spotify / interal server issues
            console.error(error);
            return res.status(500).json({ msg: 'Error validating access token' });
        }
        next();
    }
};
//helper
const extractTopData = (spotifyData) => {
    // Extract top 5 artists
    const topArtists = spotifyData.items.slice(0, 5).map(artist => ({
        name: artist.name,
        imageurl: artist.images[0].url
    }));
    // Extract genres, then filter out unique genres, and take top 5
    const allGenres = spotifyData.items.flatMap(artist => artist.genres);
    const uniqueGenres = Array.from(new Set(allGenres));
    const topGenres = uniqueGenres.slice(0, 5);
    return { topArtists, topGenres };
};
app.get('/has_linked_spotify', authenticateToken, async (req, res) => {
    const userid = String(req.user._id);
    if (!userid) {
        return res.json({ msg: 'no userid was passed through the header' });
    }
    const query = await tokens_model_js_1.default.findOne({ userid: userid });
    console.log(query);
    if (!query) {
        return res.status(400).json({ msg: 'user not linked' });
    }
    return res.status(200).json({ msg: 'success' });
});
// takes days in header, and type in url , returns top artists 
// TODO: ADD TOP TRACKS
app.get('/spotify/top', authenticateToken, validateAccessToken, async (req, res) => {
    const { days } = req.headers;
    const type = 'artists';
    let access_token;
    try {
        access_token = await getUserAccessToken(String(req.user._id));
    }
    catch (error) {
        return res.status(500).json({ msg: error });
    }
    const sendError = (status, message) => {
        res.status(status).json({ msg: message });
    };
    // Validate type
    if (!['artists', 'tracks'].includes(type)) {
        return sendError(400, 'Invalid query type');
    }
    // Validate days
    if (!Number(days)) {
        return sendError(400, 'Days is missing or undefined');
    }
    // Validate access token
    if (!access_token || access_token === 'undefined') {
        return sendError(401, 'Access token missing from request headers');
    }
    try {
        const response = await axios_1.default.get(`https://api.spotify.com/v1/me/top/${type}?limit=${days}&offset=0`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        const responseData = {
            msg: 'success',
            data: extractTopData(response.data),
        };
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error('Error in Spotify endpoint', error?.response?.status);
        console.error(error);
        if (error?.response?.status === 401) {
            return sendError(401, 'Access token is not valid');
        }
        return sendError(500, 'Error making request to Spotify');
    }
});
// ------------------------------ END ------------------------------  //
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
//# sourceMappingURL=index.js.map