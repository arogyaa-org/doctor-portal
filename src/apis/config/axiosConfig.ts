import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";

/**
 * Creates a custom Axios instance with predefined configurations.
 *
 * @param {string} baseURL - The base URL for the Axios instance (e.g., a microservice endpoint).
 * @returns {AxiosInstance} - A configured Axios instance ready to make HTTP requests.
 */
export function createAxiosInstance(baseURL: string): AxiosInstance {
    const instance = axios.create({
        baseURL,
        validateStatus: (status) => (status >= 200 && status < 300) || status == 404,
        timeout: 40000,
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json; charset=utf-8",
        },
    });

    // Custom error handler
    const errorHandler = (error: AxiosError): Promise<never> => {
        const statusCode = error.response?.status;
        if (statusCode && statusCode !== 401) {
            console.error("API Error:", error);
            throw error;
        }
        return Promise.reject(error);
    };

    // Response interceptors
    instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error: AxiosError) => errorHandler(error)
    );
    return instance;
}
