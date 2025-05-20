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
            // Refresh the models list
            fetchModels();
        } catch (error) {
            toast.error('Failed to purchase model');
            console.error('Error purchasing model:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-noir-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-noir-primary">AI Models Marketplace</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        whileHover={{ y: -5 }}
        className="bg-noir-card rounded-lg overflow-hidden border border-noir-accent"
    >
        <div className="p-6">
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
                    className="px-4 py-2 bg-noir-primary text-noir-bg rounded-lg font-bold shadow-neon hover:shadow-neon-secondary transition-all duration-300"
                >
                    Buy Now
                </motion.button>
            </div>
        </div>
    </motion.div>
);

export default Marketplace; 