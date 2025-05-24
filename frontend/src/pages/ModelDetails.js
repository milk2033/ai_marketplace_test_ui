import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

const ModelDetails = () => {
    const { id } = useParams();
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModelDetails();
    }, [id]);

    const fetchModelDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/models`);
            const modelData = response.data.models.find(m => m.id === parseInt(id));
            if (modelData) {
                setModel(modelData);
            } else {
                setModel(null);
            }
        } catch (error) {
            toast.error('Failed to fetch model details');
            console.error('Error fetching model details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/api/models/${id}/buy`);
            toast.success('Purchase successful!');
            fetchModelDetails(); // Refresh model details to update purchase count
        } catch (error) {
            toast.error('Failed to purchase model');
            console.error('Error purchasing model:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="container-custom">
                <h1 className="text-4xl font-bold mb-8 text-gradient">Model Not Found</h1>
                <p className="text-noir-muted">The model you're looking for doesn't exist or has been removed.</p>
            </div>
        );
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
                        <h1 className="text-4xl font-bold text-gradient mb-4">{model.name}</h1>

                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-noir-primary mb-2">Creator</h2>
                                <p className="text-noir-muted">{model.creator}</p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-noir-primary mb-2">Price</h2>
                                <p className="text-2xl font-bold text-noir-primary">
                                    {ethers.formatEther(model.price)} ETH
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-noir-primary mb-2">Purchase Count</h2>
                                <p className="text-noir-muted">{model.purchases} purchases</p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-noir-primary mb-2">Download</h2>
                                <a
                                    href={model.downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-noir-primary hover:text-noir-secondary transition-colors duration-200"
                                >
                                    Download Model
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-64">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBuy}
                            className="btn-primary w-full hover:shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300"
                        >
                            Buy Now
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ModelDetails; 