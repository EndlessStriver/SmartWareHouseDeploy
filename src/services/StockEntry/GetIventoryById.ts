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

interface InventoryDetail {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    quantity: number;
    isIncrease: boolean;
    location: Location;
    products: Product;
}

interface Shelf {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    maxColumns: number;
    maxLevels: number;
    currentCapacity: string;
    maxCapacity: string;
    maxWeight: string;
    currentColumnsUsed: number;
    totalColumns: number;
    currentWeight: string;
    typeShelf: string;
}

interface Inventory {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    inventoryDetail: InventoryDetail[];
    shelves?: Shelf;
}

export interface Transaction {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    transactionType: string;
    note: string;
    transactionDate: string;
    quantity: number;
    inventory: Inventory[];
}


const GetIventoryById = async (iventoryId: string, navigate: NavigateFunction): Promise<Transaction | undefined> => {
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
            const response = await axios.get(`${HOST}/whtransaction/transaction-inventory-check/${iventoryId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data;
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

export default GetIventoryById;