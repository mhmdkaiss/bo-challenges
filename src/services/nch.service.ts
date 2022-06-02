import { NCInputMultipleKeys } from '@cactus/srm-component/dist/src/components/NCInputMultiple/NCInputMultiple';
import axios from 'axios';
import { List } from 'src/models/ApiCommon';
import { Challenge, ChallengeI18n, ChallengeParticipation, ChallengeResult, ChallengeReward, ChallengesLK, NoChallenge } from '../models/Challenge';
import { LocalStorageService, StringValueKeys } from './local-storage.service';

export interface ChallengeLeaderBoard {
    userId: string;
    score: number;
}
export class NCHService {
    private static baseUrl: string = String(process.env.REACT_APP_NCH_URL);

    static async getChallenge(
        ChallengeId: string,
    ): Promise<Challenge> {
        let res;
        const params : any = {};
        try {
            res = (
                await axios.get(
                    `${NCHService.baseUrl}/admin/challenges/${ChallengeId}`,
                    {
                        method: 'GET',
                        headers: {
                            'x-access-token': LocalStorageService.getToken(),
                        },
                        params: params,
                    },
                )
            ).data;
        } catch (e) {
            throw e.response;
        }

        return res;
    }

    static async getChallenges(
        lastKey?: ChallengesLK,
        startDate?: string,
        endDate?: string,
    ): Promise<List<Challenge, ChallengesLK>> {
        let res;
        const params : any = {};
        if (lastKey) {
            params.id = lastKey.id;
            params.date = lastKey.date;
        }
        if (startDate){
            params.dateFrom = startDate;
        }
        if (endDate){
            params.dateTo = endDate;
        }
        try {
            res = (
                await axios.get(
                    `${NCHService.baseUrl}/admin/challenges`,
                    {
                        method: 'GET',
                        headers: {
                            'x-access-token': LocalStorageService.getToken(),
                        },
                        params: params,
                    },
                )
            ).data;
        } catch (e) {
            throw e.response;
        }

        return res;
    }

    static async getParticipantsCount(
        challengeId: string,
    ): Promise<ChallengeParticipation> {
        let res;

        try {
            res = (
                await axios.get(
                    `${NCHService.baseUrl}/challenges/${challengeId}/participation`,
                    {
                        method: 'GET',
                        headers: {
                            'x-access-token': LocalStorageService.getToken(),
                        },
                    }
                )
            ).data;
        } catch (e) {
            throw e.response;
        }
        return res;
    }

    static async updateChallengeGeneral(
        challenge: Challenge,
    ): Promise<Challenge> {
        let res;
        try {
            res = (
                await axios.patch(
                    `${NCHService.baseUrl}/admin/challenges/${challenge.id}/general`,
                    {
                        name: challenge.i18n.title,
                        endDate: challenge.endDate,
                        featured: challenge.featured,
                        organization: challenge.organization,
                        startDate: challenge.startDate,
                        type: challenge.type
                    },
                    {
                        headers: {
                            'x-access-token': LocalStorageService.getToken(),
                        },
                    },
                )
            ).data;
        } catch (e) {
            throw e.response;
        }
        return res;
    }

    static async updateChallengeCommunity(
        challenge: Challenge,
    ): Promise<Challenge> {
        let res;
        try {
            res = (
                await axios.patch(
                    `${NCHService.baseUrl}/admin/challenges/${challenge.id}/community`,
                    {
                        color: challenge.color,
                        discord: challenge.discord,
                        partners: challenge.partners,
                        twitch: challenge.twitch,
                    },
                    {
                        headers: {
                            'x-access-token': LocalStorageService.getStringValue(StringValueKeys.AccessToken),
                        },
                    },
                )
            ).data;
        } catch (e) {
            throw e.response;
        }
        return res;
    }

    static async updateChallengeSettings(
        challengeId: string,
        gameSlug: string,
        mission: string,
        type: number,
        requirements: Array<string>,
        platform?: string,
        rules?: string,
        sponsors?: Array<NCInputMultipleKeys>,
    ): Promise<boolean> {
        try {
            await axios.patch(
                `${NCHService.baseUrl}/admin/challenges/${challengeId}/settings`,
                {
                    gameSlug,
                    mission,
                    platform,
                    requirements,
                    rules,
                    sponsors,
                    type
                },
                {
                    headers: {
                        'x-access-token': LocalStorageService.getToken(),
                    },
                },
            );
        } catch (e) {
            throw e.response;
        }

        return true;
    }

    static async createNewChallenge(
        challenge: NoChallenge,
    ): Promise<Challenge> {
        let res;
        try {
            res = (
                await axios.post(
                    `${NCHService.baseUrl}/admin/challenges`,
                    {
                        name: challenge.name,
                        endDate: challenge.endDate,
                        featured: challenge.featured,
                        organization: challenge.organization,
                        startDate: challenge.startDate,
                        type: challenge.type
                    },
                    {
                        headers: {
                            'x-access-token': LocalStorageService.getToken(),
                        },
                    },
                )
            ).data;
        } catch (e) {
            throw e.response;
        }
        return res;
    }

    static async updateChallengeRegions(
        challenge: Challenge,
        countries: Array<string>,
    ): Promise<void> {
        try {
            (
                await axios.put(
                    `${NCHService.baseUrl}/admin/challenges/${challenge.id}/regionalization`,
                    {
                        countries,
                        regions: countries
                    },
                    {
                        headers: {
                            'x-access-token': LocalStorageService.getToken(),
                        },
                    },
                )
            ).data;
        } catch (e) {
            throw e.response;
        }
        return;
    }

    static async patchRewards(challengeId: string, payload: { rewards: {[key: number]: Array<ChallengeReward>} }): Promise<void> {
        if (!challengeId) {
            throw Error;
        }
        try {
            await axios.patch(
                `${NCHService.baseUrl}/admin/challenges/${challengeId}/rewards`,
                payload,
                {
                    headers: {
                        'x-access-token': LocalStorageService.getToken(),
                    },
                },
            );
        } catch (e) {
            if (axios.isAxiosError(e)) {
                throw e.response;
            }
            throw e;
        }
    }
    static async getParticipants(
        challengeId: string,
    ): Promise<Array<ChallengeResult>> {
        let res;

        try {
            res = (
                await axios.get(
                    `${NCHService.baseUrl}/admin/challenges/${challengeId}/results`,
                    {
                        method: 'GET',
                        headers: {
                            'x-access-token': LocalStorageService.getToken(),
                        },
                    }
                )
            ).data;
        } catch (e) {
            throw e.response;
        }
        return res.list;
    }

    static async updateParticipants(
        challenge: Challenge,
        participants: Array<ChallengeLeaderBoard>
    ): Promise<void> {
        try {
            await axios.patch(
                `${NCHService.baseUrl}/admin/challenges/${challenge.id}/results/scores`,
                participants,
                {
                    headers: {
                        'x-access-token': LocalStorageService.getToken(),
                    },
                },
            );
        } catch (e) {
            if (axios.isAxiosError(e)) {
                throw e.response;
            }
            throw e;
        }
    }

    static async updateChallengeI18n(
        challengeId: string,
        challenge: { [key: string]: ChallengeI18n },
    ): Promise<boolean> {
        try {
            await axios.patch(
                `${NCHService.baseUrl}/admin/challenges/${challengeId}/languages`,
                {
                    languages: challenge,
                },
                {
                    headers: {
                        'x-access-token': LocalStorageService.getStringValue(StringValueKeys.AccessToken),
                    },
                },
            );
            return true;
        } catch (e) {
            if (axios.isAxiosError(e)) {
                throw e.response;
            }
            throw e;
        }
    }
}

