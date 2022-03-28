import { action, Action, createContextStore } from 'easy-peasy';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextStoreModel {
    challengeId: string;
    setChallengeId: Action<ContextStoreModel, string>;
}

const ContextStore = createContextStore<ContextStoreModel>(
    {
        challengeId: '',
        setChallengeId: action((state, challengeId) => {
            state.challengeId = challengeId;
        }),
    },
    {
        name: 'bo-challenges'
    }
);

export default ContextStore;
