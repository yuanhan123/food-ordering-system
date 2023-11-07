"use client"
import { axiosAuth } from "@/lib/axios";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRefreshToken } from "./useRefreshToken";

const useAxiosAuth = () => {
    const {data: session} = useSession();
    const refreshToken = useRefreshToken();
    const prevSessionRef = useRef(session);
    const prevRefreshTokenRef = useRef(refreshToken);


    useEffect(() => {
        const fetchData = async () => {
            try {

                if (!session || !session.user) {
                    // Handle the case where session data or user data is missing
                    return;
                }

                const requestIntercept = axiosAuth.interceptors.request.use((config) => {
                    if (!config.headers["Authorization"]){
                        config.headers["Authorization"] = `${session?.user.accessToken}`;
                    }
                    return config;
                },
                    (error) => {
                        Promise.reject(error)
                    }
                );
        
                const responseIntercept = axiosAuth.interceptors.response.use(
                    (response) => {
                        return response;
                    },
                    async (error) =>{
                        const prevRequest = error?.config;
                        if( error?.response?.status === 401 && !prevRequest?.sent){
                            prevRequest.sent = true;
                            //console.log("accessToken",session?.user.accessToken)
                            await refreshToken();
                            
                            const sessionData = await getSession();
                            if(sessionData){
                                prevRequest.headers["Authorization"] = `${sessionData.user.accessToken}`;
                                return axiosAuth(prevRequest);
                            }
                        }
                        return Promise.reject(error)
                    }
                );

                prevSessionRef.current = session;
                prevRefreshTokenRef.current = refreshToken;              
        
                return () => {
                    axiosAuth.interceptors.request.eject(requestIntercept);
                    axiosAuth.interceptors.request.eject(responseIntercept);
                };

            }catch (error){
                console.log(error)
            }
        }

        fetchData();

        return () => {

        };
    }, [refreshToken]);

    return axiosAuth;
}

export default useAxiosAuth;