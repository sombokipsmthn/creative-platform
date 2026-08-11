// src/db/users.ts

export interface UserAccount {
  id: string;
  name: string;
  handle: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  kraPin: string;
  passcode: string;
  bio: string;
  avatarUrl: string;
  paymentDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    mpesaPaybill: string;
  };
  socials: {
    linkedin: string;
    instagram: string;
    youtube: string;
    linktree: string;
  };
  partners: string[];
  projects: any[];
  pressFeatures: any[];
  clients: any[];
  expenses: any[];
}

// 💡 Pre-seeded Database Users (Somboriot & Alex)
export const initialUsersDatabase: Record<string, UserAccount> = {
  sombo: {
    id: 'sombo',
    name: 'Somboriot Kipchilat',
    handle: 'KIPSMTHN',
    title: 'Creative Director & Ecosystem Storytelling Specialist',
    email: 'somboriot@gmail.com',
    phone: '+254 722 145 776',
    location: 'Nairobi, Kenya',
    kraPin: 'A012345678X',
    passcode: 'sombo2026',
    bio: 'Creative director and visual storytelling specialist documenting African startup ecosystems and clean-tech innovation.',
    avatarUrl: 'https://unavatar.io/linkedin/sombo09?fallback=https://github.com/sombokipsmthn.png',
    paymentDetails: {
      bankName: 'Standard Chartered Bank Kenya',
      accountName: 'Somboriot Kipchilat / KIPSMTHN Studio',
      accountNumber: '010203040506',
      branch: 'Westlands Branch',
      mpesaPaybill: 'Paybill 247247 (Acc: KIPSMTHN)',
    },
    socials: {
      linkedin: 'https://www.linkedin.com/in/sombo09/',
      instagram: 'https://www.instagram.com/sombo_kipsmthn/',
      youtube: 'https://www.youtube.com/@kraftdigital7749',
      linktree: 'https://linktr.ee/kipsmthn',
    },
    partners: [], // Stripped
    projects: [], // Stripped
    pressFeatures: [], // Stripped
    clients: [], // Stripped
    expenses: [], // Stripped
  },
  alex: {
    id: 'alex',
    name: 'Alex Mercer',
    handle: 'ALEX_MERCER',
    title: 'Lead Visual Director',
    email: 'alex@creativestudio.com',
    phone: '+254 700 000 000',
    location: 'Nairobi, Kenya',
    kraPin: 'P000000000X',
    passcode: 'demo2026',
    bio: 'Lead visual director specializing in commercial photography, brand films, and motion design.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    paymentDetails: {
      bankName: 'Demo Bank Kenya',
      accountName: 'Alex Mercer',
      accountNumber: '1234567890',
      branch: 'Westlands',
      mpesaPaybill: 'Paybill 123456',
    },
    socials: {
      linkedin: 'https://linkedin.com/in/democreator',
      instagram: 'https://instagram.com/democreator',
      youtube: 'https://youtube.com/@democreator',
      linktree: 'https://linktr.ee/democreator',
    },
    partners: [], // Stripped
    projects: [], // Stripped
    pressFeatures: [], // Stripped
    clients: [], // Stripped
    expenses: [], // Stripped
  },
};