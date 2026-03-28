import { useQuery } from '@tanstack/react-query';

import { getProject } from '../api/projectApi';

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  });
};
