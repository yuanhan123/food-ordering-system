import jwt from "jsonwebtoken";

const DEFAULT_ACCESS_TOKEN_OPTION = {
    expiresIn: "15m",
}

const DEFAULT_REFRESH_TOKEN_OPTION = {
    expiresIn: "48h",
}

export function signJwtAcessToken(payload, options = DEFAULT_ACCESS_TOKEN_OPTION){
    const secret_key = process.env.SECRET_KEY;
    const token = jwt.sign(payload, secret_key, options);
    return token;
}

export function signJwtRefreshToken(payload, options = DEFAULT_REFRESH_TOKEN_OPTION){
    const secret_key = process.env.REFRESH_SECRET_KEY;
    const token = jwt.sign(payload, secret_key, options);
    return token;
}

export function verifyJwt(token){
    try{
        const secret_key = process.env.SECRET_KEY;
        const decoded = jwt.verify(token, secret_key);
        return decoded;
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

export function verifyJwtRefreshToken(token){
    try{
        const secret_key = process.env.REFRESH_SECRET_KEY;
        const decoded = jwt.verify(token, secret_key);
        return decoded;
    } catch (error) {
        console.log(error);
        return null;
    }
}