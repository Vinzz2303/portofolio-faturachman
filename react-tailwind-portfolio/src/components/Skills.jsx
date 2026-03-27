import React from 'react';
import { motion } from 'framer-motion';

const Skills = () => {
    const skills = [
        {
            title: 'Frontend',
            items: ['React.js', 'ES6+'],
        },
        {
            title: 'Backend',
            items: ['RESTful API'],
        },
        {
            title: 'Tools',
            items: ['Netlify', 'Git'],
        },
    ];

    return (
        <motion.section
            id="skills"
            className="py-20 px-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <p className="text-gold uppercase tracking-widest text-xs mb-3">Expertise</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gold">Skills</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {skills.map((skill, index) => (
                        <motion.div
                            key={skill.title}
                            className="lux-card p-6 rounded-xl"
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gold">{skill.title}</h3>
                                <span className="text-xs uppercase tracking-widest text-gray-400">Core</span>
                            </div>
                            <ul className="space-y-2 text-gray-300">
                                {skill.items.map((item) => (
                                    <li key={item} className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 bg-gold rounded-full" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default Skills;
