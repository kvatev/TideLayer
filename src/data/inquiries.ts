// Simple in‑memory store for contact inquiries (for demo purposes only)
// In a real project replace this with a database / Supabase / API endpoint.
export type Inquiry = {
  id: string;
  inquiryType: string;
  productPreselect?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  createdAt: string;
};

const inquiries: Inquiry[] = [];

export const addInquiry = (inquiry: Omit<Inquiry, 'id' | 'createdAt'>) => {
  const newInquiry = {
    ...inquiry,
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    createdAt: new Date().toISOString(),
  };
  inquiries.push(newInquiry);
  return newInquiry;
};

export const getInquiries = () => {
  // Return a copy sorted by newest first
  return [...inquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

