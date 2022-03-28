import axios from 'axios';
import { LocalStorageService, StringValueKeys } from './local-storage.service';
import { Challenge, ChallengeParticipation, ChallengesLK } from '../models/Challenge';
import { List } from 'src/models/ApiCommon';
export class NCHService {
    private static baseUrl: string = String(process.env.REACT_APP_NCH_URL);
    private static publicUrl: string = String(
        process.env.REACT_APP_S3_BUCKET + '/nch',
    );

    static async getChallenge(
        ChallengeId?: string,
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
            params.dateFrom = `${startDate}:00Z`;
        }
        if (endDate){
            params.dateTo = `${endDate}:00Z`;
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
}

