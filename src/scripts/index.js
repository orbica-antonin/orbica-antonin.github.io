import '../styles/index.scss';
import JSZip from "jszip";
import axios from 'axios';
import {MAP,initMap,centroideLayer,initDeckglLayers} from './map';
//import {renderLayer}from './vizmap';
import {URL_TRIP_EDUCATION,URL_SA2POLYGONS,URL_TRIP_WORK} from './url';
import {stopSpinner,startSpinner} from './ui';
import {land_district} from './regions';
import './ui';
import {land_Subdistrict} from './regions';


startSpinner();
// initialise map
 
var resolveCensusDataEducation = function() {
  console.log("getting Education data");
  return new Promise(resolve => {
    axios({
      method: 'get',
      url: URL_TRIP_EDUCATION,
      responseType: 'blob'
    }).then(function (response) {
      var new_zip = new JSZip();
      new_zip.loadAsync(response.data)
      .then(function(zip) {
          zip.file("2018-census-main-means-of-travel-to-education-by-statistical.json").async("string").then(function (data) {
              resolve(   {type: 'eductionTrip', data: JSON.parse(data)}    );
              return data;
            });
      });
      return response.data;
    })
    .catch(error => console.log(error));
  });
};
// work 2018-census-main-means-of-travel-to-work-by-statistical-area.zip
var resolveCensusDataWork = function() {
  console.log("getting Education data");
  return new Promise(resolve => {
    axios({
      method: 'get',
      url: URL_TRIP_WORK,
      responseType: 'blob'
    }).then(function (response) {
      var new_zip = new JSZip();
      new_zip.loadAsync(response.data)
      .then(function(zip) {
          zip.file("2018-census-main-means-of-travel-to-work-by-statistical-area.json").async("string").then(function (data) {
              resolve(   {type: 'workTrip', data: JSON.parse(data)}    );
              return data;
            });
      });
      return response.data;
    })
    .catch(error => console.log(error));
  });
};
var resolveSA2polygons = function() {
  console.log("getting Education data");
  return new Promise(resolve => {
    axios({
      method: 'get',
      url: URL_SA2POLYGONS,
      responseType: 'blob'
    }).then(function (response) {
      var new_zip = new JSZip();
      new_zip.loadAsync(response.data)
      .then(function(zip) {
          zip.file("sa2aggregatewgs84.geojson").async("string").then(function (data) {
              resolve(   {type: 'sa2', data: JSON.parse(data)}    );
              return data;
            });
      });
      return response.data;
    })
    .catch(error => console.log(error));
  });
};

 
export let SAPOLYGON;
export let EDUCTAIONNAL_TRIPS;
export let WORK_TRIPS;
var initialisedataparallel = function() {
  console.log('==parallel initialisation==');
  return Promise.all([resolveCensusDataEducation(), resolveSA2polygons(), resolveCensusDataWork()]).then((data) => {
    
    // console.log(data[0]); // lente
    // console.log(data[1]); // rapide
    // console.log(data[2]); // rapide
    // Data is here, start initialising map data
    
    // let parseData = JSON.parse(data);
    SAPOLYGON = data.find(element => element.type == 'sa2').data;
    SAPOLYGON.features.forEach(element => {
      element.id = element.properties.OBJECTID;
    });
    EDUCTAIONNAL_TRIPS = data.find(element => element.type == 'eductionTrip').data;
    WORK_TRIPS = data.find(element => element.type == 'workTrip').data;
    initMap();
  
    // renderLayer(
    //   null,
    //   EDUCTAIONNAL_TRIPS ,
    //   SAPOLYGON,
    //   []);
    initDeckglLayers();
    land_district(SAPOLYGON);
    land_Subdistrict(SAPOLYGON);
    stopSpinner();
  });
};
initialisedataparallel();
