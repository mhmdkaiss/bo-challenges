import './App.scss';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { AppStore } from './store';
import React from 'react';
import { SRMStore } from '@nicecactus/srm';
import { MenuPage } from '../MenuPage/MenuPage';

const routes = [
    {
        path: '/',
        component: MenuPage,
    },
];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const App = () => {
    const basename = SRMStore.useStoreState(s => s.basename);

    const Content = () => {
        return (
            <AppStore.Provider>
                <Router basename={basename}>
                    <Switch>
                        {routes.map((route, i) => (
                            <RouteWithSubRoutes key={i} {...route} />
                        ))}
                    </Switch>
                </Router>
            </AppStore.Provider>
        );
    };

    return <Content />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RouteWithSubRoutes(route: any) {
    return (
        <Route
            path={route.path}
            render={(props) => (
                // pass the sub-routes down to keep nesting
                <route.component {...props} routes={route.routes} />
            )}
        />
    );
}

export default App;
