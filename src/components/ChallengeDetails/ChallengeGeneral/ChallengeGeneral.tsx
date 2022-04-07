import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CircularProgress } from '@material-ui/core';
import {
    Button,
    DatePicker,
    NCCard,
    NCChip,
    NCInput,
    NCMultiSearch,
    NCPreviewSearch,
} from '@cactus/srm-component';
import { Organization } from '../../../models/Organization';
import './ChallengeGeneral.scss';
import { Challenge, NoChallenge } from 'src/models/Challenge';
import { Country, CountryGroup, ExtendedCountryGroup } from 'src/models/ContryGroup';
import { NCHService } from '../../../services/nch.service';
import ContextStore from '../../../store';
import moment from 'moment';
interface ChallengeGeneralProps {
    challenge?: Challenge;
    triggerFunction?: () => void;
}

export const ChallengeGeneral: React.FunctionComponent<ChallengeGeneralProps> =
    (props : ChallengeGeneralProps) => {
        const countries = ContextStore.useStoreState((a) => a.countries);
        const countryGroups = ContextStore.useStoreState((a) => a.countryGroups);
        const setCountryGroups = ContextStore.useStoreActions((a) => a.setCountryGroups);
        const organizations = ContextStore.useStoreState((a) => a.organizations);
        const setChallenge = ContextStore.useStoreActions((a) => a.setChallenge);
        const [ selectedOrganization, setSelectedOrganization ] = useState< Organization >();
        const [ fullList, setFullList ] = useState< Array<ExtendedCountryGroup | Country> >([]);
        const [ selectedRegions, setSelectedRegions ] = useState<Array<string>>([]);
        const [ memorizeRegions, setMemorizeRegions ] = useState<Array<string>>([]);
        const [ challengeModified, setChallengeModified ] = useState<Challenge | NoChallenge>();
        const [ modified, setModified ] = useState<boolean>(false);
        const [ isLoading, setIsLoading ] = useState<boolean>(false);
        const emptyChallenge = {
            startDate: '',
            endDate: '',
            featured: false,
            name: '',
            organization: '',
            type: 0
        };

        useEffect(() => {
            if (props.challenge) {
                setSelectedOrganization(organizations.find((o) => o.domain === props?.challenge?.organization));
                setChallengeModified(props.challenge);
                setCountryGroups(
                    countryGroups.map((group) =>
                        Object.assign({ iso2: group.value }, group),
                    ),
                );
                if (props.challenge.regions) {
                    setSelectedRegions([...new Set([...props.challenge.regions])]);
                    setMemorizeRegions([...new Set([...props.challenge.regions])]);
                }
            } else {
                setChallengeModified(emptyChallenge);
            }
        }, [props.challenge]);

        useEffect(() => {
            setFullList([ ...countryGroups, ...countries ]);
        }, [ countryGroups, countries ]);

        useEffect(() => {
            if (props.challenge) {
                setModified(
                    JSON.stringify(challengeModified) !== JSON.stringify(props.challenge) ||
                        JSON.stringify(selectedRegions) !== JSON.stringify(memorizeRegions),
                );
            } else {
                setModified(JSON.stringify(challengeModified) !== JSON.stringify(emptyChallenge));
            }
        }, [ challengeModified, selectedRegions ]);

        const updateChallenge = async () => {
            if (props.challenge) {
                setIsLoading(true);
                await updateGeneral();
                const currentRegions = fullList
                    .filter((item) => selectedRegions.includes(item.iso2))
                    .map((item) => {
                        const group = item as ExtendedCountryGroup;
                        if (group.countries && group.countries.length) {
                            return [ ...group.countries, group.iso2 ];
                        } else {
                            return group.iso2;
                        }
                    })
                    .flat()
                    .filter((value, index, self) => self.indexOf(value) === index);
                await updateRegions(currentRegions);
                setSelectedRegions([...currentRegions]);
                setIsLoading(false);
            } else {
                if (challengeModified && props.triggerFunction) {
                    try {
                        await NCHService.createNewChallenge(challengeModified);
                        props.triggerFunction();
                        toast.success('successfully created a new challenge');
                    } catch (e) {
                        toast.error('An error occured during creating new challenge');
                    }
                }
            }
        };

        const updateGeneral = async () => {
            try {
                const res = await NCHService.updateChallengeGeneral(challengeModified as Challenge);
                setChallenge(res);
                toast.success('successfully updated challenge');
            } catch (e) {
                toast.error('An error occured during challenge general update');
                setIsLoading(false);
                return;
            }
            return true;
        };

        const updateRegions = async (list: Array<string>) => {
            try {
                await NCHService.updateChallengeRegions( challengeModified as Challenge, list );
            } catch (e) {
                toast.error('An error occured during challenge regions update');
                setIsLoading(false);
                return;
            }
        };

        return (
            <>
                {challengeModified && organizations.length > 0 && (
                    <NCCard>
                        <div className="nc-challenge-general">
                            <div className="mb-5">
                                <NCInput
                                    label="Title of challenge"
                                    value={props.challenge ? (challengeModified as Challenge).i18n.title : challengeModified.name}
                                    onChange={(e) => {
                                        props.challenge ? setChallengeModified( Object.assign( { ...challengeModified }, { i18n: { title: e } } ) ) :
                                            setChallengeModified(Object.assign( { ...challengeModified }, { name: e } ));
                                    }}
                                />
                            </div>
                            <div className="mb-5">
                                <div className="mb-2">
                                    Organization (default: Nicecactus)
                                </div>
                                <NCPreviewSearch
                                    searchFields={{ search: { label: 'Label1' } }}
                                    placeHolder={selectedOrganization ? selectedOrganization.name : ''}
                                    list={organizations}
                                    displayParam="name"
                                    hideStore={false}
                                    onSelection={(e) => {
                                        setSelectedOrganization(e);
                                        setChallengeModified(Object.assign( { ...challengeModified }, { organization: e.domain } ));
                                    }}
                                    value={selectedOrganization ? selectedOrganization.name : undefined}
                                />
                            </div>
                            {
                                <div>
                                    <div className="d-flex mb-5">
                                        <div className="mr-3">
                                            <DatePicker
                                                label="Registration start date"
                                                initialDate={challengeModified.startDate}
                                                dateChanged={(e) => {
                                                    setChallengeModified(Object.assign( { ...challengeModified }, { startDate: moment(e).toISOString() } ));
                                                }}
                                            ></DatePicker>
                                        </div>
                                        <div>
                                            <DatePicker
                                                label="Registration end date"
                                                initialDate={challengeModified.endDate}
                                                dateChanged={(e) => {
                                                    setChallengeModified(Object.assign( { ...challengeModified }, { endDate: moment(e).toISOString() } ));
                                                }}
                                            ></DatePicker>
                                        </div>
                                    </div>
                                </div>
                            }

                            <div className="mb-4 pb-2">
                                <div className="mb-2">Featured</div>
                                <div className="d-flex">
                                    <NCChip
                                        label="None"
                                        checked={!challengeModified.featured}
                                        onChange={() => setChallengeModified({ ...challengeModified, featured: false })}
                                    />
                                    <NCChip
                                        label="Main event"
                                        checked={challengeModified.featured}
                                        onChange={() => setChallengeModified({ ...challengeModified, featured: true, })}
                                    />
                                </div>
                            </div>

                            {
                                props.challenge ?
                                    <div>
                                        <div className="mb-2">
                                            Whitelisted zones and countries
                                        </div>
                                        <NCMultiSearch
                                            searchFields={{ search: { label: 'Label1' } }}
                                            list={fullList}
                                            hideSelected={true}
                                            displayParam="iso2"
                                            compareParam="iso2"
                                            selected={ selectedRegions }
                                            onSelection={(selected) => {
                                                const item = fullList.find((item) => item.iso2 === selected.iso2);
                                                if (item) {
                                                    selectedRegions.push(item.iso2);
                                                    setSelectedRegions([...selectedRegions]);
                                                }
                                            }}
                                            onDelete={(deleted) => {
                                                const groupsToRemove = fullList
                                                    .filter( (group) =>
                                                        selectedRegions.includes(group.iso2) &&
                                                        ((group as CountryGroup).countries || []).includes(deleted.iso2))
                                                    .map((group) => group.iso2);
                                                setSelectedRegions([...selectedRegions.filter(iso2 => iso2 !== deleted.iso2 && !groupsToRemove.includes(iso2))]);
                                            }}
                                            hideStore={false}
                                        />
                                    </div>
                                    : null
                            }

                            {isLoading ? (
                                <div className="text-center my-4">
                                    <CircularProgress />
                                </div>
                            ) : (
                                <Button
                                    disabled={!modified}
                                    styleClass="limited mx-auto mt-4"
                                    label="Save"
                                    setClick={() => updateChallenge() }
                                />
                            )}
                        </div>
                    </NCCard>
                )}
            </>
        );
    };
