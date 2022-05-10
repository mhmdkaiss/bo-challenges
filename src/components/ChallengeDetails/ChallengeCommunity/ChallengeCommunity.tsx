import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CircularProgress } from '@material-ui/core';
import { Button, ButtonTheme, ButtonType, Icon, IconType, NCCard, NCColorPicker, NCInput, NCSelect, Partner, NCColors } from '@cactus/srm-component';
import './ChallengeCommunity.scss';
import { Challenge } from 'src/models/Challenge';
import { NCHService } from '../../../services/nch.service';
import { FormattedMessage, useIntl } from 'react-intl';
import { NCCommonService } from '../../../services/ncCommon.service';

interface ChallengeGeneralProps {
    challenge: Challenge;
    triggerFunction?: () => void;
}

const PRIMARY_COLOR = NCColors.nicecactus;

export const ChallengeCommunity: React.FunctionComponent<ChallengeGeneralProps> =
    (props : ChallengeGeneralProps) => {
        const intl = useIntl();
        const [ challengeModified, setChallengeModified ] = useState<Challenge>(props.challenge);
        const [ challengeColor, setChallengeColor ] = useState<string>(props.challenge ? props.challenge.color : PRIMARY_COLOR);
        const [ selectedPartner, setSelectedPartner ] = useState<string>();
        const [ isLoading, setIsLoading ] = useState<boolean>(false);
        const [ partnersList, setPartnersList ] = useState<Partner>([]);

        useEffect(() => {
            if (!props.challenge.partners) {
                challengeModified.partners = [];
            }
            if (!props.challenge.discord) {
                challengeModified.discord = [];
            }
            if (!props.challenge.twitch) {
                challengeModified.twitch = '';
            }
            if (!props.challenge.color) {
                challengeModified.color = PRIMARY_COLOR;
            }
            setChallengeModified({ ...challengeModified });
        }, []);

        useEffect(() => {
            NCCommonService.getAllPartners()
                .then((data) => updatePartnerList(data))
                .catch((e) => console.log(e));
            // eslint-disable-next-line
        }, []);

        const updatePartnerList = (list: Array<Partner>) => {
            setPartnersList([...list.map(
                (partner: Partner) => {
                    const selected = challengeModified.partners.find((el) => el === partner.name);
                    Object.assign(partner, selected ? { disabled: true } : { disabled: false });
                    return partner;
                }
            )]);
        };

        const updateChallenge = async () => {
            setIsLoading(true);
            try {
                const res = await NCHService.updateChallengeCommunity(challengeModified);
                setChallengeModified(res);
                setIsLoading(false);
                toast.success('successfully updated challenge');
            } catch (e) {
                toast.error('An error occured during challenge general update');
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
        };

        const removeRefereeLink = (index: number) => {
            challengeModified.discord.splice(index, 1);
            setChallengeModified({ ...challengeModified });
        };

        const handleRefereeLinkChange = (change: string, index: number) => {
            challengeModified.discord[index] = change;
            setChallengeModified({ ...challengeModified });
        };

        const addDiscordLink = () => {
            challengeModified.discord.push('');
            setChallengeModified({ ...challengeModified });
        };

        const removeSubPartner = (index: number) => {
            challengeModified.partners.splice(index, 1);
            setChallengeModified({ ...challengeModified });
        };

        const addNewPartnerRow = () => {
            if (selectedPartner && !challengeModified.partners.find((partner: string) => partner === selectedPartner)) {
                challengeModified.partners.push(selectedPartner);
                setChallengeModified({ ...challengeModified });
            }
        };

        const updateChallengeColor = (color: string) => {
            setChallengeColor(color);
            challengeModified.color = color;
            setChallengeModified({ ...challengeModified });
        };

        const changeTwitchLink = (change: string) => {
            if (!challengeModified.twitch) {
                challengeModified.twitch = '';
            }
            challengeModified.twitch = change;
            setChallengeModified({ ...challengeModified });
        };

        return (
            <>
                { challengeModified && (
                    <NCCard>
                        <div className="nc-challenge-community">

                            <div className="mb-4 pb-2">
                                <div className="mb-2">Color theme</div>
                                <div className="d-flex flex-row ml-2">
                                    <NCColorPicker
                                        color={challengeColor}
                                        actionHook={(color: string) => updateChallengeColor(color)}
                                        disableAlpha={true}
                                        hideInput={true}
                                    />

                                    <div
                                        className="ml-3 my-auto text-underline cursor-pointer"
                                        onClick={() => updateChallengeColor(PRIMARY_COLOR)}
                                    >
                                        <FormattedMessage id={'bo.community.reset.color.default'} />
                                    </div>
                                </div>
                            </div>

                            <div className='my-3'>
                                <FormattedMessage id={'bo.community.title.partner.info'} />
                                <div className='d-flex flex-row my-2'>
                                    {
                                        challengeModified.partners && challengeModified.partners.length === 0 &&
                                        <FormattedMessage id={'bo.community.no.partner'} />
                                    }
                                    { challengeModified.partners && challengeModified.partners.map((partner: string, index: number) => {
                                        return (
                                            <div key={index} className="d-flex flex-row align-items-center ">
                                                <div className="clickable" onClick={() => removeSubPartner(index)}>
                                                    <Icon icon={IconType.Trashcan} width={25} height={25} />
                                                </div>
                                                <p className='mr-3 my-auto'>- {partner}</p>
                                            </div>

                                        );
                                    })}
                                </div>
                                <div className="tournament-partner">
                                    <div className="torunament-partner-select d-flex flex-row">
                                        <div className="px-2 w-50 align-self-center">
                                            <NCSelect
                                                fieldName={'name'}
                                                fieldValue={'name'}
                                                selectFields={partnersList}
                                                defaultOption={partnersList[0]}
                                                actionHook={(partner) => {
                                                    if (partner) {
                                                        setSelectedPartner(partner);
                                                    }
                                                }}
                                                orderSelectFields={(a: Partner, b: Partner) => a.name.localeCompare(b.name)}
                                            />
                                        </div>
                                        <div className="px-2 w-50">
                                            <Button
                                                label={intl.formatMessage({ id: 'bo.community.button.add.partner' })}
                                                setClick={() => addNewPartnerRow()}
                                                type={ButtonType.SECONDARY}
                                                theme={ButtonTheme.CLASSIC}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='my-3'>
                                <FormattedMessage id={'bo.community.field.discord.link'} />:
                                {challengeModified.discord && challengeModified.discord.map(
                                    (refereeLink: string, index: number) => {
                                        return (
                                            <div key={index} className="d-flex flex-row align-items-center">
                                                <div className="mr-3 my-auto" onClick={() => removeRefereeLink(index)}>
                                                    <Icon icon={IconType.Trashcan} width={25} height={25} />
                                                </div>
                                                <div className='my-2'>
                                                    <NCInput
                                                        value={refereeLink || ''}
                                                        onChange={(change: string) =>
                                                            handleRefereeLinkChange(change, index)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        );
                                    },
                                )
                                }
                                <Button
                                    label={intl.formatMessage({
                                        id: 'bo.community.button.add.another.discord.link',
                                    })}
                                    setClick={() => addDiscordLink()}
                                    type={ButtonType.SECONDARY}
                                    theme={ButtonTheme.CLASSIC}
                                />
                            </div>

                            <div className='my-3'>
                                <FormattedMessage id={'bo.community.field.twitter.link'} />:
                                <div className="d-flex flex-row align-items-center">
                                    <div className='my-2'>
                                        <NCInput
                                            value={challengeModified.twitch}
                                            onChange={(change: string) =>
                                                changeTwitchLink(change)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            {isLoading ? (
                                <div className="text-center my-4">
                                    <CircularProgress />
                                </div>
                            ) : (
                                <Button
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
