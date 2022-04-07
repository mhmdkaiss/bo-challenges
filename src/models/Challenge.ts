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
}

export interface NoChallenge {
    featured: boolean,
    name: string,
    organization: string,
    startDate: string,
    endDate: string,
    type: number,
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
