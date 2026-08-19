import axios from 'axios';

// Fallback to local endpoint if the environment variable isn't injected yet
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for sessions/cookies in e-commerce
});

export default API;
