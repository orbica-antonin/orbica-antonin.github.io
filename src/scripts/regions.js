
import {SAPOLYGON,EDUCTAIONNAL_TRIPS}from './index';
import {updateTripLayerData}from './map';


export function land_district(AS2polygon){
    const unique = [...new Set(AS2polygon.features.map(item => item.properties.land_district))];
    var list = document.getElementById('region-checkbox-list');
    //unique.forEach(element => list.innerHTML += '<a class="list-group-item list-group-item-action">' + element + '</li>');
    //unique.forEach(element => list.innerHTML += '<option value="' + element +  '">' + element + '</option>');

 

    var dataitems = [];
    unique.forEach(element => dataitems.push({label: element, value: element}));

    $("#region-checkbox-list").multiselect('dataprovider', dataitems);



}

export let SUBREGIONS;
/// SelectedRegions as array of regions selected by the user
export function land_Subdistrict(AS2polygon ){
    //list-subregion
    // "SA22018_V1": "100400",
    // "SA22018__1": "Karikari Peninsula",
    // "id": 100400,
 
    let selectedSubregions = [];
    let selectedSubregionsTable = [];
    // var tempSub = (AS2polygon.features.filter(item => item.properties.land_district == element)) ;
    var tempSub = AS2polygon.features  ;
    tempSub.forEach(elementsub=>{
        selectedSubregions.push({
            label: elementsub.properties.SA22018__1,
            title: elementsub.properties.SA22018__1,
            value:  elementsub.properties.SA22018_V1,
            groupColumn: elementsub.properties.land_district
        });
        selectedSubregionsTable.push([
            '',
             elementsub.properties.SA22018__1,
             elementsub.properties.SA22018_V1,
             elementsub.properties.land_district
        ]);
    });


        // datatable element
        let t = $('#tableregions').DataTable( 
            
            {
                data: selectedSubregionsTable,
                columnDefs: [ {
                    orderable: false,
                    className: 'select-checkbox',
                    targets:   0
                    },
                    { visible: false, targets: 3 }
                ],
                select: {
                    style:    'os',
                    selector: 'td:first-child',
                    style: 'multi'
                },
                order: [[ 3, 'asc' ]],
                //order: [[ 1, 'asc' ]],
                displayLength: 25,
                rowGroup: {
                    dataSrc:3
                }
            }
        );

        // selectedSubregions.forEach(elementRow => {
        //     t.row.add( [
        //         '',
        //         elementRow.label,
        //         elementRow.value,
        //         elementRow.groupColumn
        //     ] ).draw( false );
        // });


        
        t
        .on( 'select', function ( e, dt, type, indexes ) {
            var subreg = [];
            var rowData = t.rows( indexes ).data().toArray();
            t.rows( { selected: true } ).data().toArray().forEach(selectedelement => {
                subreg.push( (selectedelement[2]).toString( ) );
                
            });
            SUBREGIONS = subreg;
            updateTripLayerData();
        } )
        .on( 'deselect', function ( e, dt, type, indexes ) {
            var subreg = [];
            var rowData = t.rows( indexes ).data().toArray();
            t.rows( { selected: true } ).data().toArray().forEach(selectedelement => {
                subreg.push( (selectedelement[2]).toString( ) );
            });
            SUBREGIONS = subreg;
            updateTripLayerData();
        } );
        

}
