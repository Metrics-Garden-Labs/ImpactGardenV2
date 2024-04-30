'use client';
import { Fragment, SetStateAction, useState, Dispatch } from 'react';
import { LuArrowUpRight } from "react-icons/lu";
import { Project } from '../../src/types';

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}


interface Props {
  project: Project;
}

export default function Sidebar({ project }: Props) {
  const categories = ['Onchain Builders', 'OP Stack', 'Governance', 'Dev Tooling'];

  const getProjectDuration = (createdAt: Date | null | undefined) => {
    if (!createdAt) return 'Unknown';

    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const diffInMonths = (currentDate.getFullYear() - createdDate.getFullYear()) * 12 +
      (currentDate.getMonth() - createdDate.getMonth());

    return `${diffInMonths} months`;
  };

  return (
    <>
      <div className='lg:block lg:w-72 bg-white h-screen pt-16 pb-8'>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sidebar content */}
          <div className="py-10 px-8 flex grow flex-col gap-y-5 bg-white overflow-y-auto px-6 pb-4">
            {/* Company image placeholder */}
            <div className="h-60 bg-gray-300 rounded-lg flex justify-center items-center">
              {/* Replace src with your image path */}
              <img src={project.logoUrl || "/MGLIcon.png"} alt="Company Logo" className="h-full w-full object-cover rounded-lg" />
            </div>
            {/* Project Name */}
            <h2 className="text-2xl font-bold text-gray-900">{project.projectName}</h2>
            {/* Project Link */}
            {project.websiteUrl && (
                <a href={project.websiteUrl} className="text-gray-500 hover:text-gray-300 visited:text-indigo-600 flex items-center">
                {project.websiteUrl}
                <LuArrowUpRight className="ml-1" />
                </a>
            )}
            {/* Stats and Categories */}
            <div>
              <div className="text-sm font-medium text-gray-500">Attester: 85</div>
              <div className="text-sm font-medium text-gray-500">Length: {getProjectDuration(project.createdAt)}</div>
              <div className="text-sm py-2 font-medium text-gray-500">Categories:</div>
              {/* Categories */}
              <div className='mt-4'>
                {categories.map((category) => (
                  <div key={category} className='mb-2'>
                    <span className="inline-block bg-gray-100 rounded-md px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                      {category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* additional rendering for smaller screens */}
    </>
  );
}