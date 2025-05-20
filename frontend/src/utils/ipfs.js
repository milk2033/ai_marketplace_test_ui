// frontend/src/utils/ipfs.js
import { Web3Storage } from 'web3.storage';

const TOKEN = process.env.REACT_APP_WEB3STORAGE_TOKEN;

if (!TOKEN) {
    throw new Error('Missing REACT_APP_WEB3STORAGE_TOKEN in .env');
}

const client = new Web3Storage({ token: TOKEN });

/**
 * Uploads a File or Blob to Web3.Storage (IPFS) and returns an object
 * { cid, url } where url is a gateway URL you can serve to users.
 */
export async function uploadToIPFS(file) {
    // web3.storage will preserve the filename, so gateway URL = /ipfs/CID/filename
    const cid = await client.put([file]);
    const url = `https://ipfs.io/ipfs/${cid}/${encodeURIComponent(file.name)}`;
    return { cid, url };
}
