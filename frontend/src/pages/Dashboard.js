import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="container-custom py-8">
            <h1 className="text-4xl font-bold text-gradient mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-noir-card rounded-lg p-6 cursor-pointer"
                >
                    <Link to="/stake" className="block">
                        <h2 className="text-2xl font-bold mb-4">Stake</h2>
                        <p className="text-noir-muted">Stake your CGFY tokens to earn rewards</p>
                    </Link>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-noir-card rounded-lg p-6 cursor-pointer"
                >
                    <Link to="/withdraw" className="block">
                        <h2 className="text-2xl font-bold mb-4">Withdraw</h2>
                        <p className="text-noir-muted">Withdraw your staked CGFY tokens</p>
                    </Link>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-noir-card rounded-lg p-6"
            >
                <h2 className="text-xl font-bold mb-6">Staking Stats</h2>
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-noir-bg rounded-lg p-4 border border-noir-accent">
                        <div className="text-noir-muted text-sm mb-1">CGFY APR</div>
                        <div className="text-2xl font-bold text-noir-primary">12.5%</div>
                    </div>
                    <div className="bg-noir-bg rounded-lg p-4 border border-noir-accent">
                        <div className="text-noir-muted text-sm mb-1">Fee APR</div>
                        <div className="text-2xl font-bold text-noir-primary">2.5%</div>
                    </div>
                    <div className="bg-noir-bg rounded-lg p-4 border border-noir-accent">
                        <div className="text-noir-muted text-sm mb-1">Total APR</div>
                        <div className="text-2xl font-bold text-gradient">15.0%</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard; 