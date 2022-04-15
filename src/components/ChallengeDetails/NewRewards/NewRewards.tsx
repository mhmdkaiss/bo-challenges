import {
    Button,
    ButtonTheme,
    ButtonType,
    Icon,
    IconType,
    NCActions,
    NCCard,
    NCCheckbox,
    NCInput,
    NCMediaUpload,
    NCSelect
} from '@cactus/srm-component';
import React, { useEffect, useState } from 'react';
import { ChallengeReward, RewardKind } from '../../../models/Challenge';
import './NewRewards.scss';

interface RankReward {
    firstRank: number;
    lastRank: number;
    rewards: Array<ChallengeReward>;
}

interface NewRewardsProps {
    reward: RankReward;
    rewards: { [key: number]: Array<ChallengeReward> };
    partners: Array<string>;
    setRewards: (rewards: { [key: number]: Array<ChallengeReward> }) => void;
    actionHook: (openRewards: boolean) => void;
}

export const NewRewards: React.FunctionComponent<NewRewardsProps> = (props: NewRewardsProps) => {
    const currencies = [ 'EUR', 'USD' ];
    const [ reward, setReward ] = useState<RankReward>(props.reward || {});
    const [ lastRankDeleted, setLastRankDeleted ] = useState<number>(0);
    const [ isMultipleRank, setIsMultipleRank ] = useState<boolean>(false);
    const [ cashRewards, setCashRewards ] = useState<Array<ChallengeReward>>(props.reward.rewards.filter((r) => r.kind === RewardKind.CASH));
    const [ coinRewards, setCoinRewards ] = useState<Array<ChallengeReward>>(props.reward.rewards.filter((r) => r.kind === RewardKind.COIN));
    const [ giftRewards, setGiftRewards ] = useState<Array<ChallengeReward>>(props.reward.rewards.filter((r) => r.kind === RewardKind.GIFT));
    const [ image, setImage ] = useState<string | null>(null);
    const defaultPartner = 'nicecactus';
    const partners = props.partners && props.partners.length > 0 && props.partners[0] !== defaultPartner ? [ defaultPartner, ...props.partners ] : props.partners;

    useEffect(() => {
        onCheckMultipleRewardChange(!!reward.lastRank);
    }, []);

    const saveRewards = () => {
        props.actionHook(false);
        const firstRank = reward.firstRank;
        const rewards = [ ...cashRewards, ...coinRewards, ...giftRewards ];
        let newRewards;

        if (rewards.length > 0) {
            if (!reward.lastRank) {
                newRewards = Object.assign(props.rewards, { [firstRank]: rewards });
                if (newRewards && lastRankDeleted) {
                    for (let i = lastRankDeleted; i > reward.firstRank; i--) {
                        delete newRewards[i];
                    }
                }
                props.setRewards(Object.assign(props.rewards, newRewards));
                return;
            }

            const countAdded = reward.lastRank - firstRank + 1;
            if (countAdded > 0) {
                for (let i = firstRank; i < firstRank + countAdded; i++) {
                    newRewards = Object.assign(props.rewards, { [i]: rewards });
                }
                if (newRewards && lastRankDeleted) {
                    for (let i = lastRankDeleted; i > reward.lastRank; i--) {
                        delete newRewards[i];
                    }
                }

                props.setRewards(Object.assign(props.rewards, newRewards));
            }
        }
    };

    const onInputChange = (key: string, value: number) => {
        if (key === 'lastRank') {
            setLastRankDeleted(reward.lastRank);
        }
        setReward(Object.assign({}, reward, { [key]: value }));
    };

    const onCheckMultipleRewardChange = (isMultiple: boolean) => {
        if (isMultiple) {
            if (reward.lastRank) {
                setReward(Object.assign({}, reward, { lastRank: reward.lastRank }));
            } else {
                setReward(Object.assign({}, reward, { lastRank: reward.firstRank + 1 }));
            }
        } else {
            setLastRankDeleted(reward.lastRank);
            setReward(Object.assign({}, reward, { lastRank: 0 }));
        }
        setIsMultipleRank(isMultiple);
    };

    const renderHeader = () => {
        return (
            <div className="header d-flex justify-content-between align-items-center">
                <h6>New reward rank</h6>
                <div className="d-flex">
                    <NCActions
                        actions={[
                            {
                                label: 'save',
                                icon: {
                                    type: IconType.Book,
                                    width: 22,
                                    height: 22,
                                },
                                setClick: () => saveRewards(),
                            },
                            {
                                label: 'cancel',
                                icon: {
                                    type: IconType.Cross,
                                    width: 22,
                                    height: 22,
                                },
                                type: ButtonType.SECONDARY,
                                theme: ButtonTheme.RED,
                                setClick: () => props.actionHook(false),
                            },
                        ]}
                    />
                </div>
            </div>
        );
    };

    const renderSection = (name: string, component: React.ReactElement) => {
        return (
            <div className="section">
                <div className="mb-2 ml-2">{name}</div>
                {component}
            </div>
        );
    };

    const addReward = (rewardKind: RewardKind) => {
        const empty = { cur: currencies[0], kind: rewardKind, value: 0 };
        switch (rewardKind) {
            case RewardKind.CASH:
                setCashRewards([ ...cashRewards, empty ]);
                break;
            case RewardKind.COIN:
                setCoinRewards([ ...coinRewards, empty ]);
                break;
            case RewardKind.GIFT:
                setGiftRewards([ ...giftRewards, empty ]);
                break;
        }
    };

    const removeReward = (rewardKind: RewardKind, index: number, list: Array<ChallengeReward>, setRewards: React.Dispatch<React.SetStateAction<Array<ChallengeReward>>>) => {
        setRewards(list.filter((r, i) => r.kind === rewardKind && index !== i));
    };

    const renderRewardType = (name: RewardKind, list: Array<ChallengeReward>) => {
        return (
            <div className="type d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                    <NCCheckbox checked={list.length > 0} onChange={() => {return;}} />
                    <span className="type-checked text-capitalize mt-1 ml-2">{name}</span>
                </div>
                <div>
                    <Button
                        label={name}
                        type={ButtonType.SECONDARY}
                        icon={{ type: IconType.Plus, width: 22, height: 22 }}
                        setClick={() => addReward(name)}
                    />
                </div>
            </div>
        );
    };

    const renderTrashCan = ( type: RewardKind, index : number, rewardsType: ChallengeReward[], set: React.Dispatch<React.SetStateAction<ChallengeReward[]>>) => {
        return (
            <Icon
                icon={IconType.Trashcan}
                width={24}
                height={24}
                onClick={() =>
                    removeReward(type, index, rewardsType, set)
                }
            />
        );
    };

    const onChangeTrigger = (rewards: ChallengeReward[], value: string, index: number, set: (value: React.SetStateAction<ChallengeReward[]>) => void, isString?: boolean) => {
        isString ? rewards[index].title = value : rewards[index].value = Number(value);
        set([...rewards]);
    };

    const renderReward = (
        rewardList: ChallengeReward[],
        type: RewardKind,
        setRewards: React.Dispatch<React.SetStateAction<ChallengeReward[]>>
    ) => {
        return (
            rewardList && rewardList.length > 0 &&
                <div className="list-rewards">
                    { rewardList.map((reward, index) => {
                        const name = reward.image?.split('/');
                        return (
                            <div
                                className={`grid-reward ${reward.kind}`}
                                key={`${reward.kind}-${index}`}
                            >
                                {type === RewardKind.GIFT &&
                                    <NCInput
                                        id={`reward-${reward.kind}-name-${index}`}
                                        label="Prize name"
                                        value={reward.title || ''}
                                        onChange={(value) =>
                                            onChangeTrigger(rewardList, value, index, setRewards, type === RewardKind.GIFT)
                                        }
                                    />
                                }
                                <NCInput
                                    id={`reward-${reward.kind}-value-${index}`}
                                    label={`${reward.kind} value`}
                                    value={reward.value}
                                    type="number"
                                    onChange={(value) =>
                                        onChangeTrigger(
                                            rewardList,
                                            value,
                                            index,
                                            setRewards
                                        )
                                    }
                                />
                                {type !== RewardKind.COIN &&
                                    <NCSelect
                                        selectFields={currencies}
                                        actionHook={(cur) => {
                                            if (cur) {
                                                rewardList[index].cur = cur;
                                                setRewards([...rewardList]);
                                            }
                                        }}
                                    />
                                }
                                <NCSelect
                                    selectFields={partners}
                                    actionHook={(partner) => {
                                        if (partner) {
                                            reward.partner = partner;
                                            setRewards([...rewardList]);
                                        }
                                    }}
                                />
                                {type === RewardKind.GIFT &&
                                    <NCMediaUpload
                                        currentImg={name ? name[name.length - 1] : image ? image : undefined}
                                        actionHook={(ctx: string, image: string) => {
                                            reward.image = image;
                                            if (ctx === 'url' && image) {
                                                setImage(image[image.length - 1]);
                                            }
                                        }}
                                        s3PublicUrl={process.env.REACT_APP_S3_PUBLIC_URL}
                                        inputMode
                                        mediaLibrary
                                    />
                                }
                                {renderTrashCan(type, index, rewardList, setRewards)}
                            </div>
                        );
                    })}
                </div>
        );
    };

    return (
        <div className="nc-new-rewards">
            <NCCard>
                {renderHeader()}
                {renderSection(
                    'Rank',
                    <div
                        className={`rank d-flex ${
                            isMultipleRank ? 'w-75' : 'w-50'
                        }`}
                    >
                        <NCInput
                            label="First rank"
                            value={reward.firstRank}
                            type="number"
                            onChange={(rank) =>
                                onInputChange('firstRank', Number(rank))
                            }
                        />
                        <div className="d-flex justify-content-center align-items-center w-100">
                            <NCCheckbox
                                checked={isMultipleRank}
                                onChange={() =>
                                    onCheckMultipleRewardChange(!isMultipleRank)
                                }
                            />
                            <span className="multiple mt-1 ml-3">Multiple</span>
                        </div>
                        {isMultipleRank && (
                            <NCInput
                                label="Last rank"
                                value={reward.lastRank}
                                type="number"
                                onChange={(rank) =>
                                    onInputChange('lastRank', Number(rank))
                                }
                            />
                        )}
                    </div>,
                )}
                {renderSection(
                    'Prize type',
                    <div>
                        <div className="d-flex w-100 mb-5">
                            <div className="w-50">
                                {renderRewardType(RewardKind.CASH, cashRewards)}
                                {renderReward(cashRewards, RewardKind.CASH, setCashRewards)}
                            </div>
                            <div className="w-50">
                                {renderRewardType(RewardKind.COIN, coinRewards)}
                                {renderReward(coinRewards, RewardKind.COIN, setCoinRewards)}
                            </div>
                        </div>
                        <div className="w-100">
                            {renderRewardType(RewardKind.GIFT, giftRewards)}
                            {renderReward(giftRewards, RewardKind.GIFT, setGiftRewards)}
                        </div>
                    </div>,
                )}
            </NCCard>
        </div>
    );
};
