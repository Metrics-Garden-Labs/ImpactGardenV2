// app/users/attestationList.tsx

import React from 'react';
import { getAttestationsByUserId, getProjectsByUserId } from '@/src/lib/db';
import { Attestation, AttestationNetworkType, Project, User } from '@/src/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { easScanEndpoints } from '../components/easScan';

interface Props {
  user: User;
}

const AttestationList = async ({ user }: Props) => {
  try {
    let attestations: Attestation[] = await getAttestationsByUserId(user.fid);
    let projects: Project[] = await getProjectsByUserId(user.fid);

    // Sort attestations by createdAt timestamp in descending order
    attestations.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

    // Extract unique project names and ecosystems
    const userProjects = [...new Set(projects.map((project) => project.projectName))];
    const userEcosystems = [...new Set(projects.map((project) => project.ecosystem))];

    const attestedProjectNames = [...new Set(attestations.map((attestation) => attestation.projectName))];
    const attestedEcosystems = [...new Set(attestations.map((attestation) => attestation.ecosystem))];

    const ecosystemsOfInterest = [...new Set([...attestedEcosystems, ...userEcosystems])];

    return (
      <div className='flex'>
        <div className='w-1/4 p-4 bg-white border-r'>
          <div className='mb-8'>
            <h3 className='text-lg font-semibold mb-2'>Projects Attested to:</h3>
            {attestedProjectNames.length > 0 ? (
              <ul>
                {attestedProjectNames.map((projectName) => (
                  <li key={projectName} className='mb-2'>
                    <Link href={`/projects/${projectName}`}>
                      <p className='text-black hover:underline'>{projectName}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No projects attested to.</p>
            )}
          </div>
          <div>
            <h3 className='text-lg font-semibold mb-2'>Ecosystem of Interest:</h3>
            {ecosystemsOfInterest.length > 0 ? (
              <ul>
                {ecosystemsOfInterest.map((ecosystem) => (
                  <li key={ecosystem} className='mb-2'>
                    {ecosystem}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No ecosystems of interest.</p>
            )}
          </div>
        </div>
        <div className='w-3/4 p-4'>
          <h2 className='text-2xl font-bold mb-4'>Reviews {user.username} has given</h2>
          <div className='grid grid-cols-3 gap-4'>
            {attestations.length > 0 ? (
              attestations.map((attestation) => (
                <div key={attestation.id} className='p-4 bg-white border rounded-lg shadow-md'>
                  <div className='mb-2'>
                    <h3 className='text-lg font-semibold'>{attestation.projectName}</h3>
                    <p className='text-sm text-gray-500'>Contribution: {attestation.contribution}</p>
                  </div>
                  <p className='text-gray-700 mb-2'>
                    {attestation.feedback}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {format(new Date(attestation.createdAt || ''), 'MMMM dd, yyyy')}
                  </p>
                  <Link href={`${easScanEndpoints[attestation.ecosystem as AttestationNetworkType]}${attestation.attestationUID}`}>
                    <p className='text-black hover:underline'>View Attestation</p>
                  </Link>
                </div>
              ))
            ) : (
              <p>No reviews given.</p>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch attestations:', error);
    // Handle the error, display an error message, or return a fallback UI
    return <p>Failed to fetch attestations. Please try again later.</p>;
  }
};

export default AttestationList;
