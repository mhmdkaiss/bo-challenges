import axios, { AxiosError } from 'axios';
import { Platform } from '../models/Platform';
import { GLK, List } from '../models/ApiCommon';
import { NoGame } from '@cactus/srm-component';
import { LocalStorageService } from './local-storage.service';

export class NoGameService {
    private static baseUrl: string = String(process.env.REACT_APP_NG_URL);

    static async getGames(
        lastElement?: GLK,
    ): Promise<List<NoGame, GLK>> {
        try {
            const res = (
                await axios.get(`${NoGameService.baseUrl}/public/games`, {
                    params: {
                        id: lastElement?.id,
                    },
                })
            ).data;

            if (!res.list) {
                throw Error;
            }
            return res;
        } catch (e) {
            throw (e as AxiosError).response;
        }
    }

    static async getPlatforms(): Promise<List<Platform, GLK>> {
        try {
            return (
                await axios.get(
                    `${NoGameService.baseUrl}/public/platforms`,
                    {
                        headers: {
                            'x-access-token': LocalStorageService.getToken(),
                        },
                    },
                )
            ).data;
        } catch (e) {
            throw (e as AxiosError).response;
        }
    }
}
