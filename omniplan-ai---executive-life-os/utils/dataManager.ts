import { WeekData, LifeGoals, Email } from '../types';

export interface OmniPlanBackup {
  version: string;
  exportDate: string;
  data: OmniPlanBackupData;
}

export interface OmniPlanBackupData {
  allWeeks: Record<string, WeekData>;
  emails: Email[];
  lifeGoals: LifeGoals;
}

const BACKUP_VERSION = '2.0';

/**
 * Export all data to a single consolidated file
 */
export const exportAllData = (): OmniPlanBackup => {
  const allWeeks = JSON.parse(localStorage.getItem('omni_all_weeks') || '{}') as Record<string, WeekData>;
  const emails = JSON.parse(localStorage.getItem('omni_emails') || '[]') as Email[];
  const lifeGoals = JSON.parse(localStorage.getItem('omni_lifegoals') || '{}') as LifeGoals;

  return {
    version: BACKUP_VERSION,
    exportDate: new Date().toISOString(),
    data: {
      allWeeks,
      emails,
      lifeGoals,
    },
  };
};

type LegacyBackup = {
  version?: string;
  timestamp?: string;
  allWeeks?: Record<string, WeekData>;
  emails?: Email[];
  lifeGoals?: LifeGoals;
};

const normalizeBackup = (raw: unknown): OmniPlanBackupData => {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid backup file');
  }

  const maybe = raw as Partial<OmniPlanBackup>;
  if (maybe.data && typeof maybe.data === 'object') {
    const data = maybe.data as Partial<OmniPlanBackupData>;
    return {
      allWeeks: (data.allWeeks ?? {}) as Record<string, WeekData>,
      emails: (data.emails ?? []) as Email[],
      lifeGoals: (data.lifeGoals ?? {}) as LifeGoals,
    };
  }

  const legacy = raw as LegacyBackup;
  return {
    allWeeks: (legacy.allWeeks ?? {}) as Record<string, WeekData>,
    emails: (legacy.emails ?? []) as Email[],
    lifeGoals: (legacy.lifeGoals ?? {}) as LifeGoals,
  };
};

/**
 * Import all data from a consolidated backup file
 */
export const importAllData = (backup: OmniPlanBackupData) => {
  localStorage.setItem('omni_all_weeks', JSON.stringify(backup.allWeeks));
  localStorage.setItem('omni_emails', JSON.stringify(backup.emails));
  localStorage.setItem('omni_lifegoals', JSON.stringify(backup.lifeGoals));
};

/**
 * Download backup as JSON file
 */
export const downloadBackup = () => {
  const backup = exportAllData();
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `omniplan-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Clear all data from localStorage
 */
export const clearAllData = () => {
  localStorage.removeItem('omni_all_weeks');
  localStorage.removeItem('omni_emails');
  localStorage.removeItem('omni_lifegoals');
};

/**
 * Upload and import backup from file
 */
export const uploadBackup = (file: File): Promise<OmniPlanBackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const normalized = normalizeBackup(raw);
        importAllData(normalized);
        resolve(normalized);
      } catch (error) {
        reject(new Error('Invalid backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
