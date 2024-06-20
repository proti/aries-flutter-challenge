export enum OptionType { CALL = "Call", PUT = "Put" }
export enum PositionType { LONG = "long", SHORT = "short" }

export type OptionContract = {
    strike_price: number;
    type: OptionType;
    bid: number;
    ask: number;
    long_short: PositionType;
    expiration_date: string;
};