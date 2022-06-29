import {
    Button,
    ButtonTheme,
    ButtonType, GameList,
    Icon,
    IconType,
    NCCard,
    NCInput,
    NCInputMultiple,
    NCInputMultipleKeys,
    NCPreviewSearch, NoGame,
    PlatformList
} from '@cactus/srm-component';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Platform } from '../../../models/Platform';
import { Rule } from '../../../models/Setting';
import { NCHService } from '../../../services/nch.service';
import { NoGameService } from '../../../services/no-game.service';
import { NoSettingsService, SLK } from '../../../services/no-settings.service';
import ContextStore from '../../../store';
import './ChallengeSettings.scss';

interface ChallengeSettingsProps {
    challengeId: string;
}

export const ChallengeSettings: React.FunctionComponent<ChallengeSettingsProps> = (props :ChallengeSettingsProps) => {
    const challenge = ContextStore.useStoreState((s) => s.challenge);
    const [ gameSelectedId, setGameSelectedId ] = useState<string>( challenge?.gameSlug || '' );
    const [ platforms, setPlatforms ] = useState< Array<Platform>>([]);
    const [ checkedPlatforms, setCheckedPlatforms ] = useState<Array<Platform>>();
    const [ selectedPlatform, setSelectedPlatform ] = useState<string>('');
    // uncomment when we have more types and remove the line after it
    // const [ selectedType, setSelectedType ] = useState< number|undefined >(challenge?.type);
    const [ selectedType, setSelectedType ] = useState< number|undefined >(0);
    const [ gameChoosed, setGameChoosed ] = useState<NoGame>();
    const [ games, setGames ] = useState <Array<NoGame>>([]);
    const [ activeGame, setActiveGame ] = useState <number>(-1);
    const [ mission, setMission ] = useState <string>('');
    const [ itemsChanged, setItemsChanged ] = useState<boolean>(false);
    const [ requirements, setRequirements ] = useState<Array<NCInputMultipleKeys>>([{ name: '' }]);
    const [ sponsors, setSponsors ] = useState<Array<NCInputMultipleKeys>>([{ name: '' }]);
    const [ selectedRule, setSelectedRule ] = useState<Rule>();
    const [ rules, setRules ] = useState<Array<Rule>>([]);
    const [ lastKey, setLastKey ] = useState<SLK>();
    const [ pageNum, setPageNum ] = useState<number>(0);

    useEffect(() => {
        getPlatforms();
        getGameList();
    }, []);

    useEffect(() => {
        if (challenge) {
            fillChallengeSetting();
        }
    }, [ challenge, platforms ]);

    useEffect(() => {
        fillRules();
    }, [ challenge, rules ]);

    const fillRules = () => {
        if (challenge && rules.length > 0) {
            const tempRules = [...rules];
            tempRules.every((r) => {
                if (r.id === challenge.i18n.rules) {
                    setSelectedRule(r);
                    return false;
                } else {
                    setSelectedRule(Object.assign({}));
                    return true;
                }
            });
        }
    };

    const fillRequirements = () => {
        if (challenge?.i18n.requirements) {
            const tempArr = [];
            for (const req of challenge.i18n.requirements) {
                tempArr.push(Object.assign({ name: req }));
            }
            return tempArr;
        }
        return [{ name: '' }];
    };

    const fillChallengeSetting = () => {
        if (challenge?.gameSlug){
            setGameSelectedId(challenge.gameSlug);
            if (challenge.i18n.description) {
                setMission(challenge.i18n.description);
            }
            setRequirements(fillRequirements());
            if (challenge.sponsors) {
                setSponsors(challenge.sponsors);
            }
            changeActiveGame(challenge.gameSlug);
            if (platforms.length > 0) {
                showOldCheckedPlatforms();
            }
        }
    };

    const showOldCheckedPlatforms = () => {
        const tempPlatForms = [...platforms];
        setCheckedPlatforms(tempPlatForms.map((p) => {
            if (p.id === challenge?.platform) {
                p.checked = true;
                setSelectedPlatform(p.id);
            }
            return p;
        }));
    };

    const getPlatforms = async () => {
        try {
            const data = await NoGameService.getPlatforms();
            setPlatforms(data.list);
        } catch (e) {
            toast.error('An error occured during getting platforms');
        }
    };

    const updateChallenge = async () => {
        if ( gameSelectedId && selectedType !== undefined && mission && requirements.length > 0 ) {
            try {
                await NCHService.updateChallengeSettings(
                    props.challengeId,
                    gameSelectedId,
                    mission,
                    selectedType,
                    requirements.map((r) => r.name),
                    selectedPlatform,
                    selectedRule?.id,
                    sponsors
                );
            } catch (e) {
                toast.error('An error occured during updating challenge setting');
            }
            toast.success('settings updated');
        }
    };

    const getGameList = async () => {
        const data = await NoGameService.getGames(undefined);
        setGames(data.list);
    };

    const getRules = async (lastKey?: SLK) => {
        try {
            if (gameSelectedId) {
                const data = await NoSettingsService.getRulesByGame(gameSelectedId, !lastKey ? undefined : lastKey );
                setRules(!lastKey ? data.list : [ ...rules, ...data.list ]);
                setLastKey(data.lastKey);
            }
        } catch (e) {
            toast.error('An error occured during getting rules');
        }
    };

    useEffect(() => {
        getRules();
    }, [gameChoosed]);

    useEffect(() => {
        if (games) {
            changeActiveGame(gameSelectedId);
        }
    }, [ gameSelectedId, games ]);

    const changeActiveGame = ( gameSlug : string ) => {
        const positionOfGame = games.findIndex( (e) => e.id === (gameChoosed?.id ? gameChoosed?.id : gameSlug) );
        setActiveGame(positionOfGame) ;
    };

    const checkIfAnyItemChanged = () => itemsChanged && gameSelectedId && mission && requirements[0].name && !sponsors.some((s) => !s.name);

    useEffect(() => {
        if (lastKey) {
            getRules(lastKey);
        }
    }, [pageNum]);

    return (
        <NCCard>
            <div className="nc-challenge-settings">
                {/* uncomment when we have more types */}
                {/* <div className="mb-5 w-50">
                    <div className="mb-2">
                        Type
                    </div>
                    <NCSelect
                        selectFields={[ContestType[0]]}
                        defaultOptionLabel={selectedType !== undefined ? ContestType[selectedType] : ''}
                        actionHook={(e) => {
                            setSelectedType(Number(ContestType[e ?? ContestType[0]]));
                            setItemsChanged(true);
                        }}
                        fieldValue={selectedType !== undefined ? ContestType[selectedType] : undefined}
                    />
                </div> */}
                <div className=' mt-4 mb-3'>Game <span className="small-grey-text">selecting another game will erase all the process in settings management</span></div>
                <div className="d-flex mb-3">
                    <GameList
                        games={games}
                        fancy
                        onChange={(e) => {
                            setGameChoosed(e) ;
                            setGameSelectedId(e.id) ;
                            setItemsChanged(true);
                        }}
                        selected = {[activeGame]}
                    />
                    <PlatformList
                        platforms={checkedPlatforms ? checkedPlatforms : platforms}
                        onChange={(e) => {
                            setSelectedPlatform(e[0].id) ;
                            setItemsChanged(true);
                        }}
                        singlePlatform= {true}
                    />
                </div>
                <NCInput
                    label="Mission"
                    value={mission}
                    onChange={(e) => {setMission(e); setItemsChanged(true);} }
                />
                <div className='mt-4'>
                    Requirements
                </div>
                <div className='w-100 mb-4'>
                    <NCInputMultiple
                        list={requirements}
                        onChange={(e) => { setRequirements(e); setItemsChanged(true);}}
                    />
                </div>
                <div>
                    Sponsors
                </div>
                <div className='w-100 my-4'>
                    <NCInputMultiple
                        withMedia={true}
                        list={sponsors}
                        label='Name'
                        onChange={(e) => {setSponsors(e); setItemsChanged(true);}}
                    />
                </div>
                <div className="mb-5 mt-4">
                    <div className="mb-2">
                        Rules
                    </div>
                    <div className='d-flex'>
                        <div className="w-100">
                            <NCPreviewSearch
                                searchFields={{
                                    search: { label: 'Label1' },
                                }}
                                placeHolder={selectedRule ? selectedRule.name : ''}
                                list={rules}
                                displayParam="name"
                                hideStore={false}
                                onSelection={(e) => {setSelectedRule(e); setItemsChanged(true);}}
                                value={selectedRule?.name}
                                scrollToBottomTriggerFunc={() => setPageNum(pageNum + 1) }
                            />
                        </div>
                        <Link to={'/tournaments/beta/settings/rules'} >
                            <Icon
                                icon={IconType.Settings}
                                width={24}
                                height={24}
                                styleName='ml-3 mt-1'
                            />
                        </Link>
                    </div>
                </div>
                <Button
                    disabled={ (!checkIfAnyItemChanged()) }
                    styleClass="mx-auto mt-4"
                    label="Save"
                    setClick={() => updateChallenge()}
                    type={ButtonType.PRIMARY}
                    theme={ButtonTheme.CLASSIC}
                />
            </div>
        </NCCard>
    );
};
