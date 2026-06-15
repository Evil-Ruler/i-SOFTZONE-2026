import axios from 'axios';
// 1. Create an Axios instance pointing to your Node.js backend cluster
const API = axios.create({
  baseURL: 'https://i-softzone-2026.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. REQUEST INTERCEPTOR: Automatically attach the Access Token to every outgoing request header



API.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('token');
    
    // 🛠️ THE SAFEGUARD FIX: Ensure token exists and is NOT a literal string placeholder
    if (accessToken && accessToken !== "undefined" && accessToken !== "null" && accessToken.trim() !== "") {
      config.headers['Authorization'] = accessToken;
    } else {
      // Log it to your browser console to catch if a component is firing prematurely
      console.warn("Axios Interceptor blocked a malformed or missing token header transmission.");
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



// 3. RESPONSE INTERCEPTOR: Catch 401 Unauthorized errors and automatically refresh tokens
API.interceptors.response.use(
  (response) => {
    return response; // If the request succeeds, pass data right along smoothly
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the backend rejected our call with a 401 (Expired Access Token)
    // and make sure we aren't stuck in an infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request as currently undergoing a retry execution

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken'); // Grab long-lived key
        
        if (!storedRefreshToken) {
          throw new Error("No backup session refresh token found.");
        }

        // Send a background network request to your new Phase 6 backend route
        const response = await axios.post('http://localhost:5000/api/auth/refresh-token', {
          refreshToken: storedRefreshToken,
        });

        const { accessToken } = response.data;

        // Save the brand-new 15-minute access token into storage configuration nodes
        localStorage.setItem('token', accessToken);

        // Update the authorization header of the original paused request with our new key
        originalRequest.headers['Authorization'] = accessToken;

        // Re-execute the original request that failed earlier. The user notices absolutely nothing!
        return API(originalRequest);
      } catch (refreshError) {
        console.error("Session refresh link broken or revoked:", refreshError);
        
        // If the refresh token is also expired or deleted from PostgreSQL, force log them out
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;