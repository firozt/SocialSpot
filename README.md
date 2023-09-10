# SocialSpot

Spotify Friends Statistics - MERN TypeScript React MPA




SocialSpot is a full-stack TypeScript React Multi-Page Application (MPA) built with the MERN stack (MongoDB, Express.js, React, Node.js). This project allows users to view their friends' Spotify statistics and follow them to keep up to date with their music tastes and listening habits.

Table of Contents

Features
Prerequisites
Installation
Usage
Project Structure
Technologies Used
Contributing
License
Features

User Authentication: Secure user authentication and registration using OAuth 2.0 via Spotify, ensuring users can access their Spotify data.
Spotify API Integration: Fetch and display user's Spotify statistics, including top tracks, artists, playlists, and recent listening history.
Friendship System: Users can follow/unfollow friends to see their Spotify statistics and receive updates on their activity.
User Dashboard: Personalized dashboard displaying the user's Spotify statistics and followed friends' activity.
Search and Discover: Discover new friends on Spotify and search for specific users to connect with.
Prerequisites

Before you begin, ensure you have met the following requirements:

Node.js and npm installed on your machine.
MongoDB installed and running.
Spotify Developer API credentials for authentication and data retrieval.
Installation

Clone the repository:
bash
Copy code
git clone https://github.com/yourusername/spotify-friends-statistics.git
cd spotify-friends-statistics
Install server dependencies:
bash
Copy code
cd server
npm install
Install client dependencies:
bash
Copy code
cd ../client
npm install
Create a .env file in the server directory and add your Spotify API credentials:
dotenv
Copy code
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/auth/callback
SESSION_SECRET=your_session_secret
MONGO_URI=your_mongodb_uri
Start the server and client (in separate terminals):
bash
Copy code
# Server
cd ../server
npm start

# Client
cd ../client
npm start
Open your browser and access the application at http://localhost:3000.
Usage

Register and log in using your Spotify account.
Connect with friends on Spotify or search for specific users.
Follow friends to see their Spotify statistics on your dashboard.
Enjoy keeping up with your friends' music preferences and habits!
Project Structure

The project structure is organized as follows:

server: Contains the Node.js/Express.js backend.
client: Houses the React frontend.
shared: Shared TypeScript types and utilities.
Technologies Used

Frontend:
React
TypeScript
Axios for API requests
Redux for state management
React Router for routing
Material-UI for styling
Backend:
Node.js
Express.js
TypeScript
MongoDB (Mongoose)
Passport.js for authentication
Authentication:
OAuth 2.0 with Spotify API
Contributing

Contributions are welcome! Feel free to open issues or create pull requests to improve this project. Please follow the Contributing Guidelines for more details.

License

This project is licensed under the MIT License. See the LICENSE file for details.
