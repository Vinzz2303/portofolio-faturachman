import React from 'react';
import { motion } from 'framer-motion';
import centralHero from '../assets/central-hero.png';
import centralEstimasi from '../assets/central-estimasi.png';
import centralDashboard from '../assets/central-dashboard.png';

const Projects = () => {
    return (
        <motion.section
            id="featured"
            className="py-20 px-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <p className="text-gold uppercase tracking-widest text-xs mb-3">Featured Project</p>
                    <h2 className="text-3xl md:text-4xl font-bold">Central Jual Emas</h2>
                    <p className="text-gray-300 mt-4 max-w-3xl mx-auto">
                        Platform jual beli emas yang mengutamakan akurasi harga, pengalaman pengguna yang mulus,
                        dan performa tinggi di seluruh perangkat.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div className="lux-card rounded-xl p-8">
                        <h3 className="text-2xl font-semibold text-gold mb-4">Highlight Fitur</h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-2 w-2 bg-gold rounded-full" />
                                Integrasi Real-time XAU/USD API untuk pricing yang akurat.
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-2 w-2 bg-gold rounded-full" />
                                Custom Admin Dashboard untuk kontrol data dan monitoring transaksi.
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-2 w-2 bg-gold rounded-full" />
                                Optimasi responsivitas 100% pada mobile, tablet, dan desktop.
                            </li>
                        </ul>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <span className="px-4 py-2 border border-gold text-gold rounded-full text-xs uppercase tracking-[0.2em]">
                                Real-time
                            </span>
                            <span className="px-4 py-2 border border-gold text-gold rounded-full text-xs uppercase tracking-[0.2em]">
                                Dashboard
                            </span>
                            <span className="px-4 py-2 border border-gold text-gold rounded-full text-xs uppercase tracking-[0.2em]">
                                Responsive
                            </span>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-900 via-dark-bg to-gray-900 border border-gray-800 rounded-xl p-8">
                        <h3 className="text-2xl font-semibold mb-4">Peran & Dampak</h3>
                        <p className="text-gray-300 mb-6">
                            Saya menangani end-to-end development dengan fokus pada performa, integrasi data real-time,
                            serta animasi UI/UX yang halus agar pengalaman pengguna terasa premium.
                        </p>
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="px-4 py-2 border border-gold text-gold rounded-full text-sm">
                                Real-time Data
                            </span>
                            <span className="px-4 py-2 border border-gold text-gold rounded-full text-sm">
                                Custom Dashboard
                            </span>
                            <span className="px-4 py-2 border border-gold text-gold rounded-full text-sm">
                                High-fidelity Animations
                            </span>
                        </div>
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 text-gold uppercase tracking-[0.2em] text-xs hover:text-yellow-400 transition"
                        >
                            Mulai Kolaborasi
                            <span className="h-px w-10 bg-gold/60" />
                        </a>
                    </div>
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            src: centralHero,
                            title: 'Landing Experience',
                            desc: 'Visual premium untuk membangun trust sejak first impression.',
                        },
                        {
                            src: centralEstimasi,
                            title: 'Gold Estimation',
                            desc: 'Form estimasi real-time dengan UX yang ringkas dan jelas.',
                        },
                        {
                            src: centralDashboard,
                            title: 'Admin Dashboard',
                            desc: 'Monitoring lead dan data operasional dalam satu panel.',
                        },
                    ].map((item, index) => (
                        <motion.div
                            key={item.title}
                            className="lux-card rounded-2xl p-4"
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <div className="overflow-hidden rounded-xl border border-gold/20">
                                <img src={item.src} alt={item.title} className="w-full h-auto object-cover" />
                            </div>
                            <div className="mt-4">
                                <h4 className="text-lg font-semibold text-gold">{item.title}</h4>
                                <p className="text-sm text-gray-300 mt-2">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default Projects;
