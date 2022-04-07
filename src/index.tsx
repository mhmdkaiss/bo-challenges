import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import 'bootstrap/dist/css/bootstrap-reboot.min.css';

import * as serviceWorker from './serviceWorker';

import { SRM } from '@nicecactus/srm';

import { ToastContainer } from 'react-toastify';
import App from './pages/App/App';
import './index.scss';
import ContextStore from './store';
import React from 'react';
import 'react-toastify/dist/ReactToastify.min.css';

declare global {
    export interface Window {
        nicecactus: { 'bo-challenges': { render: typeof render } };
    }
}
const render = SRM(
    'nicecactus.bo-challenges',
    () => {
        const Content = () => {
            return (
                <>
                    <App />
                    <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={true}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
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
