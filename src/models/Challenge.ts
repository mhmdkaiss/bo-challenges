import { TranslatedString } from './TranslatedString';

export interface Challenge {
    status: boolean,
    partner: string,
    route: string,
    id: string,
    i18n: TranslatedString;
    description: TranslatedString,
    organization: string,
    participation: number,
    startDate: string,
    endDate: string,
    featured: boolean,
    type: number,
    gameSlug: string
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
