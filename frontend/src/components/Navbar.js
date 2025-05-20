import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
    return (
        <nav className="bg-noir-card border-b border-noir-accent">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="text-noir-primary text-2xl font-bold"
                        >
                            AI Marketplace
                        </motion.div>
                    </Link>

                    <div className="flex space-x-8">
                        <NavLink to="/marketplace">Marketplace</NavLink>
                        <NavLink to="/upload">Upload Model</NavLink>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, children }) => (
    <Link to={to}>
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-noir-text hover:text-noir-primary transition-colors duration-200"
        >
            {children}
        </motion.div>
    </Link>
);

export default Navbar;
