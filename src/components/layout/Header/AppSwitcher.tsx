import React, { useState } from 'react';
import { LayoutGrid, Shield, User, Users, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';

import { getAuthResponse } from '../../../utils/authUtils';
import { getCookie, setCookie } from '../../../utils/cookieUtils';
import { Popover } from '../../common/Popover';
import { switchApp } from '../../../features/auth/api/auth';
import { useAvailableApps } from '../../../features/auth/api/useAvailableApps';

import styles from './Header.module.scss';

const getAppIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('admin')) return <Shield size={16} />;
  if (lowerName.includes('employee')) return <User size={16} />;
  if (lowerName.includes('hr')) return <Users size={16} />;
  if (lowerName.includes('payroll')) return <Wallet size={16} />;
  return <LayoutGrid size={16} />;
};

export const AppSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: apps = [] } = useAvailableApps();
  const authResponse = getAuthResponse();
  const currentAppId = authResponse?.data?.defaultAppId;

  const handleAppSwitch = async (appId: string) => {
    try {
      const response = await switchApp({ appId });
      const { data } = response;

      const authResponseStr = getCookie('auth_response');
      if (authResponseStr && data) {
        const auth = JSON.parse(authResponseStr);
        auth.data.access_token = data.access_token;
        auth.data.defaultAppId = data.appId;
        setCookie('auth_response', JSON.stringify(auth));

        // Use window.location to trigger a full refresh and re-route based on new appId
        window.location.assign('/dashboard');
      }
    } catch {
      toast.error('Failed to switch app');
    }
  };

  const appItems = apps.map((app) => ({
    title: app.name,
    icon: getAppIcon(app.name),
    action: () => handleAppSwitch(app.id),
    className: app.id === currentAppId ? styles.activeApp : '',
  }));

  if (apps.length <= 1) return null;

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={
        <button className="icon-button" aria-label="Switch App">
          <LayoutGrid size={20} />
        </button>
      }
      items={appItems}
      dropdownClassName={styles.appSwitcherDropdown}
    />
  );
};
