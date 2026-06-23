import Dexie, { type Table } from 'dexie';
import type { Job, Photo, Measurement } from '../types/job.types';
import type { Client } from '../types/client.types';
import type { CompanySettings } from '../types/settings.types';

export class BidMateDB extends Dexie {
  jobs!: Table<Job>;
  clients!: Table<Client>;
  photos!: Table<Photo>;
  measurements!: Table<Measurement>;
  settings!: Table<CompanySettings>;

  constructor() {
    super('BidMateProDB');
    this.version(1).stores({
      jobs: 'id, jobNumber, status, categoryId, clientId, createdAt, estimateTotal',
      clients: 'id, name, email, phone, createdAt',
      photos: 'id, jobId, phase, timestamp',
      measurements: 'id, jobId, type, createdAt',
      settings: 'id',
    });
  }
}

export const db = new BidMateDB();
