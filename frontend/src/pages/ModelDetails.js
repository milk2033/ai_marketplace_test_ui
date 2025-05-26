// src/components/ModelDetails.jsx
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { ethers } from 'ethers'
import LoraMarketplaceJSON from '../contracts/LoraMarketplace.json'

const MARKETPLACE_ADDRESS = LoraMarketplaceJSON.address

export default function ModelDetails() {
    const { id } = useParams()
    const [model, setModel] = useState(null)
    const [loading, setLoading] = useState(true)
    const [buying, setBuying] = useState(false)

    useEffect(() => {
        fetchModelDetails()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    async function fetchModelDetails() {
        setLoading(true)
        try {
            if (!window.ethereum) {
                toast.error('Please install MetaMask')
                return
            }

            const provider = new ethers.BrowserProvider(window.ethereum)
            // no need to request accounts for a read
            const contract = new ethers.Contract(
                MARKETPLACE_ADDRESS,
                LoraMarketplaceJSON.abi,
                provider
            )

            // getModel expects a uint256; ethers accepts a number or bigint
            const onChain = await contract.getModel(Number(id))

            setModel({
                id: Number(onChain.id),
                name: onChain.name,
                downloadUrl: onChain.downloadUrl,
                creator: onChain.creator,
                price: onChain.price,               // bigint (wei)
                purchases: Number(onChain.purchases)
            })
        } catch (err) {
            console.error(err)
            toast.error('Failed to fetch model details')
            setModel(null)
        } finally {
            setLoading(false)
        }
    }

    async function handleBuy() {
        if (!model) return

        setBuying(true)
        try {
            if (!window.ethereum) {
                toast.error('Please install MetaMask')
                return
            }

            const provider = new ethers.BrowserProvider(window.ethereum)
            await provider.send('eth_requestAccounts', [])
            const signer = await provider.getSigner()

            const contract = new ethers.Contract(
                MARKETPLACE_ADDRESS,
                LoraMarketplaceJSON.abi,
                signer
            )

            const tx = await contract.buyModel(model.id, {
                value: model.price
            })
            await tx.wait()

            toast.success('Purchase successful!')
            // refresh to update purchase count
            fetchModelDetails()
        } catch (err) {
            console.error(err)
            toast.error('Failed to purchase model')
        } finally {
            setBuying(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!model) {
        return (
            <div className="container-custom">
                <h1 className="text-4xl font-bold mb-8 text-gradient">
                    Model Not Found
                </h1>
                <p className="text-noir-muted">
                    The model you're looking for doesn't exist or has been removed.
                </p>
            </div>
        )
    }

    return (
        <div className="container-custom max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-gradient mb-4">
                            {model.name}
                        </h1>

                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-noir-primary mb-2">
                                    Creator
                                </h2>
                                <p className="text-noir-muted">{model.creator}</p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-noir-primary mb-2">
                                    Price
                                </h2>
                                <p className="text-2xl font-bold text-noir-primary">
                                    {ethers.formatEther(model.price)} ETH
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-noir-primary mb-2">
                                    Purchase Count
                                </h2>
                                <p className="text-noir-muted">
                                    {model.purchases} {model.purchases === 1 ? 'purchase' : 'purchases'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-64">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBuy}
                            disabled={buying}
                            className="btn-primary w-full hover:shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300"
                        >
                            {buying ? 'Purchasing…' : 'Buy Now'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
