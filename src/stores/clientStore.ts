import { create } from 'zustand';
import type { Client } from '../types/client.types';
import { db } from '../db/database';
import { newId } from '../utils/ids';

interface ClientStore {
  clients: Client[];
  isLoading: boolean;
  loadClients: () => Promise<void>;
  createClient: (data: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
}

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  isLoading: false,

  loadClients: async () => {
    set({ isLoading: true });
    const clients = await db.clients.orderBy('name').toArray();
    set({ clients, isLoading: false });
  },

  createClient: async (data) => {
    const now = new Date().toISOString();
    const client: Client = {
      id: newId(),
      name: data.name ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      billingAddress: data.billingAddress,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
    await db.clients.put(client);
    set({ clients: [...get().clients, client].sort((a, b) => a.name.localeCompare(b.name)) });
    return client;
  },

  updateClient: async (id, data) => {
    const current = get().clients.find((c) => c.id === id);
    if (!current) return;
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    await db.clients.put(updated);
    set({
      clients: get()
        .clients.map((c) => (c.id === id ? updated : c))
        .sort((a, b) => a.name.localeCompare(b.name)),
    });
  },

  deleteClient: async (id) => {
    await db.clients.delete(id);
    set({ clients: get().clients.filter((c) => c.id !== id) });
  },

  getClient: (id) => get().clients.find((c) => c.id === id),
}));
