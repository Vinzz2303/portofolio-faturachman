import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
    return (
        <motion.section
            id="contact"
            className="py-20 px-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="container mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gold">Contact</h2>
                <p className="mb-10 text-gray-300 max-w-2xl mx-auto">
                    Terbuka untuk kolaborasi, proyek baru, atau diskusi seputar web development dan produk digital.
                    Kirim detail kebutuhan Anda, saya akan merespons dengan cepat.
                </p>
                <div className="lux-card rounded-2xl p-8 max-w-3xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a
                            href="https://www.linkedin.com/in/yourprofile"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-gold text-gold py-3 px-6 rounded-md hover:bg-gold hover:text-gray-900 transition"
                        >
                            LinkedIn
                        </a>
                        <a
                            href="https://github.com/yourprofile"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-gold text-gold py-3 px-6 rounded-md hover:bg-gold hover:text-gray-900 transition"
                        >
                            GitHub
                        </a>
                        <a
                            href="mailto:faturachmanalkahfi7@gmail.com"
                            className="border border-gold text-gold py-3 px-6 rounded-md hover:bg-gold hover:text-gray-900 transition"
                        >
                            Email
                        </a>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default Contact;
