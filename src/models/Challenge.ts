import { TranslatedString } from './TranslatedString';

export interface Challenge {
    color: string,
    countries: Array<string>,
    discord: Array<string>,
    estimated: boolean,
    featured: boolean,
    gameSlug: string,
    name: string,
    status: boolean,
    partners: Array<string>,
    route: string,
    id: string,
    isAvailableInRegion: boolean,
    i18n: TranslatedString;
    description: TranslatedString,
    organization: string,
    participation: number,
    platform: string,
    startDate: string,
    endDate: string,
    regions: Array<string>,
    twitch: string,
    type: number,
    rewards: { [key: number]: Array<ChallengeReward> },
}

export interface NoChallenge {
    featured: boolean,
    name: string,
    organization: string,
    startDate: string,
    endDate: string,
    type: number,
    gameSlug: string,
    rewards: { [key: number]: Array<ChallengeReward> },
}
export interface ChallengesLK {
    id: string;
    date: Date;
}

export interface ChallengeParticipation {
    participation: number;
}

export enum ChallengeStatus {
    Scheduled = 0,
    Started = 1,
    Ended = 2,
}

// Challenge Type List
export enum Type {
    Photo = 0,
}

export interface ChallengeResult {
    date: string;
    id: string;
    media: string;
    route: string;
    score: number;
    username: string;
}

export interface ChallengeReward {
    cur: string;
    kind: RewardKind;
    value: number;
    partner?: string;
    title?: string;
    image?: string;
    giftId?: string;
}

export enum RewardKind {
    CASH = 'cash',
    GIFT = 'gift',
    COIN = 'coin',
}
