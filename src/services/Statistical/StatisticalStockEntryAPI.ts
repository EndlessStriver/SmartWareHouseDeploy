import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { NavigateFunction } from "react-router-dom";
import { ResponseError } from "../../interface/ResponseError";

interface Location {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    locationCode: string;
    maxCapacity: string;
    currentCapacity: string;
    maxWeight: string;
    currentWeight: string;
    quantity: number;
    occupied: boolean;
}

interface Product {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    productCode: string;
    img: string;
    export_criteria: string;
}

interface Unit {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    isBaseUnit: boolean;
}

interface Item {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    expectQuantity: number;
    receiveQuantity: number;
    itemStatus: boolean;
    location: string;
    product: Product;
    unit: Unit;
    locations: Location[];
}

export interface StatisticalStockEntryResponse {
    checkItems: Item[];
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    receiveDate: string;
    receiveBy: string;
    totalExpectQuantity: number;
    totalReceiveQuantity: number;
}



const StatisticalStockEntryAPI = async (from: string, to: string, navigate: NavigateFunction): Promise<StatisticalStockEntryResponse[] | undefined> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');

        if (!token) {
            navigate("/login");
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            navigate("/session-expired");
        } else {
            const response = await axios.get(`${HOST}/receive-check/date/not-pagination?startDate=${from}&endDate=${to}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('profile');
                navigate("/session-expired");
            }
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default StatisticalStockEntryAPI;