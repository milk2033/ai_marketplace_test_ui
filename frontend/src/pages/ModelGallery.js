import { useEffect, useState } from "react";
import { chainApi } from "../utils/chain";

const ModelGallery = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        chainApi.getModels()
            .then(({ models }) => setModels(models))
            .catch(err => {
                console.error(err);
                alert("Could not load models: " + err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading models…</p>;
    if (!models.length) return <p>No models available.</p>;

    return (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {models.map(m => (
                <div key={m.id} className="border rounded p-4 shadow">
                    <h2 className="font-semibold mb-2">{m.name}</h2>
                    <p className="text-sm mb-1">
                        Price: add eth price ETH
                    </p>
                    <p className="text-sm mb-1">
                        Creator: <code className="break-all">{m.creator}</code>
                    </p>
                    <p className="text-sm mb-3">
                        Purchased: {m.purchases}×
                    </p>
                    <a
                        href={m.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mb-3 text-blue-600 underline"
                    >
                        Download
                    </a>
                    <button
                        onClick={async () => {
                            try {
                                const { txHash } = await chainApi.buyModel(m.id);
                                alert(`Purchased in tx ${txHash}`);
                            } catch (err) {
                                alert("Purchase failed: " + err.message);
                            }
                        }}
                        className="w-full bg-green-600 text-white py-1 rounded"
                    >
                        Buy
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ModelGallery;