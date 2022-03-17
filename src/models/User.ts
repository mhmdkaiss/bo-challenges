export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  PREMIUM = 'PREMIUM',
  NONE = 'NONE',
}

export interface UserSettings {
  currency?: string;
  lang?: string;
  countryCode?: string;
  hasOptedIn?: boolean;
  isAdmin?: boolean;
  hasPassword?: boolean;
}

export interface UserIdentity {
  id?: string;
  firstName?: string;
  lastName?: string;
  birthday?: string | Date | null;
  email?: string;
  nickname?: string;
  code?: string;
  phoneNumber?: string;
  userTag?: string;
}

export interface UserAccount {
  confirmation: string;
  premiumUntil: string | Date | null;
  subscriptionStatus: SubscriptionStatus | string;
  createdAt: string | Date;
  isPremium: boolean;
  registrationOrigin: string;
}

export interface User {
  identity: UserIdentity;
  settings?: UserSettings;
  account?: UserAccount;
  gameInfo?: {
    favoriteGames?: Array<FavoriteGame | string>;
    favoritePlatforms?: Array<string>;
  };
}

export interface FavoriteGame {
  id: string;
  name: string;
}
