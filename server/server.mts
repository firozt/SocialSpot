
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const UserDB = require('./models/user.model.mts')

mongoose.connect('mongodb://localhost:27017/MernTest');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 

// ----------------------- HELPER FUNCTIONS ------------------------  //


// verifies Basic Auth credentials then returns
const checkAuthHeader = (req, res) => {
	const authHeader = req.headers['authorization'];
	if (!authHeader) {
		return res.status(401).send('Authorization header not provided');
	}
	
	const encodedCredentials = authHeader.split(' ')[1]; // decode credentials
	const credentials = atob(encodedCredentials).split(':');
	return { name: credentials[0] , password: credentials[1] }
}

console.log('SERVER STARTING');


// ------------------------- API ENDPOINTS -------------------------  //


app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.post('/register', async (req, res) => {
	try {
		const validatedData = checkAuthHeader(req, res)

		const newUser = await UserDB.create(validatedData);

		console.log('New user inserted:', newUser);
		return res.status(200).json({ msg: `User registered successfully ${newUser}`});
	} catch (error) {
		console.error('Error:', error);
		return res.status(500).json({ msg: 'Internal server error' });
	}
});

app.post('/login', async (req, res) => {
	console.log('in login')
	try {
		const validatedData = checkAuthHeader(req, res)
		const query = await UserDB.find(validatedData)
		console.log(query)
		if (query.length == 0) {
			return res.status(404).json({msg:'user not found'})
		}
		return res.status(200).json(query)
	} catch (error) {
		console.log(error)
		return res.status(500).json({msg:'server error'})
	}
})

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});
