import { MAP, BASEMAPS_COURCES } from "./map";
import { land_Subdistrict } from "./regions";
import { SAPOLYGON } from "./index";
import schemaDeplacement from "../data/schemaDeplacement.json";
import {
  updateTripLayerData,
  initAggregateLayers,
  AggregateLayer,
  firstSymbolId,
} from "./map";
export const SPINNER_EL = document.getElementById("loader");
export function stopSpinner() {
  SPINNER_EL.style.visibility = "hidden";
}
export function startSpinner() {
  SPINNER_EL.style.visibility = "visible";
}
export const TransportModes = schemaDeplacement;
export let TRANSPORTTYPE;
export let VIZTYPE;
/* BaseMaps -------------------*/
function closeBasemapList() {
  if ($("#BasemapsList").is(":visible")) {
    $("#BasemapsList").css("display", "none"); //hidden
    $("#BasemapsList").css("visibility", "hidden"); //hidden
  } else {
    $("#BasemapsList").css("display", "flex"); //hidden
    $("#BasemapsList").css("visibility", "visible"); //hidden
  }
}
$("#menuItemBasemapsManager").click(function () {
  closeBasemapList();
});
$(".basemapsbtns").on("click", function () {
  closeBasemapList();
});
function getlastLayerID() {
  var layers = MAP.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  var firstSymbolId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].id === "background") {
      firstSymbolId = i;
      break;
    }
  }
  return firstSymbolId + 1;
}
//
$("#BMSatellite").click(function () {
  //MapBoxBasemap
  MAP.setStyle("mapbox://styles/mapbox/satellite-v9");
});
$("#BMLight").click(function () {
  MAP.setStyle("mapbox://styles/mapbox/light-v10");
});
$("#BMDark").click(function () {
  MAP.setStyle("mapbox://styles/mapbox/dark-v10");
});
$("#BMStreet").click(function () {
  MAP.setStyle("mapbox://styles/mapbox/streets-v11");
});
$("#BMOutdoors").click(function () {
  MAP.setStyle("mapbox://styles/mapbox/outdoors-v11");
});
//--Not modal
$("#menuItemARselector").click(function () {});
$("#ARselector").on("shown.bs.modal", function () {
  $(document).off("focusin.bs.modal");
  $(".modal-backdrop").shown();
});
// Aggregateselector
$("#Aggregateselector").on("shown.bs.modal", function () {
  $(document).off("focusin.bs.modal");
  $(".modal-backdrop").hide();
});
$(document).ready(function () {
  $("#ARselector").show();
  $("#region-checkbox-list").multiselect({
    buttonContainer: '<div id="region-checkbox-list-container"></div>',
    buttonClass: "",
    templates: {
      button: "",
      ul: '<ul class="multiselect-container checkbox-list"></ul>',
    },
    onChange: function (element, checked) {
      var brands = $("#region-checkbox-list option:selected");
      var subreg = [];
      $(brands).each(function (index, brand) {
        // alert([$(this).val()]);
        // get the selected sub regions
        subreg.push($(this).val());
      });
      land_Subdistrict(SAPOLYGON, subreg);
    },
  });
  // Radio button Work / eductaion
  $('input[name="TypeFlowRadio"]').change(function () {
    let selected_value = $('input[name="TypeFlowRadio"]:checked').val();
    var component = document.getElementById("DivTransportMode");
    component.innerHTML = "";
    if (selected_value == "Educationnal") {
      for (const [key, value] of Object.entries(TransportModes["education"])) {
        var htmlData = `<div class="form-check">
                    <input class="form-check-input" type="radio" name="transportType" id="${key}" value="${key}">
                    <label class="form-check-label" for="${key}">
                    ${value}
                    </label>
                </div> `;
        component.innerHTML += htmlData;
      }
    } else {
      for (const [key, value] of Object.entries(TransportModes["work"])) {
        var htmlData = `<div class="form-check">
                    <input class="form-check-input" type="radio" name="transportType" id="${key}" value="${key}">
                    <label class="form-check-label" for="${key}">
                    ${value}
                    </label>
                </div> `;
        component.innerHTML += htmlData;
      }
    }
    // total by default
    TRANSPORTTYPE = "Total";
    $("#Total").prop("checked", true);
    // change the flow dataviz
    updateTripLayerData();
    initAggregateLayers();
    $('input[name="transportType"]').change(function () {
      let selected_value = $('input[name="transportType"]:checked').val();
      TRANSPORTTYPE = selected_value;
      // change the flow dataviz
      updateTripLayerData();
      initAggregateLayers();
    });
  });
  // change programmaticly Educationnal - initialisation
  $('input[name="TypeFlowRadio"]').val = "Educationnal";
  var component = document.getElementById("DivTransportMode");
  component.innerHTML = "";
  for (const [key, value] of Object.entries(TransportModes["education"])) {
    var htmlData = `<div class="form-check">
            <input class="form-check-input" type="radio" name="transportType" id="${key}" value="${key}">
            <label class="form-check-label" for="${key}">
            ${value}
            </label>
        </div> `;
    component.innerHTML += htmlData;
  }
  TRANSPORTTYPE = "Total";
  $("#Total").prop("checked", true);
  initAggregateLayers();
  $('input[name="transportType"]').change(function () {
    let selected_value = $('input[name="transportType"]:checked').val();
    TRANSPORTTYPE = selected_value;
    // change the flow dataviz
    updateTripLayerData();
    initAggregateLayers();
  });
  // initialise the first view
  $('input[name="VizType"]').change(function () {
    let selected_value = $('input[name="VizType"]:checked').val();
    VIZTYPE = selected_value;
    // change the flow dataviz
    updateTripLayerData();
  });
  // default values
  VIZTYPE = "VizAnimation";
  // DirectionRadio
  $('input[name="DirectionRadio"]').change(function () {
    // change the flow dataviz
    initAggregateLayers();
  });
  $("#CheckFlowActivated").change(function () {
    if ($("#CheckFlowActivated").is(":checked")) {
      $("#CheckAggregatedActivated").prop("checked", false);
    }
    initAggregateLayers();
    updateTripLayerData();
  });
  $("#CheckAggregatedActivated").change(function () {
    if ($("#CheckAggregatedActivated").is(":checked")) {
      $("#CheckFlowActivated").prop("checked", false);
    }
    initAggregateLayers();
    updateTripLayerData();
  });
});
