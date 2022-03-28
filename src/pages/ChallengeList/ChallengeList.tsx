import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@material-ui/core';
import { DatePicker, SearchBar, Icon, IconType, ButtonType, Button } from '@cactus/srm-component';
import React, { useEffect, useRef, useState } from 'react';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { ChallengeDetails } from '../../components/ChallengeDetails/ChallengeDetails';
import { NCHService } from '../../services/nch.service';
import './ChallengeList.scss';
import { Challenge, ChallengesLK, ChallengeStatus, Type } from '../../models/Challenge';
import moment from 'moment';
interface ExtendedChallenge extends Challenge {
    participation: number;
}

export const ChallengeList: React.FunctionComponent<
    RouteComponentProps
> = (props: RouteComponentProps ) => {
    const params = props.match.params;
    const basename = props.match.url;
    const paramsChallengeId = (params as any).id;

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

    useEffect(() => {
        if (paramsChallengeId) {
            getChallengeList(true, paramsChallengeId);
        } else {
            getChallengeList(true);
        }
        // eslint-disable-next-line
    }, [research, startDate, endDate, params ]);

    const getChallengeList = async (reset: boolean = false, id?: string) => {
        setChallengeId(id);
        let data;
        if (id) {
            data = {
                list: [await NCHService.getChallenge(id)],
            };
        } else {
            data = await NCHService.getChallenges(
                reset ? undefined : lastKey,
                startDate,
                endDate,
            );
        }
        if (!data){
            return;
        }

        const tournamentsFilled = await Promise.all(
            data.list.map(async (c): Promise<ExtendedChallenge> => {
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
            setChallenges(challenges.concat(tournamentsFilled));
        } else {
            setChallenges(tournamentsFilled);
        }

        setLastKey(data.lastKey);
    };

    const calculateStatus = (c: Challenge) => {
        const startDate = moment(c.startDate).unix();
        const endDate = moment(c.endDate).unix();
        const currentTime = moment().unix();
        if (currentTime<startDate){
            return ChallengeStatus[0];
        } else if (startDate<currentTime && currentTime<endDate) {
            return ChallengeStatus[1];
        } else {
            return ChallengeStatus[2];
        }
    };

    return (
        <div className="d-flex flex-column bo-challenge-list">
            <div className='scrollable'>
                <div className="w-100 bo-challenge-list">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mt-3 text-white">
                            Challenge list
                        </h5>
                        {challengeId && (
                            <div className='d-flex'>
                                <Button
                                    label='Finish'
                                    type={ButtonType.PRIMARY}
                                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                                    setClick={() => {}}
                                />
                                <Button
                                    label='Cancel'
                                    containerClass='ml-3'
                                    type={ButtonType.SECONDARY}
                                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                                    setClick={() => {}}
                                />
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
                                <div className="col-2">
                                    <DatePicker
                                        initialDate={startDate}
                                        label="Start date"
                                        dateChanged={(e) => {
                                            setStartDate(e);
                                        }}
                                    ></DatePicker>
                                </div>
                                <div className="col-2">
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
                                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                                    setClick={() => {}}
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
                                                return research ? c.organization.includes(research) : true;
                                            } )
                                            .map(
                                                (c: Challenge) => {
                                                    return (
                                                        <TableRow key={c.id}>
                                                            <TableCell>
                                                                {calculateStatus(c)}
                                                            </TableCell>
                                                            <TableCell>
                                                                {c.i18n.title}
                                                            </TableCell>
                                                            <TableCell className="text-capitalize">
                                                                {c.organization}
                                                            </TableCell>
                                                            <TableCell>
                                                                {Type[c.type]}
                                                            </TableCell>
                                                            <TableCell>
                                                                {c.participation}
                                                            </TableCell>
                                                            <TableCell>
                                                                {c.gameSlug}
                                                            </TableCell>
                                                            <TableCell>
                                                                {c.startDate}
                                                            </TableCell>
                                                            <TableCell>
                                                                {c.endDate}
                                                            </TableCell>
                                                            <TableCell className="d-flex justify-content-around text-center actions">
                                                                <a
                                                                    href={''}
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
                                                                {console.log(props)}
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
                </div>
            </div>
        </div>
    );
};
