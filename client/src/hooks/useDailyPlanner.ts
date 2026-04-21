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

export interface CounterHistory {
  [dateKey: string]: Partial<CounterData>;
}

export interface CounterSnapshot {
  values: CounterData;
  labels: {
    card1: string;
    card2: string;
  };
}

export interface CounterSnapshots {
  [dateKey: string]: CounterSnapshot;
}

export interface CounterSettingsHistory {
  [dateKey: string]: CounterSettings;
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
const COUNTER_SNAPSHOT_STORAGE_KEY = 'daily-planner-counter-snapshots';
const COUNTER_SETTINGS_HISTORY_STORAGE_KEY = 'daily-planner-counter-settings-history';
const SETTINGS_STORAGE_KEY = 'daily-planner-settings';

interface DailyPlannerContextValue {
  data: PlannerData;
  counters: CounterData;
  counterSettings: CounterSettings;
  counterLabels: {
    card1: string;
    card2: string;
  };
  updateCounter: (key: keyof CounterData, value: number) => void;
  resetCounterCard: (key: keyof CounterData, nextCounterSettings: CounterSettings) => void;
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

export const DEFAULT_COUNTER_BACKGROUND_IMAGES = {
  card1: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/sober-background-bDFkU7TWD7dBBJfyHkpZHT.webp',
  card2: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663523060286/knRwrfkCnLKzMouRBtkKzr/healthy-lungs-background-eKXsr288wJwJ6wEvGSPAir.webp',
} as const;

export const DEFAULT_COUNTER_LABEL = '[YOUR GOAL OR EVENT]';

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
    card1BackgroundImage: DEFAULT_COUNTER_BACKGROUND_IMAGES.card1,
    card2BackgroundImage: DEFAULT_COUNTER_BACKGROUND_IMAGES.card2,
  },
};

const DailyPlannerContext = createContext<DailyPlannerContextValue | null>(null);

function normalizeStoredSettings(storedSettings: Partial<SettingsData>): SettingsData {
  const storedCounterSettings = storedSettings.counterSettings as Partial<CounterSettings>;

  const mergedSettings: SettingsData = {
    ...defaultSettings,
    ...storedSettings,
    counterSettings: {
      ...defaultSettings.counterSettings,
      ...storedCounterSettings,
    },
  };

  // Migrate old minute-based values to seconds.
  if (mergedSettings.sleepModeTimeout > 0 && mergedSettings.sleepModeTimeout <= 60) {
    mergedSettings.sleepModeTimeout *= 60;
  }

  return mergedSettings;
}

function clampCounterValue(value: number) {
  return Math.max(0, value);
}

function getDateKeyFromDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function getDayDifference(fromKey: string, toKey: string) {
  const fromDate = new Date(`${fromKey}T00:00:00`);
  const toDate = new Date(`${toKey}T00:00:00`);
  return Math.round((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000));
}

function deriveCounterValue(
  history: CounterHistory,
  dateKey: string,
  counterKey: keyof CounterData,
  shouldIncrementForward: boolean,
) {
  const sortedKeys = Object.keys(history).sort();

  if (sortedKeys.length === 0) {
    return 0;
  }

  const exactValue = history[dateKey]?.[counterKey];
  if (typeof exactValue === "number") {
    return clampCounterValue(exactValue);
  }

  const previousKey = [...sortedKeys].reverse().find((key) => key < dateKey && typeof history[key]?.[counterKey] === "number");
  const nextKey = sortedKeys.find((key) => key > dateKey && typeof history[key]?.[counterKey] === "number");

  if (previousKey) {
    const previousValue = history[previousKey]?.[counterKey] ?? 0;
    if (shouldIncrementForward) {
      return clampCounterValue(previousValue - getDayDifference(previousKey, dateKey));
    }
    return clampCounterValue(previousValue);
  }

  if (nextKey) {
    const nextValue = history[nextKey]?.[counterKey] ?? 0;
    return shouldIncrementForward
      ? clampCounterValue(nextValue + getDayDifference(dateKey, nextKey))
      : clampCounterValue(nextValue - getDayDifference(dateKey, nextKey));
  }

  return 0;
}

function deriveCounterSettings(
  history: CounterSettingsHistory,
  dateKey: string,
  fallbackSettings: CounterSettings,
) {
  const sortedKeys = Object.keys(history).sort();

  if (sortedKeys.length === 0) {
    return fallbackSettings;
  }

  const exactValue = history[dateKey];
  if (exactValue) {
    return exactValue;
  }

  const previousKey = [...sortedKeys].reverse().find((key) => key < dateKey);

  if (previousKey) {
    return history[previousKey];
  }

  const nextKey = sortedKeys.find((key) => key > dateKey);

  if (nextKey) {
    return history[nextKey];
  }

  return fallbackSettings;
}

function buildPastCounterSnapshots(
  history: CounterHistory,
  snapshots: CounterSnapshots,
  selectedDateKey: string,
  settings: SettingsData,
) {
  const earliestKey = Object.keys(history).sort()[0];
  if (!earliestKey) {
    return snapshots;
  }

  const nextSnapshots = { ...snapshots };
  const cursor = new Date(`${earliestKey}T00:00:00`);
  const end = new Date(`${selectedDateKey}T00:00:00`);

  while (cursor < end) {
    const dateKey = getDateKeyFromDate(cursor);
    if (!nextSnapshots[dateKey]) {
      nextSnapshots[dateKey] = {
        values: {
          card1: deriveCounterValue(
            history,
            dateKey,
            "card1",
            settings.counterSettings.card1CountdownMode,
          ),
          card2: deriveCounterValue(
            history,
            dateKey,
            "card2",
            settings.counterSettings.card2CountdownMode,
          ),
        },
        labels: {
          card1: settings.counterSettings.card1Label,
          card2: settings.counterSettings.card2Label,
        },
      };
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return nextSnapshots;
}

function useDailyPlannerState(): DailyPlannerContextValue {
  const [data, setData] = useState<PlannerData>({});
  const [counterHistory, setCounterHistory] = useState<CounterHistory>({});
  const [counterSnapshots, setCounterSnapshots] = useState<CounterSnapshots>({});
  const [counterSettingsHistory, setCounterSettingsHistory] = useState<CounterSettingsHistory>({});
  const [tasks, setTasks] = useState<string[]>(TASKS);
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    let parsedCounterSnapshots: CounterSnapshots | null = null;

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
        setCounterHistory(JSON.parse(storedCounters) as CounterHistory);
      } catch (e) {
        console.error('Failed to parse stored counters:', e);
      }
    }
    const storedCounterSnapshots = localStorage.getItem(COUNTER_SNAPSHOT_STORAGE_KEY);
    if (storedCounterSnapshots) {
      try {
        parsedCounterSnapshots = JSON.parse(storedCounterSnapshots) as CounterSnapshots;
        setCounterSnapshots(parsedCounterSnapshots);
      } catch (e) {
        console.error('Failed to parse stored counter snapshots:', e);
      }
    }
    const storedCounterSettingsHistory = localStorage.getItem(COUNTER_SETTINGS_HISTORY_STORAGE_KEY);
    if (storedCounterSettingsHistory) {
      try {
        setCounterSettingsHistory(JSON.parse(storedCounterSettingsHistory));
      } catch (e) {
        console.error('Failed to parse stored counter settings history:', e);
      }
    } else if (parsedCounterSnapshots) {
      const migratedSettingsHistory = Object.entries(parsedCounterSnapshots).reduce<CounterSettingsHistory>((acc, [dateKey, snapshot]) => {
        acc[dateKey] = {
          ...defaultSettings.counterSettings,
          card1Label: snapshot.labels.card1,
          card2Label: snapshot.labels.card2,
        };
        return acc;
      }, {});
      setCounterSettingsHistory(migratedSettingsHistory);
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
      localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(counterHistory));
    }
  }, [counterHistory, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(COUNTER_SNAPSHOT_STORAGE_KEY, JSON.stringify(counterSnapshots));
    }
  }, [counterSnapshots, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(COUNTER_SETTINGS_HISTORY_STORAGE_KEY, JSON.stringify(counterSettingsHistory));
    }
  }, [counterSettingsHistory, isLoading]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  const getDateKey = useCallback((date: Date): string => {
    return getDateKeyFromDate(date);
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
    const currentDateKey = getDateKey(selectedDate);

    setCounterHistory((prev) => ({
      ...prev,
      [currentDateKey]: {
        ...prev[currentDateKey],
        [key]: clampCounterValue(value),
      },
    }));
  }, [getDateKey, selectedDate]);

  const resetCounterCard = useCallback((key: keyof CounterData, nextCounterSettings: CounterSettings) => {
    const currentDateKey = getDateKey(selectedDate);

    setCounterHistory((prev) => {
      const nextHistory = Object.entries(prev).reduce<CounterHistory>((acc, [dateKey, values]) => {
        acc[dateKey] = {
          ...values,
          [key]: 0,
        };
        return acc;
      }, {});

      nextHistory[currentDateKey] = {
        ...nextHistory[currentDateKey],
        [key]: 0,
      };

      return nextHistory;
    });

    setCounterSettingsHistory((prev) => {
      const nextHistory = Object.entries(prev).reduce<CounterSettingsHistory>((acc, [dateKey, value]) => {
        acc[dateKey] = key === 'card1'
          ? {
            ...value,
            card1Label: nextCounterSettings.card1Label,
            card1CountdownMode: nextCounterSettings.card1CountdownMode,
            card1CountdownTarget: nextCounterSettings.card1CountdownTarget,
            card1BackgroundImage: nextCounterSettings.card1BackgroundImage,
          }
          : {
            ...value,
            card2Label: nextCounterSettings.card2Label,
            card2CountdownMode: nextCounterSettings.card2CountdownMode,
            card2CountdownTarget: nextCounterSettings.card2CountdownTarget,
            card2BackgroundImage: nextCounterSettings.card2BackgroundImage,
          };
        return acc;
      }, {});

      const currentSettings = nextHistory[currentDateKey] ?? nextCounterSettings;

      nextHistory[currentDateKey] = key === 'card1'
        ? {
          ...currentSettings,
          card1Label: nextCounterSettings.card1Label,
          card1CountdownMode: nextCounterSettings.card1CountdownMode,
          card1CountdownTarget: nextCounterSettings.card1CountdownTarget,
          card1BackgroundImage: nextCounterSettings.card1BackgroundImage,
        }
        : {
          ...currentSettings,
          card2Label: nextCounterSettings.card2Label,
          card2CountdownMode: nextCounterSettings.card2CountdownMode,
          card2CountdownTarget: nextCounterSettings.card2CountdownTarget,
          card2BackgroundImage: nextCounterSettings.card2BackgroundImage,
        };

      return nextHistory;
    });
  }, [getDateKey, selectedDate]);

  const updateSettings = useCallback((key: keyof SettingsData, value: any) => {
    if (key === "counterSettings") {
      const currentDateKey = getDateKey(selectedDate);
      const counterSettingsValue = value as CounterSettings;
      const previousDate = new Date(selectedDate);
      previousDate.setDate(previousDate.getDate() - 1);
      const previousDateKey = getDateKey(previousDate);

      setCounterSettingsHistory((prev) => {
        const nextHistory = { ...prev };
        const hasEarlierEntry = Object.keys(prev).some((historyDateKey) => historyDateKey < currentDateKey);

        if (!hasEarlierEntry) {
          nextHistory[previousDateKey] = deriveCounterSettings(prev, previousDateKey, settings.counterSettings);
        }

        nextHistory[currentDateKey] = counterSettingsValue;
        return nextHistory;
      });
    }

    setSettings((prev) => ({
      ...prev,
      [key]: typeof value === 'number' ? Math.max(5, Math.round(value)) : value,
    }));
  }, [counterHistory, getDateKey, selectedDate, settings]);

  const selectedDateKey = getDateKey(selectedDate);
  const counterSettings = deriveCounterSettings(
    counterSettingsHistory,
    selectedDateKey,
    settings.counterSettings,
  );
  const counters: CounterData = {
    card1: deriveCounterValue(
      counterHistory,
      selectedDateKey,
      "card1",
      counterSettings.card1CountdownMode,
    ),
    card2: deriveCounterValue(
      counterHistory,
      selectedDateKey,
      "card2",
      counterSettings.card2CountdownMode,
    ),
  };

  const counterLabels = {
    card1: counterSettings.card1Label,
    card2: counterSettings.card2Label,
  };

  return {
    data,
    counters,
    counterSettings,
    counterLabels,
    updateCounter,
    resetCounterCard,
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
