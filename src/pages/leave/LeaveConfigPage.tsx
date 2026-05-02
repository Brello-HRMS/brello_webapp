import React from 'react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { LeaveRulesCard } from '../../features/leave/components/LeaveRulesCard';
import { LeaveTypesCard } from '../../features/leave/components/LeaveTypesCard';
import { Button } from '../../components/ui/Button/Button';

const LeaveConfigPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Leave Configuration"
        actions={
          <Button variant="primary" onClick={() => {}}>
            Save
          </Button>
        }
      />
      <LeaveRulesCard />
      <LeaveTypesCard />
    </div>
  );
};

export default LeaveConfigPage;
