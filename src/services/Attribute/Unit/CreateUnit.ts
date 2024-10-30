import axios from "axios";
import { checkTokenExpired } from "../../../util/DecodeJWT";
import { ResponseError } from "../../../interface/ResponseError";

interface interfaceData {
    productId: string,
    unitFromName: string,
    toUnitId: string,
    conversionFactor: number,
}

const CreateUnit = async (data: interfaceData): Promise<void> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = "/login";
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            window.location.href = "/session-expired";
        } else {
            await axios.post(`${HOST}/unit/conversion`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('profile');
                window.location.href = "/session-expired";
            }
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default CreateUnit;