import mapboxgl from "mapbox-gl";
import { Deck } from "@deck.gl/core";
import { GeoJsonLayer, ArcLayer } from "@deck.gl/layers";
import { MapboxLayer } from "@deck.gl/mapbox";
import FlowMapLayer from "@flowmap.gl/core";
import { TripsLayer } from "@deck.gl/geo-layers";
import chroma from "chroma-js";
import * as d3 from "d3";
import * as geostats from "geostats";
export const MAPBOXKEY =
  "pk.eyJ1IjoiYW50b25pbjY0IiwiYSI6ImNqNnlnc2F0MjAybmwyd2xydWxkcGZ2cG4ifQ.TBlcogPpj9WVTV41EAYGjA";
export const MAPBOXSTYLEBLUE =
  "mapbox://styles/antonin64/cj6yh5j1qazk52ro1axmm3a6w";
export const MAPBOXSTYLEDARKDEFAULT = "mapbox://styles/mapbox/dark-v9";
export const MAPBOXSTYLELIGHTDEFAULT = "mapbox://styles/mapbox/light-v9";
import centroides from "../data/sa2centroides.json";
import schemaDeplacementImg from "../data/schemaDeplacementImage.json";
import { getMaxMin, getMaxMinTab } from "./helper";
import { SAPOLYGON, EDUCTAIONNAL_TRIPS, WORK_TRIPS } from "./index";
import * as d3scaleChromatic from "d3-scale-chromatic";
import { SUBREGIONS } from "./regions";
import { TRANSPORTTYPE, VIZTYPE, TransportModes } from "./ui";
const CENTER_CITIES = centroides;
export const CURRENTBASEMAP = {
  id: "MapBoxBasemap",
  type: "raster",
  source: {
    type: "raster",
    tiles: [
      "https://api.mapbox.com/styles/v1/antonin64/cj6yh5j1qazk52ro1axmm3a6w/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50b25pbjY0IiwiYSI6ImNqNnlnc2F0MjAybmwyd2xydWxkcGZ2cG4ifQ.TBlcogPpj9WVTV41EAYGjA",
    ],
    tileSize: 256,
  },
  paint: {},
};
export const SOURCE_MAPBOX_PERSO = {
  type: "raster",
  tiles: [
    "https://api.mapbox.com/styles/v1/antonin64/cj6yh5j1qazk52ro1axmm3a6w/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50b25pbjY0IiwiYSI6ImNqNnlnc2F0MjAybmwyd2xydWxkcGZ2cG4ifQ.TBlcogPpj9WVTV41EAYGjA",
  ],
  tileSize: 256,
};
export const SOURCE_MAPBOX_LIGHT = {
  type: "raster",
  tiles: [
    "https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50b25pbjY0IiwiYSI6ImNqNnlnc2F0MjAybmwyd2xydWxkcGZ2cG4ifQ.TBlcogPpj9WVTV41EAYGjA",
  ],
  tileSize: 256,
};
export const SOURCE_MAPBOX_DARK = {
  type: "raster",
  tiles: [
    "https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50b25pbjY0IiwiYSI6ImNqNnlnc2F0MjAybmwyd2xydWxkcGZ2cG4ifQ.TBlcogPpj9WVTV41EAYGjA",
  ],
  tileSize: 256,
};
export const SOURCE_OSM = {
  type: "raster",
  tiles: ["https://b.tile.osm.org/{z}/{x}/{y}.png"],
  tileSize: 256,
};
export const SOURCE_LINZ = {
  type: "raster",
  tiles: [
    "http://tiles-a.data-cdn.linz.govt.nz/services;key=f11577986e92458baa1bc5497c3c0d41/tiles/v4/set=4702/EPSG:3857/{z}/{x}/{y}.png",
  ],
  tileSize: 256,
};
export let SYMBOL_LABEL_ID = "0";
export const INITIAL_VIEW_STATE = {
  latitude: -41.53333,
  longitude: 172.63333,
  zoom: 5,
  bearing: 0,
  pitch: 0,
};
export let centroideLayer;
export let polygonSA2Layer;
export let firstSymbolId;
export let AggregateLayer;
const tabColorBlueToPurple = chroma.scale([
  "65d265",
  "80d265",
  "9cd265",
  "b7d265",
  "d2d265",
  "d2b765",
  "d29c65",
  "d28065",
  "d26565",
]);
mapboxgl.accessToken = MAPBOXKEY; // eslint-disable-line
const emptyStyle = {
  version: 8,
  name: "Empty",
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        //"background-color": "hsl(47, 26%, 88%)"
      },
    },
  ],
  id: "empty",
};
let hoveredStateId = null;

export let MAP = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10", // emptyStyle,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  bearing: INITIAL_VIEW_STATE.bearing,
  pitch: INITIAL_VIEW_STATE.pitch,
});
export const U = require("mapbox-gl-utils").init(MAP);

export function initMap() {
  MAP.on("style.load", function () {
    // // MAP.addLayer(CURRENTBASEMAP);
    // MAP.addSource('SOURCE_LINZ', SOURCE_LINZ);
    // MAP.addSource('SOURCE_OSM', SOURCE_OSM);
    // MAP.addSource('SOURCE_MAPBOX_PERSO', SOURCE_MAPBOX_PERSO);
    // // MAP.addSource('SOURCE_MAPBOX_LIGHT', SOURCE_MAPBOX_LIGHT);
    // // MAP.addControl(new mapboxgl.AttributionControl(), 'top-right');
    // // symbol id
    // let layers = MAP.getStyle().layers;
    // // Find the index of the first symbol layer in the map style
    // for (let i = 0; i < layers.length; i++) {
    //     if (layers[i].type === 'symbol') {
    //         SYMBOL_LABEL_ID = layers[i].id;
    //         break;
    //     }
    // }
    // initDeckglLayers();
  });

  MAP.on("mousemove", "sa2OverFills", function (e) {
    if (e.features.length > 0) {
      if (hoveredStateId) {
        MAP.setFeatureState(
          {
            source: "sa2OverSource",
            id: hoveredStateId,
          },
          {
            hover: false,
          }
        );
      }
      hoveredStateId = e.features[0].id;
      MAP.setFeatureState(
        {
          source: "sa2OverSource",
          id: hoveredStateId,
        },
        {
          hover: true,
        }
      );
    }
  });

  MAP.on("mouseleave", "sa2OverFills", function () {
    if (hoveredStateId) {
      MAP.setFeatureState(
        {
          source: "sa2OverSource",
          id: hoveredStateId,
        },
        {
          hover: false,
        }
      );
    }
    hoveredStateId = null;
  });

  String.prototype.hexEncode = function () {
    let hex, i;
    let result = "";
    for (i = 0; i < this.length; i++) {
      hex = this.charCodeAt(i).toString(16);
      result += ("000" + hex).slice(-4);
    }
    return result;
  };

  MAP.on("click", function (e) {
    if (!$("#CheckFlowActivated").is(":checked")) {
      // Aggregate view
      let bbox = [
        [e.point.x - 2, e.point.y - 2],
        [e.point.x + 2, e.point.y + 2],
      ];
      let features = MAP.queryRenderedFeatures(bbox, {
        layers: ["AggregateLayer"],
      });
      let attTypeFlow = "";
      if ($('input[name="TypeFlowRadio"]:checked').val() == "Educationnal") {
        attTypeFlow = "edu_";
      } else {
        attTypeFlow = "work_";
      }
      let attDirection = "";
      if ($('input[name="DirectionRadio"]:checked').val() == "Origin") {
        // mode origin
        attDirection = "_origin";
      } else {
        // mode destination
        attDirection = "_dest";
      }
      let plocation = "";
      let tableData = {};
      let propertiesOnly = [];
      if (features != null) {
        if (features.length > 0) {
          let pProperties = features[0].properties;
          plocation = features[0].properties.SA22018__1;
          Object.keys(pProperties).forEach(function (key, index) {
            if (
              key.includes(attTypeFlow) &&
              key.includes(attDirection) &&
              !key.includes("Total")
            ) {
              if (typeof pProperties[key] == "number") {
                if (pProperties[key] > 0) {
                  tableData[
                    key.replace(attTypeFlow, "").replace(attDirection, "")
                  ] = pProperties[key];
                  propertiesOnly.push(
                    key.replace(attTypeFlow, "").replace(attDirection, "")
                  );
                }
              }
            }
          });
        }
      }
      let location = document.getElementById("location");
      location.innerHTML = plocation;
      let pchart = document.getElementById("chart");
      pchart.innerHTML = ""; // empty
      // create the chart and display
      // set the dimensions and margins of the graph
      let width = 300;
      let height = 300;
      let margin = 50;
      // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
      let radius = Math.min(width, height) / 2 - margin;
      // append the svg object to the div called 'my_dataviz'
      let svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
      let data = tableData;
      let color = d3
        .scaleOrdinal()
        .domain(propertiesOnly)
        .range(d3.schemeCategory10);
      let pie = d3
        .pie()
        .sort(null)
        .value(function (d) {
          return d.value;
        });
      let data_ready = pie(d3.entries(data));
      let arc = d3
        .arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.8);
      let outerArc = d3
        .arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);
      svg
        .selectAll("allSlices")
        .data(data_ready)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", function (d) {
          return color(d.data.key);
        })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);
      svg
        .selectAll("allPolylines")
        .data(data_ready)
        .enter()
        .append("polyline")
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr("points", function (d) {
          let posA = arc.centroid(d);
          let posB = outerArc.centroid(d);
          let posC = outerArc.centroid(d);
          let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
          return [posA, posB, posC];
        });
      svg
        .selectAll("allLabels")
        .data(data_ready)
        .enter()
        .append("text")
        .attr("class", "fa")
        .attr("font-size", function (d) {
          return d.size * 2 + "em";
        })
        .text(function (d) {
          return `${String.fromCharCode(
            "0x" + schemaDeplacementImg.img[d.data.key]
          )}:${d.data.value}`;
        }) // '\uf118'
        .attr("transform", function (d) {
          let pos = outerArc.centroid(d);
          let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
          return "translate(" + pos + ")";
        })
        .style("text-anchor", function (d) {
          let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          return midangle < Math.PI ? "start" : "end";
        });
    } else {
      let bbox = [
        [e.point.x - 2, e.point.y - 2],
        [e.point.x + 2, e.point.y + 2],
      ];
      let features = MAP.queryRenderedFeatures(bbox, {
        layers: ["sa2OverFills"],
      });
      if (features != null) {
        if (features.length > 0) {
          let idSA2 = features[0].properties.SA22018_V1;
          let table = $("#tableregions").DataTable();
          let indexes = table
            .rows()
            .eq(0)
            .filter(function (rowIdx) {
              return table.cell(rowIdx, 2).data() === idSA2 ? true : false;
            });
          let row = table.row(indexes);
          let found = false;
          let $tr = $(row.node());
          if ($tr.hasClass("selected")) {
            table.rows(indexes).deselect();
          } else {
            table.rows(indexes).select();
          }
        }
      }
    }
  });
}

export function initDeckglLayers() {
  let layers = MAP.getStyle().layers;
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol") {
      firstSymbolId = layers[i].id;
      break;
    }
  }
  console.log("start create the layer");
  // Addin the deckgl layers
  centroideLayer = new MapboxLayer({
    type: GeoJsonLayer,
    id: "centroides",
    data: [],
    filled: true,
    getRadius: 50,
    radius: 10,
    getFillColor: [178, 245, 86, 180],
    pickable: true,
    autoHighlight: true,
    // onClick: (info) =>
    //   info.object &&
    //   alert(
    //     `${info.object.properties.name} (${info.object.properties.abbrev})`
    //   ),
  });
  let idstart = MAP.addLayer(centroideLayer);
  centroideLayer.setProps({
    ["data"]: CENTER_CITIES,
  });
  console.log("centroides");
  MAP.addSource("sa2OverSource", {
    type: "geojson",
    data: SAPOLYGON,
  });
  polygonSA2Layer = MAP.addLayer({
    id: "sa2OverFills",
    type: "fill",
    source: "sa2OverSource",
    layout: {},
    paint: {
      "fill-color": "#ffffff",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.3,
        0.0,
      ],
    },
  });
  MAP.addLayer({
    id: "sa2OverLines",
    type: "line",
    source: "sa2OverSource",
    layout: {},
    paint: {
      "line-color": "#EC6608",
      "line-width": 1,
    },
  });
  console.log("polygoons");
  let dataset = SAPOLYGON;
  MAP.addSource("sa2polygonsSource", {
    type: "geojson",
    data: dataset,
  });
  console.log("init source polygoons");
}
export let TripLayer;
function animate() {
  let loopLength = 18000;
  let animationSpeed = 30;
  const timestamp = Date.now() / 1000;
  const loopTime = loopLength / animationSpeed;
  let time = Math.round(((timestamp % loopTime) / loopTime) * loopLength);
  if (TripLayer) {
    TripLayer.setProps({
      ["animationCurrentTime"]: time,
    });
  }
  window.requestAnimationFrame(animate.bind(this));
}
export const MIN_ZOOM_LEVEL = 0;
export const MAX_ZOOM_LEVEL = 20;
export function updateTripLayerData() {
  let selectedIds = SUBREGIONS;
  let TypeOfTransport = TRANSPORTTYPE;
  let tabColorToUse = tabColorBlueToPurple;
  const sizeTrip = 8;
  if (!selectedIds) return;
  if (TripLayer != null && TripLayer) {
    if (typeof TripLayer !== "undefined") {
      try {
        if (MAP.getLayer("trips")) {
          MAP.removeLayer("trips");
        }
      } catch (error) {}
    }
  }
  if (!$("#CheckFlowActivated").is(":checked")) {
    return;
  }

  let largerList = [];
  let selected_Trips = [];
  let NatureCommute = '';
  if ($('input[name="TypeFlowRadio"]:checked').val() == "Educationnal") {
    NatureCommute = "education";
    EDUCTAIONNAL_TRIPS.forEach((element) => {
      if (
        selectedIds.includes(element.SA2_code_educational_address.toString()) ||
        selectedIds.includes(
          element.SA2_code_usual_residence_address.toString()
        )
      ) {
        // add the element
        selected_Trips.push(element);
        if (
          !largerList.includes(element.SA2_code_educational_address.toString())
        ) {
          largerList.push(element.SA2_code_educational_address.toString());
        }
        if (
          !largerList.includes(
            element.SA2_code_usual_residence_address.toString()
          )
        ) {
          largerList.push(element.SA2_code_usual_residence_address.toString());
        }
      }
    });
  } else   {
    NatureCommute = "work";
    WORK_TRIPS.forEach((element) => {
      if (
        selectedIds.includes(element.SA2_code_workplace_address.toString()) ||
        selectedIds.includes(
          element.SA2_code_usual_residence_address.toString()
        )
      ) {
        selected_Trips.push(element);
        if (
          !largerList.includes(element.SA2_code_workplace_address.toString())
        ) {
          largerList.push(element.SA2_code_workplace_address.toString());
        }
        if (
          !largerList.includes(
            element.SA2_code_usual_residence_address.toString()
          )
        ) {
          largerList.push(element.SA2_code_usual_residence_address.toString());
        }
      }
    });
  }

  let typeFlow = VIZTYPE == "VizAnimation" ? "animated" : null;

  // only display the selected flows  selectedIds
  // CENTER_CITIES
  // const unique = [...new Set(AS2polygon.features.map(item => item.properties.land_district))];
  // property SA22018_V1_00: "105300"
  let selected_centers_cities = {
    type: "FeatureCollection",
    features: [],
  };

  let listcity = [];
  CENTER_CITIES.features.forEach((element) => {
    if (largerList.includes(element.properties.SA22018_V1_00)) {
      // add the element
      selected_centers_cities.features.push(element);
      listcity.push(element.properties.SA22018_V1_00);
    }
  });
  let cleanedselected_Trips = selected_Trips;
  let i = cleanedselected_Trips.length;
  while (i--) {
    if (cleanedselected_Trips[i][TypeOfTransport] == -999) {
      cleanedselected_Trips.splice(i, 1);
    }
  }


  // // get the max
  // let MinMax = getMaxMinTab(cleanedselected_Trips, TypeOfTransport);
  // // change legend
  // let list = document.getElementById("trip-legend");
  // list.innerHTML = ""; // empty
  // for (i = 0; i <= 10; i = i + 2) {
  //   let num = (MinMax.max * i) / 10;
  //   list.innerHTML += `<div><span style="background-color: ${tabColorToUse(
  //     i / 10
  //   ).hex()}"></span>${parseInt(num)} trip</div>`;
  // }
  // list.style.display = "block";
  // // do the minmax by SA2_code_usual_residence_address
  // let colorDic = {};
  // cleanedselected_Trips.forEach((element) => {
  //   if (!(element.SA2_code_usual_residence_address in colorDic)) {
  //     colorDic[element.SA2_code_usual_residence_address] = {
  //       minmax: null,
  //       tb: [],
  //     };
  //   }
  //   colorDic[element.SA2_code_usual_residence_address].tb.push(element);
  // });


  // Classes & symbology
  let values = [];
  for (i = 0; i < cleanedselected_Trips.length; i++) {
    if (!isNaN(parseFloat(cleanedselected_Trips[i][TypeOfTransport]))) {
      values.push(parseFloat(cleanedselected_Trips[i][TypeOfTransport]));
    }
  }
  values = values.sort(function (a, b) {
    return a - b;
  });
  const countUniqueValues = new Set(values).size;
  const numberOfClasses = (countUniqueValues>=10)?10:countUniqueValues;
  let gs = new geostats(values);
  let breaks = gs.getClassJenks(numberOfClasses-1);
  tabColorToUse = chroma.scale(["green","yellow", "red" ]);



  // legend
  let list = document.getElementById("trip-legend");
  list.innerHTML = ""; // empty
 
  for (let index = 0; index < numberOfClasses; index++) {
    list.innerHTML += `<div><span style="background-color: ${tabColorToUse(
      index/(numberOfClasses)
    ).hex()}"></span>${parseInt(breaks[index])} trips</div>`;
  }

  list.style.display = "block";




  // color scheme
  const scheme = d3scaleChromatic.schemeOrRd[
    d3scaleChromatic.schemeOrRd.length - 1
  ]
    .slice()
    .reverse();
  const pcolors = {
    darkMode: true,
    flows: {
      scheme,
    },
    locationAreas: {
      outline: 'rgba(11,112,128,0.5)',
      normal: 'rgba(100,220,220,0.5)'
    },
    locationCircles: {
      outgoing:  '#ABA681'  ,
      incoming:  '#77733F'  ,
    },
    outlineColor: "#000",
  };

  TripLayer = new MapboxLayer({
    type: FlowMapLayer,
    id: "trips",
    locations: selected_centers_cities, //   CENTER_CITIES,
    flows: selected_Trips, // tripsJson,
    animate: typeFlow,
    // getAnimatedFlowLineStaggering: (d) =>new alea(`${d.origin}-${d.dest}`)(),
    showTotals: true,
    visible: true,
    showOnlyTopFlows: 500,
    colors:pcolors,
    // highlightedFlow:'flow',
    // colors: pcolors, // https://github.com/etra0/flowmap.gl/blob/master/examples/src/stories/basic.tsx
    animationCurrentTime: 100,
    maxFlowThickness: sizeTrip,
    getFlowColor: (flow) => {

      for (let index = 0; index < numberOfClasses; index++) {
        if(flow[TypeOfTransport] >= breaks[index] && flow[TypeOfTransport] < breaks[index+1] ){
          return tabColorToUse(index/(numberOfClasses)).hex();
        }
      }
      // return flow[TypeOfTransport] == -999
      //   ? tabColorToUse(0)
      //   : tabColorToUse(flow[TypeOfTransport] / MinMax.max);
    },
    getFlowMagnitude: (flow) => flow[TypeOfTransport] || 0, //  flow.Study_at_home / 10 || 0,
    getFlowOriginId: (flow) => flow.SA2_code_usual_residence_address,
    getFlowDestId: (flow) => (NatureCommute == 'education') ? flow.SA2_code_educational_address : flow.SA2_code_workplace_address,
    getLocationId: (loc) => loc.properties.SA22018_V1_00,
    getLocationCentroid: (location) => [
      location.geometry.coordinates[0],
      location.geometry.coordinates[1],
    ],
  });

  MAP.addLayer(TripLayer);
  animate(0);
  //TripLayer.setProps({["locations"]: selected_centers_cities , ["flows"]: selected_Trips });
}

export function initAggregateLayers() {
  let TypeOfTransport = TRANSPORTTYPE;
  let tabColorToUse = chroma.scale(["yellow", "red", "black"]);
  if (AggregateLayer) {
    if (typeof AggregateLayer != "undefined") {
      if (MAP.getLayer("AggregateLayer")) {
        MAP.removeLayer("AggregateLayer");
      }
    }
  }
  // Is it to be displayed?
  if (!$("#CheckAggregatedActivated").is(":checked")) {
    return;
  }
  // create the attribute name to display based on the user query
  let attributeName = "";
  if ($('input[name="TypeFlowRadio"]:checked').val() == "Educationnal") {
    attributeName = "edu_";
  } else {
    attributeName = "work_";
  }
  // define the transport mode studied  (TransportModes)
  // TypeOfTransport give us that informnation
  attributeName = attributeName + TypeOfTransport;
  if ($('input[name="DirectionRadio"]:checked').val() == "Origin") {
    // mode origin
    attributeName = attributeName + "_origin";
  } else {
    // mode destination
    attributeName = attributeName + "_dest";
  }
  // the name of the attribute to change
  // establish the range of color value based
  let dataset = SAPOLYGON;
  if (!SAPOLYGON) {
    return;
  }
  let minmax = getMaxMin(dataset.features, attributeName);
  // get tbale of values
  let values = [];
  for (i = 0; i < dataset.features.length; i++) {
    //max = Math.max(parseFloat(geojson[i]["properties"][prop]), max);
    if (!isNaN(parseFloat(dataset.features[i]["properties"][attributeName]))) {
      values.push(parseFloat(dataset.features[i]["properties"][attributeName]));
    }
  }
  values = values.sort(function (a, b) {
    return a - b;
  });
  let gs = new geostats(values);
  let breaks = gs.getClassJenks(11);
  let list = document.getElementById("trip-legend");
  list.innerHTML = ""; // empty
  let i = 0;
  for (i = 0; i <= 10; i++) {
    let num = (minmax.max * i) / 10;
    list.innerHTML += `<div><span style="background-color: ${tabColorToUse(
      i / 10
    ).hex()}"></span>${parseInt(num)} ${$(
      'input[name="TypeFlowRadio"]:checked'
    ).val()} ${$(
      'input[name="DirectionRadio"]:checked'
    ).val()}  ${TypeOfTransport} trips</div>`;
  }
  list.style.display = "block";
  AggregateLayer = MAP.addLayer({
    id: "AggregateLayer",
    type: "fill",
    source: "sa2polygonsSource",
    layout: {},
    paint: {
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", attributeName],
        breaks[0],
        "#B8B8B8",
        breaks[1],
        tabColorToUse(0.1).hex(),
        breaks[2],
        tabColorToUse(0.2).hex(),
        breaks[3],
        tabColorToUse(0.3).hex(),
        breaks[4],
        tabColorToUse(0.4).hex(),
        breaks[5],
        tabColorToUse(0.5).hex(),
        breaks[6],
        tabColorToUse(0.6).hex(),
        breaks[7],
        tabColorToUse(0.7).hex(),
        breaks[8],
        tabColorToUse(0.8).hex(),
        breaks[9],
        tabColorToUse(0.9).hex(),
        breaks[10],
        tabColorToUse(1).hex(),
      ],
      "fill-opacity": 0.65,
    },
  });
}
