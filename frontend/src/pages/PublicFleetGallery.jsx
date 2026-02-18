import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { Car, Fuel, Users, Settings, ArrowRight, Phone, Mail } from "lucide-react";

const PublicFleetGallery = () => {
    const { userId } = useParams();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const res = await api.get(`/api/cars/public/fleet/${userId}`);
                setCars(res.data);
            } catch (error) {
                console.error("Failed to load fleet");
            } finally {
                setLoading(false);
            }
        };
        if (userId) {
            fetchCars();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-gray-200">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white py-20 md:py-32 px-4 text-center shadow-sm">
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-gray-900">
                        Premium Fleet Collection
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
                        Experience luxury and performance. Choose from our meticulously maintained selection of vehicles for your next journey.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => document.getElementById('fleet').scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition shadow-lg"
                        >
                            View Fleet
                        </button>
                    </div>
                </div>
            </div>

            {/* Fleet Grid */}
            <div id="fleet" className="max-w-7xl mx-auto px-4 py-20">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 text-gray-900">Our Vehicles</h2>
                        <p className="text-gray-500">Select a vehicle to view gallery and details</p>
                    </div>
                </div>

                {cars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cars.map((car) => (
                            <div
                                key={car._id}
                                onClick={() => navigate(`/gallery/${car._id}`)}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
                            >
                                {/* Image Aspect Ratio Container */}
                                <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                                    {car.images && car.images.length > 0 ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/${car.images[0]}`}
                                            alt={`${car.brand} ${car.model}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Car size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        ₹{car.dailyRate?.toLocaleString()}/day
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6">
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">{car.brand}</p>
                                        <h3 className="text-xl font-bold text-gray-900">{car.model}</h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-6 text-xs text-gray-500">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5 text-gray-400"><Fuel size={14} /> Fuel</span>
                                            <span className="font-semibold text-gray-700">{car.fuelType || "—"}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5 text-gray-400"><Settings size={14} /> Gear</span>
                                            <span className="font-semibold text-gray-700">{car.transmission || "—"}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5 text-gray-400"><Users size={14} /> Seats</span>
                                            <span className="font-semibold text-gray-700">{car.seatingCapacity || "—"}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-emerald-600 font-medium text-sm group-hover:text-emerald-700 transition-colors">
                                        <span>View Details</span>
                                        <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <Car size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-xl">No vehicles available at the moment.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white py-12 px-4 mt-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-xl font-bold mb-2 text-gray-900">Rent Info</h2>
                        <p className="text-gray-500 text-sm">Premium car rental services.</p>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition text-gray-600"><Phone size={20} /></a>
                        <a href="#" className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition text-gray-600"><Mail size={20} /></a>
                    </div>
                    <div className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} Rent Info. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicFleetGallery;
