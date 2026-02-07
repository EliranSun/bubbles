import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import type { Activity, ActivityCategory } from "./activityTypes";

const STORAGE_KEY = "activities-store-v1";

type ActivitiesState = {
  activities: Activity[];
};

type AddActivityPayload = {
  category: ActivityCategory;
  title: string;
};

type RenameActivityPayload = {
  id: string;
  title: string;
};

type DeleteActivityPayload = {
  id: string;
};

type ResetActivityTimerPayload = {
  id: string;
};

type UpdateActivityPositionPayload = {
  id: string;
  x: number;
  y: number;
};

type UpdateActivityImagePayload = {
  id: string;
  imageUrl: string | null;
};

type ActivitiesAction =
  | { type: "ADD_ACTIVITY"; payload: AddActivityPayload }
  | { type: "RENAME_ACTIVITY"; payload: RenameActivityPayload }
  | { type: "DELETE_ACTIVITY"; payload: DeleteActivityPayload }
  | { type: "RESET_ACTIVITY_TIMER"; payload: ResetActivityTimerPayload }
  | {
      type: "UPDATE_ACTIVITY_POSITION";
      payload: UpdateActivityPositionPayload;
    }
  | { type: "UPDATE_ACTIVITY_IMAGE"; payload: UpdateActivityImagePayload };

const initialState: ActivitiesState = {
  activities: [],
};

const canUseStorage = typeof window !== "undefined";

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parsePersistedState(value: string | null): ActivitiesState {
  if (!value) {
    return initialState;
  }

  try {
    const parsed = JSON.parse(value) as Partial<ActivitiesState>;

    if (!parsed || !Array.isArray(parsed.activities)) {
      return initialState;
    }

    return {
      activities: parsed.activities,
    };
  } catch {
    return initialState;
  }
}

function loadInitialState(): ActivitiesState {
  if (!canUseStorage) {
    return initialState;
  }

  return parsePersistedState(window.localStorage.getItem(STORAGE_KEY));
}

function activitiesReducer(
  state: ActivitiesState,
  action: ActivitiesAction,
): ActivitiesState {
  switch (action.type) {
    case "ADD_ACTIVITY": {
      const now = Date.now();
      const newActivity: Activity = {
        id: generateId(),
        title: action.payload.title,
        category: action.payload.category,
        createdAt: now,
        lastResetAt: now,
        imageUrl: null,
        x: 0,
        y: 0,
      };

      return {
        ...state,
        activities: [...state.activities, newActivity],
      };
    }
    case "RENAME_ACTIVITY": {
      return {
        ...state,
        activities: state.activities.map((activity) =>
          activity.id === action.payload.id
            ? { ...activity, title: action.payload.title }
            : activity,
        ),
      };
    }
    case "DELETE_ACTIVITY": {
      return {
        ...state,
        activities: state.activities.filter(
          (activity) => activity.id !== action.payload.id,
        ),
      };
    }
    case "RESET_ACTIVITY_TIMER": {
      const now = Date.now();

      return {
        ...state,
        activities: state.activities.map((activity) =>
          activity.id === action.payload.id
            ? { ...activity, lastResetAt: now }
            : activity,
        ),
      };
    }
    case "UPDATE_ACTIVITY_POSITION": {
      return {
        ...state,
        activities: state.activities.map((activity) =>
          activity.id === action.payload.id
            ? { ...activity, x: action.payload.x, y: action.payload.y }
            : activity,
        ),
      };
    }
    case "UPDATE_ACTIVITY_IMAGE": {
      return {
        ...state,
        activities: state.activities.map((activity) =>
          activity.id === action.payload.id
            ? { ...activity, imageUrl: action.payload.imageUrl }
            : activity,
        ),
      };
    }
    default:
      return state;
  }
}

type ActivitiesContextValue = {
  state: ActivitiesState;
  addActivity: (category: ActivityCategory, title: string) => void;
  renameActivity: (id: string, title: string) => void;
  deleteActivity: (id: string) => void;
  resetActivityTimer: (id: string) => void;
  updateActivityPosition: (id: string, x: number, y: number) => void;
  updateActivityImage: (id: string, imageUrl: string | null) => void;
};

const ActivitiesContext = createContext<ActivitiesContextValue | null>(null);

function createActions(dispatch: Dispatch<ActivitiesAction>) {
  return {
    addActivity: (category: ActivityCategory, title: string) => {
      dispatch({
        type: "ADD_ACTIVITY",
        payload: { category, title },
      });
    },
    renameActivity: (id: string, title: string) => {
      dispatch({
        type: "RENAME_ACTIVITY",
        payload: { id, title },
      });
    },
    deleteActivity: (id: string) => {
      dispatch({
        type: "DELETE_ACTIVITY",
        payload: { id },
      });
    },
    resetActivityTimer: (id: string) => {
      dispatch({
        type: "RESET_ACTIVITY_TIMER",
        payload: { id },
      });
    },
    updateActivityPosition: (id: string, x: number, y: number) => {
      dispatch({
        type: "UPDATE_ACTIVITY_POSITION",
        payload: { id, x, y },
      });
    },
    updateActivityImage: (id: string, imageUrl: string | null) => {
      dispatch({
        type: "UPDATE_ACTIVITY_IMAGE",
        payload: { id, imageUrl },
      });
    },
  };
}

export function ActivitiesProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(activitiesReducer, undefined, loadInitialState);

  const actions = useMemo(() => createActions(dispatch), [dispatch]);

  useEffect(() => {
    if (!canUseStorage) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      ...actions,
    }),
    [actions, state],
  );

  return <ActivitiesContext.Provider value={value}>{children}</ActivitiesContext.Provider>;
}

export function useActivitiesStore() {
  const context = useContext(ActivitiesContext);

  if (!context) {
    throw new Error("useActivitiesStore must be used within ActivitiesProvider");
  }

  return context;
}

export function useActivitiesByCategory(category: ActivityCategory) {
  const { state } = useActivitiesStore();

  return useMemo(
    () => state.activities.filter((activity) => activity.category === category),
    [category, state.activities],
  );
}
