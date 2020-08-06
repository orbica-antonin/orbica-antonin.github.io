import {
  MAP,
  INITIAL_VIEW_STATE,
  MAPBOXKEY,
  MAPBOXSTYLEBLUE,
  MAPBOXSTYLEDARKDEFAULT,
  MAPBOXSTYLELIGHTDEFAULT,
  BASEMAPS,
  SYMBOL_LABEL_ID} from './map';

import {Deck} from '@deck.gl/core';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';
import FlowMapLayer from '@flowmap.gl/core';
import mapboxgl from 'mapbox-gl';
import centroides from '../data/sa2centroides.json';
import {getMaxMin} from './helper';

const CENTER_CITIES =centroides;
let sizecentroides = 1;




  
  export function renderLayer (psizecentroides,  tripsEducationJson, sa2polygons, selectedIds) {
    


    // min max distance
    var minmax = getMaxMin(sa2polygons.features,'work_Total_dest');
    var step =  minmax.max / 10; 
    var tableColor = [];
    var count = 0 ;


    

    // MAP.addSource('sa2polygonsSource', {
    //   'type': 'geojson',
    //   'data': sa2polygons
    //   });
    // MAP.addLayer({
    //   'id': 'sa2polygons',
    //   'type': 'fill',
    //   'source': 'sa2polygonsSource',
    //   'layout': {},
    //   'paint': {
    //     'fill-color': [
    //     'interpolate',
    //     ['linear'],
    //     ['get', 'work_Total_dest'],
    //     0,
    //     '#F2F12D',
    //     5,
    //     '#EED322',
    //     75,
    //     '#E6B71E',
    //     100,
    //     '#DA9C20',
    //     250,
    //     '#CA8323',
    //     500,
    //     '#B86B25',
    //     750,
    //     '#A25626',
    //     1000,
    //     '#8B4225',
    //     2500,
    //     '#723122'
    //     ],
    //     'fill-opacity': 0.75
    //   }
    // } , SYMBOL_LABEL_ID);


        // limiting tripsEducationJson
        // SA2_code_educational_address: 100100
        // SA2_code_usual_residence_address: 100100
        // SA2_name_educational_address: "North Cape"
        // SA2_name_usual_residence_address: "North Cape"
        let largerList= [];
        let selected_Trips = [];
        tripsEducationJson.forEach(element => {
          if(selectedIds.includes(element.SA2_code_educational_address.toString() ) || selectedIds.includes(element.SA2_code_usual_residence_address.toString() )   ){
              // add the element
              selected_Trips.push(element);
              if(!largerList.includes(element.SA2_code_educational_address.toString())){
                largerList.push(element.SA2_code_educational_address.toString());
              }
              if(!largerList.includes(element.SA2_code_usual_residence_address.toString())){
                largerList.push(element.SA2_code_usual_residence_address.toString());
              }

          }
        });


        // only display the selected flows  selectedIds
        // CENTER_CITIES
        // const unique = [...new Set(AS2polygon.features.map(item => item.properties.land_district))];
        // property SA22018_V1_00: "105300"
        let selected_centers_cities = {type: "FeatureCollection", features:[]};
        CENTER_CITIES.features.forEach(element => {
          if(largerList.includes(element.properties.SA22018_V1_00) ){
              // add the element
              selected_centers_cities.features.push(element);
          }
        });






        var pflow =  new FlowMapLayer({
            id: 'my-flowmap-layer',
            locations:
              // either array of location areas or a GeoJSON feature collection
              selected_centers_cities, //   CENTER_CITIES,
            //   [{ id: 1, name: "Nework", lat: 40.713543, lon: -74.011219 }, 
            //   { id: 2, name: "London", lat: 51.507425, lon: -0.127738 }, 
            //   { id: 3, name: "Riojaneiro", lat: -22.906241, lon: -43.180244 }],
            flows: selected_Trips, // tripsEducationJson,
            //   [{ origin: 1, dest: 2, count: 42 },
            //   { origin: 2, dest: 1, count: 51 },
            //   { origin: 3, dest: 1, count: 50 },
            //   { origin: 2, dest: 3, count: 40 },
            //   { origin: 1, dest: 3, count: 22 },
            //   { origin: 3, dest: 2, count: 42 }],
            //colors:  colors ,
            getFlowMagnitude: (flow) => flow.Study_at_home /10 || 0,
            getFlowOriginId: (flow) => flow.SA2_code_usual_residence_address,
            getFlowDestId: (flow) => flow.SA2_code_educational_address,
            getLocationId: (loc) => loc.properties.SA22018_V1_00,
            getLocationCentroid: (location) => [location.geometry.coordinates[0],location.geometry.coordinates[1]],
          });
  
  
      deckgl.setProps({
        //layers: [centroideLayer]
        layers: [centroideLayer,pflow]
      });
    }
  