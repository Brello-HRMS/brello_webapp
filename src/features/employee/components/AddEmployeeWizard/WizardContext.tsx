/* eslint-disable react-refresh/only-export-components, @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface WizardSlice {
  currentStep: number;
  employeeId: string | null;
  formData: any;
}

const emptySlice = (): WizardSlice => ({
  currentStep: 1,
  employeeId: null,
  formData: {},
});

interface WizardState {
  currentStep: number;
  employeeId: string | null;
  formData: any;
  isEditMode: boolean;
  setEmployeeId: (id: string) => void;
  setFormData: (data: any) => void;
  updateFormData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetWizard: () => void;
  initEditMode: (employeeId: string, prefillData: any) => void;
}

const WizardContext = createContext<WizardState | undefined>(undefined);

const STORAGE_KEY = 'brello_onboarding_wizard_state';

const loadPersistedAddSlice = (): WizardSlice => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return emptySlice();
  try {
    const parsed = JSON.parse(saved);
    return {
      currentStep: parsed.currentStep || 1,
      employeeId: parsed.employeeId || null,
      formData: parsed.formData || {},
    };
  } catch {
    return emptySlice();
  }
};

export const WizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [addSlice, setAddSlice] = useState<WizardSlice>(loadPersistedAddSlice);
  const [editSlice, setEditSlice] = useState<WizardSlice>(emptySlice);
  const [mode, setMode] = useState<'add' | 'edit'>('add');

  const isEditMode = mode === 'edit';
  const active = isEditMode ? editSlice : addSlice;

  const updateSlice = useCallback(
    (updater: (s: WizardSlice) => WizardSlice) => {
      if (isEditMode) {
        setEditSlice(updater);
      } else {
        setAddSlice(updater);
      }
    },
    [isEditMode],
  );

  // Persist only the add slice — edit-mode changes are ephemeral.
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addSlice));
  }, [addSlice]);

  const setEmployeeId = useCallback(
    (id: string) => updateSlice((s) => ({ ...s, employeeId: id })),
    [updateSlice],
  );

  const setFormData = useCallback(
    (data: any) => updateSlice((s) => ({ ...s, formData: data })),
    [updateSlice],
  );

  const updateFormData = useCallback(
    (data: any) => updateSlice((s) => ({ ...s, formData: { ...s.formData, ...data } })),
    [updateSlice],
  );

  const nextStep = useCallback(
    () => updateSlice((s) => ({ ...s, currentStep: s.currentStep + 1 })),
    [updateSlice],
  );

  const prevStep = useCallback(
    () => updateSlice((s) => ({ ...s, currentStep: Math.max(1, s.currentStep - 1) })),
    [updateSlice],
  );

  const goToStep = useCallback(
    (step: number) => updateSlice((s) => ({ ...s, currentStep: step })),
    [updateSlice],
  );

  const initEditMode = useCallback((editEmployeeId: string, prefillData: any) => {
    setEditSlice({ currentStep: 1, employeeId: editEmployeeId, formData: prefillData });
    setMode('edit');
  }, []);

  const resetWizard = useCallback(() => {
    if (isEditMode) {
      // End the edit session: drop edit state, return to add mode (add slice is preserved).
      setEditSlice(emptySlice());
      setMode('add');
    } else {
      setAddSlice(emptySlice());
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isEditMode]);

  return (
    <WizardContext.Provider
      value={{
        currentStep: active.currentStep,
        employeeId: active.employeeId,
        formData: active.formData,
        isEditMode,
        setEmployeeId,
        setFormData,
        updateFormData,
        nextStep,
        prevStep,
        goToStep,
        resetWizard,
        initEditMode,
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
