import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import ConnectWalletButton from './ConnectWalletButton';
import CognifyToken from '../contracts/CognifyToken.json';

const Navbar = () => {
    const [balance, setBalance] = useState('0');
    const [account, setAccount] = useState('');

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
                                "https://sepolia.base.org",                         // public Base Sepolia RPC
                                "https://base-sepolia-rpc.publicnode.com"            // publicnode fallback
                            ],
                            nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
                            blockExplorerUrls: ["https://sepolia-explorer.base.org"]
                        }],
                    });
                    // then switch again
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
            setBalance(ethers.formatUnits(balance, 18)); // Assuming 18 decimals
        } catch (error) {
            console.error('Error fetching balance:', error);
            setBalance('0');
        }
    };

    return (
        <nav className="bg-noir-card border-b border-noir-accent">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="text-gradient text-lg font-bold"
                        >
                            AI Marketplace
                        </motion.div>
                    </Link>

                    <div className="flex space-x-4">
                        <NavLink to="/marketplace">Marketplace</NavLink>
                        <NavLink to="/upload">Upload Model</NavLink>
                        <NavLink to="/dashboard">CGFY</NavLink>
                    </div>
                    {/* maybe move the CGFY token balance somewhere else, looks bad here imo */}
                    <div className="flex flex-col items-end">
                        {/* <p className="text-[0.7em]">CGFY Token Balance: {balance}</p> */}
                        <ConnectWalletButton />
                    </div>

                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, children }) => (
    <Link to={to}>
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="nav-link text-sm"
        >
            {children}
        </motion.div>
    </Link>
);

export default Navbar;
