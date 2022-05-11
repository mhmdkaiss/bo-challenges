import { NCInputMultipleKeys } from '@cactus/srm-component';
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
    languages: { [key: string]: ChallengeI18n }
    i18n: ChallengeI18n,
    organization: string,
    participation: number,
    platform: string,
    startDate: string,
    endDate: string,
    sponsors: Array<NCInputMultipleKeys>,
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

export interface ChallengeI18n {
    title: string,
    id?: string,
    lang?: string,
    requirements?: Array<string>,
    description?: string,
    rules?: string,
    logo?: string,
    banner?: string,
    banner_og?: string,
    banner_promo?: string,
    banner_promo_button?: string,
    banner_promo_link?: string,
    banner_promo_text?: string,
}
