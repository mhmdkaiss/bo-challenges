export class CountryGroup {
    constructor(public countries: Array<string>, public value: string) {}
}

export class Country {
    constructor(
        public active: boolean,
        public iso2: string,
        public name: string,
    ) {}
}
export interface ExtendedCountryGroup extends CountryGroup {
    iso2: string;
}
