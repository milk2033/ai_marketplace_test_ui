// frontend/src/utils/chain.js

const API_BASE = "http://localhost:5000/api";

// —————————————————————————————————————————————————————————————
// 1) Backend‐signed implementation (for testing)
// —————————————————————————————————————————————————————————————
export const chainApi = {
    /**
     * @param {File} file        – the .safetensors File object
     * @param {string} name      – model name
     * @param {string} price     – price in wei (string or number)
     */
    uploadModel: async (file, name, price) => {
        const form = new FormData();
        form.append("modelFile", file);
        form.append("name", name);
        form.append("price", price);

        const res = await fetch(`${API_BASE}/models/upload`, {
            method: "POST",
            body: form
        });
        console.log('fetched res')
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Upload failed");
        }

        return res.json(); // { txHash }
    },

    buyModel: async (id) => {
        const res = await fetch(`${API_BASE}/models/${id}/buy`, {
            method: "POST"
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Purchase failed");
        }
        return res.json(); // { txHash }
    },

    getModels: async () => {
        const res = await fetch(`${API_BASE}/models`);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to fetch models");
        }
        return res.json(); // { models: [ { id, name, downloadUrl, price, owner } ] }
    },
};

// // —————————————————————————————————————————————————————————————
// // 2) MetaMask/Ethers.js implementation (for later swap-in)
// // —————————————————————————————————————————————————————————————
// let contract; // cached ethers.Contract

// async function initContract() {
//     if (!contract) {
//         if (typeof window.ethereum === "undefined") {
//             throw new Error("No injected wallet found");
//         }
//         // ask user to connect
//         await window.ethereum.request({ method: "eth_requestAccounts" });
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const signer = provider.getSigner();
//         contract = new ethers.Contract(
//             CONTRACT_ADDRESS,
//             CONTRACT_ABI,
//             signer
//         );
//     }
//     return contract;
// }

// export const chainMetaMask = {
//     uploadModel: async (name, downloadUrl, price) => {
//         const c = await initContract();
//         const tx = await c.uploadModel(name, downloadUrl, price);
//         const receipt = await tx.wait(1);
//         return { txHash: receipt.transactionHash };
//     },

//     buyModel: async (id, price) => {
//         const c = await initContract();
//         const tx = await c.buyModel(id, { value: price });
//         const receipt = await tx.wait(1);
//         return { txHash: receipt.transactionHash };
//     }
// };

// how to use
// in components, import whichever you need:

// import { chainApi, chainMetaMask } from "../utils/chain";

// // for now (backend-signed)
// await chainApi.uploadModel(name, url, price);

// // later (MetaMask-signed)
// await chainMetaMask.uploadModel(name, url, price);