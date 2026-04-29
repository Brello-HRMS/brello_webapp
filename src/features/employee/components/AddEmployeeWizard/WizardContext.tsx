/* eslint-disable react-refresh/only-export-components, @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface WizardState {
  currentStep: number;
  employeeId: string | null;
  formData: any;
  setEmployeeId: (id: string) => void;
  setFormData: (data: any) => void;
  updateFormData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetWizard: () => void;
}

const WizardContext = createContext<WizardState | undefined>(undefined);

const STORAGE_KEY = 'brello_onboarding_wizard_state';

export const WizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).currentStep || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  });

  const [employeeId, setEmployeeId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).employeeId || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [formData, setFormData] = useState<any>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).formData || {};
      } catch {
        return {};
      }
    }
    return {};
  });

  React.useEffect(() => {
    const state = { currentStep, employeeId, formData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentStep, employeeId, formData]);

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => Math.max(1, prev - 1));
  const goToStep = (step: number) => setCurrentStep(step);

  const updateFormData = useCallback((data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  }, []);

  const resetWizard = () => {
    setCurrentStep(1);
    setEmployeeId(null);
    setFormData({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        employeeId,
        formData,
        setEmployeeId,
        setFormData,
        updateFormData,
        nextStep,
        prevStep,
        goToStep,
        resetWizard,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};
