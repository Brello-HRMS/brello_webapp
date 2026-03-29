import { useParams } from 'react-router-dom';

import { useProject } from '../../features/project/hooks/useProject';
import { ProjectDetailHeader } from '../../features/project/components/ProjectDetail/ProjectDetailHeader';
import { ProjectLeadBar } from '../../features/project/components/ProjectDetail/ProjectLeadBar';
import { ProjectOverviewCard } from '../../features/project/components/ProjectDetail/ProjectOverviewCard';
import { ProjectTeamTable } from '../../features/project/components/ProjectDetail/ProjectTeamTable';
import { ProjectContractSummary } from '../../features/project/components/ProjectDetail/ProjectContractSummary';

import styles from './ProjectDetailPage.module.scss';

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ clientId: string; projectId: string }>();
  const { data: response, isLoading } = useProject(projectId || '');

  const project = response?.data;

  if (isLoading) {
    return <div className={styles.container}>Loading project details...</div>;
  }

  if (!project) {
    return <div className={styles.container}>Project not found.</div>;
  }

  return (
    <div className={styles.container}>
      <ProjectDetailHeader project={project} />
      <ProjectLeadBar project={project} />
      <ProjectOverviewCard project={project} />
      <ProjectTeamTable project={project} />
      <ProjectContractSummary project={project} />
    </div>
  );
};

export default ProjectDetailPage;
