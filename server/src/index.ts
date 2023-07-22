import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import cors from 'cors';
import UserDB from './models/user.model.js';
import express, {Request, Response} from 'express';
import User from './interfaces/User.js'
import jwt from 'jsonwebtoken';




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
	console.log('in2')
	const authHeader: string = req.headers['authorization'];
	if (!authHeader) {
		return res.status(401).send('Authorization header not provided');
	}
	
	const encodedCredentials: string = authHeader.split(' ')[1]; // decode credentials
	const credentials: string[] = atob(encodedCredentials).split(':');

	return { name: credentials[0] , password: credentials[1] }
}

// Hashes password using bcrypt, with salt value 10
const hashPassword = async (password: string, saltRounds: number = 10): Promise<string> => {
	return bcrypt.hash(password, saltRounds);
}

const secretKey: string = 'sekret';

// Creates JWT token
const generateToken = (payload: User): any => {
	return jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Set the token expiration time (e.g., 1 hour)
};



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
			name: userDocument['name'], 
			password: userDocument['password'],
		}
		return res.status(200).json({ msg: `User registered successfully ${newUser}`});
	} catch (error) {
		console.error('Error:', error);
		return res.status(500).json({ msg: 'Internal server error' });
	}
});

app.post('/login', async (req: Request, res: Response) => {
	try {
		const validatedData: User = checkBasicAuth(req, res);
		const query: Array<Document> = await UserDB.find({ name: validatedData['name'] });
		if (query.length === 0) {
			return res.status(404).json({ msg: 'user not found' });
		}

		// cast document type to user type by extracting name, password, id, v
		const user: User = {
			name: query[0]['name'], 
			password: query[0]['password'],
			_id: query[0]['_id'],
			__v: query[0]['__v'],
		};

		const passwordMatches = await bcrypt.compare(
			validatedData['password'], 
			user['password']
			);

		if (!passwordMatches) {
			return res.status(404).json({ msg: 'user not found' });
		}

		const token: any = generateToken(user)
		return res
		.status(200)
		.json({msg: 'success', user:user});
	} catch (error) {
		
		console.log(error);
		return res.status(500).json({ msg: 'server error' });
	}
});

app.get('/check', (req: Request, res: Response) => {
	console.log('working')
	return res
	.status(200)
	.json({msg:'working!!'})
})

// ------------------------------ END ------------------------------  //

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});
