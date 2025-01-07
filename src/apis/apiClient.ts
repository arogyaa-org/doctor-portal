import { createAxiosInstance } from "./config/axiosConfig";
import { Utility } from "@/utils";

const { getServiceUrl } = Utility();

/**
 * Fetches data from the provided service name and endpoint using a GET request.
 *
 * @template T - The expected type of the response data.
 * @param {string} serviceName - The key representing the microservice (e.g., 'appointment', 'doctor').
 * @param {string} endpoint - The API endpoint to fetch data from.
 * @returns {Promise<T>} - A promise that resolves to the fetched data.
 * @throws {Error} - If the response does not contain data.
 */
export const fetcher = async <T>(
    serviceName: string,
    endpoint: string
): Promise<T> => {
    const baseURL = getServiceUrl(serviceName);
    const axiosInstance = createAxiosInstance(baseURL);
    const res = await axiosInstance.get<T>(endpoint);

    if (!res.data) {
        throw new Error("No data found");
    }
    return res.data;
};

/**
 * Creates data at the provided service name and endpoint using a POST request.
 *
 * @template T - The type of the response data.
 * @template D - The type of the data to be sent in the request body.
 * @param {string} serviceName - The key representing the microservice.
 * @param {string} endpoint - The API endpoint to send data to.
 * @param {D} data - The data to be sent.
 * @returns {Promise<T>} - A promise that resolves to the created data.
 * @throws {Error} - If the response does not contain data.
 */
export const creator = async <T, D>(
    serviceName: string,
    endpoint: string,
    data: D
): Promise<T> => {
    const baseURL = getServiceUrl(serviceName);
    const axiosInstance = createAxiosInstance(baseURL);
    const res = await axiosInstance.post<T>(endpoint, data);

    if (!res.data) {
        throw new Error("Failed to create data");
    }
    return res.data;
};

/**
 * Modifies data at the provided service name and endpoint using a PUT request.
 *
 * @template T - The type of the response data.
 * @template D - The type of the data to be sent in the request body.
 * @param {string} serviceName - The key representing the microservice.
 * @param {string} endpoint - The API endpoint to send data to.
 * @param {D} data - The data to be updated.
 * @returns {Promise<T>} - A promise that resolves to the updated data.
 * @throws {Error} - If the response does not contain data.
 */
export const modifier = async <T, D>(
    serviceName: string,
    endpoint: string,
    data: D
): Promise<T> => {
    const baseURL = getServiceUrl(serviceName);
    const axiosInstance = createAxiosInstance(baseURL);
    const res = await axiosInstance.patch<T>(endpoint, data);

    if (!res.data) {
        throw new Error("Failed to modify data");
    }
    return res.data;
};
