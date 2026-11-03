'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MarketingIdea, CampaignInput, BudgetLevel } from '@/types/marketing';

interface CampaignFormData {
  industry: string;
  productName: string;
  budgetLevel: BudgetLevel;
  objective: string;
  additionalNotes: string;
}

interface CampaignContextType {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
  updateFormField: <K extends keyof CampaignFormData>(field: K, value: CampaignFormData[K]) => void;
  resetForm: () => void;
  ideas: MarketingIdea[];
  setIdeas: React.Dispatch<React.SetStateAction<MarketingIdea[]>>;
  updateIdea: (updatedIdea: MarketingIdea) => void;
  revertIdea: (ideaId: string) => void;
  lastInput: CampaignInput | null;
  setLastInput: React.Dispatch<React.SetStateAction<CampaignInput | null>>;
  clearAllCampaignData: () => void;
}

const STORAGE_KEY = 'marketing-ai:campaign-state:v1';

const DEFAULT_FORM_DATA: CampaignFormData = {
  industry: '',
  productName: '',
  budgetLevel: 'medium',
  objective: '',
  additionalNotes: '',
};

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<CampaignFormData>(DEFAULT_FORM_DATA);
  const [ideas, setIdeas] = useState<MarketingIdea[]>([]);
  const [lastInput, setLastInput] = useState<CampaignInput | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  // Khôi phục dữ liệu từ sessionStorage khi mount ở client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.formData) {
          setFormData((prev) => ({ ...prev, ...parsed.formData }));
        }
        if (Array.isArray(parsed.ideas)) {
          setIdeas(parsed.ideas);
        }
        if (parsed.lastInput) {
          setLastInput(parsed.lastInput);
        }
      }
    } catch (err) {
      console.warn('[CampaignContext] Lỗi đọc state từ sessionStorage:', err);
    } finally {
      setIsRestored(true);
    }
  }, []);

  // Tự động lưu state vào sessionStorage khi có thay đổi
  useEffect(() => {
    if (!isRestored || typeof window === 'undefined') return;

    try {
      const stateToSave = {
        formData,
        ideas,
        lastInput,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.warn('[CampaignContext] Không thể lưu state vào sessionStorage:', err);
    }
  }, [formData, ideas, lastInput, isRestored]);

  const updateFormField = useCallback(
    <K extends keyof CampaignFormData>(field: K, value: CampaignFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
  }, []);

  const updateIdea = useCallback((updatedIdea: MarketingIdea) => {
    setIdeas((prev) => prev.map((item) => (item.id === updatedIdea.id ? updatedIdea : item)));
  }, []);

  const revertIdea = useCallback((ideaId: string) => {
    setIdeas((prev) =>
      prev.map((item) => {
        if (item.id !== ideaId) return item;
        const history = item.refinementHistory;
        if (!history || history.length === 0) return item;

        const latest = history[0];
        const remainingHistory = history.slice(1);
        const revertedIdea: MarketingIdea = {
          ...latest.previousIdea,
          id: item.id,
          version: Math.max(1, (item.version || 2) - 1),
          refinementHistory: remainingHistory
        };
        return revertedIdea;
      })
    );
  }, []);

  const clearAllCampaignData = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setIdeas([]);
    setLastInput(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <CampaignContext.Provider
      value={{
        formData,
        setFormData,
        updateFormField,
        resetForm,
        ideas,
        setIdeas,
        updateIdea,
        revertIdea,
        lastInput,
        setLastInput,
        clearAllCampaignData,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaign phải được sử dụng bên trong CampaignProvider');
  }
  return context;
}

