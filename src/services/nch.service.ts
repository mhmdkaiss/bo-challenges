import axios from 'axios';
import { LocalStorageService, StringValueKeys } from './local-storage.service';
import { Challenge, ChallengeParticipation, ChallengesLK, NoChallenge, ChallengeReward } from '../models/Challenge';
import { List } from 'src/models/ApiCommon';
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
                            'x-access-token': LocalStorageService.getStringValue(StringValueKeys.AccessToken),
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
                            'x-access-token': LocalStorageService.getStringValue(StringValueKeys.AccessToken),
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
                            'x-access-token': LocalStorageService.getStringValue(StringValueKeys.AccessToken),
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
                            'x-access-token': LocalStorageService.getStringValue(StringValueKeys.AccessToken),
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
                        'x-access-token': LocalStorageService.getStringValue(StringValueKeys.AccessToken),
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
}

