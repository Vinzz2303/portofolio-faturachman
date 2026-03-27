import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <motion.section
            id="hero"
            className="relative flex items-center justify-center min-h-screen px-6 text-center overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-dark-bg to-dark-bg opacity-70" />
            <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative max-w-5xl mx-auto">
                <p className="text-gold uppercase tracking-widest text-xs mb-6">High-performance web solutions</p>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    High-performance end-to-end web solutions
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                    Saya membangun produk digital yang cepat, responsif, dan berfokus pada pengalaman pengguna
                    dari ide sampai rilis.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <a
                        href="#featured"
                        className="bg-gold text-gray-900 py-3 px-8 rounded-md font-semibold hover:bg-yellow-400 transition"
                    >
                        Lihat Featured Project
                    </a>
                    <a
                        href="#contact"
                        className="border border-gold text-gold py-3 px-8 rounded-md font-semibold hover:bg-gold hover:text-gray-900 transition"
                    >
                        Hubungi Saya
                    </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {[
                        {
                            title: 'Mobile-first UX',
                            description: 'Rancangan responsif yang terasa premium di setiap layar.',
                        },
                        {
                            title: 'Real-time API',
                            description: 'Integrasi data live dengan performa stabil dan akurat.',
                        },
                        {
                            title: 'AI Prompt Engineering',
                            description: 'Iterasi cepat dengan pipeline berbasis prompt yang terukur.',
                        },
                    ].map((item) => (
                        <div key={item.title} className="lux-card p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-gold mb-3">{item.title}</h3>
                            <p className="text-sm text-gray-300">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default Hero;
