import { Partner } from '@cactus/srm-component';
import axios, { AxiosError } from 'axios';
import { Country, ExtendedCountryGroup } from 'src/models/ContryGroup';
import { Lang } from '../models/Lang';
import { Organization } from '../models/Organization';
import { LocalStorageService, StringValueKeys } from './local-storage.service';

export class NCCommonService {
    private static baseUrl: string = String(process.env.REACT_APP_COMMON_URL);

    public static getCountryGroups = async (
        limit: number = 10,
        page: number = 0,
    ): Promise<Array<ExtendedCountryGroup>> => {
        let res;
        const params : any = {};
        params.limit = limit;
        params.page = page;
        try {
            res = (
                await axios.get(
                    `${NCCommonService.baseUrl}/groupcountry`,
                    {
                        headers: {
                            'x-access-token': LocalStorageService.getToken(),
                        },
                        params: params,
                    },
                )
            ).data.docs;
        } catch (e) {
            throw (e as AxiosError).response;
        }
        return res;
    };

    public static getAllCountries = async (): Promise<Array<Country>> => {
        let res;
        try {
            res = (
                await axios.get(`${NCCommonService.baseUrl}/countries/all`, {
                    headers: {
                        'x-access-token': LocalStorageService.getToken(),
                    },
                })
            ).data.docs;
        } catch (e) {
            throw (e as AxiosError).response;
        }
        return res;
    };

    public static getAllOrganisation = async (): Promise<
        Array<Organization>
    > => {
        let res;
        try {
            res = (
                await axios.get(`${NCCommonService.baseUrl}/organisation/all`, {
                    headers: {
                        'x-access-token': LocalStorageService.getToken(),
                    },
                })
            ).data;
        } catch (e) {
            throw (e as AxiosError).response;
        }
        return res;
    };

    static async getAllPartners(): Promise<Array<Partner>> {
        try {
            const res = await axios.get(
                `${NCCommonService.baseUrl}/partner/all`, {
                    headers: {
                        'x-access-token': LocalStorageService.getToken(),
                    }
                }
            );
            return res.data;
        } catch (e) {
            throw (e as AxiosError).response;
        }
    }
    public static getLangs = async (): Promise<Array<Lang>> => {
        let res;

        try {
            res = (
                await axios.get(
                    `${NCCommonService.baseUrl}/languages?active=true`,
                    {
                        headers: {
                            'x-access-token': LocalStorageService.getStringValue(StringValueKeys.AccessToken),
                        },
                    },
                )
            ).data.docs;
        } catch (e) {
            throw e.response;
        }

        return res;
    };
}

