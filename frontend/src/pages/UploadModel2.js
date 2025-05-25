import { useState } from "react";
import { chainApi } from "../utils/chain";

export default function UploadModel() {
    const [file, setFile] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    const handleSubmit = async (e) => {
        console.log('hit handleSubmit')
        e.preventDefault();
        if (!file) return alert("Please select a .txt file.");

        try {
            console.log('hit try')
            const { txHash } = await chainApi.uploadModel(file, name, price);
            alert("Model uploaded on-chain in tx: " + txHash);
        } catch (err) {
            console.error(err);
            alert("Upload failed: " + err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <label>
                Model file:
                <input
                    type="file"
                    accept=".txt"
                    onChange={e => setFile(e.target.files[0])}
                    required
                />
            </label>
            <label>
                Name:
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
            </label>
            <label>
                Price (wei):
                <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                />
            </label>
            <button type="submit">Upload Model</button>
        </form>
    );
}
