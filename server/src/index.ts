import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import cors from 'cors';
import UserDB from './models/user.model.js';
import UserTokensDB from './models/tokens.model.js'
import express, {Request, Response, NextFunction} from 'express';
import User from './interfaces/User.js'
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import path from 'path'
import request from 'request-promise-native';
import axios from 'axios';
import { error } from 'console';
import SpotifyArtist from './interfaces/SpotifyMusic.js';
import SpotifyExtractedData from './interfaces/SpotiftyData.js';
import UserTokens from './interfaces/UserTokens.js';



// extends Requests interface with user attributes that i obtain from the jwt bearer token
declare module 'express-serve-static-core' {
	export interface Request {
		user: User
	}
}

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Setting up connections and middleware

mongoose.connect('mongodb://localhost:27017/MernTest');
const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173',  
    credentials: true
}));

app.use(express.json());


console.log('SERVER STARTING');

// ----------------------- HELPER FUNCTIONS ------------------------  //


// verifies Basic Auth credentials then returns
const checkBasicAuth = (req: Request, res: Response): User => {
	const authHeader: string = req.headers['authorization'];
	if (!authHeader) {
		res.status(401).send('Authorization header not provided');
		throw new Error('Authorization header not provided')
	}
	
	const encodedCredentials: string = authHeader.split(' ')[1]; // decode credentials
	const credentials: string[] = atob(encodedCredentials).split(':');

	return {
		email: credentials[0], 
		password: credentials[1], 
		username: null, // user will select a username on first login
		_id: null // will be generated on creation
	}
}

// Hashes password using bcrypt, with salt value 10
const hashPassword = async (password: string, saltRounds: number = 10): Promise<string> => {
	return bcrypt.hash(password, saltRounds);
}

const secretKey: string = 'sekret';

// Creates JWT token
const generateToken = (payload: User): string => {
	return jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Set the token expiration time (e.g., 1 hour)
};

// verifies jwt token, given by user header (bearer token)
// extracts user details from this and stores to req.user 
const authenticateToken = (req: Request, res: Response, next: NextFunction): void  => {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({msg:'auth header missing'});
        return;
    }

    const token: string = authHeader.split(' ')[1];

    jwt.verify(token, secretKey, (err: unknown, user: any): void => {
        if (err) {
            res.status(403).json({msg:'user does not have permission'});
            return;
        }
        
        req.user = user;
        next();
    });
};

// Returns username given userid
const userIdToUsername = async (userId: string): Promise<string> => {
	let query: Document;
	try {
		query = await UserDB.findById(userId)
	} catch (error) {
		console.error(error)
		throw new Error("unable to query db");
	}
	if (!query){
		throw new Error("User not found")
	}
	return query['username']
}

const usernameToUserId = async (username: string): Promise<string> => {
	let query: Document[];
	try {
		query = await UserDB.find({username: username})
	} catch (error: any) {
		console.error(error)
		throw new Error("unable to query db");
	}
	if (query.length === 0) {
		throw new Error("User not found");
	}
	return query[0]['_id']
}

const getFollowing = async (userId: string, res: Response): Promise<User[]>  => {
	let query: User[];
	try {
		// find user making query
		query = await UserDB.find({_id: userId})
	} catch (error) {
		console.error(error)
		res
			.status(500)
			.json({msg:'unable to fetch user database'})
		throw new Error('Unable to get following from users collection')
	}

	if (query.length === 0) {
		res
			.status(404)
			.json({msg:'user not found'})
		throw new Error('User not found in users collection')
	}
	// load user into var
	const user: User = {
		username: query[0]['username'],
		_id: query[0]['_id'],
		following: query[0]['following'],
	}
		
	const followingList: User[] = []

	for (const userId of user['following']) {
		const username = await userIdToUsername(userId);
		followingList.push({username: username, _id: user['_id']});
	}
	return followingList
}

// ------------------------- API ENDPOINTS -------------------------  //

app.get('/', (req: Request, res: Response) => {
	res.send('working');
});

app.post('/set_name/:username', authenticateToken , async (req: Request, res: Response) => {
	const userid: string = String(req.user['_id']);
	try {
		const newUser: User = await UserDB.findByIdAndUpdate(
			userid,
			{username: req.params.username},
			{new: true})
		if (!newUser) {
			return res
				.status(401)
				.json({msg:'cant find user'})
		}
		const userToken: User = {
			_id: newUser['_id'],
			username: newUser['username'],
			email: newUser['email'],
		}
		const newToken: string = generateToken(userToken)
		
		return res
			.status(200)
			.json({msg:'success',token:newToken})
	} catch (error: any) {
		console.error(error)
		return res
			.status(500)
			.json({msg:'unable to lookup users collection'})
	}
}) 

app.post('/register', async (req: Request, res: Response) => {
	try {
		const validatedData: User = checkBasicAuth(req, res)
		validatedData['password'] = await hashPassword(validatedData['password'])
		const userDocument: Document = await UserDB.create(validatedData);
		const newUser: User = {
			email: userDocument['email'],
			username: userDocument['username'], 
			password: userDocument['password'],
			_id: userDocument['_id'],
		}
		return res.status(200).json({ msg: `User registered successfully ${newUser}`});
	} catch (error) {
		console.error('Error:', error);
		return res.status(500).json({ msg: 'Internal server error' });
	}
});

app.post('/login', async (req: Request, res: Response) => {
	// validate header
	const validatedData: User = checkBasicAuth(req, res);
	let query: Array<Document>;
	try {
		// find user in db
		query = await UserDB.find({ email: validatedData['email'] });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ msg: 'error fetching from users collection' });
	}

	if (query.length === 0) {
		return res.status(404).json({ msg: 'user not found' });
	}
	// load user in var to be returned (name,_id)
	const user: User = {
		email: query[0]['email'],
		username: query[0]['username'], 
		_id: query[0]['_id'],
	};
	// compare hashed pw 
	const passwordMatches = await bcrypt.compare(
		validatedData['password'], 
		query[0]['password']
		);

	if (!passwordMatches) {
		return res.status(404).json({ msg: 'user not found (pw)' });
	}

	// create and return token
	const token: any = generateToken(user)
	
	return res
		.status(200)
		.json({msg: 'success', user:{name:user['name'],_id:user['_id']}, token:token});
});

app.get('/get_user', authenticateToken, (req: Request, res: Response) => {
	const user: User = { 
		username: req.user['username'], 
		email: req.user['email'],
		_id: req.user['_id'],
	}
	return res
	.status(200)
	.json({msg:'working', user:user})
})

app.post('/follow/:username', authenticateToken ,async (req: Request, res: Response) => {
	const friendUsername: string = req.params.username
	let query: Array<Document>
	try {
		// find user in collection
		query= await UserDB.find({ username: friendUsername });
	} catch (error: any) {
		console.log(error)
		return res
			.status(404)
			.json({msg:'user not found'})
	}
	// check if user exists
	if (query.length === 0) {
		return res.status(404).json({ msg: 'user not found' });
	}
	// extract useful information
	const friend: User = {
		username: query[0]['username'], 
		_id: query[0]['_id'],
	};
	try {
		// add userid of username to following list
		await UserDB.findOneAndUpdate(
			{ _id: req.user['_id'] },
			{ $addToSet: { following: friend['_id'] } } // push friend id to following list
		)
	} catch (error) {
		return res
			.status(500)
			.json({msg:'could not append friend to friends list'})		
	}
	return res
		.status(200)
		.json({msg:'success'})
}) 

app.post('/unfollow/:username', authenticateToken , async (req: Request, res: Response) => {
	const userIdToRemove: string = await usernameToUserId(req.params.username)
	try {
		const updatedUser: Document = await UserDB.findOneAndUpdate(
			{ _id: req.user['_id'] },
			{ $pull: { following: userIdToRemove}})
		
		if (!updatedUser) {
			return res.status(404).json({ msg: 'User not found' });
		}
		return res
			.status(200)
			.json({msg:'success', usr: updatedUser})

	} catch (error) {
		console.error(error)
		return res
			.status(500)
			.json({msg:'could not search users db'})
	}
})

app.get('/following', authenticateToken , async (req: Request, res: Response) => {
	const followingList: User[] = await getFollowing(String(req.user['_id']), res)
	return res
		.status(200)
		.json({msg:'success', following:followingList})
})

app.get('/search_users/:query', authenticateToken, async (req: Request, res: Response) => {
	const query: string = req.params.query
	let queryOutput: User[];
	// query all where 'query' exist inside name (SQL's LIKE keyword)
	try {
		queryOutput = await UserDB.find(
			{ username: { $regex: new RegExp(query, 'i') } },  // 'i' means case insesetive
			{ username: 1, _id: 1} ) // only select username and _id
	} catch (error: any) {
		console.error(error)
		return res
			.status(500)
			.json({msg: 'could not fetch users tablwe'})
	}

	// parse only names and id
	queryOutput.map((item: User, index: number) => {
		return {
			username: item['username'],
			_id: item['_id'],
		}
	})
	// get users following data, currently stored as ids, translate to usernames

	const followingList: User[] = await getFollowing(String(req.user['_id']), res)

	const notFollowing: User[] = queryOutput.filter((item1) => {
		return (
			!followingList.some((item2) => item1.username === item2.username) &&
			item1.username !== req.user.username
		);
	});

	return res.status(200).json({msg:'success', query:notFollowing})
})

// ---------------------------- SPOTIFY ----------------------------  //


// asks user for spotify access
app.get('/spotify' , (req, res) => {
    const scopes = 'user-read-private user-read-email user-top-read';
	const client_id: string = process.env.SPOTIFY_CLIENT_ID
	// const redirect_uri =  `${process.env.API_URL}:${process.env.API_PORT}/callback`
	const redirect_uri: string =  'http://localhost:5173/callback'


    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + client_id +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirect_uri));
});


// runs once per user, once ran will save refresh token and access token to token table
// takes auth code in headers as 'code'
app.get('/get_spotify_tokens', authenticateToken, async (req: Request, res: Response) => {
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

        const response = await axios(authOptions);
        const access_token = response.data.access_token;
        const refresh_token = response.data.refresh_token;

        // Store refresh token + access token in db, as user is new we will need to create a new row
        const userid: string = String(req.user._id);
        await UserTokensDB.create({
			userid: userid,
			refreshToken: refresh_token,
			accessToken: access_token,
		})

        res.status(200).json({msg:'successfull'});
    } catch (error) {
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
const refreshTokens = async (username: string): Promise<string> => {
	const client_id = process.env.SPOTIFY_CLIENT_ID;
	const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  // Convert username to userid
	const userid = await usernameToUserId(username);
	if (!userid) {
		throw new Error("User does not exist");
	}

  // Obtain refreshToken from DB given userid
	const userTokens: UserTokens = await UserTokensDB.findOne({userid: userid});
	console.log(userTokens)
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
		const response = await axios(authOptions);
		return response.data.access_token;
	} catch (error) {
		throw new Error(`Error making request to Spotify: ${error.message}`);
	}
}

// obtain access token assosciated to a userid
const getUserAccessToken = async (userid: string): Promise<string> => {
	// search db for token given userid
	const userToken: UserTokens = await UserTokensDB.findOne({userid: userid})
	if (!userToken) {
		throw new Error(`Error: User does not exist in TokensDB`)
	}
	return userToken.accessToken
}

	// middleware to be called before any spotify api calls
const validateAccessToken = async (req: Request, res: Response, next: Function) => {
    const access_token = await getUserAccessToken(String(req.user._id))

    // If there's no access token, we can directly throw an error or handle accordingly
    if (!access_token) {
        return res.status(401).json({ msg: 'Access token missing in database' });
    }

	// make call to a spotify endpoint , if it throws a 401, accesstoken has expired
	// else it will return a 200 and access-token is not expired yet. do nothing
	// if expired get a new one via refresh token
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        if (response.status === 200) {
			// token OK
			console.log('token OK')
            req.headers.changed = '0';
            next();
        } else {
			// token EXPIRED
            throw new Error('Invalid status code from Spotify API'); // move to catch block
        }
    } catch (error) {
		console.log('token INVALID, refreshing')
        if (error?.response?.status === 401) { // Token expired or unauthorized
            try {
				// create new token and changed headers of request 
                const newAccessToken = await refreshTokens(req.user?.username);
				// now store new access token to db
				await UserTokensDB.findOneAndUpdate(
					{ userid: String(req.user._id) }, 
					{ $set: { accessToken: newAccessToken } },
				);
            } catch (innerError) {
				console.error('inner error: ',innerError)
                return res.status(500).json({ msg: 'Error refreshing access token in validateAccessToken', innerError });
            }
        } else {
            // either spotify / interal server issues
			console.error(error)
            return res.status(500).json({ msg: 'Error validating access token' });
        }

        next();
    }
};

//helper
const extractTopData = (spotifyData: { items: SpotifyArtist[] }): SpotifyExtractedData => {
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

app.get('/has_linked_spotify', authenticateToken , async (req: Request, res: Response) => {
	const userid: string  = String(req.user._id)
	if (!userid) {
		return res.json({msg:'no userid was passed through the header'})
	}
	const query = await UserTokensDB.find({userid: userid})
	if(!query) {
		return res.status(400).json({msg:'user not linked'})
	}
	return res.status(200).json({msg:'success'})
})


// takes days in header, and type in url 
app.get('/top/:type', authenticateToken, validateAccessToken, async (req: Request, res: Response) => {
    const { days } = req.headers;
    const { type } = req.params;
	let access_token: string
	try {
		access_token = await getUserAccessToken(String(req.user._id))
	} catch (error: any) {
		return res.status(500).json({msg: error})
	}
    const sendError = (status: number, message: string) => {
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
        // Request top artists/tracks from Spotify's API
        // const response = await axios.get(`https://api.spotify.com/v1/me/top/${type}?offset=${days}`, {
        // const response = await axios.get(`https://api.spotify.com/v1/me/top/${type}?limit=${days}?offset=${0}`, {
        const response = await axios.get(`https://api.spotify.com/v1/me/top/${type}?limit=${days}&offset=0`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const responseData = {
            msg: 'success',
            data: extractTopData(response.data),  
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error in Spotify endpoint', error?.response?.status);
		console.error(error)
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


