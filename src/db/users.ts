// src/db/users.ts

export interface ProjectItem {
  id: string;
  title: string;
  client: string;
  category: string;
  year: string;
  desc: string;
  image: string;
  featured?: boolean;
}

export interface PressMention {
  publication: string;
  title: string;
  link: string;
  tag: string;
  excerpt?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  email: string;
  token: string;
  pin: string;
  status: string;
}

export interface ExpenseRecord {
  id: string;
  merchant: string;
  amountKes: number;
  category: string;
  date: string;
}

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
  projects: ProjectItem[];
  pressFeatures: PressMention[];
  clients: ClientRecord[];
  expenses: ExpenseRecord[];
}

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
    partners: ['iHUB / ccHUB', 'UNDP Timbuktoo', 'Mastercard Foundation', 'Safaricom Spark', 'BURN Manufacturing', 'Delta40 Studio', 'GrowthAfrica', 'HEVA Fund'],
    projects: [
      {
        id: '01',
        title: 'UNDP Timbuktoo & EdTech Fellowship',
        client: 'iHUB / ccHUB',
        category: 'Ecosystem Storytelling',
        year: '2023 - 2026',
        desc: 'Documenting founders, accelerator cohorts, and international ecosystem milestones across Africa.',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        featured: true,
      },
      {
        id: '02',
        title: 'Clean Energy Impact Series',
        client: 'BURN Manufacturing USA',
        category: 'Brand Films',
        year: '2025 - Present',
        desc: 'Impact video production, photography, and digital web UX improvements across African clean energy markets.',
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        featured: false,
      },
      {
        id: '03',
        title: 'Circular Economy & Climate Tech Summits',
        client: 'Delta40 Venture Studio',
        category: 'Venture Studio',
        year: '2025',
        desc: 'Capturing climate-tech founders across energy, mobility, and circular economy scale programs.',
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
        featured: false,
      },
    ],
    pressFeatures: [
      { publication: 'Friedrich-Ebert-Stiftung (FES Kenya)', title: 'Social Justice & Democratic Governance', link: 'https://kenya.fes.de/', tag: 'Foundation Credits' },
      { publication: 'Capital FM Kenya', title: 'Microsoft Imagine Cup National Winner', link: 'https://www.capitalfm.co.ke/campus/', tag: 'Global Press' },
      { publication: 'HEVA Fund Official Press', title: 'Uhuru Market Brand Identity', link: 'https://www.hevafund.com/', tag: 'Design Feature' },
    ],
    clients: [
      { id: 'c1', name: 'UNDP Timbuktoo & ccHUB', email: 'timbuktoo@undp.org', token: 'xK9_mQ2pL7v', pin: '4821', status: 'IN_REVIEW' },
      { id: 'c2', name: 'BURN Manufacturing USA', email: 'media@burnmfg.com', token: 'burn_impact_2025', pin: '1234', status: 'FINAL_DELIVERY' },
    ],
    expenses: [],
  },
  demo: {
    id: 'demo',
    name: 'Demo Creator', // 💡 Renamed from Alex Mercer to Demo Creator
    handle: 'DEMO_CREATOR',
    title: 'Lead Visual Director',
    email: 'demo@creativestudio.com',
    phone: '+254 700 000 000',
    location: 'Nairobi, Kenya',
    kraPin: 'P000000000X',
    passcode: 'demo2026',
    bio: 'Lead visual director specializing in commercial photography, brand films, and motion design.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    paymentDetails: {
      bankName: 'Demo Bank Kenya',
      accountName: 'Demo Creator Account',
      accountNumber: '1234567890',
      branch: 'Westlands',
      mpesaPaybill: 'Paybill 123456',
    },
    socials: {
      linkedin: '',
      instagram: '',
      youtube: '',
      linktree: '',
    },
    partners: [],
    projects: [],
    pressFeatures: [],
    clients: [],
    expenses: [],
  },
};