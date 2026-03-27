import React from 'react';

const ProjectCard = ({ project }) => {
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white dark:bg-gray-800">
            <img className="w-full" src={project.image} alt={project.title} />
            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{project.title}</div>
                <p className="text-gray-700 dark:text-gray-300 text-base">
                    {project.description}
                </p>
            </div>
            <div className="px-6 pt-4 pb-2">
                {project.features.map((feature, index) => (
                    <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 dark:bg-gray-700 dark:text-gray-200">
                        {feature}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ProjectCard;