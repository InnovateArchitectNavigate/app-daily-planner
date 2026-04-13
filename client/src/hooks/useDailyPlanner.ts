import { createContext, createElement, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export const TASKS = [
  'Read / Ideate / Obsidian',
  'Exercise',
  'Meditate',
  'Cards to Kan Ban Project Plan',
  '[4] Soggy',
  '[5] Investor',
  'Break',
  '[3] Tnega',
  '[2] Repeat After Me We Are Free',
  '[1] [IAN]',
  'Unwind / Cook / Socialise',
  'Categorise Cards',
];

export interface DayData {
  completed: boolean[];
  isFreeDay: boolean;
}

export interface CounterData {
  card1: number;
  card2: number;
}

export interface CounterSettings {
  card1Label: string;
  card1CountdownMode: boolean;
  card1CountdownTarget: number;
  card2Label: string;
  card2CountdownMode: boolean;
  card2CountdownTarget: number;
  card1BackgroundImage: string;
  card2BackgroundImage: string;
}

export interface SettingsData {
  sleepModeTimeout: number;
  celebrationStyle: 'rainbow-droplets' | 'fireworks' | 'particles' | 'waves' | 'sparkles';
  counterSettings: CounterSettings;
}

export interface PlannerData {
  [dateKey: string]: DayData;
}

const STORAGE_KEY = 'daily-planner-data';
const COUNTER_STORAGE_KEY = 'daily-planner-counters';
const SETTINGS_STORAGE_KEY = 'daily-planner-settings';

interface DailyPlannerContextValue {
  data: PlannerData;
  counters: CounterData;
  updateCounter: (key: keyof CounterData, value: number) => void;
  settings: SettingsData;
  updateSettings: (key: keyof SettingsData, value: SettingsData[keyof SettingsData]) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  getDayData: (date: Date) => DayData;
  toggleTask: (date: Date, taskIndex: number) => void;
  toggleFreeDay: (date: Date) => void;
  getWeekData: (startDate: Date) => Array<{ date: Date; completed: number; total: number; isFreeDay: boolean }>;
  getWeekStart: (date: Date) => Date;
  getDateKey: (date: Date) => string;
  isLoading: boolean;
}

const defaultSettings: SettingsData = {
  sleepModeTimeout: 300,
  celebrationStyle: 'particles',
  counterSettings: {
    card1Label: '[SOBER]',
    card1CountdownMode: false,
    card1CountdownTarget: 0,
    card2Label: '[HEALTHY LUNGS]',
    card2CountdownMode: false,
    card2CountdownTarget: 0,
    card1BackgroundImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/sober-background-bDFkU7TWD7dBBJfyHkpZHT.webp',
    card2BackgroundImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/healthy-lungs-background-eKXsr288wJwJ6wEvGSPAir.webp',
  },
};

const DailyPlannerContext = createContext<DailyPlannerContextValue | null>(null);

function normalizeStoredSettings(storedSettings: Partial<SettingsData>): SettingsData {
  const storedCounterSettings = storedSettings.counterSettings as Partial<CounterSettings> & {
    soberLabel?: string;
    soberCountdownMode?: boolean;
    soberCountdownTarget?: number;
    healthyLungsLabel?: string;
    healthyLungsCountdownMode?: boolean;
    healthyLungsCountdownTarget?: number;
    soberBackgroundImage?: string;
    healthyLungsBackgroundImage?: string;
  };

  const mergedSettings: SettingsData = {
    ...defaultSettings,
    ...storedSettings,
    counterSettings: {
      ...defaultSettings.counterSettings,
      ...storedCounterSettings,
      card1Label: storedCounterSettings?.card1Label ?? storedCounterSettings?.soberLabel ?? defaultSettings.counterSettings.card1Label,
      card1CountdownMode: storedCounterSettings?.card1CountdownMode ?? storedCounterSettings?.soberCountdownMode ?? defaultSettings.counterSettings.card1CountdownMode,
      card1CountdownTarget: storedCounterSettings?.card1CountdownTarget ?? storedCounterSettings?.soberCountdownTarget ?? defaultSettings.counterSettings.card1CountdownTarget,
      card2Label: storedCounterSettings?.card2Label ?? storedCounterSettings?.healthyLungsLabel ?? defaultSettings.counterSettings.card2Label,
      card2CountdownMode: storedCounterSettings?.card2CountdownMode ?? storedCounterSettings?.healthyLungsCountdownMode ?? defaultSettings.counterSettings.card2CountdownMode,
      card2CountdownTarget: storedCounterSettings?.card2CountdownTarget ?? storedCounterSettings?.healthyLungsCountdownTarget ?? defaultSettings.counterSettings.card2CountdownTarget,
      card1BackgroundImage: storedCounterSettings?.card1BackgroundImage ?? storedCounterSettings?.soberBackgroundImage ?? defaultSettings.counterSettings.card1BackgroundImage,
      card2BackgroundImage: storedCounterSettings?.card2BackgroundImage ?? storedCounterSettings?.healthyLungsBackgroundImage ?? defaultSettings.counterSettings.card2BackgroundImage,
    },
  };

  // Migrate old minute-based values to seconds.
  if (mergedSettings.sleepModeTimeout > 0 && mergedSettings.sleepModeTimeout <= 60) {
    mergedSettings.sleepModeTimeout *= 60;
  }

  return mergedSettings;
}

function useDailyPlannerState(): DailyPlannerContextValue {
  const [data, setData] = useState<PlannerData>({});
  const [counters, setCounters] = useState<CounterData>({ card1: 0, card2: 0 });
  const [tasks, setTasks] = useState<string[]>(TASKS);
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
    const storedCounters = localStorage.getItem(COUNTER_STORAGE_KEY);
    if (storedCounters) {
      try {
        const parsedCounters = JSON.parse(storedCounters) as Partial<CounterData> & {
          sober?: number;
          healthyLungs?: number;
        };
        setCounters({
          card1: parsedCounters.card1 ?? parsedCounters.sober ?? 0,
          card2: parsedCounters.card2 ?? parsedCounters.healthyLungs ?? 0,
        });
      } catch (e) {
        console.error('Failed to parse stored counters:', e);
      }
    }
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      try {
        setSettings(normalizeStoredSettings(JSON.parse(storedSettings)));
      } catch (e) {
        console.error('Failed to parse stored settings:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoading]);

  // Save counters to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(counters));
    }
  }, [counters, isLoading]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  const getDateKey = useCallback((date: Date): string => {
    return date.toISOString().split('T')[0];
  }, []);

  const getDayData = useCallback((date: Date): DayData => {
    const key = getDateKey(date);
    return data[key] || {
      completed: new Array(TASKS.length).fill(false),
      isFreeDay: false,
    };
  }, [data, getDateKey]);

  const toggleTask = useCallback((date: Date, taskIndex: number) => {
    const key = getDateKey(date);
    const dayData = getDayData(date);
    const newCompleted = [...dayData.completed];
    newCompleted[taskIndex] = !newCompleted[taskIndex];

    setData((prev) => ({
      ...prev,
      [key]: {
        ...dayData,
        completed: newCompleted,
      },
    }));
  }, [getDateKey, getDayData]);

  const toggleFreeDay = useCallback((date: Date) => {
    const key = getDateKey(date);
    const dayData = getDayData(date);

    setData((prev) => ({
      ...prev,
      [key]: {
        ...dayData,
        isFreeDay: !dayData.isFreeDay,
      },
    }));
  }, [getDateKey, getDayData]);

  const getWeekData = useCallback((startDate: Date) => {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayData = getDayData(date);
      const completed = dayData.completed.filter(Boolean).length;
      week.push({
        date,
        completed,
        total: TASKS.length,
        isFreeDay: dayData.isFreeDay,
      });
    }
    return week;
  }, [getDayData]);

  const getWeekStart = useCallback((date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }, []);

  const updateCounter = useCallback((key: keyof CounterData, value: number) => {
    setCounters((prev) => ({
      ...prev,
      [key]: Math.max(0, value),
    }));
  }, []);

  const updateSettings = useCallback((key: keyof SettingsData, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: typeof value === 'number' ? Math.max(5, Math.round(value)) : value,
    }));
  }, []);

  return {
    data,
    counters,
    updateCounter,
    settings,
    updateSettings,
    selectedDate,
    setSelectedDate,
    getDayData,
    toggleTask,
    toggleFreeDay,
    getWeekData,
    getWeekStart,
    getDateKey,
    isLoading,
  };
}

export function DailyPlannerProvider({ children }: { children: ReactNode }) {
  const value = useDailyPlannerState();

  return createElement(DailyPlannerContext.Provider, { value }, children);
}

export function useDailyPlanner() {
  const context = useContext(DailyPlannerContext);

  if (!context) {
    throw new Error('useDailyPlanner must be used within a DailyPlannerProvider');
  }

  return context;
}
