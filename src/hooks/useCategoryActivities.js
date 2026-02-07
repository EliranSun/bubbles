import { useMemo, useState } from 'react';

const STORAGE_KEY = 'activities';

function loadActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function useCategoryActivities(category) {
  const [allActivities, setAllActivities] = useState(loadActivities);

  const activities = useMemo(
    () => allActivities.filter((activity) => activity.category === category),
    [allActivities, category],
  );

  const addActivity = (title) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    const nextActivities = [
      ...allActivities,
      {
        id: crypto.randomUUID(),
        title: trimmed,
        category,
      },
    ];

    setAllActivities(nextActivities);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextActivities));
  };

  const removeActivity = (id) => {
    const nextActivities = allActivities.filter(
      (activity) => !(activity.category === category && activity.id === id),
    );

    setAllActivities(nextActivities);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextActivities));
  };

  return {
    activities,
    addActivity,
    removeActivity,
  };
}
