import "core-js/stable";
import "regenerator-runtime/runtime";
import "../styles/index.scss";
import JSZip from "jszip";
import axios from "axios";
import { MAP, initMap, centroideLayer, initDeckglLayers } from "./map";
import { URL_TRIP_EDUCATION, URL_SA2POLYGONS, URL_TRIP_WORK } from "./url";
import { stopSpinner, startSpinner } from "./ui";
import { land_district } from "./regions";
import "./ui";
import { land_Subdistrict } from "./regions";
export let SAPOLYGON;
export let EDUCTAIONNAL_TRIPS;
export let WORK_TRIPS;

startSpinner();
var resolveCensusDataEducation = function () {
  console.log("getting Education data");
  return new Promise((resolve) => {
    axios({
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      // },
      method: "get",
      url: URL_TRIP_EDUCATION,
      responseType: "blob",
    })
      .then(function (response) {
        var new_zip = new JSZip();
        new_zip.loadAsync(response.data).then(function (zip) {
          zip
            .file(
              "2018-census-main-means-of-travel-to-education-by-statistical.json"
            )
            .async("string")
            .then(function (data) {
              resolve({ type: "eductionTrip", data: JSON.parse(data) });
              return data;
            });
        });
        return response.data;
      })
      .catch((error) => console.log(error));
  });
};
// work 2018-census-main-means-of-travel-to-work-by-statistical-area.zip
var resolveCensusDataWork = function () {
  console.log("getting Education data");
  return new Promise((resolve) => {
    axios({
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      // },
      method: "get",
      url: URL_TRIP_WORK,
      responseType: "blob",
    })
      .then(function (response) {
        var new_zip = new JSZip();
        new_zip.loadAsync(response.data).then(function (zip) {
          zip
            .file(
              "2018-census-main-means-of-travel-to-work-by-statistical-area.json"
            )
            .async("string")
            .then(function (data) {
              resolve({ type: "workTrip", data: JSON.parse(data) });
              return data;
            });
        });
        return response.data;
      })
      .catch((error) => console.log(error));
  });
};
var resolveSA2polygons = function () {
  console.log("getting Education data");
  return new Promise((resolve) => {
    axios({
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      // },
      method: "get",
      url: URL_SA2POLYGONS,
      responseType: "blob",
    })
      .then(function (response) {
        var new_zip = new JSZip();
        new_zip.loadAsync(response.data).then(function (zip) {
          zip
            .file("sa2aggregatewgs84.geojson")
            .async("string")
            .then(function (data) {
              resolve({ type: "sa2", data: JSON.parse(data) });
              return data;
            });
        });
        return response.data;
      })
      .catch((error) => console.log(error));
  });
};

var initialisedataparallel = function () {
  console.log("==parallel initialisation==");
  return Promise.all([
    resolveCensusDataEducation(),
    resolveSA2polygons(),
    resolveCensusDataWork(),
  ]).then((data) => {
    SAPOLYGON = data.find((element) => element.type == "sa2").data;
    SAPOLYGON.features.forEach((element) => {
      element.id = element.properties.OBJECTID;
    });
    EDUCTAIONNAL_TRIPS = data.find((element) => element.type == "eductionTrip")
      .data;
    WORK_TRIPS = data.find((element) => element.type == "workTrip").data;
    initMap();
    initDeckglLayers();
    land_district(SAPOLYGON);
    land_Subdistrict(SAPOLYGON);
    stopSpinner();
  });
};
initialisedataparallel();
