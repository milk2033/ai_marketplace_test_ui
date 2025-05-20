
import { JsonRpcProvider } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';

//will need this later when incorporating metamask
export async function connectWallet() {
    if (!window.ethereum) throw new Error("No wallet found");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    return accounts[0];
}

//all of these contracts will need to be rewritten when incorporating metamask
export async function uploadModel(name, url, priceInEth) {

}

// const provider = new JsonRpcProvider("https://base-sepolia.gateway-url"); // or use MetaMask's injected provider if applicable

// export const getContract = () => {
//     return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
// };

// export async function uploadModel(name, url, priceInEth) {
//   const contract = getContract();
//   const price = ethers.utils.parseEther(priceInEth);
//   const tx = await contract.uploadModel(name, url, price);
//   await tx.wait();
// }

// export async function buyModel(id, priceInEth) {
//   const contract = getContract();
//   const value = ethers.utils.parseEther(priceInEth);
//   const tx = await contract.buyModel(id, { value });
//   await tx.wait();
// }

// export async function fetchModel(id) {
//   const contract = getContract();
//   return await contract.getModel(id);
// }
