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
                <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-noir-primary to-noir-secondary bg-clip-text text-transparent">
                    AI Model Marketplace
                </h1>
                <p className="text-xl text-noir-muted mb-12 max-w-2xl mx-auto">
                    Discover, buy, and sell cutting-edge AI models in a decentralized marketplace.
                    Powered by blockchain technology for secure and transparent transactions.
                </p>

                <div className="flex space-x-6 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                            to="/marketplace"
                            className="px-8 py-3 bg-noir-primary text-noir-bg rounded-lg font-bold shadow-neon hover:shadow-neon-secondary transition-all duration-300"
                        >
                            Browse Models
                        </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                            to="/upload"
                            className="px-8 py-3 border-2 border-noir-primary text-noir-primary rounded-lg font-bold hover:bg-noir-primary hover:text-noir-bg transition-all duration-300"
                        >
                            Upload Model
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full"
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
        className="bg-noir-card p-6 rounded-lg border border-noir-accent"
    >
        <h3 className="text-noir-primary text-xl font-bold mb-3">{title}</h3>
        <p className="text-noir-muted">{description}</p>
    </motion.div>
);

export default Home;      