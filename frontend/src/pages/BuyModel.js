import { useState } from "react";
import { chainApi } from "../utils/chain";

export default function BuyModel() {
    const [id, setId] = useState("");

    const handleBuy = async (e) => {
        e.preventDefault();
        if (!id.match(/^\d+$/)) {
            return alert("Please enter a valid numeric ID.");
        }

        try {
            const { txHash } = await chainApi.buyModel(id);
            alert(`Purchased model ${id} in tx: ${txHash}`);
        } catch (err) {
            console.error(err);
            alert("Purchase failed: " + err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Buy a Model</h1>
            <form onSubmit={handleBuy} className="space-y-4">
                <div>
                    <label className="block mb-1">Model ID</label>
                    <input
                        type="number"
                        min="0"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="w-full border p-2"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded"
                >
                    Buy Model
                </button>
            </form>
        </div>
    );
}
