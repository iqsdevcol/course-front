export interface States {
    id:     number;
    name:   string;
    code:   number;
    status: string;
    cities: City[];
}

export interface City {
    id:        number;
    stateId:   number;
    stateName: string;
    name:      string;
    code:      number;
    status:    string;
}

