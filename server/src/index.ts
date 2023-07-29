import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import cors from 'cors';
import UserDB from './models/user.model.js';
import express, {Request, Response} from 'express';
import User from './interfaces/User.js'
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import path from 'path'
dotenv.config()
const envPath = path.resolve(__dirname, '../../.env'); // Adjust the path as needed

// Load the environment variables from the .env file
dotenv.config({ path: envPath });




// Setting up connections and middleware

mongoose.connect('mongodb://localhost:27017/MernTest');
const app = express();
const port = 3000;

// app.use(cors());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());



// ----------------------- HELPER FUNCTIONS ------------------------  //


// verifies Basic Auth credentials then returns
const checkBasicAuth = (req: Request, res: Response): User => {
	const authHeader: string = req.headers['authorization'];
	if (!authHeader) {
		return res.status(401).send('Authorization header not provided');
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
const authenticateToken = (req: Request, res: Response, next: Function): void => {
	const authHeader: string = req.headers.authorization
	if (!authHeader) {
		return res
			.status(401)
			.json({msg:'auth header missing'})
	}
	const token: string = authHeader.split(' ')[1]

	jwt.verify(token, secretKey, (err: unknown, user: User) => {
		if (err) {
			return res
				.status(403)
				.json({msg:'user does not have permission'})
				.redirect(`${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}/login`)
		}
		req.user = user
		next()
	});
}

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


// ------------------------- API ENDPOINTS -------------------------  //
console.log('SERVER STARTING');


app.get('/', (req: Request, res: Response) => {
	res.send('working');
});

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
		password: query[0]['password'],
		_id: query[0]['_id'],
		__v: query[0]['__v'],
	};
	// compare hashed pw 
	const passwordMatches = await bcrypt.compare(
		validatedData['password'], 
		user['password']
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
			{ $addToSet: { following: friend['_id'] } } // push friend id to friends
		)
	} catch (error) {
		return res
			.status('500')
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
	const userId: string = req.user['_id']
	let query: User[];
	try {
		// find user making query
		query = await UserDB.find({_id: userId})
	} catch (error) {
		console.error(error)
		return res
			.status(500)
			.json({msg:'unable to fetch user database'})
	}

	if (query.length === 0) {
		return res
			.status(404)
			.json({msg:'user not found'})
	}
	// load user into var
	const user: User = {
		username: query[0]['username'],
		_id: query[0]['_id'],
		following: query[0]['following'],
	}
	
	const followingList: string[] = []

	for (const userId of user['following']) {
		const username = await userIdToUsername(userId);
		followingList.push(username);
	}
	return res
		.status(200)
		.json({msg:'succes', following:followingList})
})

// ---------------------------- SPOTIFY ----------------------------  //


app.get('/callback', (req:Request, res:Response) => {
	// const redirect_uri: string = `http://${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}/`
	if (!req.query.code) {
		return res
		.status(401)
		.json({msg:'unauthorized'})
	}
	return res.json({msg:'succes',spotify_token:req.query.code})
})

app.get('/spotify', authenticateToken ,(req: Request, res: Response) => {
	const url: string = buildRequestURL()
	return res
		.status(200)
		.json({'msg':'success',url:url})
})

// builds URL that we will redirect to to gain user access
const buildRequestURL = (): string => {
	const client_id: string =  process.env.SPOTIFY_CLIENT_ID
	// const redirect_uri: string = `${process.env.API_URL}:${process.env.API_PORT}/callback`
	const redirect_uri: string = `http://${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}/user`
	console.log(redirect_uri)
	const AUTHORIZE: string = "https://accounts.spotify.com/authorize"
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
}

// ------------------------------ END ------------------------------  //

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});


