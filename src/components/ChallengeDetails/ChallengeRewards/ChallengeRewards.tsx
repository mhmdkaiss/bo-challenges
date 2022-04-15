import './ChallengeRewards.scss';
import { Button, ButtonType, Icon, IconType } from '@cactus/srm-component';
import React, { useEffect, useState } from 'react';
import {
    RewardKind,
    Challenge,
    ChallengeReward,
    ChallengeStatus,
} from '../../../models/Challenge';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@material-ui/core';
import { NewRewards } from '../NewRewards/NewRewards';
import moment from 'moment';
import { NCHService } from '../../../services/nch.service';
import { toast } from 'react-toastify';

interface ChallengeRewardsProps {
    challenge: Challenge;
}

export const ChallengeRewards: React.FunctionComponent<ChallengeRewardsProps> = (props: ChallengeRewardsProps) => {
    const [ openNewRewards, setOpenNewRewards ] = useState<boolean>(false);
    const [ rank, setRank ] = useState<{ firstRank: number, lastRank: number}>({ firstRank: 0, lastRank: 0 });
    const [ rewards, setRewards ] = useState<{ [key: number]: Array<ChallengeReward>}>(props.challenge.rewards || Object.assign({}));
    const [ hasRefresh, setHasRefresh ] = useState<boolean>(false);
    const [ selectedReward, setSelectedReward ] = useState<Array<ChallengeReward>>([]);
    const partners = [ props.challenge.organization, ...(props.challenge.partners ? props.challenge.partners : []) ];
    const rewardsLength = Object.keys(rewards).length;

    useEffect(() => {
        setSelectedReward(selectedReward);
    }, [selectedReward]);

    const rewardSaveAuto = async ( rewards: { [key: number]: Array<ChallengeReward> } ) => {
        setRewards(rewards);
        try {
            NCHService.patchRewards(props.challenge.id, { rewards });
        } catch {
            toast.error('error updating rewards');
        }
    };

    const onOpenReward = (rank: number, nextRank: number, rewards: Array<ChallengeReward>) => {
        setRank({ firstRank: rank, lastRank: nextRank });
        setSelectedReward(rewards);
        setOpenNewRewards(true);
    };

    const deleteReward = (firstRank: number, lastRank: number | undefined) => {
        for (const key of Object.keys(rewards)) {
            const k = Number(key);
            if ((lastRank && firstRank <= k && lastRank >= k) || firstRank === k) {
                delete rewards[k];
            }
        }
        rewardSaveAuto(rewards);
        setHasRefresh(!hasRefresh);
    };

    const compareRewards = (lastReward: Array<ChallengeReward>, reward: Array<ChallengeReward>) => {
        let checkStep: boolean = true;
        lastReward.forEach((last, index) => {
            if (checkStep && last && reward[index]
                    && last.value === reward[index].value
                    && last.kind === reward[index].kind
                    && last.cur === reward[index].cur
                    && (!last.partner === !reward[index].partner || last.partner === reward[index].partner)
            ) {
                checkStep = true;
            } else {
                checkStep = false;
            }
        });
        return checkStep;
    };

    const groupByRewards = () => {
        const groups: Array<Array<ChallengeReward>> = [];
        const ranks: Array<number> = [];
        const counts: Array<number> = [];
        for (const [ index, reward ] of Object.entries(rewards)) {
            const lastReward = groups[groups.length - 1];
            if (groups.length < 1 || (lastReward.length > 0 && !compareRewards(lastReward, reward))) {
                groups.push(reward);
                ranks.push(Number(index));
                counts.push(0);
            } else {
                counts[groups.length - 1]++;
            }
        }
        return { rewards: groups, total: ranks, count: counts };
    };

    const renderKindReward = (reward: ChallengeReward, index: number) => {
        const kind = (<span>{`Reward ${index + 1}: ${reward.kind !== RewardKind.COIN ? reward.kind : 'exp'}`}</span>);
        let text;
        let sponsor;
        switch (reward.kind) {
            case RewardKind.CASH:
                text = (
                    <span className="ml-2">
                        {reward.value} {reward.cur}
                    </span>
                );
                break;
            case RewardKind.GIFT:
                if (reward.value) {
                    text = (
                        <span>
                                &quot;{reward.title ? reward.title : ''}&quot;{' '}
                            {reward.value} {reward.cur}
                        </span>
                    );
                } else {
                    text = (
                        <span>&quot;{reward.title ? reward.title : ''}&quot;</span>
                    );
                }
                break;
            case RewardKind.COIN:
                text = <span>{reward.value}</span>;
                break;
        }
        if (reward.partner) {
            sponsor = (
                <span className="ml-2">sponsor: {reward.partner}</span>
            );
        }
        return (
            <div key={`${kind}-${index}`}>
                {kind} {text} {sponsor}
            </div>
        );
    };

    const renderRewards = () => {
        const groupRewards = groupByRewards();
        return groupRewards.rewards.map((reward, index) => {
            const rank = groupRewards.total[index];
            const count = groupRewards.count[index];
            const nextRank = rank + count;
            return (
                <TableRow key={index}>
                    <TableCell style={{ width: '5%' }}>
                        <span className="rank d-flex justify-content-center">
                            {rank} {count?'-':''} { !!count && nextRank}
                        </span>
                    </TableCell>
                    <TableCell style={{ width: '85%' }}>
                        {Object.values(reward).map((r, i) =>
                            renderKindReward(r, i),
                        )}
                    </TableCell>
                    { calculateStatus(props.challenge) === ChallengeStatus.Scheduled &&
                            <TableCell style={{ width: '10%' }}>
                                <div className="actions d-flex justify-content-center">
                                    <Icon
                                        icon={IconType.Pen}
                                        width={22}
                                        height={20}
                                        onClick={() =>
                                            onOpenReward(rank, count ? nextRank : count, Object.values(reward))
                                        }
                                    />
                                    <Icon
                                        icon={IconType.Trashcan}
                                        width={22}
                                        height={20}
                                        onClick={() =>
                                            deleteReward(rank, nextRank)
                                        }
                                    />
                                </div>
                            </TableCell>
                    }
                </TableRow>
            );
        });
    };

    const calculateStatus = (c: Challenge) => {
        const startDate = moment(c.startDate);
        const endDate = moment(c.endDate);
        const currentTime = moment();

        if (currentTime < startDate){
            return ChallengeStatus.Scheduled;
        } else if ( startDate < currentTime && currentTime < endDate ) {
            return ChallengeStatus.Started;
        } else {
            return ChallengeStatus.Ended;
        }
    };

    return (
        <div className="nc-challenge-rewards">
            { calculateStatus(props.challenge) === ChallengeStatus.Scheduled &&
                    <div className="d-flex justify-content-end mb-4">
                        <Button
                            label={'Add new'}
                            type={ButtonType.SECONDARY}
                            icon={{ type: IconType.Plus, width: 22, height: 22 }}
                            setClick={() => onOpenReward(0, 0, [])}
                        ></Button>
                    </div>
            }
            { Object.keys(rewards).length > 0 ?
                <TableContainer className='mb-4'>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Rank</TableCell>
                                <TableCell>Rewards</TableCell>
                                { calculateStatus(props.challenge) === ChallengeStatus.Scheduled &&
                                        <TableCell className="text-center">
                                            Actions
                                        </TableCell>
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>{renderRewards()}</TableBody>
                    </Table>
                </TableContainer> :
                <div>
                    { !openNewRewards &&
                        <div className="no-rewards d-flex justify-content-center align-items-center">
                            <span>No rewards were created</span>
                        </div>
                    }
                </div>
            }
            {openNewRewards && selectedReward.length > 0 && (
                <NewRewards
                    reward={{
                        firstRank: rank.firstRank,
                        lastRank: rank.lastRank,
                        rewards: selectedReward,
                    }}
                    rewards={rewards}
                    partners={partners}
                    setRewards={rewardSaveAuto}
                    actionHook={setOpenNewRewards}
                />
            )}
            {openNewRewards && selectedReward.length < 1 && (
                <NewRewards
                    reward={{
                        firstRank: rewardsLength + 1,
                        lastRank: 0,
                        rewards: [],
                    }}
                    rewards={rewards}
                    partners={partners}
                    setRewards={rewardSaveAuto}
                    actionHook={setOpenNewRewards}
                />
            )}
        </div>
    );
};
