import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import CognifyToken from '../contracts/CognifyToken.json';
import StakingRewards from '../contracts/StakingRewards.json';
import { toast } from 'react-toastify';

const StakePage = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState('0');
    const [account, setAccount] = useState('');
    const [stakeAmount, setStakeAmount] = useState('');
    const [isStaking, setIsStaking] = useState(false);

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

    const handleStake = async () => {
        if (!window.ethereum) {
            toast.error('Please install MetaMask to use this feature');
            return;
        }

        if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
            toast.error('Please enter a valid amount to stake');
            return;
        }

        try {
            setIsStaking(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // First approve the staking contract to spend tokens
            const tokenContract = new ethers.Contract(
                CognifyToken.address,
                CognifyToken.abi,
                signer
            );

            const amountToStake = ethers.parseUnits(stakeAmount, 18);

            // Check allowance first
            const allowance = await tokenContract.allowance(account, StakingRewards.address);
            if (allowance < amountToStake) {
                const approveTx = await tokenContract.approve(StakingRewards.address, amountToStake);
                await approveTx.wait();
                toast.success('Approval successful!');
            }

            // Now stake the tokens
            const stakingContract = new ethers.Contract(
                StakingRewards.address,
                StakingRewards.abi,
                signer
            );

            const stakeTx = await stakingContract.stake(amountToStake);
            await stakeTx.wait();

            toast.success('Staking successful!');
            setStakeAmount('');
            // Refresh balance
            fetchBalance(account);
        } catch (error) {
            console.error('Error staking:', error);
            toast.error('Failed to stake tokens');
        } finally {
            setIsStaking(false);
        }
    };

    return (
        <div className="container-custom py-8 w-1/2 mx-auto">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-noir-primary hover:text-white text-sm font-semibold transition-colors duration-200"
                >
                    Back
                </button>
            </div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Stake CGFY</h1>
                <div className="bg-noir-card rounded-lg px-4 py-2">
                    <span className="text-noir-muted text-sm">Balance: </span>
                    <span className="font-bold">{Number(balance).toFixed(3)} CGFY</span>
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
                                className="text-noir-primary hover:text-white text-sm transition-colors duration-200"
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
                            onClick={handleStake}
                            disabled={isStaking}
                            className={`w-full mt-4 btn-primary py-3 rounded-lg font-bold shadow-none hover:shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300 ${isStaking ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isStaking ? 'Staking...' : 'Stake'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StakePage; 