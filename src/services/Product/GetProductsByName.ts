import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";
import { checkTokenExpired } from "../../util/DecodeJWT";

export interface Product {
    id: string;
    name: string;
    description: string;
    category: Category;
    productDetails: ProductDetail[];
    units: Unit[];
}

interface Category {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    categoryCode: string;
}

interface ProductDetail {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    quantity: number;
    images: Image[];
}

interface Image {
    url: string;
    publicId: string;
    isDeleted: boolean;
}

export interface Unit {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    isBaseUnit: boolean;
    unitConversionsFrom: UnitConversion[];
}

interface UnitConversion {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    conversionFactor: string;
}


const GetProductsByName = async (navigate: NavigateFunction, productName: string): Promise<Product[] | undefined> => {

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
            const response = await axios.get(`${HOST}/products/name?name=${productName || ""}`, {
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

export default GetProductsByName;