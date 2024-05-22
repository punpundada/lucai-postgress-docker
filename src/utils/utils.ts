import { sha256 } from "oslo/crypto"
import { encodeHex } from "oslo/encoding"

export const hashOptions = {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
}

export const getHashedToken= async (tokenId:string)=>encodeHex(await sha256(new TextEncoder().encode(tokenId)))