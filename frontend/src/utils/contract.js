import config from '../config/contract-config.json';

export const CONTRACT_ADDRESS = config.address;
export const CONTRACT_ABI = config.abi;


// export const CONTRACT_ADDRESS = "0x5D14fb515e2c6223B13CD1641a90D2c9B7E2dE9d"; // replace with actual deployed address


// export const CONTRACT_ABI = [
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "uint256",
//                 "name": "id",
//                 "type": "uint256"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "buyer",
//                 "type": "address" 
//             }
//         ],
//         "name": "ModelPurchased",
//         "type": "event"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "uint256",
//                 "name": "id",
//                 "type": "uint256"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "string",
//                 "name": "name",
//                 "type": "string"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "creator",
//                 "type": "address"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "uint256",
//                 "name": "price",
//                 "type": "uint256"
//             }
//         ],
//         "name": "ModelUploaded",
//         "type": "event"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "_id",
//                 "type": "uint256"
//             }
//         ],
//         "name": "buyModel",
//         "outputs": [],
//         "stateMutability": "payable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "_id",
//                 "type": "uint256"
//             }
//         ],
//         "name": "getModel",
//         "outputs": [
//             {
//                 "components": [
//                     {
//                         "internalType": "uint256",
//                         "name": "id",
//                         "type": "uint256"
//                     },
//                     {
//                         "internalType": "string",
//                         "name": "name",
//                         "type": "string"
//                     },
//                     {
//                         "internalType": "string",
//                         "name": "downloadUrl",
//                         "type": "string"
//                     },
//                     {
//                         "internalType": "address payable",
//                         "name": "creator",
//                         "type": "address"
//                     },
//                     {
//                         "internalType": "uint256",
//                         "name": "price",
//                         "type": "uint256"
//                     },
//                     {
//                         "internalType": "uint256",
//                         "name": "purchases",
//                         "type": "uint256"
//                     }
//                 ],
//                 "internalType": "struct LoraMarketplace.Model",
//                 "name": "",
//                 "type": "tuple"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "modelCount",
//         "outputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "",
//                 "type": "uint256"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "",
//                 "type": "uint256"
//             }
//         ],
//         "name": "models",
//         "outputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "id",
//                 "type": "uint256"
//             },
//             {
//                 "internalType": "string",
//                 "name": "name",
//                 "type": "string"
//             },
//             {
//                 "internalType": "string",
//                 "name": "downloadUrl",
//                 "type": "string"
//             },
//             {
//                 "internalType": "address payable",
//                 "name": "creator",
//                 "type": "address"
//             },
//             {
//                 "internalType": "uint256",
//                 "name": "price",
//                 "type": "uint256"
//             },
//             {
//                 "internalType": "uint256",
//                 "name": "purchases",
//                 "type": "uint256"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "string",
//                 "name": "_name",
//                 "type": "string"
//             },
//             {
//                 "internalType": "string",
//                 "name": "_downloadUrl",
//                 "type": "string"
//             },
//             {
//                 "internalType": "uint256",
//                 "name": "_price",
//                 "type": "uint256"
//             }
//         ],
//         "name": "uploadModel",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     }
// ]