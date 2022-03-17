import { action, Action, createContextStore } from 'easy-peasy';
import { User } from './models/User';
import { JSONValueKeys, LocalStorageService } from './services/local-storage.service';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContextStoreModel {
    user: User | null,
    setUser: Action<ContextStoreModel, User | null>,
}

const ContextStore = createContextStore<ContextStoreModel>(
    {
        user: LocalStorageService.getJsonValue<User>(JSONValueKeys.User),
        setUser: action((state, user) => {
            if (user) {
                LocalStorageService.setJsonValue(JSONValueKeys.User, user);
            } else {
                LocalStorageService.removeItem(JSONValueKeys.User);
            }
            state.user = user;
        }),
    },
    {
        name: 'bo-challenges'
    }
);

export default ContextStore;
