export const generateConfig = (filePath, mapDetails, config) => {
    const fileName = filePath.split('/').pop();
    const center = [mapDetails.center[1], mapDetails.center[0]]; // Convert to [lat, lon]

    console.log(mapDetails)

    let thisMap = config.search_center.perMap.find(item => item.fileName === fileName)
    thisMap.latitude = center[0]
    thisMap.longitude = center[1]
    thisMap.zoom = mapDetails.zoom
    thisMap.features = mapDetails.features

    config.search_center.perMap = config.search_center.perMap.map(item => item.fileName === fileName ? thisMap : item)

    const jsonString = JSON.stringify(config, null, 2);
    return jsonString;
}; 