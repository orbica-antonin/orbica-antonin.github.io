import mapboxgl from 'mapbox-gl';
import {
    Deck
} from '@deck.gl/core';
import {
    GeoJsonLayer,
    ArcLayer
} from '@deck.gl/layers';
import {
    MapboxLayer
} from '@deck.gl/mapbox';
import FlowMapLayer from '@flowmap.gl/core';
import {
    TripsLayer
} from '@deck.gl/geo-layers';

import chroma from "chroma-js";

 

export const MAPBOXKEY = 'pk.eyJ1IjoiYW50b25pbjY0IiwiYSI6ImNqNnlnc2F0MjAybmwyd2xydWxkcGZ2cG4ifQ.TBlcogPpj9WVTV41EAYGjA';
export const MAPBOXSTYLEBLUE = 'mapbox://styles/antonin64/cj6yh5j1qazk52ro1axmm3a6w';
export const MAPBOXSTYLEDARKDEFAULT = 'mapbox://styles/mapbox/dark-v9';
export const MAPBOXSTYLELIGHTDEFAULT = 'mapbox://styles/mapbox/light-v9';
import centroides from '../data/sa2centroides.json';
import {
    getMaxMin, getMaxMinTab
} from './helper';
import {
    SAPOLYGON,
    EDUCTAIONNAL_TRIPS,
    WORK_TRIPS
} from './index';
import * as d3scaleChromatic from 'd3-scale-chromatic';

import {SUBREGIONS} from './regions';
import {TRANSPORTTYPE,VIZTYPE} from './ui';



const CENTER_CITIES = centroides;
// const {MapboxLayer, GeoJsonLayer} = deck;
export const CURRENTBASEMAP = {
    'id': 'MapBoxBasemap',
    'type': 'raster',
    'source': {
        'type': 'raster',
        'tiles': ['https://api.mapbox.com/styles/v1/antonin64/cj6yh5j1qazk52ro1axmm3a6w/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50b25pbjY0IiwiYSI6ImNqNnlnc2F0MjAybmwyd2xydWxkcGZ2cG4ifQ.TBlcogPpj9WVTV41EAYGjA'],
        'tileSize': 256
    },
    'paint': {}
};
export const SOURCE_MAPBOX_PERSO = {
    'type': 'raster',
    'tiles': ['https://api.mapbox.com/styles/v1/antonin64/cj6yh5j1qazk52ro1axmm3a6w/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50b25pbjY0IiwiYSI6ImNqNnlnc2F0MjAybmwyd2xydWxkcGZ2cG4ifQ.TBlcogPpj9WVTV41EAYGjA'],
    'tileSize': 256
};
export const SOURCE_MAPBOX_LIGHT = {
    'type': 'raster',
    'tiles': ['https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50b25pbjY0IiwiYSI6ImNqNnlnc2F0MjAybmwyd2xydWxkcGZ2cG4ifQ.TBlcogPpj9WVTV41EAYGjA'],
    'tileSize': 256
};
export const SOURCE_MAPBOX_DARK = {
    'type': 'raster',
    'tiles': ['https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50b25pbjY0IiwiYSI6ImNqNnlnc2F0MjAybmwyd2xydWxkcGZ2cG4ifQ.TBlcogPpj9WVTV41EAYGjA'],
    'tileSize': 256
};
export const SOURCE_OSM = {
    'type': 'raster',
    'tiles': ['https://b.tile.osm.org/{z}/{x}/{y}.png'],
    'tileSize': 256
};
export const SOURCE_LINZ = {
    'type': 'raster',
    'tiles': ['http://tiles-a.data-cdn.linz.govt.nz/services;key=f11577986e92458baa1bc5497c3c0d41/tiles/v4/set=4702/EPSG:3857/{z}/{x}/{y}.png'],
    'tileSize': 256
};
export let SYMBOL_LABEL_ID = '0';
export const INITIAL_VIEW_STATE = {
    latitude: -43.53333,
    longitude: 172.63333,
    zoom: 3,
    bearing: 30,
    pitch: 30
};


const tabColorYellowToRed = ['#ffff40', '#fffd3f', '#fffb3d', '#fff93b', '#fff73a', '#fff538', '#fff337', '#fff135', '#ffef34', '#ffed32', '#ffeb31', '#ffe930', '#ffe72e', '#ffe52d', '#ffe22c', '#ffe02a', '#ffde29', '#ffdc28', '#ffda27', '#fed826', '#fed624', '#fed423', '#fed222', '#fed021', '#fdce20', '#fdcc1f', '#fdca1e', '#fdc81d', '#fdc61c', '#fcc41a', '#fcc219', '#fcc018', '#fbbe17', '#fbbc16', '#fbba15', '#fbb814', '#fab613', '#fab412', '#fab211', '#f9af10', '#f9ad0f', '#f8ab0e', '#f8a90d', '#f8a70c', '#f7a50b', '#f7a30a', '#f7a109', '#f69f08', '#f69d08', '#f59b07', '#f59906', '#f49705', '#f49405', '#f49204', '#f39003', '#f38e03', '#f28c02', '#f28a02', '#f18801', '#f18501', '#f08300', '#f08100', '#ef7f00', '#ef7d00', '#ee7a00', '#ee7800', '#ed7600', '#ec7400', '#ec7100', '#eb6f00', '#eb6d00', '#ea6b00', '#ea6800', '#e96600', '#e96300', '#e86100', '#e75e00', '#e75c00', '#e65900', '#e55700', '#e55400', '#e45200', '#e44f00', '#e34c00', '#e24900', '#e24700', '#e14400', '#e04000', '#e03d00', '#df3a00', '#de3600', '#de3300', '#dd2f00', '#dc2b00', '#dc2700', '#db2200', '#da1c00', '#d91500', '#d90c00', '#d80000'];
 
const tabColorBlueToPurple = chroma.scale(['49b6ff', '779be7', 'a480cf', 'd264b6', 'ff499e', 'ef476f']);


// Set your mapbox token here
mapboxgl.accessToken = MAPBOXKEY; // eslint-disable-line
const emptyStyle = {
    "version": 8,
    "name": "Empty",
    "sources": {},
    "layers": [{
        "id": "background",
        "type": "background",
        "paint": {
            //"background-color": "hsl(47, 26%, 88%)"
        }
    }],
    "id": "empty"
};
export let MAP = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10', // emptyStyle,
    // Note: deck.gl will be in charge of interaction and event handling
    // interactive: false,
    center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
    zoom: INITIAL_VIEW_STATE.zoom,
    bearing: INITIAL_VIEW_STATE.bearing,
    pitch: INITIAL_VIEW_STATE.pitch
});
export const U = require('mapbox-gl-utils').init(MAP);
export function initMap() {
    MAP.on('load', function() {
        // MAP.addLayer(CURRENTBASEMAP);
        MAP.addSource('SOURCE_LINZ', SOURCE_LINZ);
        MAP.addSource('SOURCE_OSM', SOURCE_OSM);
        MAP.addSource('SOURCE_MAPBOX_PERSO', SOURCE_MAPBOX_PERSO);
        // MAP.addSource('SOURCE_MAPBOX_LIGHT', SOURCE_MAPBOX_LIGHT);
        // MAP.addControl(new mapboxgl.AttributionControl(), 'top-right');
        // symbol id
        var layers = MAP.getStyle().layers;
        // Find the index of the first symbol layer in the map style
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol') {
                SYMBOL_LABEL_ID = layers[i].id;
                break;
            }
        }
    });
    // // MAP.on('mousemove', ({point}) => {
    // //   if (polygonSA2Layer) {
    // //     polygonSA2Layer.setProps({mousePosition: [point.x, point.y]});
    // //   }
    // // });
    // // When the user moves their mouse over the state-fill layer, we'll update the
    // // feature state for the feature under the mouse.
    MAP.on('mousemove', 'sa2OverFills', function(e) {
        if (e.features.length > 0) {
            if (hoveredStateId) {
                MAP.setFeatureState({
                    source: 'sa2OverSource',
                    id: hoveredStateId
                }, {
                    hover: false
                });
            }
            hoveredStateId = e.features[0].id;
            MAP.setFeatureState({
                source: 'sa2OverSource',
                id: hoveredStateId
            }, {
                hover: true
            });
        }
    });
    var hoveredStateId = null;
    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    MAP.on('mouseleave', 'sa2OverFills', function() {
        if (hoveredStateId) {
            MAP.setFeatureState({
                source: 'sa2OverSource',
                id: hoveredStateId
            }, {
                hover: false
            });
        }
        hoveredStateId = null;
    });
    // MAP.on('mousemove', function() {
    //     // sizecentroides =   MAP.getZoom();
    //     // renderLayer(sizecentroides,null);
    // });
    MAP.on('zoom', function() {
        // sizecentroides =   MAP.getZoom();
        // renderLayer(sizecentroides,null);
    });
}
export let centroideLayer;
export let polygonSA2Layer;
export function initDeckglLayers() {
    // Addin the deckgl layers
    centroideLayer = new MapboxLayer({
        type: GeoJsonLayer,
        id: 'centroides',
        data: [],
        // Styles
        filled: true,
        getRadius: 50, //(1/psizecentroides)*2000,
        radius: 10,
        getFillColor: [178, 245, 86, 180],
        pickable: true,
        autoHighlight: true,
        onClick: info =>
            info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
    });
    MAP.addLayer(centroideLayer);
    centroideLayer.setProps({
        ["data"]: CENTER_CITIES
    });
    MAP.addSource('sa2OverSource', {
        'type': 'geojson',
        'data': SAPOLYGON
    });
    polygonSA2Layer = MAP.addLayer({
        'id': 'sa2OverFills',
        'type': 'fill',
        'source': 'sa2OverSource',
        'layout': {},
        'paint': {
            'fill-color': '#ffffff',
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.3,
                0.0
            ]
        }
    });
    MAP.addLayer({
        'id': 'sa2OverLines',
        'type': 'line',
        'source': 'sa2OverSource',
        'layout': {},
        'paint': {
            'line-color': '#000000',
            'line-width': 1
        }
    });
    // var dataset = SAPOLYGON;
    // polygonSA2Layer = new MapboxLayer({
    //     type: GeoJsonLayer,
    //     id: 'geojson-layer',
    //     data : SAPOLYGON,
    //     pickable: true,
    //     stroked: false,
    //     filled: true,
    //     extruded: true,
    //     lineWidthScale: 20,
    //     lineWidthMinPixels: 2,
    //     getFillColor: [160, 160, 180, 200],
    //     getLineColor:  [160, 160, 180, 200],
    //     getRadius: 100,
    //     getLineWidth: 1,
    //     getElevation: 30
    //   });
    //   MAP.addLayer(polygonSA2Layer );
    // TripLayer = new MapboxLayer({
    //     type: FlowMapLayer,
    //     id: 'trips',
    //     locations: [], //   CENTER_CITIES,
    //     flows: [], // tripsEducationJson,
    //     getFlowMagnitude: (flow) => flow.Study_at_home /10 || 0,
    //     getFlowOriginId: (flow) => flow.SA2_code_usual_residence_address,
    //     getFlowDestId: (flow) => flow.SA2_code_educational_address,
    //     getLocationId: (loc) => loc.properties.SA22018_V1_00,
    //     getLocationCentroid: (location) => [location.geometry.coordinates[0],location.geometry.coordinates[1]],
    // });
    // TripLayer = new MapboxLayer({
    //     type: FlowMapLayer,
    //     id: 'trips',
    //     locations: [], //   CENTER_CITIES,
    //     flows: [], // tripsEducationJson,
    //     animate: 'animated',
    //     // getAnimatedFlowLineStaggering: (d) =>new alea(`${d.origin}-${d.dest}`)(),
    //     showTotals: true,
    //     visible: true,
    //     highlightedFlow:'flow',
    //     animationCurrentTime: 100,
    //     getFlowMagnitude: (flow) => flow.Study_at_home /10 || 0,
    //     getFlowOriginId: (flow) => flow.SA2_code_usual_residence_address,
    //     getFlowDestId: (flow) => flow.SA2_code_educational_address,
    //     getLocationId: (loc) => loc.properties.SA22018_V1_00,
    //     getLocationCentroid: (location) => [location.geometry.coordinates[0],location.geometry.coordinates[1]],
    // });
    // MAP.addLayer(TripLayer );
    // animate(0);
};
export let TripLayerEducation;
export let TripLayerWork;
function animate() {
    var loopLength = 18000; // unit corresponds to the timestamp in source data
    var animationSpeed = 30; // unit time per second
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;
    var time = Math.round(((timestamp % loopTime) / loopTime) * loopLength);
    // WHAT SHOULD I DO NOW???
    if (TripLayerEducation) {
        TripLayerEducation.setProps({
            ["animationCurrentTime"]: time
        });
    }
    if (TripLayerWork) {
        TripLayerWork.setProps({
            ["animationCurrentTime"]: time
        });
    }
    window.requestAnimationFrame(animate.bind(this));
}
export const MIN_ZOOM_LEVEL = 0;
export const MAX_ZOOM_LEVEL = 20;
// This function will update the layer trips providing a lists of ids to display
export function updateTripLayerData() {
    
    let selectedIds = SUBREGIONS ; 
    let TypeOfTransport = TRANSPORTTYPE; 


    if(!selectedIds) return;

    // delete previously selected
    if (TripLayerEducation!= null && TripLayerEducation) {
        if (typeof TripLayerEducation != 'undefined') {
            // Remove map layer & source.
            MAP.removeLayer('tripsEducation');
        }
    }
    if (TripLayerWork) {
        if (typeof TripLayerWork != 'undefined') {
            // Remove map layer & source.
            MAP.removeLayer('tripsWork');
        }
    }







    // limiting tripsEducationJson
    // SA2_code_educational_address: 100100
    // SA2_code_usual_residence_address: 100100
    // SA2_name_educational_address: "North Cape"
    // SA2_name_usual_residence_address: "North Cape"
    // Are we in eduction mode ?
    if ($('input[name="TypeFlowRadio"]:checked').val() == "Educationnal") {
        let largerList = [];
        let selected_Trips = [];
        EDUCTAIONNAL_TRIPS.forEach(element => {
            if (selectedIds.includes(element.SA2_code_educational_address.toString()) || selectedIds.includes(element.SA2_code_usual_residence_address.toString())) {
                // add the element
                selected_Trips.push(element);
                if (!largerList.includes(element.SA2_code_educational_address.toString())) {
                    largerList.push(element.SA2_code_educational_address.toString());
                }
                if (!largerList.includes(element.SA2_code_usual_residence_address.toString())) {
                    largerList.push(element.SA2_code_usual_residence_address.toString());
                }
            }
        });
        // only display the selected flows  selectedIds
        // CENTER_CITIES
        // const unique = [...new Set(AS2polygon.features.map(item => item.properties.land_district))];
        // property SA22018_V1_00: "105300"
        let selected_centers_cities = {
            type: "FeatureCollection",
            features: []
        };
        CENTER_CITIES.features.forEach(element => {
            if (largerList.includes(element.properties.SA22018_V1_00)) {
                // add the element
                selected_centers_cities.features.push(element);
            }
        });


        var cleanedselected_Trips = selected_Trips;
        var i = cleanedselected_Trips.length;
        while (i--) {
            if (cleanedselected_Trips[i][TypeOfTransport] == -999) { 
                cleanedselected_Trips.splice(i, 1);
            } 
        }
        // get the max 
        var MinMax = getMaxMinTab(cleanedselected_Trips,TypeOfTransport);

        

        const scheme = (d3scaleChromatic.schemeGnBu[d3scaleChromatic.schemeGnBu.length - 1])
            .slice()
            .reverse();
        const pcolors = {
            darkMode: true,
            flows: {
                scheme,
            },
            locationAreas: {
                normal: '#334',
            },
            outlineColor: '#000',
        };




        if(VIZTYPE == 'VizAnimation'){
            TripLayerEducation = new MapboxLayer({
                type: FlowMapLayer,
                id: 'tripsEducation',
                locations: selected_centers_cities, //   CENTER_CITIES,
                flows: selected_Trips, // tripsEducationJson,
                animate: 'animated',
                // getAnimatedFlowLineStaggering: (d) =>new alea(`${d.origin}-${d.dest}`)(),
                showTotals: true,
                visible: true,
                showOnlyTopFlows: 500,
                //highlightedFlow:'flow',
                colors: pcolors, // https://github.com/etra0/flowmap.gl/blob/master/examples/src/stories/basic.tsx
                animationCurrentTime: 100,
                maxFlowThickness:8,
                getFlowColor:(flow) => {   
                    if(flow[TypeOfTransport]/ MinMax.max > 1 ){
                        debugger;
                    }
                    return  ((flow[TypeOfTransport] == -999) ? tabColorBlueToPurple(0): tabColorBlueToPurple((flow[TypeOfTransport]/ MinMax.max)));    
                },
                getFlowMagnitude: (flow) => flow[TypeOfTransport]  || 0,  //  flow.Study_at_home / 10 || 0,
                getFlowOriginId: (flow) => flow.SA2_code_usual_residence_address,
                getFlowDestId: (flow) => flow.SA2_code_educational_address,
                getLocationId: (loc) => loc.properties.SA22018_V1_00,
                getLocationCentroid: (location) => [location.geometry.coordinates[0], location.geometry.coordinates[1]],
            });

        }else{
            TripLayerEducation = new MapboxLayer({
                type: FlowMapLayer,
                id: 'tripsEducation',
                locations: selected_centers_cities,
                flows: selected_Trips,
                showTotals: true,
                visible: true,
                maxFlowThickness:25,
                showOnlyTopFlows: 500,
                //highlightedFlow:'flow',
                colors: pcolors, // https://github.com/etra0/flowmap.gl/blob/master/examples/src/stories/basic.tsx
                getFlowColor:(flow) => {   
                    return  ((flow[TypeOfTransport] == -999) ? tabColorBlueToPurple(0): tabColorBlueToPurple((flow[TypeOfTransport]/ MinMax.max)));    
                },
                getFlowMagnitude: (flow) => flow[TypeOfTransport] * 10 || 0,  //  flow.Study_at_home / 10 || 0,
                getFlowOriginId: (flow) => flow.SA2_code_usual_residence_address,
                getFlowDestId: (flow) => flow.SA2_code_educational_address,
                getLocationId: (loc) => loc.properties.SA22018_V1_00,
                getLocationCentroid: (location) => [location.geometry.coordinates[0], location.geometry.coordinates[1]],
            });
        }

        MAP.addLayer(TripLayerEducation);


    }else if ($('input[name="TypeFlowRadio"]:checked').val() == "Work") {
        let largerList = [];
        let selected_Trips = [];
        WORK_TRIPS.forEach(element => {
            if (selectedIds.includes(element.SA2_code_workplace_address.toString()) || selectedIds.includes(element.SA2_code_usual_residence_address.toString())) {
                // add the element
                selected_Trips.push(element);
                if (!largerList.includes(element.SA2_code_workplace_address.toString())) {
                    largerList.push(element.SA2_code_workplace_address.toString());
                }
                if (!largerList.includes(element.SA2_code_usual_residence_address.toString())) {
                    largerList.push(element.SA2_code_usual_residence_address.toString());
                }
            }
        });
        let selected_centers_cities = {
            type: "FeatureCollection",
            features: []
        };
        CENTER_CITIES.features.forEach(element => {
            if (largerList.includes(element.properties.SA22018_V1_00)) {
                // add the element
                selected_centers_cities.features.push(element);
            }
        });
        const scheme = (d3scaleChromatic.schemeOrRd[d3scaleChromatic.schemeOrRd.length - 1])
            .slice()
            .reverse();
        const pcolors = {
            darkMode: true,
            flows: {
                scheme,
            },
            locationAreas: {
                normal: '#334',
            },
            outlineColor: '#000',
        };



        var cleanedselected_Trips = selected_Trips;
        var i = cleanedselected_Trips.length;
        while (i--) {
            if (cleanedselected_Trips[i][TypeOfTransport] == -999) { 
                cleanedselected_Trips.splice(i, 1);
            } 
        }
        // get the max 
        var MinMax = getMaxMinTab(cleanedselected_Trips,TypeOfTransport);


        if(VIZTYPE == 'VizAnimation'){
            TripLayerWork = new MapboxLayer({
                type: FlowMapLayer,
                id: 'tripsWork',
                locations: selected_centers_cities, //   CENTER_CITIES,
                flows: selected_Trips, // tripsEducationJson,
                animate: 'animated',
                // getAnimatedFlowLineStaggering: (d) =>new alea(`${d.origin}-${d.dest}`)(),
                showTotals: true,
                visible: true,
                showOnlyTopFlows: 500,
                //highlightedFlow:'flow',
                colors: pcolors, // https://github.com/etra0/flowmap.gl/blob/master/examples/src/stories/basic.tsx
                animationCurrentTime: 100,
                maxFlowThickness:8,
                getFlowColor:(flow) => {   
                    return  ((flow[TypeOfTransport] == -999) ? tabColorBlueToPurple(0): tabColorBlueToPurple((flow[TypeOfTransport]/ MinMax.max)));    
                },
                getFlowMagnitude:   (flow) => flow[TypeOfTransport]  || 0,  //  flow.Study_at_home / 10 || 0,
                getFlowOriginId: (flow) => flow.SA2_code_usual_residence_address,
                getFlowDestId: (flow) => flow.SA2_code_workplace_address,
                getLocationId: (loc) => loc.properties.SA22018_V1_00,
                getLocationCentroid: (location) => [location.geometry.coordinates[0], location.geometry.coordinates[1]],
            });
        }else{
            TripLayerWork = new MapboxLayer({
                type: FlowMapLayer,
                id: 'tripsWork',
                locations: selected_centers_cities, 
                flows: selected_Trips, 
                showTotals: true,
                visible: true,
                showOnlyTopFlows: 500,
                //highlightedFlow:'flow',
                colors: pcolors, // https://github.com/etra0/flowmap.gl/blob/master/examples/src/stories/basic.tsx
                animationCurrentTime: 100,
                maxFlowThickness:8,
                getFlowColor:(flow) => {   
                    return  ((flow[TypeOfTransport] == -999) ? tabColorBlueToPurple(0): tabColorBlueToPurple((flow[TypeOfTransport]/ MinMax.max)));    
                },
                getFlowMagnitude:   (flow) => flow[TypeOfTransport]  || 0,  //  flow.Study_at_home / 10 || 0,
                getFlowOriginId: (flow) => flow.SA2_code_usual_residence_address,
                getFlowDestId: (flow) => flow.SA2_code_workplace_address,
                getLocationId: (loc) => loc.properties.SA22018_V1_00,
                getLocationCentroid: (location) => [location.geometry.coordinates[0], location.geometry.coordinates[1]],
            });
        }


        MAP.addLayer(TripLayerWork);
    }
    animate(0);
    //TripLayer.setProps({["locations"]: selected_centers_cities , ["flows"]: selected_Trips });
}