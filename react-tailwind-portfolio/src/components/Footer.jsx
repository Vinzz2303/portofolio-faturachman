import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-dark-bg text-white py-8 border-t border-gray-800">
            <div className="container mx-auto text-center">
                <div className="h-px w-20 bg-gold/60 mx-auto mb-4" />
                <p className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Faturachman Al Kahfi. All rights reserved.
                </p>
                <div className="flex justify-center space-x-4 mt-4 text-xs uppercase tracking-[0.2em] text-gray-500">
                    <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition">LinkedIn</a>
                    <a href="https://github.com/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition">GitHub</a>
                    <a href="mailto:faturachmanalkahfi7@gmail.com" className="hover:text-gold transition">Email</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
