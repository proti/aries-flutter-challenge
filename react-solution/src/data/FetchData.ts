import { OptionContract } from "./OptionType";

type JSON = {
    data: Array<OptionContract> | string
}

const FetchData = async (file: string = '../data/data.json') => {
    try {
        const data = await fetch(file, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        const json: JSON = await data.json();
        return json.data;
    } catch (e: unknown) {
        console.log(e);
        return "Error loading JSON";
    }
};
export default FetchData;