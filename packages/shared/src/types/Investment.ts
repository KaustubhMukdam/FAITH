export interface InvestmentContent {
  id: string;
  title: string;
  description: string;
  content: string;
  category: InvestmentCategory;
  readTimeMinutes: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum InvestmentCategory {
  BASICS = 'BASICS',
  STOCKS = 'STOCKS',
  MUTUAL_FUNDS = 'MUTUAL_FUNDS',
  INDEX_FUNDS = 'INDEX_FUNDS',
  BONDS = 'BONDS',
  REAL_ESTATE = 'REAL_ESTATE',
  GOLD = 'GOLD',
  TAX_SAVING = 'TAX_SAVING',
  RETIREMENT = 'RETIREMENT',
}

export interface Advisor {
  id: string;
  name: string;
  sebiRegistrationNumber: string;
  email: string;
  phone: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  profileUrl?: string;
}
