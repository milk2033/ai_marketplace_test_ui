import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const ModelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModelDetails();
    }, [id]);

    const fetchModelDetails = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/models');
            const modelData = response.data.models.find(m => m.id === parseInt(id));
            if (modelData) {
                setModel(modelData);
            } else {
                toast.error('Model not found');
                navigate('/marketplace');
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
            navigate('/marketplace');
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
        return null;
    }

    return (
        <div className="container-custom py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8"
            >
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gradient mb-4">{model.name}</h1>
                        <p className="text-noir-muted">
                            Created by: {model.creator.slice(0, 6)}...{model.creator.slice(-4)}
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBuy}
                        className="btn-primary"
                    >
                        Buy for {parseInt(model.price) / 1e18} ETH
                    </motion.button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-noir-primary mb-2">Model Details</h2>
                        <div className="bg-noir-card p-4 rounded-lg">
                            <p className="text-noir-muted">
                                <span className="font-semibold text-noir-primary">Downloads:</span> {model.purchases}
                            </p>
                            <p className="text-noir-muted mt-2">
                                <span className="font-semibold text-noir-primary">Download URL:</span>{' '}
                                <a
                                    href={model.downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-noir-accent hover:text-noir-primary transition-colors"
                                >
                                    {model.downloadUrl}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ModelDetails; 