import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const ConnectWalletButton = () => {
    const [account, setAccount] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        // Check if MetaMask is installed
        if (window.ethereum) {
            // Check if already connected
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                    }
                })
                .catch(console.error);

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount('');
                }
            });
        }
    }, []);

    const connectWallet = async () => {
        if (!window.ethereum) {
            toast.error('Please install MetaMask to use this feature');
            return;
        }

        try {
            setIsConnecting(true);
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            setAccount(accounts[0]);
            toast.success('Wallet connected successfully!');
        } catch (error) {
            console.error('Error connecting wallet:', error);
            toast.error('Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAccount('');
        toast.info('Wallet disconnected');
    };

    if (!window.ethereum) {
        return (
            <motion.a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="btn-secondary text-xs py-1 px-2"
            >
                Install MetaMask
            </motion.a>
        );
    }

    if (account) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-1"
            >
                <span className="text-noir-muted text-xs">
                    {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </span>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={disconnectWallet}
                    className="btn-secondary text-xs py-1 px-2"
                >
                    Disconnect
                </motion.button>
            </motion.div>
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={connectWallet}
            disabled={isConnecting}
            className={`btn-primary shadow-none hover:shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300 text-sm py-1.5 px-3 ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {isConnecting ? 'Connecting...' : account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </motion.button>
    );
};

export default ConnectWalletButton;