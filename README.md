# SocialSpot

Spotify Friends Statistics - MERN TypeScript React MPA




SocialSpot is a full-stack TypeScript React Multi-Page Application (MPA) built with the MERN stack (MongoDB, Express.js, React, Node.js). This project allows users to view their friends' Spotify statistics and follow them to keep up to date with their music tastes and listening habits.


User Authentication: Secure user authentication and registration using OAuth 2.0 via Spotify, ensuring users can access their Spotify data.
Spotify API Integration: Fetch and display user's Spotify statistics, including top tracks, artists, playlists, and recent listening history.
Friendship System: Users can follow/unfollow friends to see their Spotify statistics and receive updates on their activity.
User Dashboard: Personalized dashboard displaying the user's Spotify statistics and followed friends' activity.
Search and Discover: Discover new friends on Spotify and search for specific users to connect with.
Prerequisites

# Before you begin, ensure you have met the following requirements:

1. Node.js and npm installed on your machine.
2. MongoDB installed and running.
3. Spotify Developer API credentials for authentication and data retrieval.

# Installation

1. Clone the repository:
  git clone https://github.com/firozt/socialSpot
  cd socialSpot
  Install server dependencies:
  cd server
  npm install

2. Install client dependencies:
  cd ../client
  npm install

3.  Create a .env file in the server directory and add your Spotify API credentials:

    CLIENT_URL=localhost
    CLIENT_PORT=5173
    API_URL=http://127.0.0.1
    API_PORT=3000
    SPOTIFY_CLIENT_ID= YOUR SPOTIFY CLIENT ID
    SPOTIFY_CLIENT_SECRET= YOUR SPOTIFY CLIENT SECRET

4.  start the server and client (in separate terminals):
  -Server
  cd ../server
  npm start

  -Client
  cd ../client
  npm start
  Open your browser and access the application at http://localhost:3000.

Usage
Register and log in using your Spotify account.
Connect with friends on Spotify or search for specific users.
Follow friends to see their Spotify statistics on your dashboard.
Enjoy keeping up with your friends' music preferences and habits!
Project Structure

# The project structure is organized as follows:

server: Contains the Node.js/Express.js backend.
+ client: Houses the React frontend.
+ shared: Shared TypeScript types and utilities.
+ Technologies Used

Frontend:
+ React
+ TypeScript
+ Axios for API requests
+ React Router for routing
+ ChakraUI for styling
+ Backend:
+ Node.js
+ Express.js
+ TypeScript
+ MongoDB (Mongoose)
Authentication:
+ OAuth 2.0 with Spotify API
+ JWT tokens
+ BCrypt for storing passwords
+ Bearer Keys


