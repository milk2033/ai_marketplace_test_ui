// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { JsonRpcProvider, Wallet, Contract } = require("ethers");
const { create } = require("@web3-storage/w3up-client");
const { Blob } = require("buffer");
const config = require(path.resolve(__dirname, "../frontend/src/config/contract-config.json"));
const LoraMarketplace = require(path.resolve(__dirname, "../frontend/src/contracts/LoraMarketplace.json"));
const CognifyToken = require(path.resolve(__dirname, "../frontend/src/contracts/CognifyToken.json"));
const StakingRewards = require(path.resolve(__dirname, "../frontend/src/contracts/StakingRewards.json"));

const app = express();
const PORT = 5000;

// Enable CORS and JSON parsing 
app.use(cors());
app.use(express.json());

// Health-check endpoint
app.get("/", (_req, res) => res.send("Backend running."));


// Load environment variables
const {
    ALCHEMY_API_KEY,
    PRIVATE_KEY,
    WEB3STORAGE_TOKEN
} = process.env;
if (!ALCHEMY_API_KEY || !PRIVATE_KEY || !WEB3STORAGE_TOKEN) {
    console.error("Missing required environment variables: ALCHEMY_API_KEY, PRIVATE_KEY, WEB3STORAGE_TOKEN");
    process.exit(1);
}

// Ethers.js setup
const provider = new JsonRpcProvider(
    `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);
const wallet = new Wallet(PRIVATE_KEY, provider);

//can delete contract, this is old
const contract = new Contract(config.address, config.abi, wallet);

// CognifyToken contract
const cognifyToken = new Contract(CognifyToken.address, CognifyToken.abi, wallet);

// StakingRewards contract
const stakingRewards = new Contract(StakingRewards.address, StakingRewards.abi, wallet);

// LoraMarketplace contract
const loraMarketplace = new Contract(LoraMarketplace.address, LoraMarketplace.abi, wallet);
// Build a simple registry of instances
const CONTRACTS = {
    LoraMarketplace: loraMarketplace,
    CognifyToken: cognifyToken,
    StakingRewards: stakingRewards,
};

// Whitelist which methods are allowed on each
const ALLOWED = {
    LoraMarketplace: ["uploadModel", "buyModel", "getModel", "modelCount"],
    CognifyToken: ["approve", "transfer", "balanceOf"],
    StakingRewards: ["stake", "withdraw", "claimRewards", "pendingReward"],
};

app.post("/api/relay", async (req, res) => {
    try {
        const { loraMarketplace: name, method, args } = req.body;

        // 1) Validate contract name and method
        if (!CONTRACTS[name]) {
            return res.status(404).json({ error: `Unknown contract: ${name}` });
        }
        if (!ALLOWED[name]?.includes(method)) {
            return res.status(403).json({ error: `Method "${method}" not allowed on ${name}` });
        }

        // 2) Invoke
        const c = CONTRACTS[name];
        const tx = await c[method](...(Array.isArray(args) ? args : []));
        // 3) Return tx hash
        return res.json({ hash: tx.hash });
    } catch (err) {
        console.error("Relay error:", err);
        return res.status(500).json({ error: err.message });
    }
});

// w3up client and Space initialization
let w3upClient;
async function getW3upClient() {
    if (!w3upClient) {
        w3upClient = await create({ token: WEB3STORAGE_TOKEN })
        await w3upClient.setCurrentSpace(`did:key:${WEB3STORAGE_TOKEN}`)
    }
    return w3upClient
}

// Multer for temporary file uploads
const upload = multer({ dest: path.join(__dirname, "tmp_uploads") });

// Combined IPFS pin + contract call
app.post(
    "/api/models/upload",
    upload.single("modelFile"), // form field: modelFile
    async (req, res) => {
        console.log("hit backend, starting upload");
        try {
            // 1) Read the uploaded file from disk
            const { path: tempPath, originalname } = req.file;
            const buffer = fs.readFileSync(tempPath);

            // 2) Pin to IPFS via w3up (Web3.Storage)
            const client = await getW3upClient();
            console.log('got client, pinning file...')
            const blob = new Blob([buffer], { type: "application/octet-stream" });
            const cid = await client.uploadFile(
                blob,
                originalname,
                {
                    onRootCidReady: localCid => console.log("Computed CID:", localCid),
                    onStoredChunk: size => console.log("Uploaded chunk:", size)
                }
            );

            console.log("IPFS CID:", cid);  // now you’ll see your real CID string
            const downloadUrl = `https://${cid}.ipfs.w3s.link/`;
            console.log("Download URL:", downloadUrl);
            // 3) Cleanup temp file
            fs.unlinkSync(tempPath);

            // 4) Read metadata
            const { name, price } = req.body;

            // 5) Call smart contract
            console.log('name', name, 'downloadUrl', downloadUrl, 'price', price)
            const tx = await loraMarketplace.uploadModel(name, downloadUrl, price);
            const receipt = await tx.wait(1);
            console.log("Transaction hash:", receipt.hash);
            // 6) Respond
            res.json({ txHash: receipt.transactionHash });
        } catch (err) {
            console.error("Upload+IPFS+contract error:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

// Buy a model on‐chain (backend‐signed)
app.post("/api/models/:id/buy", async (req, res) => {
    try {
        const id = req.params.id;

        // 1) Fetch the model to get its price
        const model = await loraMarketplace.getModel(id);
        const price = model.price;      // BigNumber
        console.log('model', model)

        // 2) Submit the purchase tx, sending `price` in value
        const tx = await loraMarketplace.buyModel(id, { value: price });
        const receipt = await tx.wait(1);
        console.log(`Model ${id} purchased in tx ${receipt.hash}`);
        res.json({ txHash: receipt.hash });
    } catch (err) {
        console.error("BuyModel error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET all models
app.get("/api/models", async (_req, res) => {
    try {
        const countBn = await loraMarketplace.modelCount();
        console.log('countBn', countBn)
        const count = Number(countBn);  // convert to Number
        console.log('count', count)
        // fetch each on-chain Model
        const raw = await Promise.all(
            Array.from({ length: count }, (_, i) => loraMarketplace.getModel(i + 1))
        );

        // map to JSON
        const models = raw.map(m => ({
            id: Number(m.id),
            name: m.name,
            downloadUrl: m.downloadUrl,
            creator: m.creator,           // was `owner` before
            price: m.price.toString(),  // in wei
            purchases: Number(m.purchases)  // new field
        }));

        res.json({ models });
    } catch (err) {
        console.error("FetchModels error:", err);
        res.status(500).json({ error: err.message });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
});
