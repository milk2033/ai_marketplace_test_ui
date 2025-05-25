import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import CognifyToken from '../contracts/CognifyToken.json';

const StakePage = () => {
    const [balance, setBalance] = useState('0');
    const [account, setAccount] = useState('');
    const [stakeAmount, setStakeAmount] = useState('');

    useEffect(() => {
        // Check if MetaMask is installed
        if (window.ethereum) {
            // Check if already connected
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                        fetchBalance(accounts[0]);
                    }
                })
                .catch(console.error);

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    fetchBalance(accounts[0]);
                } else {
                    setAccount('');
                    setBalance('0');
                }
            });
        }
    }, []);

    const fetchBalance = async (address) => {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });

            const chainId = "0x14A34"; // 84532 in hex
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId }],
                });
            } catch (swError) {
                // 4902 means it's not added yet, so add it
                if (swError.code === 4902) {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                            chainId,
                            chainName: "Base Sepolia",
                            rpcUrls: [
                                "https://sepolia.base.org",
                                "https://base-sepolia-rpc.publicnode.com"
                            ],
                            nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
                            blockExplorerUrls: ["https://sepolia-explorer.base.org"]
                        }],
                    });
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId }],
                    });
                } else {
                    throw swError;
                }
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(
                CognifyToken.address,
                CognifyToken.abi,
                provider
            );
            const balance = await contract.balanceOf(address);
            setBalance(ethers.formatUnits(balance, 18));
        } catch (error) {
            console.error('Error fetching balance:', error);
            setBalance('0');
        }
    };

    const handleMaxClick = () => {
        setStakeAmount(balance);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        // Only allow numbers and decimal point
        if (/^\d*\.?\d*$/.test(value)) {
            setStakeAmount(value);
        }
    };

    return (
        <div className="container-custom py-8 w-1/2 mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Stake CGFY</h1>
                <div className="bg-noir-card rounded-lg px-4 py-2">
                    <span className="text-noir-muted text-sm">Balance: </span>
                    <span className="font-bold">{balance} CGFY</span>
                </div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-noir-card rounded-lg p-6"
            >
                <div className="space-y-4">
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-noir-muted text-sm">Amount to Stake</label>
                            <button
                                onClick={handleMaxClick}
                                className="text-noir-primary hover:text-noir-secondary text-sm transition-colors duration-200"
                            >
                                MAX
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={stakeAmount}
                                onChange={handleInputChange}
                                placeholder="0.0"
                                className="w-full bg-noir-bg border border-noir-accent rounded-lg px-4 py-3 text-noir-text focus:outline-none focus:border-noir-primary"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-noir-muted">
                                CGFY
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-4 btn-primary py-3 rounded-lg font-bold hover:shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300"
                        >
                            Stake
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-noir-card rounded-lg p-6 mt-6"
            >
                <h2 className="text-xl font-bold mb-6">Staking Stats</h2>
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-noir-bg rounded-lg p-4 border border-noir-accent">
                        <div className="text-noir-muted text-sm mb-1">CGFY APR</div>
                        <div className="text-2xl font-bold text-noir-primary">12.5%</div>
                    </div>
                    <div className="bg-noir-bg rounded-lg p-4 border border-noir-accent">
                        <div className="text-noir-muted text-sm mb-1">Fee APR</div>
                        <div className="text-2xl font-bold text-noir-primary">2.5%</div>
                    </div>
                    <div className="bg-noir-bg rounded-lg p-4 border border-noir-accent">
                        <div className="text-noir-muted text-sm mb-1">Total APR</div>
                        <div className="text-2xl font-bold text-gradient">15.0%</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StakePage; 