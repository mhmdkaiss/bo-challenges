import { NCTabs, ThemePlatform } from '@cactus/srm-component';
import { TabParameter } from '@cactus/srm-component/dist/src/components/Tabs/Tabs';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import { SRMStore } from '@nicecactus/srm';
import React, { useEffect } from 'react';
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import ContextStore from '../../store';
import { ChallengeList } from '../ChallengeList/ChallengeList';
import './App.scss';
import { AppStore } from './store';

const routes = [
    {
        name: 'Challenge list',
        path: '/list',
        component: ChallengeList,
    },
    {
        name: 'Challenge',
        path: '/details/:id',
        component: ChallengeList,
        hide: true,
    },
    {
        name: 'Default Redirection',
        hide: true,
        path: '/',
        redirect: '/list',
    },
];

const App = () => {
    const Content = () => {
        const basename = SRMStore.useStoreState((s) => s.basename);
        const fetchOrganizations = ContextStore.useStoreActions( (a) => a.fechOrganizations );
        const fechCountryGroups = ContextStore.useStoreActions( (a) => a.fechCountryGroups );
        const fechCountries = ContextStore.useStoreActions( (a) => a.fechCountries );

        useEffect(() => {
            fetchOrganizations();
            fechCountryGroups();
            fechCountries();
        }, []);

        return (
            <MuiThemeProvider theme={ThemePlatform || createMuiTheme()}>
                <AppStore.Provider>
                    <Router basename={basename}>
                        <NCTabs
                            basename={basename}
                            tabs={routes}
                            variant='bo'
                        />
                        <div className={'content-wrapper'}>
                            <Switch>
                                {routes.map((route: any, i: any) => (
                                    <RouteWithSubRoutes key={i} {...route} />
                                ))}
                            </Switch>
                        </div>
                    </Router>
                </AppStore.Provider>
            </MuiThemeProvider>
        );
    };

    return (
        <div
            data-testid="bo-challenge"
            className="bo-challenge"
            style={{
                backgroundImage: `url(${process.env.REACT_APP_S3_URL}/game/5d31aa9684d0814f4c04bbd5/medias/BackgroundImage`,
            }}
        >
            <div className="bo-wrapper">
                <Content />
            </div>
        </div>
    );
};

function RouteWithSubRoutes(route: TabParameter) {
    if (route.redirect) {
        return <Redirect exact from={route.path} to={route.redirect} />;
    }
    if (route.internalLink) {
        return (
            <Route
                path={route.path}
                render={() => {
                    window.location.pathname = route.internalLink as string;
                    return null;
                }}
            />
        );
    }
    if (route.children) {
        return <Route path={route.path}>{SubRoutes(route)}</Route>;
    }

    return (
        <Route
            path={route.path}
            render={(props) => (
                // pass the sub-routes down to keep nesting
                <route.component {...props} routes={route.children} />
            )}
        />
    );
}

function SubRoutes(route: TabParameter) {
    function goodPath(_path: string) {
        return _path && _path === '/' ? '' : _path;
    }
    return (
        <Switch>
            {(route.children as []).map((subRoute: TabParameter, i: any) => (
                <RouteWithSubRoutes
                    key={i}
                    {...{
                        ...subRoute,
                        path: route.path + goodPath(subRoute.path),
                    }}
                />
            ))}
        </Switch>
    );
}

export default App;

