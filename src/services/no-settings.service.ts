import axios, { AxiosError } from 'axios';
import { List } from '../models/ApiCommon';
import { Rule } from '../models/Setting';
import { LocalStorageService } from './local-storage.service';

export interface SLK {
    id: string;
    route: string;
    game: string;
}

export class NoSettingsService {
    private static baseUrl: string = String(
        process.env.REACT_APP_NS_URL,
    );

    static async getRulesByGame(
        gameId: string,
        lastElement?: SLK,
    ): Promise<List<Rule, SLK>> {
        let res;
        try {
            res = (
                await axios.get(
                    `${NoSettingsService.baseUrl}/admin/games/${gameId}/rules`,
                    {
                        headers: {
                            'x-access-token': LocalStorageService.getToken(),
                        },
                        params: lastElement ? { id: lastElement.id } : undefined,
                    },
                )
            ).data;
        } catch (e) {
            throw (e as AxiosError).response;
        }

        if (!res.list) {
            throw Error;
        }

        return res;
    }
}
