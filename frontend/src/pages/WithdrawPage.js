import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import StakingRewards from '../contracts/StakingRewards.json';
import { toast } from 'react-toastify';

const WithdrawPage = () => {
    const navigate = useNavigate();
    const [account, setAccount] = useState('');
    const [stakedBalance, setStakedBalance] = useState('0');
    const [pendingTokenRewards, setPendingTokenRewards] = useState('0');
    const [pendingEthRewards, setPendingEthRewards] = useState('0');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        if (!window.ethereum) return;
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    fetchBalances(accounts[0]);
                }
            })
            .catch(console.error);

        window.ethereum.on('accountsChanged', accounts => {
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                fetchBalances(accounts[0]);
            } else {
                setAccount('');
                setStakedBalance('0');
                setPendingTokenRewards('0');
                setPendingEthRewards('0');
            }
        });
    }, []);

    const fetchBalances = async (address) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const stakingContract = new ethers.Contract(
                StakingRewards.address,
                StakingRewards.abi,
                provider
            );

            // Fetch staked CGFY
            const info = await stakingContract.userInfo(address);
            const staked = info.amount;
            setStakedBalance(ethers.formatUnits(staked, 18));

            // Fetch pending CGFY drip rewards
            const pendingToken = await stakingContract.pendingReward(address);
            setPendingTokenRewards(ethers.formatUnits(pendingToken, 18));

            // Fetch pending ETH rev-share rewards
            const pendingEth = await stakingContract.pendingRevShare(address);
            setPendingEthRewards(ethers.formatEther(pendingEth));

        } catch (error) {
            console.error('Error fetching balances/rewards:', error);
            setStakedBalance('0');
            setPendingTokenRewards('0');
            setPendingEthRewards('0');
        }
    };

    const handleMaxClick = () => {
        setWithdrawAmount(stakedBalance);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setWithdrawAmount(value);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
            toast.error('Please enter a valid amount to withdraw');
            return;
        }
        setIsWithdrawing(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = await provider.getSigner();

            const stakingContract = new ethers.Contract(
                StakingRewards.address,
                StakingRewards.abi,
                signer
            );

            const amountToWithdraw = ethers.parseUnits(withdrawAmount, 18);
            const tx = await stakingContract.withdraw(amountToWithdraw);
            await tx.wait();

            toast.success('Withdrawal successful!');
            setWithdrawAmount('');
            fetchBalances(account);
        } catch (error) {
            console.error('Error withdrawing:', error);
            toast.error('Failed to withdraw tokens');
        } finally {
            setIsWithdrawing(false);
        }
    };

    const handleClaim = async () => {
        if (!window.ethereum) {
            toast.error('Please install MetaMask to use this feature');
            return;
        }
        setIsClaiming(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = await provider.getSigner();

            const stakingContract = new ethers.Contract(
                StakingRewards.address,
                StakingRewards.abi,
                signer
            );

            const tx = await stakingContract.claimRewards();
            await tx.wait();

            toast.success('Rewards claimed!');
            fetchBalances(account);
        } catch (error) {
            console.error('Error claiming rewards:', error);
            toast.error('Failed to claim rewards');
        } finally {
            setIsClaiming(false);
        }
    };

    const truncateDecimals = (value, decimals) => {
        const [integer, fraction = ''] = value.split('.');
        // pad with zeros so we always have at least `decimals` digits
        const padded = fraction.padEnd(decimals, '0');
        return `${integer}.${padded.slice(0, decimals)}`;
    };

    return (
        <div className="container-custom py-8 w-1/2 mx-auto">
            <div className="flex justify-end mb-4 gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-noir-primary hover:text-white text-sm font-semibold transition-colors duration-200"
                >
                    Back
                </button>
                <button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="text-noir-primary hover:text-white text-sm font-semibold transition-colors duration-200 disabled:opacity-50"
                >
                    {isClaiming ? 'Claiming…' : 'Claim'}
                </button>
            </div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Withdraw CGFY</h1>
                <div className="bg-noir-card rounded-lg px-4 py-2 space-y-1">
                    <div>
                        <span className="text-noir-muted text-sm">Staked: </span>
                        <span className="font-bold">{stakedBalance} CGFY</span>
                    </div>
                    <div>
                        <span className="text-noir-muted text-sm">Claimable CGFY: </span>
                        <span className="font-bold">
                            {truncateDecimals(pendingTokenRewards, 3)} CGFY
                        </span>
                    </div>
                    <div>
                        <span className="text-noir-muted text-sm">Claimable ETH: </span>
                        <span className="font-bold">{pendingEthRewards} ETH</span>
                    </div>
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
                            <label className="text-noir-muted text-sm">Amount to Withdraw</label>
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
                                value={withdrawAmount}
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
                            onClick={handleWithdraw}
                            disabled={isWithdrawing}
                            className={`w-full mt-4 btn-primary py-3 rounded-lg font-bold shadow-none hover:shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300 ${isWithdrawing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default WithdrawPage;
