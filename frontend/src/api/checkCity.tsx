export async function checkCity(cityName: string){
    const url = "https://nominatim.openstreetmap.org/search"
    const params = {
        "q": cityName,
        "format": "json",
        "addressdetails": "1",
        "limit": "100",
        "accept-language": "ru",
        "featuretype": "city,town,village",
        "namedetails": "1",
        "dedupe": "1",
        "viewbox": "30.0,60.0,40.0,50.0",
        "bounded": "0",
    }

    const headers = {
        "User-Agent": "MyGeocoderBot/1.0 (vitya.bashkov@mail.ru)"
    }
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
    });
    const urlWithParams = `${url}?${queryParams.toString()}`;

    try {
        const response = await fetch(urlWithParams, {
            method: 'GET',
            headers: headers,
        })
    const data = await response.json()
    if (!data){
        return false
    }

    for (const location of data) {
        const placeType = location.type || "";
        const classType = location.class || "";

        const isCityLike = (
        ["city", "town", "village", "administrative"].includes(placeType) ||
        (classType === "boundary" && placeType === "administrative")
    );
     if (isCityLike) {
        const displayName = location.display_name || "";
        const correctName = displayName.split(",")[0] || "";
        const address = location.address || {};

        const possibleNames = new Set([
            address.city || "",
            address.town || "",
            address.village || "",
            address.municipality || "",
            correctName
        ].filter(name => name && name.trim()));

        const lowerCaseCityName = cityName.toLowerCase();
        const hasExactMatch = Array.from(possibleNames).some(name => 
            name.toLowerCase() === lowerCaseCityName
        );

        if (hasExactMatch) {
            return true;
        }

        if (possibleNames.size > 0) {
            return Array.from(possibleNames)[0]
        }
    }

    }
    return false
    }
    catch (error){
        console.error('Ошибка при проверке города')
        throw error
    }
}
