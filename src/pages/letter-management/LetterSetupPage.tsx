import React, { useRef, useState, useMemo } from 'react';
// Imports removed

import { PageHeader } from '../../components/common';
import { useModuleAccess } from '../../hooks/useModuleAccess';
import { ModuleCode } from '../../enum/modules';

import TemplatesTab from './TemplatesPage';
import CategoriesTab from './CategoriesPage';
import SignatoriesTab from './SignatoriesPage';
import LetterSettingsTab from './LetterSettingsPage';
import styles from './LetterSetupPage.module.scss';

enum TabType {
  TEMPLATES = 'templates',
  CATEGORIES = 'categories',
  SIGNATORIES = 'signatories',
  SETTINGS = 'settings',
}

const LetterSetupPage: React.FC = () => {
  const isMounted = useRef(false);

  // Derive initial tab from path if matched, else fallback
  const getInitialTab = (): TabType => {
    return TabType.SETTINGS;
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  const [headerActions, setHeaderActions] = useState<React.ReactNode>(null);

  const { hasViewAccess: hasTemplatesAccess } = useModuleAccess(ModuleCode.LETTER_TEMPLATES);

  const tabs = useMemo(() => {
    const availableTabs = [];
    if (hasTemplatesAccess) {
      availableTabs.push(
        { id: TabType.SETTINGS, label: 'Settings' },
        { id: TabType.CATEGORIES, label: 'Categories' },
        { id: TabType.SIGNATORIES, label: 'Signatories' },
        { id: TabType.TEMPLATES, label: 'Templates' },
      );
    }
    return availableTabs;
  }, [hasTemplatesAccess]);

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    // Reset actions on tab switch
    setHeaderActions(null);
  }, [activeTab]);

  // Sync tab state with URL for direct navigation / sidebar highlights
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    // Since we now only have one route /letter-management/setup, we just update the hash or state.
    // Let's just update the local state without changing the URL to avoid navigation complexity,
    // or we can keep it as is if we want URL driven tabs.
    // Actually, since there's only one sidebar route, changing the URL to /letter-management/:tab
    // would break the active sidebar state if the sidebar only looks for /letter-management/setup.
    // So let's NOT change the URL, just update the state.
  };

  const getTitleAndSubtitle = () => {
    switch (activeTab) {
      case TabType.TEMPLATES:
        return {
          title: 'Letter Templates',
          subtitle: 'Create and manage reusable templates used to generate employee letters.',
        };
      case TabType.CATEGORIES:
        return {
          title: 'Letter Categories',
          subtitle: 'Define and manage categories used to organize letter templates.',
        };
      case TabType.SIGNATORIES:
        return {
          title: 'Letter Signatories',
          subtitle: 'Manage authorized personnel who can sign issued letters.',
        };
      case TabType.SETTINGS:
        return {
          title: 'Letter Settings',
          subtitle:
            'Configure numbering, date format, and the default signatory for issued letters.',
        };
      default:
        return { title: 'Letter Management', subtitle: '' };
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case TabType.TEMPLATES:
        return <TemplatesTab setHeaderActions={setHeaderActions} />;
      case TabType.CATEGORIES:
        return <CategoriesTab setHeaderActions={setHeaderActions} />;
      case TabType.SIGNATORIES:
        return <SignatoriesTab setHeaderActions={setHeaderActions} />;
      case TabType.SETTINGS:
        return <LetterSettingsTab setHeaderActions={setHeaderActions} />;
      default:
        return null;
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  return (
    <div className={styles.container}>
      <PageHeader title={title} subtitle={subtitle} actions={headerActions} />

      {tabs.length > 0 && (
        <div className={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.tabContent}>{renderTabContent()}</div>
    </div>
  );
};

export default LetterSetupPage;
