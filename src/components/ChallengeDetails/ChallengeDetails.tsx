import { Redirect, Route, Switch } from 'react-router-dom';
import { NCDefault, NCTabs } from '@cactus/srm-component';
import React from 'react';
import { TabParameter } from '@cactus/srm-component/dist/src/components/Tabs/Tabs';
import { useIntl } from 'react-intl';
import { Challenge } from 'src/models/Challenge';

export interface ChallengeDetailsProps {
    challenge?: Challenge;
    challengeId: string;
    parentProps: any;
    basename: string;
    cashPrize?: string;
}

export const ChallengeDetails: React.FunctionComponent<ChallengeDetailsProps> =
    (props: ChallengeDetailsProps) => {
        const intl = useIntl();
        const routes: Array<TabParameter> = [
            {
                name: intl.formatMessage({ id: 'challenge.tabs.general' }),
                path: props.basename + '/general',
                component: NCDefault,
            },
            {
                name: intl.formatMessage({ id: 'challenge.tabs.settings' }),
                path: props.basename + '/settings',
                component: NCDefault,
            },
            {
                name: intl.formatMessage({ id: 'challenge.tabs.community' }),
                path: props.basename + '/community',
                component: NCDefault,
            },
            {
                name: intl.formatMessage({
                    id: 'challenge.tabs.participants',
                }),
                path: props.basename + '/participants',
                component: NCDefault,
            },
            {
                name: intl.formatMessage({ id: 'challenge.tabs.rewards' }),
                path: props.basename + '/rewards',
                component: NCDefault,
            },
            {
                name: intl.formatMessage({ id: 'challenge.tabs.languages' }),
                path: props.basename + '/languages',
                component: NCDefault,
            },
            {
                name: 'Default Redirection',
                hide: true,
                path: props.basename + '/',
                redirect: props.basename + '/general',
            },
        ];

        return (
            <>
                <NCTabs
                    basename={props.basename}
                    tabs={routes}
                />

                <Switch>
                    {routes.map((route: any, i: any) => {
                        if (route.redirect) {
                            return (
                                <Redirect
                                    exact
                                    from={route.path}
                                    to={route.redirect}
                                />
                            );
                        }
                        return (
                            <Route
                                key={i}
                                path={route.path}
                                render={(p) => (
                                    // pass the sub-routes down to keep nesting
                                    <route.component
                                        {...p}
                                        challengeId={props.challengeId}
                                        challenge={props.challenge}
                                        routes={route.children}
                                    />
                                )}
                            />
                        );
                    })}
                </Switch>
            </>
        );
    };
