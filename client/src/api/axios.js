import axios from 'axios';

axios.defaults.withCredentials = true; // Enable sending cookies with requests

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});

//Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            try {
                // Attempt to refresh the token
                const refreshResponse = await axios.post('http://localhost:8080/api/auth/refresh-token',
                    {}, // Empty body for refresh token endpoint
                    { withCredentials: true }
                );

                // If refresh is successful, update the access token in localStorage
                const newAccessToken = refreshResponse.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);

                // Retry the original request with the new access token
                error.config.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(error.config);
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError);
                localStorage.removeItem('accessToken');
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;