# Esoteric Wisdom App (Practice Project)

This is a full-stack web application developed as a practice project to explore and demonstrate various web development concepts, including:
-   **Frontend:** React.js for a dynamic user interface.
-   **Backend:** Node.js with Express.js for API services.
-   **Authentication:** User registration, login, and protected routes using JWT (JSON Web Tokens) and bcrypt for password hashing.
-   **Data Storage:** Simple JSON files for user and wisdom data (for demonstration purposes).
-   **Deployment:** Configured for deployment on platforms like Render.

## Project Structure

The project is divided into two main parts:
-   `client/`: Contains the React frontend application.
-   `server/`: Contains the Node.js/Express backend API.

## Local Development Setup

To run this project locally, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/Soskid107/noob.git
cd noob/esoteric-wisdom-app
```

### 2. Backend Setup (server/)

Navigate to the `server` directory, install dependencies, and start the server:

```bash
cd server
npm install
npm start
```
The server will run on `http://localhost:3000`.

### 3. Frontend Setup (client/)

Open a new terminal, navigate to the `client` directory, install dependencies, and start the React development server:

```bash
cd ../client
npm install
npm start
```
The client will run on `http://localhost:3001`.

### 4. Access the Application

Once both the client and server are running, open your web browser and go to `http://localhost:3001` to access the application.

## API Endpoints

The backend provides the following API endpoints:

-   `POST /register`: Register a new user.
-   `POST /login`: Log in an existing user and receive a JWT.
-   `GET /profile`: Get user profile information (requires authentication token).
-   `PUT /profile`: Update user profile information (requires authentication token).
-   `GET /wisdom`: Get a random piece of wisdom (requires authentication token).

## Live Deployment

*(Once deployed, you can add a link to your live application here, e.g., `https://your-app-name.onrender.com`)*
