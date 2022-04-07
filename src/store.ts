import { action, Action, createContextStore, thunk, Thunk } from 'easy-peasy';
import { Challenge } from './models/Challenge';
import { Country, ExtendedCountryGroup } from './models/ContryGroup';
import { Organization } from './models/Organization';
import { NCCommonService } from './services/ncCommon.service';
import { NCHService } from './services/nch.service';

export interface ContextStoreModel {
    challenge: Challenge | null;
    setChallenge: Action<ContextStoreModel, Challenge | null>;
    fetchChallenge: Thunk<ContextStoreModel, string, undefined, ContextStoreModel>;
    organizations: Array<Organization>;
    setOrganizations: Action<ContextStoreModel, Array<Organization>>;
    fechOrganizations: Thunk<ContextStoreModel>;
    countryGroups: Array<ExtendedCountryGroup>;
    setCountryGroups: Action<ContextStoreModel, Array<ExtendedCountryGroup>>;
    fechCountryGroups: Thunk<ContextStoreModel>;
    countries: Array<Country>;
    setCountries: Action<ContextStoreModel, Array<Country>>;
    fechCountries: Thunk<ContextStoreModel>;
}

const ContextStore = createContextStore<ContextStoreModel>(
    {
        challenge: null,
        setChallenge: action((state, challenge) => {
            state.challenge = challenge;
        }),
        fetchChallenge: thunk(async (actions, challengeId) => {
            const tnt = await NCHService.getChallenge(challengeId);
            actions.setChallenge(tnt);
        }),
        organizations: [],
        setOrganizations: action((state, organizations) => {
            state.organizations = organizations;
        }),
        fechOrganizations: thunk(async (actions) => {
            const res = await NCCommonService.getAllOrganisation();
            actions.setOrganizations(res);
        }),
        countryGroups: [],
        setCountryGroups: action((state, countryGroups) => {
            state.countryGroups = countryGroups;
        }),
        fechCountryGroups: thunk(async (actions) => {
            const res = await NCCommonService.getCountryGroups();
            actions.setCountryGroups(res);
        }),
        countries: [],
        setCountries: action((state, countries) => {
            state.countries = countries;
        }),
        fechCountries: thunk(async (actions) => {
            const res = await NCCommonService.getAllCountries();
            actions.setCountries(res);
        })
    },
    {
        name: 'bo-challenges'
    }
);

export default ContextStore;
