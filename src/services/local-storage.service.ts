export enum JSONValueKeys {
    User = 'user'
}

export enum StringValueKeys {
    RefreshToken = 'refreshToken',
    AccessToken = 'accessToken'
}
export class LocalStorageService {
    static removeItem(key: StringValueKeys | JSONValueKeys): void {
        localStorage.removeItem(key);
    }

    static getJsonValue<T>(key: JSONValueKeys): T | null {
        const userString = localStorage.getItem(key);
        if (userString) {
            return JSON.parse(userString);
        }
        return null;
    }

    static setJsonValue<T>(key: JSONValueKeys, value: T): void {
        return localStorage.setItem(key, JSON.stringify(value));
    }

    static getStringValue(key: StringValueKeys): string | null {
        return localStorage.getItem(key);
    }

    static setStringValue(key: StringValueKeys, value: string): void {
        return localStorage.setItem(key, value);
    }

    static getToken = () => localStorage.getItem('accessToken');
}
