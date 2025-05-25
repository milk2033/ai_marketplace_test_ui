import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Upload from './pages/Upload';
import ModelDetails from './pages/ModelDetails';
import StakePage from './pages/StakePage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-noir-bg text-noir-text font-tech">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/models/:id" element={<ModelDetails />} />
            <Route path="/stake" element={<StakePage />} />
          </Routes>
        </main>
        <ToastContainer
          position="bottom-right"
          theme="dark"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
