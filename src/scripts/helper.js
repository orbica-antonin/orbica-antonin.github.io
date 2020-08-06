export function getMaxMin(geojson, prop) {
    var max = -10000000;
    for (var i=0 ; i<geojson.length ; i++) {
        max = Math.max(parseFloat(geojson[i]["properties"][prop]), max);
    }

    var min = 10000000;
    for (var i=0 ; i<geojson.length ; i++) {
        min = Math.min(parseFloat(geojson[i]["properties"][prop]), min);
    }


    return {min:min,max:max};
}



export function getMaxMinTab(table, prop) {
    var max = -10000000;
    for (var i=0 ; i<table.length ; i++) {
        max = Math.max(parseFloat(table[i][prop]), max);
    }

    var min = 10000000;
    for (var i=0 ; i<table.length ; i++) {
        if(parseFloat(table[i][prop] == -999)) {
            continue;
        }
        min = Math.min(parseFloat(table[i][prop]), min);
    }


    return {min:min,max:max};
}