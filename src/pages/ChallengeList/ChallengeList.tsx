import { Button, ButtonType, ContestType, DatePicker, Icon, IconMask, IconType, NCDialog, SearchBar } from '@cactus/srm-component';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@material-ui/core';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { ChallengeDetails } from '../../components/ChallengeDetails/ChallengeDetails';
import { ChallengeGeneral } from '../../components/ChallengeDetails/ChallengeGeneral/ChallengeGeneral';
import { Challenge, ChallengesLK, ChallengeStatus } from '../../models/Challenge';
import { NCHService } from '../../services/nch.service';
import ContextStore from '../../store';
import './ChallengeList.scss';

export const ChallengeList: React.FunctionComponent<
    RouteComponentProps
> = (props: RouteComponentProps ) => {
    const params = props.match.params;
    const basename = props.match.url;
    const paramsChallengeId = (params as any).id;
    const setChallenge = ContextStore.useStoreActions((a) => a.setChallenge);

    const [ challengeId, setChallengeId ] = useState<string>();
    const [ challenges, setChallenges ] = useState<Array<Challenge>>(
        [],
    );
    const [ lastKey, setLastKey ] = useState<ChallengesLK | undefined>(undefined);

    const [ startDate, setStartDate ] = useState<string>();
    const [ endDate, setEndDate ] = useState<string>();
    const searchFields: { [key: string]: { label: string } } = {
        search: { label: '' },
    };

    const [ research, setResearch ] = useState<string>();
    const loader = useRef<HTMLDivElement>(null);
    const [ showCancelState, setShowCancelState ] = useState<boolean>(false);
    const [ showFinishState, setShowFinishState ] = useState<boolean>(false);
    const [ openPreviewModal, setOpenPreviewModal ] = useState<boolean>(false);

    useEffect(() => {
        if (paramsChallengeId) {
            getChallengeList(true, paramsChallengeId);
        } else {
            getChallengeList(true);
        }
    }, [ startDate, endDate, params ]);

    const getChallengeList = async (reset: boolean = false, id?: string) => {
        setChallengeId(id);
        let data;
        if (id) {
            data = {
                list: [await NCHService.getChallenge(id)],
            };
            setChallenge(data.list[0]);
        } else {
            data = await NCHService.getChallenges(
                reset ? undefined : lastKey,
                startDate ? moment(startDate).toISOString() : undefined,
                endDate ? moment(endDate).toISOString() : undefined,
            );
        }
        if (!data){
            return;
        }

        const challengesFilled = await Promise.all(
            data.list.map(async (c): Promise<Challenge> => {
                const {
                    participation: participationCount,
                } = await NCHService.getParticipantsCount(c.id);
                return {
                    ...c,
                    participation: participationCount,
                };
            }),
        );

        if (!reset) {
            setChallenges(challenges.concat(challengesFilled));
        } else {
            setChallenges(challengesFilled);
        }

        setLastKey(data.lastKey);
    };

    const calculateStatus = (c: Challenge) => {
        const startDate = moment(c.startDate);
        const endDate = moment(c.endDate);
        const currentTime = moment();

        showCancel(startDate, endDate, currentTime);

        if (currentTime < startDate){
            return ChallengeStatus.Scheduled;
        } else if ( startDate < currentTime && currentTime < endDate ) {
            return ChallengeStatus.Started;
        } else {
            return ChallengeStatus.Ended;
        }
    };

    const showCancel = async (startDate: moment.Moment, endDate: moment.Moment, currentTime: moment.Moment) => {
        if (challengeId) {
            const res = await NCHService.getParticipantsCount(challengeId);
            setShowCancelState( (res['participation'] === 0) || currentTime < startDate );
            setShowFinishState( currentTime < endDate );
        }
    };

    return (
        <div className="d-flex flex-column bo-challenge-list">
            <div className='scrollable'>
                <div className="w-100">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mt-3 text-white">
                            Challenge list
                        </h5>
                        {challengeId && (
                            <div className='d-flex'>
                                {
                                    showFinishState &&
                                    <Button
                                        label='Finish'
                                        type={ButtonType.PRIMARY}
                                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                                        setClick={() => {}}
                                    />
                                }
                                {
                                    showCancelState &&
                                    <Button
                                        label='Cancel'
                                        containerClass='ml-3'
                                        type={ButtonType.SECONDARY}
                                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                                        setClick={() => {}}
                                    />
                                }
                            </div>
                        )}
                    </div>
                    {!challengeId &&
                        <div className='d-flex justify-content-between'>
                            <div className="d-flex align-items-baseline row mb-4 pb-2">
                                <div className="col-4">
                                    <SearchBar
                                        searchFields={searchFields}
                                        placeHolder={'Search challenge'}
                                        typingHook={(e) => setResearch(e)}
                                        value={
                                            research ? research : undefined
                                        }
                                        hideStore
                                    />
                                </div>
                                <div className="col-4">
                                    <DatePicker
                                        initialDate={startDate}
                                        label="Start date"
                                        dateChanged={(e) => {
                                            setStartDate(e);
                                        }}
                                    ></DatePicker>
                                </div>
                                <div className="col-4">
                                    <DatePicker
                                        initialDate={endDate}
                                        label="End date"
                                        dateChanged={(e) => {
                                            setEndDate(e);
                                        }}
                                    ></DatePicker>
                                </div>
                            </div>
                            <div>
                                <Button
                                    label='Create Challenge'
                                    type={ButtonType.PRIMARY}
                                    setClick={() => setOpenPreviewModal(true)}
                                />
                            </div>
                        </div>
                    }
                    {challenges && challenges.length > 0 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Partner</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Participation</TableCell>
                                        <TableCell>Game</TableCell>
                                        <TableCell>Start date</TableCell>
                                        <TableCell>End date</TableCell>
                                        <TableCell className="text-center">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {challenges.length > 0 &&
                                        challenges
                                            .filter((c) => {
                                                return research ? c.organization.includes(research) || c.i18n.title.includes(research) : true;
                                            } )
                                            .map(
                                                (c: Challenge) => {
                                                    return (
                                                        <TableRow key={c.id}>
                                                            <TableCell className={`text-uppercase font-weight-bold status nt-${ChallengeStatus[
                                                                calculateStatus(c)
                                                            ].toLowerCase()}`}>
                                                                {ChallengeStatus[calculateStatus(c)]}
                                                            </TableCell>
                                                            <TableCell>
                                                                {c.i18n.title}
                                                            </TableCell>
                                                            <TableCell className="text-capitalize">
                                                                {c.organization}
                                                            </TableCell>
                                                            <TableCell>
                                                                {ContestType[c.type]}
                                                            </TableCell>
                                                            <TableCell>
                                                                {c.participation}
                                                            </TableCell>
                                                            <TableCell>
                                                                <IconMask
                                                                    icon={`${process.env.REACT_APP_S3_URL}/game/${c.gameSlug}/medias/LogoImage`}
                                                                    name={'game'}
                                                                    styleName="mr-2"
                                                                    height={24}
                                                                    width={24}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {c.startDate}
                                                            </TableCell>
                                                            <TableCell>
                                                                {c.endDate}
                                                            </TableCell>
                                                            <TableCell className="d-flex justify-content-around text-center actions">
                                                                <a
                                                                    href={`${process.env.REACT_APP_NICECACTUS_URL}/challenges/${c.id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Icon
                                                                        styleName="icon"
                                                                        icon={IconType.GoToLink}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                </a>
                                                                <Link
                                                                    to={
                                                                        challengeId
                                                                            ? '/challenges'
                                                                            : `/details/${c.id}/management`
                                                                    }
                                                                >
                                                                    <Icon
                                                                        styleName="icon"
                                                                        icon={ challengeId
                                                                            ? IconType.Back
                                                                            : IconType.Settings}
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                </Link>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                },
                                            )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <div ref={loader} />
                    {paramsChallengeId &&
                        challenges &&
                        challenges[0] &&
                        (
                            <div className="mt-4">
                                <Switch>
                                    <Route path={basename + '/management'}>
                                        <ChallengeDetails
                                            challenge={challenges[0]}
                                            parentProps={props}
                                            basename={basename + '/management'}
                                            challengeId={paramsChallengeId}
                                        />
                                    </Route>
                                </Switch>
                            </div>
                        )}

                    <NCDialog
                        show={openPreviewModal}
                        setShow={setOpenPreviewModal}
                        title={'create new challenge'}
                        wildBody={true}
                        noPadding={false}
                    >
                        <ChallengeGeneral triggerFunction={() => { setOpenPreviewModal(false); getChallengeList(true); } }/>
                    </NCDialog>
                </div>
            </div>
        </div>
    );
};
