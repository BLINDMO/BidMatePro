export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  billingAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
