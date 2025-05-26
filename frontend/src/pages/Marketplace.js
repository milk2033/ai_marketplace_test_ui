// src/components/Marketplace.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { ethers } from 'ethers'
import LoraMarketplaceJSON from '../contracts/LoraMarketplace.json'
import StakingRewardsJSON from '../contracts/StakingRewards.json'
import { useNavigate } from 'react-router-dom'

const MARKETPLACE_ADDRESS = LoraMarketplaceJSON.address

export default function Marketplace() {
    const [models, setModels] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchModels()
    }, [])

    async function fetchModels() {
        setLoading(true);
        try {
            if (!window.ethereum) {
                toast.error('Please install MetaMask');
                return;
            }

            // 1) Connect to MetaMask's provider
            const provider = new ethers.BrowserProvider(window.ethereum);

            // 2) Instantiate the contract for read calls
            const contract = new ethers.Contract(
                MARKETPLACE_ADDRESS,
                LoraMarketplaceJSON.abi,
                provider
            );

            const staking = new ethers.Contract(
                StakingRewardsJSON.address,
                StakingRewardsJSON.abi,
                provider
            );

            const revReceived = await contract.revShareReceiver() //lora marketplace address

            // (Optional) If you import StakingRewardsJSON at the top, you could do:
            // const staking = new ethers.Contract(revReceiver, StakingRewardsJSON.abi, provider);
            // console.log("Staking.totalStaked:", await staking.totalStaked());

            // 3) Read modelCount and then pull each model
            const countBig = await contract.modelCount();      // bigint
            const count = Number(countBig);                // JS number


            const arr = [];
            for (let i = 1; i <= count; i++) {
                const m = await contract.getModel(i);
                arr.push({
                    id: Number(m.id),
                    name: m.name,
                    downloadUrl: m.downloadUrl,
                    creator: m.creator,
                    price: m.price,
                    purchases: Number(m.purchases),
                });
            }
            setModels(arr);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch models');
        } finally {
            setLoading(false);
        }
    }

    async function handleBuy(model) {
        try {
            if (!window.ethereum) {
                toast.error('Please install MetaMask')
                return
            }

            // 1) Get signer so we can send a tx
            const provider = new ethers.BrowserProvider(window.ethereum)
            await provider.send('eth_requestAccounts', [])  // pops up MetaMask if needed
            const signer = await provider.getSigner()

            // 2) Connect contract to signer
            const contract = new ethers.Contract(
                MARKETPLACE_ADDRESS,
                LoraMarketplaceJSON.abi,
                signer
            )

            // 3) Call buyModel(id) with exactly the model.price as value
            console.log('submitting tx')
            const tx = await contract.buyModel(model.id, { value: model.price })
            await tx.wait()
            console.log('tx submitted')
            toast.success('Purchase successful!')
            fetchModels()
        } catch (err) {
            console.error(err)
            toast.error('Failed to purchase model')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="container-custom">
            <h1 className="text-4xl font-bold mb-8 text-gradient">
                AI Models Marketplace
            </h1>

            <motion.div
                className="grid-auto-fit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {models.map((model) => (
                    <ModelCard key={model.id} model={model} onBuy={handleBuy} />
                ))}
            </motion.div>
        </div>
    )
}

function ModelCard({ model, onBuy }) {
    const navigate = useNavigate()

    const handleCardClick = (e) => {
        if (e.target.closest('.btn-primary')) return
        navigate(`/models/${model.id}`)
    }

    return (
        <motion.div
            whileHover={{ scale: 1.035 }}
            whileTap={{ scale: 0.95 }}
            className="card cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(147,51,234,0.25)] hover:border-purple-500/20"
            onClick={handleCardClick}
        >
            <h3 className="text-xl font-bold text-noir-primary mb-2">
                {model.name}
            </h3>
            <p className="text-noir-muted mb-4">
                Creator: {model.creator.slice(0, 6)}…{model.creator.slice(-4)}
            </p>
            <div className="flex justify-between items-center">
                <span className="text-noir-primary font-bold">
                    {ethers.formatEther(model.price)} ETH
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onBuy(model)
                    }}
                    className="btn-primary shadow-none hover:shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300"
                >
                    Buy Now
                </button>
            </div>
        </motion.div>
    )
}
