import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <motion.section
            id="about"
            className="py-20 px-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="container mx-auto max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gold">About</h2>
                        <p className="text-lg text-gray-300 leading-relaxed mb-6">
                            Fokus saya adalah membangun mobile-first user experiences yang mulus dan konsisten di setiap device.
                            Saya memanfaatkan AI Prompt Engineering untuk mempercepat siklus pengembangan, memperjelas kebutuhan
                            produk, dan menjaga kualitas UI/UX di setiap iterasi.
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm uppercase tracking-[0.2em] text-gray-400">
                            <span className="border border-gray-700 px-4 py-2">React.js</span>
                            <span className="border border-gray-700 px-4 py-2">Real-time API</span>
                            <span className="border border-gray-700 px-4 py-2">UI/UX Motion</span>
                        </div>
                    </div>
                    <div className="lux-card rounded-2xl p-8">
                        <h3 className="text-xl font-semibold text-gold mb-4">Working Principles</h3>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-2 w-2 bg-gold rounded-full" />
                                Mobile-first design sebagai baseline kualitas.
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-2 w-2 bg-gold rounded-full" />
                                Integrasi AI untuk percepatan riset, prototyping, dan delivery.
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-2 w-2 bg-gold rounded-full" />
                                UI/UX motion yang halus untuk menegaskan detail premium.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default About;
