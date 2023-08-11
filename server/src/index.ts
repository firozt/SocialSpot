import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import cors from 'cors';
import UserDB from './models/user.model.js';
import express, {Request, Response, NextFunction} from 'express';
import User from './interfaces/User.js'
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import path from 'path'
import request from 'request-promise-native';
import axios from 'axios';
import { error } from 'console';



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
	console.log(req.params.username)
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
		console.log(newUser)
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

	return res
		.status(200)
		.json({msg:'success', query:notFollowing})
})

// ---------------------------- SPOTIFY ----------------------------  //

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

// runs once per user, once ran will save refresh token to db and return tempoary access tokens
// takes auth code in headers as 'code'
app.get('/get_spotify_tokens', authenticateToken , async (req: Request, res: Response) => {
	const client_id: string = process.env.SPOTIFY_CLIENT_ID
	const redirect_uri: string =  'http://localhost:5173/callback'
	const client_secret = process.env.SPOTIFY_CLIENT_SECRET
	

    const code: string = String(req.headers.code) || '';
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
            const response = await request.post(authOptions);
            if (response) {
                const access_token = response.access_token;
                const refresh_token = response.refresh_token;

				// now store refresh token in db
				const userid: string = String(req.user._id)
				const doc: Document = await UserDB.findByIdAndUpdate(userid,
					{
						refreshToken: refresh_token
					},
					{
						new: true,
						upsert: true,
					})
				console.log('doc: ',doc)
				// error checking db
				if (!doc) {
					res.status(404)
						.json({msg:'user not found'})
					return
				}
				console.log('success')
				res.status(200)
				.json({access_token: access_token,});
				
            } else {
				// auth token in header was invalid
				console.log('invalid token')
				res.status(400)
					.json({msg:'invalid token'})
            }
        } catch (error) {
			// error calling spotify endpoint
            console.error(error);
            res.send({
                error: 'Something went wrong while retrieving the tokens',
            });
        }
    } else {
		// auth code not present in headers
		res.status(400)
			.json({msg:'no auth code in headers'})
    }
});

// takes refresh_token in header
const refreshTokens = async (username: string): Promise<string> => {
	const client_id: string = process.env.SPOTIFY_CLIENT_ID
	const client_secret = process.env.SPOTIFY_CLIENT_SECRET
	let userid: string;

	// convert username to userid
	try {
		userid = await usernameToUserId(username)
	} catch (error) {
		throw new Error(error.message)
	}
	
	// obtain refreshtokens from db given userid

	let user: User
	user = await UserDB.findById(userid)
	if (!user) {
		throw error('user not found')
	}
	const refresh_token: string = user['refreshToken'];

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
	let access_token: string
	const response = await request.post(authOptions, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			access_token = body.access_token;
			return access_token
		} else {
			throw new Error(`Error making request to spotify, ${error}, response ${JSON.stringify(response)}`)
		}
	});
	return response.access_token
}

const validateAccessToken = async (req: Request, res: Response, next: Function) => {
	// check if access token is valid

	const access_token: string = String(req.headers.access_token);
	axios.get('https://api.spotify.com/v1/me', {
		headers: {
			'Authorization': 'Bearer ' + access_token
		}
	}).then(async response => {
		if (response.status === 200) {
			req.headers.changed = '0';
			next()
		} else {
			throw new Error("Invalid status code");  // Handle non-200 status codes as errors
		}
	}).catch(async error => {
		const newAccessToken: string = await refreshTokens(req.user['username']);
		req.headers.access_token = newAccessToken;

		req.headers.changed = '1';
		next()
	})
}


// takes access_token, days in header, 
app.get('/top/:type', authenticateToken , validateAccessToken , async (req: Request, res: Response) => {
	   // Extract access token from request headers, and query type from url
		const access_token: string = String(req.headers.access_token);
		const type: string = String(req.params.type)
		const days: string = String(req.headers.days)



		// error checking variables
		if (type != 'artists' && type != 'tracks') {
			res.status(400).json({msg:'Invalid query type'})
			return;
		} 
		if (!Number(days)) {
			res.status(400).json({msg:'Days is missing or undefined'})
			return
		}

		if (!access_token || access_token == 'undefined') {
			res.status(401).json({msg:'Access token missing from request headers'});
			return;
		}


		try {
			// Request top artists from Spotify's API
			const response = await request.get(`https://api.spotify.com/v1/me/top/${type}?offset=${days}`, {
				headers: {
					Authorization: `Bearer ${access_token}`
				}
			});
			if (req.headers.changed == '1') {
				res.status(200).json({msg:'success',data:response, newToken: true, access_token: access_token});

			} else {
				res.status(200).json({msg:'success',data:response});
			}
		} catch (error) {
			console.log('error in spotify endpoint')
			if (error?.statusCode == 401) {
				console.log('access token ran out')
				res.status(401).json({msg:'access token is not valid'})
			} else {
			   // Something happened in setting up the request and triggered an Error
				// console.log('Error', error.message);
				console.log('error here!!!!!!!!!!!!!', error.statusCode)
				res.status(500).json({msg: error});
			}
		}
})

// ------------------------------ END ------------------------------  //

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});


