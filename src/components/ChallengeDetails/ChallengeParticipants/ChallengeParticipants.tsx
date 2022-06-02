import {
    Button,
    ButtonType,
    NCDialog,
    NCParticipantCardList,
    NCRadioGroup,
    NcRadioGroupFields,
    SearchBar
} from '@cactus/srm-component';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Challenge, ChallengeResult } from '../../../models/Challenge';
import { NCHService } from '../../../services/nch.service';
import './ChallengeParticipants.scss';

interface ChallengeParticipantsProps {
    challenge: Challenge;
    triggerFunction?: () => void;
}

export enum ParticipantsDistribution {
    WINNERS = 'Winners only',
    Ranked = 'Ranked only'
  }

export const ChallengeParticipants: React.FunctionComponent<ChallengeParticipantsProps> =
    (props : ChallengeParticipantsProps) => {
        const searchFields: { [key: string]: { label: string } } = {
            search: { label: '' },
        };
        const [ research, setResearch ] = useState<string>();
        const [ participants, setParticipants ] = useState<Array<ChallengeResult>>([]);
        const ncRadioValues: Array<NcRadioGroupFields> = [
            { key: ParticipantsDistribution.WINNERS, value: ParticipantsDistribution.WINNERS },
            { key: ParticipantsDistribution.Ranked, value: ParticipantsDistribution.Ranked }
        ];
        const [ ncRadioGroupValue, setNcRadioGroupValue ] = useState<string>( ncRadioValues[1].value );

        const [ result, setResult ] = useState<ChallengeResult>();

        const fetchParticipants = async () => {
            try {
                const res = await NCHService.getParticipants(props.challenge?.id);
                setParticipants(res);
            } catch {
                toast.error('error fetching participants results');
            }
        };

        useEffect(() => {
            fetchParticipants();
        }, []);

        const filterParticipants = () => {
            const tempParticipants = _.cloneDeep(participants).sort((a, b) => a.score - b.score);
            if (ParticipantsDistribution.Ranked === ncRadioGroupValue) {
                return tempParticipants.filter((p) => p.score !== 0);
            } else {
                const ranks: Array<number>= [];
                if (props.challenge.rewards) {
                    (Object.keys(props.challenge.rewards)).forEach((r) => {
                        ranks.push(Number(r));
                    });
                }
                return tempParticipants.filter((p) => {
                    return ranks.includes(p.score);
                });
            }
        };

        const confirmParticipants = async () => {
            try {
                updateAllRanks();
                toast.success('success saving participants');
            } catch {
                toast.error('error confirming participants');
            }
        };

        const updateAllRanks = async () => {
            Promise.all(participants.map(async (p) => {
                await NCHService.updateParticipants(props.challenge, [{ userId: p.id, score: p.score }]);
            }));
        };

        const checkStatus = (c: Challenge) => {
            const endDate = moment(c.endDate);
            const currentTime = moment();
            return (currentTime < endDate);
        };

        return (
            <>
                {participants.length > 0 ?
                    <>
                        <div className='participants-tab'>
                            <div className='mb-3 col-5'>
                                <SearchBar
                                    searchFields={searchFields}
                                    placeHolder={'Search participants'}
                                    typingHook={(e) => setResearch(e)}
                                    value={ research ? research : undefined }
                                    hideStore
                                />
                            </div>
                            <div className='row'>
                                <div className='col-5'>
                                    { participants &&
                                        <NCParticipantCardList
                                            list={participants.filter((p) => { return research ? (p.username).toLowerCase().includes(research) : true;}).sort((a, b) => a.score - b.score)}
                                            triggerOnChange={(newItems) => setParticipants(_.uniqBy([ newItems, ...participants ], 'id')) }
                                            onClick={setResult}
                                        /> }
                                </div>
                                <div className='col-5'>
                                    { participants &&
                                        <NCParticipantCardList
                                            list={filterParticipants()}
                                            triggerOnChange={(newItems) => setParticipants(_.uniqBy([ newItems, ...participants ], 'id')) }
                                            onClick={setResult}
                                        />
                                    }
                                    {
                                        participants.length > 0 &&
                                        <div>
                                            <span>Display</span>
                                            <NCRadioGroup
                                                value={ncRadioGroupValue}
                                                actionHook={setNcRadioGroupValue}
                                                fields={ncRadioValues}
                                            />
                                            <Button
                                                label='Save leaderboard'
                                                type={ButtonType.PRIMARY}
                                                setClick={() => confirmParticipants()}
                                                disabled={checkStatus(props.challenge)}
                                            />
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                        <NCDialog
                            show={!!result}
                            setShow={() => setResult(undefined)}
                            title={`${result?.username} - ${moment(result?.date).format('DD/MM/YY hh:mm')}`}
                            wildBody={true}
                        >
                            <img src={result?.media} />
                        </NCDialog>
                    </>
                    :
                    <div className='participants-tab'>
                        {
                            <div className="no-participants d-flex justify-content-center align-items-center">
                                <span>No participants</span>
                            </div>
                        }
                    </div>
                }
            </>
        );
    };
