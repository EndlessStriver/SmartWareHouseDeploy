import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";
import { Account } from "../../interface/Account";
import Order from "../../enum/Order";

enum OrderBy {
    Username = "username",
    FullName = "fullName",
    Email = "email",
    RoleName = "roleName",
    Status = "status",
    PhoneNumber = "phoneNumber",
}

interface ResponseGetAccounts {
    data: Account[];
    totalPage: number;
    limit: number;
    offset: number;
    totalElementOfPage: number;
}

interface GetAccountsAPIProps {
    limit?: number;
    offset?: number;
    order?: Order;
    orderBy?: OrderBy;
}

const GetAccountsAPI = async (input?: GetAccountsAPIProps): Promise<ResponseGetAccounts> => {

    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error("Token not found.");
        }

        const response = await axios.get(`${HOST}/account/ad?limit=${input?.limit || 10}&offset=${input?.offset || 1}&order=${input?.order || Order.ASC}&orderBy=${input?.orderBy || OrderBy.FullName}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.data;

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default GetAccountsAPI;