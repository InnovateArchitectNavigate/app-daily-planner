import { useState, useEffect, useCallback } from 'react';

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
  sober: number;
  healthyLungs: number;
}

export interface CounterSettings {
  soberLabel: string;
  soberCountdownMode: boolean;
  soberCountdownTarget: number;
  healthyLungsLabel: string;
  healthyLungsCountdownMode: boolean;
  healthyLungsCountdownTarget: number;
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

export function useDailyPlanner() {
  const [data, setData] = useState<PlannerData>({});
  const [counters, setCounters] = useState<CounterData>({ sober: 0, healthyLungs: 0 });
  const [tasks, setTasks] = useState<string[]>(TASKS);

  const [settings, setSettings] = useState<SettingsData>({
    sleepModeTimeout: 5,
    celebrationStyle: 'particles',
    counterSettings: {
      soberLabel: '[SOBER]',
      soberCountdownMode: false,
      soberCountdownTarget: 0,
      healthyLungsLabel: '[HEALTHY LUNGS]',
      healthyLungsCountdownMode: false,
      healthyLungsCountdownTarget: 0,
    },
  });
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
        setCounters(JSON.parse(storedCounters));
      } catch (e) {
        console.error('Failed to parse stored counters:', e);
      }
    }
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
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
      [key]: typeof value === 'number' ? Math.max(1, value) : value,
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
