// src/utils/ipfs.js

/**
 * Uploads a browser File to IPFS via Pinata.
 * Returns the CID (IpfsHash).
 */
const uploadToIpfs = async (file) => {
    // Pinata requires a multipart / form - data POST
    const form = new FormData()
    form.append("file", file, file.name)
    const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
            method: "POST",
            headers: {
                // Use the JWT from your .env (exposed in frontend)
                Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
            },
            body: form,
        }
    )

    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Pinata error: ${res.status} ${text}`)
    }

    const { IpfsHash } = await res.json()
    return IpfsHash
}

export default uploadToIpfs;
