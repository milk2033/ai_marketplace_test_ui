// src/components/ModelUploader.jsx
import React, { useState } from "react"
import { ethers } from "ethers"
import { motion } from 'framer-motion'
import uploadToIpfs from "../utils/ipfs"
import LoraMarketplaceAbi from "../contracts/LoraMarketplace.json"

const Cloudflare = () => {
    const [file, setFile] = useState(null)
    const [name, setName] = useState("")
    const [priceEth, setPrice] = useState("0")
    const [cid, setCid] = useState(null)
    const [txHash, setTxHash] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleUpload = async () => {

        if (!file || !name || !priceEth) {
            setError("Name, file and price are required")
            return
        }

        setLoading(true)
        setError(null)

        try {
            // 1) pin to IPFS via Pinata
            const newCid = await uploadToIpfs(file)
            setCid(newCid)
            const url = `ipfs://${newCid}`

            // 2) connect to MetaMask
            const provider = new ethers.BrowserProvider(window.ethereum)
            await provider.send("eth_requestAccounts", [])
            const signer = await provider.getSigner()

            // 3) call uploadModel(name, url, price)
            const contract = new ethers.Contract(
                LoraMarketplaceAbi.address,
                LoraMarketplaceAbi.abi,
                signer
            )
            const priceWei = ethers.parseEther(priceEth)
            const tx = await contract.uploadModel(name, url, priceWei)
            const receipt = await tx.wait()
            setTxHash(receipt.transactionHash)

        } catch (e) {
            setError(e.message || "Upload failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container-custom max-w-2xl">
            <h1 className="text-4xl font-bold mb-8 text-gradient">Upload AI Model</h1>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleUpload();
                }}
            >
                <div className="mb-6">
                    <label className="form-label">Model Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="form-input"
                        placeholder="Enter model name"
                    />
                </div>

                <div className="mb-6">
                    <label className="form-label">Price (ETH)</label>
                    <input
                        type="number"
                        value={priceEth}
                        onChange={e => setPrice(e.target.value)}
                        className="form-input"
                        placeholder="Enter price in ETH"
                        step="0.000000000000000001"
                        min="0"
                    />
                </div>

                <div className="mb-8">
                    <label className="form-label">Model File</label>
                    <div className="border-2 border-dashed border-noir-accent rounded-lg p-6 text-center">
                        <input
                            type="file"
                            onChange={e => setFile(e.target.files?.[0] ?? null)}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer text-noir-primary hover:text-white transition-colors duration-200"
                        >
                            {file ? file.name : 'Click to upload or drag and drop'}
                        </label>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-bold shadow-none hover:shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300 ${loading
                        ? 'bg-noir-muted cursor-not-allowed'
                        : 'btn-primary'
                        }`}
                >
                    {loading ? 'Uploading...' : 'Upload & List'}
                </motion.button>

                {cid && (
                    <div className="mt-4 p-4 bg-noir-muted rounded-lg">
                        <p className="text-sm">
                            IPFS CID: <code className="text-noir-accent">{cid}</code>
                        </p>
                    </div>
                )}
                {txHash && (
                    <div className="mt-4 p-4 bg-noir-muted rounded-lg">
                        <p className="text-sm">
                            Listed! Transaction:&nbsp;
                            <a
                                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-noir-accent hover:text-noir-secondary"
                            >
                                {txHash}
                            </a>
                        </p>
                    </div>
                )}
                {error && (
                    <div className="mt-4 p-4 bg-red-100 rounded-lg">
                        <p className="text-red-600">Error: {error}</p>
                    </div>
                )}
            </motion.form>
        </div>
    )
}

export default Cloudflare;
