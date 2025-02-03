import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { Utility } from "@/utils";

/**
 * Creates a custom Axios instance with predefined configurations.
 *
 * @param {string} baseURL - The base URL for the Axios instance (e.g., a microservice endpoint).
 * @returns {AxiosInstance} - A configured Axios instance ready to make HTTP requests.
 */
export function createAxiosInstance(baseURL: string): AxiosInstance {
    const instance = axios.create({
        baseURL,
        validateStatus: (status) => (status >= 200 && status < 300) || status === 404, // Allow 404 as valid status
        timeout: 40000, // Request timeout in milliseconds
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json; charset=utf-8",
        },
    });

    /**
     * Custom error handler for Axios errors.
     *
     * @param {AxiosError} error - The Axios error object.
     * @returns {Promise<never>} - A rejected promise with the error.
     */
    const errorHandler = (error: AxiosError): Promise<never> => {
        const statusCode = error.response?.status;
        if (statusCode && statusCode !== 401) {
            console.error("API Error:", error.message);
            throw error;
        }
        return Promise.reject(error);
    };

    // Response interceptors
    instance.interceptors.response.use(
        (response: AxiosResponse) => response, // Pass through the successful response
        (error: AxiosError) => errorHandler(error) // Handle errors using the custom handler
    );

    // Request interceptor to include the token in headers
    instance.interceptors.request.use(
        (config) => {
            const { getCookies } = Utility();
            const cookies = getCookies();
            const token = cookies?.token; // Retrieve the token from cookies

            if (token) {
                config.headers["x-access-token"] = token; // Add token to headers if available
            }

            return config;
        },
        (error) => Promise.reject(error) // Reject the promise on request errors
    );

    return instance;
}
