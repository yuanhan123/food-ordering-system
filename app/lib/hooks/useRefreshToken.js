"use client"

import { useSession } from "next-auth/react";
import axios from "../axios";

export const useRefreshToken = () => {
    const { data:session, update } = useSession();

    const refreshToken = async () => {

        const res = await axios.post("/api/auth/refreshToken",{
            refresh: session?.user.refreshToken
        });

        if(session){
            const newAccessToken = res.data.accessToken
            await update({
                ...session,
                user: {
                    ...session?.user,
                    accessToken: `${newAccessToken}`
                }
            })
        }
    };

    return refreshToken;
}