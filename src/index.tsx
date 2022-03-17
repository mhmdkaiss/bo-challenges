import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import 'bootstrap/dist/css/bootstrap-reboot.min.css';
import './index.scss';

import * as serviceWorker from './serviceWorker';

import { SRM } from '@nicecactus/srm';

import App from './pages/App/App';
import ContextStore from './store';
import React from 'react';

declare global {
    export interface Window {
        nicecactus: { corner: { render: typeof render } };
    }
}

const render = SRM(
    'nicecactus.corner',
    () => {
        const Content = () => {
            return (
                <>
                    <App />
                </>
            );
        };

        return (
            <ContextStore.Provider>
                <Content />
            </ContextStore.Provider>
        );
    },
    (lang: string) => require(`./_translations/${lang}.json`),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

export default render;
