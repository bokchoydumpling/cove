"use client";
import { create } from "zustand";
import type { User, MapFilter } from "@/lib/types";
import { SEED_USERS, SEED_CIRCLES, SEED_EVENTS } from "@/lib/seed";

interface AppState {
  currentUser: User;
  users: typeof SEED_USERS;
  circles: typeof SEED_CIRCLES;
  events: typeof SEED_EVENTS;
  mapFilter: MapFilter;
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  setMapFilter: (filter: Partial<MapFilter>) => void;
  updateCurrentlyInto: (text: string) => void;
}

const defaultFilter: MapFilter = {
  professions: [],
  interests: [],
  lookingFor: [],
  availability: [],
  distance: "Entire City",
};

export const useAppStore = create<AppState>((set) => ({
  currentUser: SEED_USERS[0],
  users: SEED_USERS,
  circles: SEED_CIRCLES,
  events: SEED_EVENTS,
  mapFilter: defaultFilter,
  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),
  setMapFilter: (filter) =>
    set((state) => ({ mapFilter: { ...state.mapFilter, ...filter } })),
  updateCurrentlyInto: (text) =>
    set((state) => ({
      currentUser: {
        ...state.currentUser,
        currentlyInto: text,
        currentlyIntoUpdatedAt: new Date().toISOString(),
      },
    })),
}));
