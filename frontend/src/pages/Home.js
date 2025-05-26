import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
            >
                <h1 className="text-6xl font-bold mb-6 text-gradient">
                    AI Model Marketplace
                </h1>
                <p className="text-xl text-noir-muted mb-12 max-w-2xl mx-auto">
                    Discover, buy, and sell cutting-edge AI models in a decentralized marketplace.
                    Powered by blockchain technology for secure and transparent transactions.
                </p>

                <div className="flex space-x-6 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/marketplace" className="btn-primary shadow-none hover:shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300">
                            Browse Models
                        </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/upload" className="btn-secondary hover:shadow-[0_0_5px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300">
                            Upload Model
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-16 grid-auto-fit max-w-5xl w-full"
            >
                <FeatureCard
                    title="Decentralized"
                    description="All models are stored on IPFS and transactions are secured by blockchain technology."
                />
                <FeatureCard
                    title="Secure"
                    description="Smart contracts ensure fair and transparent transactions between buyers and sellers."
                />
                <FeatureCard
                    title="Innovative"
                    description="Access cutting-edge AI models from creators around the world."
                />
            </motion.div>
        </div>
    );
};

const FeatureCard = ({ title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="card hover-lift"
    >
        <h3 className="text-noir-primary text-xl font-bold mb-3">{title}</h3>
        <p className="text-noir-muted">{description}</p>
    </motion.div>
);

export default Home;      