import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const Marketplace = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/models');
            setModels(response.data.models);
        } catch (error) {
            toast.error('Failed to fetch models');
            console.error('Error fetching models:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (modelId) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/models/${modelId}/buy`);
            toast.success('Purchase successful!');
            fetchModels();
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

    return (
        <div className="container-custom">
            <h1 className="text-4xl font-bold mb-8 text-gradient">AI Models Marketplace</h1>

            <div className="grid-auto-fit">
                {models.map((model) => (
                    <ModelCard key={model.id} model={model} onBuy={handleBuy} />
                ))}
            </div>
        </div>
    );
};

const ModelCard = ({ model, onBuy }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card hover-lift"
    >
        <h3 className="text-xl font-bold text-noir-primary mb-2">{model.name}</h3>
        <p className="text-noir-muted mb-4">Creator: {model.creator.slice(0, 6)}...{model.creator.slice(-4)}</p>
        <div className="flex justify-between items-center">
            <span className="text-noir-primary font-bold">
                {parseInt(model.price) / 1e18} ETH
            </span>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onBuy(model.id)}
                className="btn-primary"
            >
                Buy Now
            </motion.button>
        </div>
    </motion.div>
);

export default Marketplace; 