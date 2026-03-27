import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    const renderLink = (label, hash) => {
        const className = "text-gray-300 hover:text-gold transition";
        if (isHome) {
            return (
                <a href={`#${hash}`} className={className}>{label}</a>
            );
        }
        return (
            <Link to={`/#${hash}`} className={className}>{label}</Link>
        );
    };

    return (
        <header className="bg-dark-bg bg-opacity-95 text-white sticky top-0 z-50 backdrop-blur border-b border-gray-800">
            <div className="container mx-auto flex flex-col md:flex-row md:justify-between md:items-center px-6 py-4 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gold tracking-wide">Faturachman Al Kahfi</h1>
                    <p className="text-xs uppercase tracking-[0.35em] text-gray-400">
                        Full-Stack Web Developer & Informatics Student
                    </p>
                </div>
                <nav>
                    <ul className="flex flex-wrap items-center gap-5 text-xs uppercase tracking-[0.25em]">
                        <li>{renderLink('Home', 'hero')}</li>
                        <li>{renderLink('About', 'about')}</li>
                        <li>{renderLink('Skills', 'skills')}</li>
                        <li>{renderLink('Project', 'featured')}</li>
                        <li>{renderLink('Contact', 'contact')}</li>
                        <li><Link to="/login" className="text-gray-300 hover:text-gold transition">AI Assistant</Link></li>
                    </ul>
                </nav>
                {isHome ? (
                    <a
                        href="#contact"
                        className="border border-gold text-gold px-4 py-2 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-gray-900 transition"
                    >
                        Let&apos;s Talk
                    </a>
                ) : (
                    <Link
                        to="/#contact"
                        className="border border-gold text-gold px-4 py-2 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-gray-900 transition"
                    >
                        Let&apos;s Talk
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;
