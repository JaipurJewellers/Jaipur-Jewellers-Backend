import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

let auth_phonepe = process.env.AUTH_PHONEPE;
let client_secret = process.env.CLIENT_SECRET;
let client_id = process.env.CLIENT_ID;
let PHONEPAY_API = process.env.PHONEPAY_API;

export async function processPayment(input, FRONTEND_URL) {
    const formData = new URLSearchParams();
    formData.append("client_id", client_id);
    formData.append("client_version", "1");
    formData.append("client_secret", client_secret);
    formData.append("grant_type", "client_credentials");

    const options = {
        method: "POST",
        url: auth_phonepe,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: formData.toString(),
    };

    const response = await axios.request(options);
    const token = response.data.access_token;
    const options2 = {
        method: "POST",
        url: PHONEPAY_API,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `O-Bearer ${token}`,
        },
        data: {
            merchantOrderId: input.transactionId,
            amount: Math.round(input.totalPrice * 100),
            expireAfter: 1200,
            metaInfo: {
                "udf1": "additional-information-1",
                "udf2": "additional-information-2",
                "udf3": "additional-information-3",
                "udf4": "additional-information-4",
                "udf5": "additional-information-5"
            },
            paymentFlow: {
                type: "PG_CHECKOUT",
                message: "Payment message used for collect requests",
                merchantUrls: {
                    "redirectUrl": `${FRONTEND_URL}${input.transactionId}`,
                },
                paymentModeConfig: {
                    enabledPaymentModes: [
                        {
                            type: "UPI_INTENT"
                        },
                        {
                            type: "UPI_COLLECT"
                        },
                        {
                            type: "UPI_QR"
                        },
                        {
                            type: "NET_BANKING"
                        },
                        {
                            type: "CARD",
                            cardTypes: [
                                "DEBIT_CARD",
                                "CREDIT_CARD"
                            ]
                        }
                    ],
                }
            }
        }
    };
    const response2 = await axios.request(options2);
    return response2.data // Send payment response to the frontend-
}

export async function verifyPayments(transactionId) {
    try {

        const formData = new URLSearchParams();
        formData.append("client_id", client_id);
        formData.append("client_version", "1");
        formData.append("client_secret", client_secret);
        formData.append("grant_type", "client_credentials");

        const options = {
            method: "POST",
            url: auth_phonepe,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: formData.toString(),
        };

        const response = await axios.request(options);
        const token = response.data.access_token;

        const options2 = {
            method: "Get",
            // url: `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${transactionId}/status`, // this is for local testing
            url: `https://api.phonepe.com/apis/pg/checkout/v2/order/${transactionId}/status`, // this is for production
            headers: {
                "Content-Type": "application/json",
                "Authorization": `O-Bearer ${token}`,
            },
        };

        const response2 = await axios.request(options2);

        return response2
    } catch (error) {
        console.log(error);
        throw error;
    }
}