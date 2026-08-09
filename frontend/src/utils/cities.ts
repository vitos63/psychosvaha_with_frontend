export type CityOption = {
    value: string;
    label: string;
};

type City = {
    id: number;
    name: string;
    name_ru: string;
};

let citiesPromise: Promise<City[]> | null = null;

const getCities = (): Promise<City[]> => {
    if (!citiesPromise) {
        const publicUrl = process.env.PUBLIC_URL || '';

        citiesPromise = fetch(`${publicUrl}/data/cities.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load cities: ${response.status}`);
                }

                return response.json() as Promise<City[]>;
            })
            .catch(error => {
                citiesPromise = null;
                throw error;
            });
    }

    return citiesPromise;
};

export const loadCityOptions = async (inputValue: string): Promise<CityOption[]> => {
    const query = inputValue.toLowerCase().trim();
    if (!query) return [];

    const cities = await getCities();

    return cities
        .filter(city =>
            city.name.toLowerCase().includes(query) ||
            city.name_ru.toLowerCase().includes(query)
        )
        .slice(0, 30)
        .map(city => ({
            value: city.name,
            label: `${city.name_ru} (${city.name})`,
        }));
};
