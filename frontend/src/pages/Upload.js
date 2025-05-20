import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !name || !price) {
            toast.error('Please fill in all fields');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('modelFile', file);
        formData.append('name', name);
        formData.append('price', price);

        try {
            const response = await axios.post('http://localhost:5000/api/models/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Model uploaded successfully!');
            // Reset form
            setFile(null);
            setName('');
            setPrice('');
        } catch (error) {
            toast.error('Failed to upload model');
            console.error('Error uploading model:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-noir-primary">Upload AI Model</h1>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-noir-card p-8 rounded-lg border border-noir-accent"
                onSubmit={handleSubmit}
            >
                <div className="mb-6">
                    <label className="block text-noir-text mb-2">Model Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 bg-noir-bg border border-noir-accent rounded-lg text-noir-text focus:outline-none focus:border-noir-primary"
                        placeholder="Enter model name"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-noir-text mb-2">Price (ETH)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2 bg-noir-bg border border-noir-accent rounded-lg text-noir-text focus:outline-none focus:border-noir-primary"
                        placeholder="Enter price in ETH"
                        step="0.01"
                        min="0"
                    />
                </div>

                <div className="mb-8">
                    <label className="block text-noir-text mb-2">Model File</label>
                    <div className="border-2 border-dashed border-noir-accent rounded-lg p-6 text-center">
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer text-noir-primary hover:text-noir-secondary transition-colors duration-200"
                        >
                            {file ? file.name : 'Click to upload or drag and drop'}
                        </label>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={uploading}
                    className={`w-full py-3 rounded-lg font-bold ${uploading
                        ? 'bg-noir-muted cursor-not-allowed'
                        : 'bg-noir-primary text-noir-bg shadow-neon hover:shadow-neon-secondary'
                        } transition-all duration-300`}
                >
                    {uploading ? 'Uploading...' : 'Upload Model'}
                </motion.button>
            </motion.form>
        </div>
    );
};

export default Upload; 