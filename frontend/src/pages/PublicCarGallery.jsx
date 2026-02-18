import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { ChevronLeft, Share2, Maximize2, X, Download, Car } from "lucide-react";

const PublicCarGallery = () => {
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const res = await api.get(`/api/cars/public/${id}`);
                setCar(res.data);
            } catch (error) {
                console.error("Failed to load car details");
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [id]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${car.brand} ${car.model} Gallery`,
                    text: `Check out this ${car.brand} ${car.model} on Rent Info!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log("Error sharing", error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
                <Car size={48} className="text-gray-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
                <p className="text-gray-400">This gallery might have been removed or is unavailable.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent p-4 md:p-6 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-lg md:text-2xl font-bold tracking-tight">
                            {car.brand} <span className="text-gray-400 font-light">{car.model}</span>
                        </h1>
                        <div className="flex items-center gap-3 mt-1 text-xs md:text-sm text-gray-400">
                            {car.year && <span>{car.year}</span>}
                            {car.color && (
                                <>
                                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                    <span>{car.color}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleShare}
                        className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full transition backdrop-blur-md"
                    >
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="pt-24 pb-10 px-4 md:px-6 max-w-7xl mx-auto">
                {car.images && car.images.length > 0 ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {car.images.map((img, index) => (
                            <div
                                key={index}
                                className="relative group overflow-hidden rounded-xl bg-gray-900 break-inside-avoid cursor-zoom-in"
                                onClick={() => setSelectedImage(img)}
                            >
                                <img
                                    src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/${img}`}
                                    alt={`${car.model} - ${index + 1}`}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Car size={48} className="mb-4 opacity-50" />
                        <p>No images available for this vehicle.</p>
                    </div>
                )}
            </div>

            {/* Lightbox / Fullscreen View */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition"
                    >
                        <X size={24} />
                    </button>

                    <img
                        src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/${selectedImage}`}
                        alt="Full view"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                </div>
            )}
        </div>
    );
};

export default PublicCarGallery;
