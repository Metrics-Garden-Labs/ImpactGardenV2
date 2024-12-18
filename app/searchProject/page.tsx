import { Contribution, Project, SearchResult } from '../../src/types';
import { getContributionsByCategoryAndSubcategory, getProjectAttestationCount, getProjectsByCategoryAndSubcategory } from '../../src/lib/db/dbprojects';
import ProjectPageClient from '../components/searchProjects/ProjectPageClient';
import { Metadata } from 'next';

interface Props {
  searchParams?: {
    query?: string;
    filter?: string;
    sortOrder?: string;
    searchResults?: SearchResult[];
  };
}

export const metadata: Metadata = {
  title: "Impact Garden - Search Projects",
};

const ProjectPage = async ({ searchParams }: Props) => {
  const query = searchParams?.query || '';
  const filter = searchParams?.filter || '';
  const sortOrder = searchParams?.sortOrder || 'A-Z';

  console.log('Received search parameters:', searchParams);
  const [category, subcategory] = filter.split(':');

  try {
    const projects: Project[] = await getProjectsByCategoryAndSubcategory(category || '', subcategory || '');
    // const contributions: ContributionWithProjectsAndAttestationCount[] = await getContributionsByCategoryAndSubcategory(category || '', subcategory || '', query || '');
    // console.log('Projects retrieved successfully:', projects);
    // console.log('Received sortOrder in ProjectPage:', sortOrder);
    return (
      <ProjectPageClient
        projects={projects}
        query={query}
        filter={filter}
        sortOrder={sortOrder}
        searchResults={searchParams?.searchResults || []}
      />
    );
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return (
      <ProjectPageClient
        projects={[]}
        query={query}
        filter={filter}
        sortOrder={sortOrder}
        searchResults={[]}
        error="Failed to fetch projects"
      />
    );
  }
};

export default ProjectPage;
