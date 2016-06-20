/**
 * Created by andreiafariacarvalho on 21/03/16.
 */



// ********************************************* GLOBAL VARIABLES *********************************************

var dataFile = "/data.json"; // JSON object file where we have all data stored

var heightTextArea = 700;
var javaEditor; // related to CodeMirror textarea
var editableMode = false; // true if the textarea is editable, false otherwise

var currentTimes; // current times of the visualizations
var stepintoTimes; // array with all times for the stepinto visualization
var stepintoTimesIndex;

var idHTMLNav = "navbar";

var idHTMLSourceCode = "source-code";
var idHTMLSourceCodeInfo = "source-info"; //HTML id for the source code visualization
// HTML ids of all sliders
var idHTMLSlider_vis = "stepSlider_vis";
var idHTMLTextSlider_vis = "step_text_vis";
var idHTMLNavTextSlider_vis = "nav_step_text_vis";
// HTML ids where the stack and heap visualization is shown
var idHTMLStack_vis = "vis_stack";
var idHTMLHeap_vis = "vis_heap";
var idHTMLArrows_vis = "vis_arrows";

var idHTMLIllustration = "written_illustration";

var idHTMLAllSettings = "all_settings";
var idHTMLNavAllSettings = "nav_all_settings";

// variables related to breakpoints
var breakPointList = [];
var idHTMLBreakPointClear = "break_point_clear";
var idHTMLBreakPointNext = "break_point_next";
var idHTMLNavBreakPointClear = "nav_break_point_clear";
var idHTMLNavBreakPointNext = "nav_break_point_next";

// HTML ids related to the voice/speech illustration
var idHTMLVoiceIllustration = "voice_illustration";
var idHTMLStop = "voice_stop";
var idHTMLReplay = "voice_replay";
var idHTMLVoiceVolume = "voice_volume";
var idHTMLMuteVoice = "volume_mute";
var idHTMLMaxVoice = "volume_max";
var idHTMLNavStop = "nav_voice_stop";
var idHTMLNavReplay = "nav_voice_replay";
var idHTMLNavVoiceVolume = "nav_voice_volume";
var idHTMLNavMuteVoice = "nav_volume_mute";
var idHTMLNavMaxVoice = "nav_volume_max";

var idHTMLTextEdit = "text_edit";
var idHTMLTextSave = "text_save";



// ****************************************** Template.visualization ******************************************

Template.visualization.helpers({
});

Template.visualization.events({
    'click :button': function(event, template) {
        switch(event.target.id) {
            // text area
            case idHTMLTextEdit:
                textAreaEditableMode(true);
                break;
            case idHTMLTextSave:
                if(editableMode) {
                    var newCode = javaEditor.getValue();
                    Meteor.call('saveFile', newCode, function(error, result) {
                        //textAreaEditableMode(false);
                        if(error) {
                            console.log(error);
                            toastr.error(error.reason, "ERROR");
                            //writeIllustration(error);
                        } else {
                            if(result == "OK") {
                                toastr.success("Source code processed successfully!", "SUCCESS");
                            } else {
                                toastr.error(result, "ERROR");
                            }
                            //console.log(result);
                            //writeIllustration(result);
                            //textAreaEditableMode(false);
                        }
                    });
                }
                break;
            // breakpoints
            case idHTMLBreakPointClear:
            case idHTMLNavBreakPointClear:
                if(!editableMode) {
                    breakPointList = [];
                    showSourceCode(currentTimes, idHTMLSourceCodeInfo, javaEditor, dataFile);
                }
                break;
            case idHTMLBreakPointNext:
            case idHTMLNavBreakPointNext:
                if(!editableMode) {
                    goNextBreakPoint(dataFile);
                }
                break;
            // speech synthesis
            case idHTMLStop:
            case idHTMLNavStop:
                if(!editableMode) {
                    window.speechSynthesis.cancel();
                }
                break;
            case idHTMLReplay:
            case idHTMLNavReplay:
                if(!editableMode) {
                    speechSynthesisReplay(dataFile, currentTimes);
                }
                break;
            // back/forward step
            default:
                if(!editableMode) {
                    stepBackFor(event.target.id);
                    showStackAndHeap(currentTimes, idHTMLStack_vis, idHTMLHeap_vis, idHTMLArrows_vis, dataFile);
                    showSourceCode(currentTimes, idHTMLSourceCodeInfo, javaEditor, dataFile);
                }
        }
    },

    'change :input': function(event, template) {
        if(!editableMode) {
            if (event.target.id == idHTMLSlider_vis) {
                var index = event.target.value;
                currentTimes = stepintoTimes[index];
                setSlider(idHTMLSlider_vis, idHTMLTextSlider_vis, stepintoTimes.length - 1, index);
                setSlider(idHTMLSlider_vis, idHTMLNavTextSlider_vis, stepintoTimes.length - 1, index);
                showStackAndHeap(currentTimes, idHTMLStack_vis, idHTMLHeap_vis, idHTMLArrows_vis, dataFile);
                showSourceCode(currentTimes, idHTMLSourceCodeInfo, javaEditor, dataFile);
            }
        }
    }
});

Template.visualization.rendered = function() {

    // ---------- basic settings ----------

    // in case the used browser doesn't support the "speech synthesis", the voice settings are hidden
    if(!('speechSynthesis' in window)) {
        document.getElementById(idHTMLVoiceIllustration).style.display = "none";
    }

    // set all current times for the visualization
    currentTimes = 0;
    setStepintoTimes();

    // hidden all settings for the visualization in the navigation bar
    document.getElementById(idHTMLNavAllSettings).style.visibility = "hidden";

    toastr.options = {
        "showDuration": "3000"
    };

    // ---------- textarea ----------

    // configure the CodeMirror textarea
    javaEditor = CodeMirror.fromTextArea(document.getElementById(idHTMLSourceCode), {
        gutters: ["CodeMirror-linenumbers", "breakpoints"],
        lineNumbers: true, // Whether to show line numbers to the left of the editor.
        lineWrapping: false, // Whether CodeMirror should scroll or wrap for long lines. Defaults to false (scroll).
        matchBrackets: true, // Defines an option matchBrackets which, when set to true, causes matching brackets to be highlighted whenever the cursor is next to them.
        mode: "text/x-java", // The mode to use. When not given, this will default to the first mode that was loaded.
        tabSize: 3, // The width of a tab character. Defaults to 4.
        scrollbarStyle: "simple", // Chooses a scrollbar implementation.
        readOnly: true // This disables editing of the editor content by the user. If the special value "nocursor" is given (instead of simply true), focusing of the editor is also disallowed.
    });
    // for the break-point
    javaEditor.on("gutterClick", function(cm, n) {
        if(breakPointList.indexOf(n+1) != -1) { // remove a break-point
            breakPointList.splice(breakPointList.indexOf(n+1),1);
        } else { // add a new break-point
            breakPointList.push(n+1);
        }
        showSourceCode(currentTimes, idHTMLSourceCodeInfo, javaEditor, dataFile);
    });
    // size of the textarea
    javaEditor.setSize("100%", heightTextArea);

    // no editable mode
    textAreaEditableMode(false);

    // ---------- listener: textarea ----------

    //// some event listeners for the textarea when there is a click, in the way to always have the current executed line underlined
    //javaEditor.on("mousedown", function() {
    //    showSourceCode(currentTimes, idHTMLSourceCodeInfo, javaEditor, dataFile);
    //});
    //javaEditor.on("dblclick", function() {
    //    showSourceCode(currentTimes, idHTMLSourceCodeInfo, javaEditor, dataFile);
    //});

    // ---------- addEventListener: others ----------

    // in case the screen is resized
    window.addEventListener("resize", function() {
        showStackAndHeapWithoutIllustration(currentTimes, idHTMLStack_vis, idHTMLHeap_vis, idHTMLArrows_vis, dataFile);
    });

    // set up the volume for the audio
    document.getElementById(idHTMLNavVoiceVolume).value = 10;
    document.getElementById(idHTMLVoiceVolume).value = 10;

    // volume sliders
    document.getElementById(idHTMLVoiceVolume).addEventListener("click", function() {
        document.getElementById(idHTMLNavVoiceVolume).value = document.getElementById(idHTMLVoiceVolume).value;
    });
    document.getElementById(idHTMLNavVoiceVolume).addEventListener("click", function() {
        document.getElementById(idHTMLVoiceVolume).value = document.getElementById(idHTMLNavVoiceVolume).value;
    });
    // images related to volume settings clickable
    document.getElementById(idHTMLMuteVoice).addEventListener("click", function(){
        document.getElementById(idHTMLVoiceVolume).value = 0;
        document.getElementById(idHTMLNavVoiceVolume).value = 0;
    });
    document.getElementById(idHTMLNavMuteVoice).addEventListener("click", function(){
        document.getElementById(idHTMLVoiceVolume).value = 0;
        document.getElementById(idHTMLNavVoiceVolume).value = 0;
    });
    document.getElementById(idHTMLMaxVoice).addEventListener("click", function(){
        document.getElementById(idHTMLVoiceVolume).value = document.getElementById(idHTMLVoiceVolume).max;
        document.getElementById(idHTMLNavVoiceVolume).value = document.getElementById(idHTMLNavVoiceVolume).max;
    });
    document.getElementById(idHTMLNavMaxVoice).addEventListener("click", function(){
        document.getElementById(idHTMLVoiceVolume).value = document.getElementById(idHTMLVoiceVolume).max;
        document.getElementById(idHTMLNavVoiceVolume).value = document.getElementById(idHTMLNavVoiceVolume).max;
    });

    // when a page is scrolled and the settings are hidden, then the settings nav has to appear
    window.addEventListener("scroll", function() {
        var element = document.getElementById(idHTMLAllSettings);
        if(checkElemVisibleOnScreen(element)) {
            document.getElementById(idHTMLNavAllSettings).style.visibility = "hidden";
        } else {
            document.getElementById(idHTMLNavAllSettings).style.visibility = "visible";
        }
    });

    // set text area
    showSourceCode(currentTimes, idHTMLSourceCodeInfo, javaEditor, dataFile);
};



// ********************************** FUNCTIONS FOR STACK&HEAP VISUALIZATION **********************************

/**
 * This is the main function for the visualization of the stack and heap (with illustration).
 * Given the location where to show the stack and heap, it reads the data file and visualize the state at one specific time.
 * @param time - selected time
 * @param idHTMLStack - id of the HTML tag where the stack visualization is located
 * @param idHTMLHeap - id of the HTML tag where the heap visualization is located
 * @param idHTMLArrows - id of the HTML tag where all arrows are shown
 * @param dataJSONFile - JSON object file where we have all data stored
 */
function showStackAndHeap(time, idHTMLStack, idHTMLHeap, idHTMLArrows, dataJSONFile) {
    d3.json(dataJSONFile, function(error, data) {
        if(!error) {
            // variables needed to draw arrows
            var listArrowsStart = [], listArrows = [];

            // set positions of text/rect objects of d3.js
            var marginTable = 5;
            var rowWidth = 80, rowHeight = 30;
            var xName = 5, yName = 15;
            var widthTot = marginTable + rowWidth * 2 + marginTable;

            // STACK&HEAP VISUALIZATION
            var stackHeap = getJSONStackHeap(data, time);

            document.getElementById(idHTMLStack).innerHTML = "";
            document.getElementById(idHTMLHeap).innerHTML = "";

            if(time != 0) {
                // STACK VISUALIZATION
                listArrowsStart = visualizationStack(idHTMLStack, stackHeap.stack, marginTable, rowWidth, rowHeight, xName, yName, widthTot);

                // HEAP VISUALIZATION
                var widthStack = document.getElementById(idHTMLStack).getBoundingClientRect().width + 5;
                listArrows = visualizationHeap(idHTMLHeap, stackHeap.heap, marginTable, rowWidth, rowHeight, xName, yName, widthTot, listArrowsStart, widthStack);
            }
            // draw all arrows
            drawArrowsOfStackHeap(idHTMLArrows, idHTMLStack, idHTMLHeap, widthTot, listArrows);

            // illustration: text and voice
            illustrationTextVoice(stackHeap.illustration);
        } else {
            console.log("error: problem on reading the data JSON file");
        }
    });
}

/**
 * This is the main function for the visualization of the stack and heap (without illustration).
 * Given the location where to show the stack and heap, it reads the data file and visualize the state at one specific time.
 * @param time - selected time
 * @param idHTMLStack - id of the HTML tag where the stack visualization is located
 * @param idHTMLHeap - id of the HTML tag where the heap visualization is located
 * @param idHTMLArrows - id of the HTML tag where all arrows are shown
 * @param dataJSONFile - JSON object file where we have all data stored
 */
function showStackAndHeapWithoutIllustration(time, idHTMLStack, idHTMLHeap, idHTMLArrows, dataJSONFile) {
    d3.json(dataJSONFile, function(error, data) {
        if(!error) {
            // variables needed to draw arrows
            var listArrowsStart = [], listArrows = [];

            // set positions of text/rect objects of d3.js
            var marginTable = 5;
            var rowWidth = 80, rowHeight = 30;
            var xName = 5, yName = 15;
            var widthTot = marginTable + rowWidth * 2 + marginTable;

            // STACK&HEAP VISUALIZATION
            var stackHeap = getJSONStackHeap(data, time);

            document.getElementById(idHTMLStack).innerHTML = "";
            document.getElementById(idHTMLHeap).innerHTML = "";

            if(time != 0) {
                // STACK VISUALIZATION
                listArrowsStart = visualizationStack(idHTMLStack, stackHeap.stack, marginTable, rowWidth, rowHeight, xName, yName, widthTot);

                // HEAP VISUALIZATION
                var widthStack = document.getElementById(idHTMLStack).getBoundingClientRect().width + 5;
                listArrows = visualizationHeap(idHTMLHeap, stackHeap.heap, marginTable, rowWidth, rowHeight, xName, yName, widthTot, listArrowsStart, widthStack);
            }
            // draw all arrows
            drawArrowsOfStackHeap(idHTMLArrows, idHTMLStack, idHTMLHeap, widthTot, listArrows);
        } else {
            console.log("error: problem on reading the data JSON file");
        }
    });
}

/**
 * The function takes all stack information (data and coordinates) and shows the stack visualization inside the space given by a specific id.
 * @param idHTML - id of the HTML tag where the stack is located
 * @param stackJSON - data of the stack in JSON format
 * @param marginTable - margin (top=bottom=left=right) of the table composed by variables (names and values) of frames
 * @param rowWidth - cells dimensions
 * @param rowHeight - cells dimensions
 * @param xNameFrame - x position of the frame's name
 * @param yNameFrame - y position of the frame's name
 * @param widthTot - total width (stack + heap)
 */
function visualizationStack(idHTML, stackJSON, marginTable, rowWidth, rowHeight, xNameFrame, yNameFrame, widthTot) {
    var numberVariables = [];
    for(var index = 0; index < stackJSON.length; index++) {
        numberVariables.push(Object.keys(stackJSON[index].content).length);
    }

    var listArrowsStart = [];

    var stack = d3.select("#" + idHTML)
        .attr("height", (marginTable * 2 + marginTable + yNameFrame) * numberVariables.length + numberVariables.reduce(add, 0) * rowHeight)
        .attr("width", widthTot)
        .append("g")
        .attr("transform", "translate(0,0)");

    // show the name of the frames
    var stackRow = stack.selectAll("g")
        .data(stackJSON)
        .enter().append("g")
        .attr("transform", function(d,i) {
            var h = 0;
            if(i > 0) {
                for(var v = 0; v < i; v++) {
                    h += 2 * marginTable + rowHeight * Object.keys(stackJSON[v].content).length + yNameFrame + marginTable;
                }
            }
            return "translate(0," + h + ")";
        });
    stackRow.append("rect") // variables: names
        .attr("x", xNameFrame)
        .attr("y", marginTable)
        .attr("width", rowWidth*2 + marginTable)
        .attr("height", function(d) {
            return yNameFrame + marginTable + (rowHeight)*d.content.length;
        })
        .style("fill-opacity", 0.3)
        .style("fill", "#C0C0C0");
    stackRow.append("text")
        .attr("x", xNameFrame + marginTable/2)
        .attr("y", yNameFrame)
        .attr("dy", ".35em")
        .style("fill", "black")
        .style("font-size", "12px")
        .style("text-decoration", "underline")
        .text(function(d) { return "" + d.name + " - line: " + d.line; });

    // show all variables
    var nameVariable = stackRow.selectAll("g.cell")
        .data(function(d,i) {
            var obj = [];
            for(var n = 0; n < d.content.length; n++) {
                obj.push({
                    "name": d.content[n].name,
                    "value": d.content[n].value,
                    "color": d.content[n].color,
                    "i": i
                });
            }
            return obj;
        })
        .enter().append("g")
        .attr("transform", "translate(0,0)");
    nameVariable.append("text") // variables: names
        .attr("x", xNameFrame - marginTable + rowWidth)
        .attr("y", function(d,i) { return rowHeight/2 + i * rowHeight + marginTable + yNameFrame + marginTable/2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .style("fill", "black")
        .style("font-size", "12px")
        .text(function(d) { return d.name; });
    nameVariable.append("rect") // variables: values
        .attr("x", xNameFrame + rowWidth)
        .attr("y", function(d,i) { return 5 + marginTable + i * rowHeight + yNameFrame; })
        .attr("width", rowWidth)
        .attr("height", rowHeight-5)
        .style("fill-opacity", 0.5)
        .style("fill", function(d) { return d.color; });
    nameVariable.append("text")
        .attr("x", xNameFrame + marginTable + rowWidth)
        .attr("y", function(d,i) { return rowHeight/2 + i * rowHeight + marginTable + yNameFrame + marginTable/2; })
        .attr("dy", ".35em")
        .style("fill", "black")
        .style("font-size", "12px")
        .text(function(d,i) {
            if(d.value.substring(0,9) == "_pointer_") { // in case the variable points to an object
                var xPointerPos = marginTable + rowWidth + rowWidth;
                var h = 0;
                if(d.i > 0) {
                    for(var v = 0; v < d.i; v++) {
                        h += 2 * marginTable + rowHeight * Object.keys(stackJSON[v].content).length + yNameFrame + marginTable;
                    }
                }
                var yPointerPos = rowHeight/2 + i * rowHeight + marginTable + h + yNameFrame;
                listArrowsStart.push({
                    "x": xPointerPos,
                    "y": yPointerPos,
                    "objectId": d.value.substring(d.value.indexOf("@") + 1)
                });
                return "";
            }
            return d.value; // in case the variable doesn't point to an object
        });
    nameVariable.append("path") // vertical line between name of the field and its value
        .attr("d", function(d, i) {
            var x = xNameFrame + rowWidth;
            var y_start = i * rowHeight + marginTable + yNameFrame + 5;
            var y_end = y_start + rowHeight - 5;
            return "M " + x + " " + y_start + " L " + x + " " + y_end;
        })
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", 1);
    nameVariable.append("path") // horizontal line below each field
        .attr("d", function(d, i) {
            var x_start = xNameFrame + rowWidth;
            var x_end = x_start + rowWidth;
            var y = i * rowHeight + marginTable + yNameFrame + rowHeight;
            return "M " + x_start + " " + y + " L " + x_end + " " + y;
        })
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", 1);

    return listArrowsStart;
}

/**
 * The function takes all heap information (data and coordinates) and shows the heap visualization inside the space given by a specific id.
 * @param idHTML - id of the HTML tag where the stack is located
 * @param heapJSON - data of the heap in JSON format
 * @param marginTable margin (top=bottom=left=right) of the table composed by fields (names and values) of objects
 * @param rowWidth - cells dimensions
 * @param rowHeight - cells dimensions
 * @param xNameObject - x position of the frame's name
 * @param yNameObject - y position of the frame's name
 * @param widthTot - total width (stack + heap)
 * @param listArrowsStart - list that has all position of the variables that as value points to an object
 * @param widthStack - width of the HTML containing the visualization of the stack
 */
function visualizationHeap(idHTML, heapJSON, marginTable, rowWidth, rowHeight, xNameObject, yNameObject, widthTot, listArrowsStart, widthStack) {
    var numberFields = [];
    var countEmpty = 0;
    for(var index = 0; index < heapJSON.length; index++) {
        if(Object.keys(heapJSON[index].content).length == 0) {
            countEmpty++;
        }
        numberFields.push(Object.keys(heapJSON[index].content).length);
    }

    var listArrows = [];
    var listArrowsObjects = [];

    var heap = d3.select("#" + idHTML)
        .attr("height", (marginTable * 2 + yNameObject) * numberFields.length + (numberFields.reduce(add, 0) + countEmpty) * rowHeight)
        .attr("width", widthTot)
        .attr("transform", "translate(0,0)");

    // show the name of the objects (part 1)
    var heapRow = heap.selectAll("g")
        .data(heapJSON)
        .enter().append("g")
        .attr("transform", function(d,i) {
            var h = 0;
            if(i > 0) {
                for(var v = 0; v < i; v++) {
                    h += 2 * marginTable + rowHeight * Math.max(Object.keys(heapJSON[v].content).length,1) + yNameObject;
                }
            }
            return "translate(0," + h + ")";
        });

    // show all fields
    var nameFields = heapRow.selectAll("g.cell")
        .data(function(d,i) {
            var obj = [];
            for(var n = 0; n < d.content.length; n++) {
                obj.push({
                    "name": d.content[n].name,
                    "value": d.content[n].value,
                    "color": d.content[n].color,
                    "i": i
                });
            }
            return obj;
        })
        .enter().append("g")
        .attr("class", "cell")
        .attr("transform", "translate(0,0)");
    nameFields.append("rect") // object: names
        .attr("x", xNameObject)
        .attr("y", function(d,i) { return marginTable + i * rowHeight + yNameObject; })
        .attr("width", rowWidth)
        .attr("height", rowHeight)
        .style("fill", "#6699FF")
        .style("fill-opacity", 0.5);
    nameFields.append("text")
        .attr("x", xNameObject - marginTable + rowWidth)
        .attr("y", function(d,i) { return rowHeight/2 + i * rowHeight + marginTable + yNameObject; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .style("fill", "black")
        .style("font-size", "12px")
        .text(function(d, i) { return d.name || i; });
    nameFields.append("rect") // object: values
        .attr("x", xNameObject + rowWidth)
        .attr("y", function(d,i) { return marginTable + i * rowHeight + yNameObject; })
        .attr("width", rowWidth)
        .attr("height", rowHeight)
        .style("fill", function(d) { return d.color; })
        .style("fill-opacity", 0.5);
    nameFields.append("text")
        .attr("x", xNameObject + marginTable + rowWidth)
        .attr("y", function(d,i) { return rowHeight/2 + i * rowHeight + marginTable + yNameObject; })
        .attr("dy", ".35em")
        .style("fill", "black")
        .style("font-size", "12px")
        .text(function(d,i) {
            if(d.value == "NULL") { // null pointer
                return "";
            }
            if(d.value.substring(0,9) == "_pointer_") { // in case the variable points to an object
                var h = 0;
                if(d.i > 0) {
                    for(var v = 0; v < d.i; v++) {
                        h += 2 * marginTable + rowHeight * Math.max(Object.keys(heapJSON[v].content).length,1) + yNameObject;
                    }
                }
                var xPointerPos = widthStack + rowWidth * 2 + marginTable * 2;
                var yPointerPos = rowHeight/2 + i * rowHeight + marginTable + h + yNameObject;
                listArrowsObjects.push({
                    "x": xPointerPos,
                    "y": yPointerPos,
                    "objectId": d.value.substring(d.value.indexOf("@") + 1)
                });
                return "";
            }
            return d.value;
        });
    nameFields.append("path") // vertical line between name of the field and its value
        .attr("d", function(d, i) {
            var x = xNameObject + rowWidth;
            var y_start = i * rowHeight + marginTable + yNameObject;
            var y_end = y_start + rowHeight;
            return "M " + x + " " + y_start + " L " + x + " " + y_end;
        })
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", 1);
    nameFields.append("path") // horizontal line below each field
        .attr("d", function(d, i) {
            var x_start = xNameObject;
            var x_end = x_start + rowWidth*2;
            var y = i * rowHeight + marginTable + yNameObject + rowHeight;
            return "M " + x_start + " " + y + " L " + x_end + " " + y;
        })
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", 1);
    // show the name of the objects (part 2)
    heapRow.append("text")
        .attr("x", xNameObject)
        .attr("y", yNameObject - marginTable)
        .attr("dy", ".35em")
        .style("fill", "#606060")
        .style("font-size", "12px")
        .style("text-decoration", "underline")
        .text(function(d, i) {
            var currentObjectId = d.oid.substring(d.oid.indexOf("@")+1);
            for(var index = 0; index < listArrowsStart.length; index++) { // search if there are variables pointing to the object
                if(currentObjectId == listArrowsStart[index].objectId) {
                    var h = 0;
                    if(i > 0) {
                        for(var v = 0; v < i; v++) {
                            h += 2 * marginTable + rowHeight * Math.max(Object.keys(heapJSON[v].content).length,1) + yNameObject;
                        }
                    }
                    var lineData = [{
                        "x": listArrowsStart[index].x,
                        "y": listArrowsStart[index].y
                    },{
                        "x": widthStack + xNameObject,
                        "y": yNameObject + h
                    }, { "mode": 1 }];
                    listArrows.push(lineData);
                }
            }
            for(var index = 0; index < listArrowsObjects.length; index++) { // search if there is a field in objects pointing to the object
                if(currentObjectId == listArrowsObjects[index].objectId) {
                    var h = 0;
                    if(i > 0) {
                        for(var v = 0; v < i; v++) {
                            h += 2 * marginTable + rowHeight * Math.max(Object.keys(heapJSON[v].content).length,1) + yNameObject;
                        }
                    }
                    var lineData = [{
                        "x": listArrowsObjects[index].x,
                        "y": listArrowsObjects[index].y
                    },{
                        "x": listArrowsObjects[index].x + marginTable,
                        "y": yNameObject + h - marginTable
                    }, { "mode": 2 }];
                    listArrows.push(lineData);
                }
            }
            if(d.name == "array") {
                return "array";
            } else {
                var name = d.oid.substring(0,d.oid.indexOf("@"));
                return name.substr(name.lastIndexOf(".") + 1); // show the name of the object
            }
        });
    heapRow.append("rect") // object: names
        .attr("x", xNameObject)
        .attr("y", yNameObject - marginTable + 10)
        .attr("width", rowWidth*2)
        .attr("height", function(d,i) { if(d.content.length == 0) { return rowHeight; } return 0; })
        .style("fill", function(d,i) { if(d.content.length == 0) { return "#C0C0C0"; } return ""; });

    return listArrows;
}

/**
 * The function takes all arrow information (data/coordinates) and draws all arrows that are in, into the space given by a specific id.
 * @param idHTMLArrows - id of the HTML tag where we have the are to draw all arrows
 * @param idHTMLStack - id of the HTML tag where the stack visualization is located
 * @param idHTMLHeap - id of the HTML tag where the heap visualization is located
 * @param widthTot - total width (stack + heap)
 * @param listArrows - data with all information needed (coordinates) to draw all arrows
 */
function drawArrowsOfStackHeap(idHTMLArrows, idHTMLStack, idHTMLHeap, widthTot, listArrows) {
    document.getElementById(idHTMLArrows).lastChild.innerHTML = "";

    // set the needed settings to position in a correct location the area where the arrows will be drawn
    var elem = document.getElementById(idHTMLArrows);
    var posArrowsArea = getAbsoluteBoundingRect(elem);
    var heightAreaStack = document.getElementById(idHTMLStack).getBoundingClientRect().height;
    var heightAreaHeap = document.getElementById(idHTMLHeap).getBoundingClientRect().height;
    var heightArea;
    if(heightAreaStack > heightAreaHeap) {
        heightArea = heightAreaStack;
    } else {
        heightArea = heightAreaHeap;
    }
    var arrows = d3.select("#" + idHTMLArrows)
        .append("svg")
        .attr("height", heightArea)
        .attr("width", widthTot*4)
        .style("position", "absolute")
        .style("float", "left")
        .style("left", (posArrowsArea.left + 5).toString() + "px")
        .style("top", (posArrowsArea.top + 10).toString() + "px");

    // draw the arrow
    arrows.append("svg:defs").selectAll("marker")
        .data(listArrows)
        .enter().append("svg:marker")
        .attr("id", function(d,i) { return "pathArrow" + i; })
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 3) // the x-coordinate of the reference point that should be aligned exactly at the marker position
        .attr("refY", 5) // the y-coordinate of the reference point that should be aligned exactly at the marker position
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M 0 0 L 10 5 L 0 10 L 3 5") // construction of the arrow: 3 vertices
        .style("fill", "black");

    // draw the line
    arrows.append("svg:g").selectAll("path")
        .data(listArrows)
        .enter().append("svg:path")
        .attr("d", function(d) {
            if(d[2].mode == 1) { // pointer from frame to object
                var middlePoint = {};
                middlePoint.x = (d[0].x + d[1].x) / 2;
                middlePoint.y = (d[0].y + d[1].y) / 2;
                var path = "M" + d[0].x + "," + d[0].y;
                path += " Q" + parseInt((middlePoint.x+d[0].x)/2) + "," + d[0].y;
                path += " " + middlePoint.x + "," + middlePoint.y;
                path += " T" + (d[1].x-10) + "," + d[1].y;
                return path;
            } else if(d[2].mode == 2) { // pointer from object to object
                var path = "M" + d[0].x + " " + d[0].y;
                path += " Q" + (d[0].x + 100) + " " + d[0].y;
                path += " " + d[1].x + " " + d[1].y;
                return path;
            }
        })
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", 2)
        .style("marker-start", "")
        .style("marker-end", function(d,i) { return "url(#pathArrow" + i + ")"; });
}



// ********************************** FUNCTIONS FOR SOURCE CODE VISUALIZATION *********************************

/**
 * The function takes the chosen time and searches its corresponding source file and line of code.
 * It displays the full source code of the correspondent file with the interested line underlined.
 * @param time - chosen time
 * @param idHTMLSourceCodeInfo - HTML id of the text area where the source code will be shown
 * @param javaTextAreaEditor - related to CodeMirror textarea
 * @param dataJSONFile - JSON object file where we have all data stored
 */
function showSourceCode(time, idHTMLSourceCodeInfo, javaTextAreaEditor, dataJSONFile) {
    d3.json(dataJSONFile, function(error, data) {
        if(!error) {
            // get number of line and name of the file, for the given time
            var line_current = 0;
            var line_next = 0;
            var fileName = data[0].source_name;
            for(var index = 0; index < data.length; index++) {
                if (data[index].time > time) { // find the next line that will be execute
                    if(1 < data.length - index) {
                        line_next = data[index].source_line_no;
                    }
                    break;
                }
                line_current = data[index].source_line_no;
                line_next = line_current;
                fileName = data[index].source_name;
            }
            if(fileName == "UNTRACED") {
                fileName = data[1].source_name;
            }

            // show/underline the line source corresponded to the time
            document.getElementById(idHTMLSourceCodeInfo).innerHTML = "";
            d3.select("#" + idHTMLSourceCodeInfo).text("" + fileName + " (line " + line_current + "):");
            d3.xhr(fileName, function(err, response) {
                if (err) {
                    javaTextAreaEditor.setValue("// Error loading file '" + fileName + "'");
                } else {
                    if(time >= 0) {
                        javaTextAreaEditor.setValue(response.responseText);
                        reDrawAllBreakPoints(); // re-draw break points
                        if(time != 0) {
                            javaTextAreaEditor.setSelection({line: line_current - 1, ch: 0}, {line: line_current - 1, ch: null}); // current
                            javaTextAreaEditor.addSelection({line: line_next - 1, ch: 0}, {line: line_next - 1, ch: null}); // next
                            if(document.getElementsByClassName("CodeMirror-selected").length == 1) {
                                document.getElementsByClassName("CodeMirror-selected").item(0).style.background = "lightgreen";
                            } else if(line_current < line_next) {
                                document.getElementsByClassName("CodeMirror-selected").item(0).style.background = "lightgreen";
                                document.getElementsByClassName("CodeMirror-selected").item(1).style.background = "coral";
                            } else {
                                document.getElementsByClassName("CodeMirror-selected").item(1).style.background = "lightgreen";
                                document.getElementsByClassName("CodeMirror-selected").item(0).style.background = "coral";
                            }
                        }
                    } else {
                        //javaTextAreaEditor.setValue(response.responseText);
                        javaTextAreaEditor.setValue("// step 0 - nothing"); // TODO: change this...
                    }
                }
            });
        } else {
            console.log("error: problem on reading the data JSON file");
        }
    });
}

/**
 * The function adds the visual "break-point" in the vertical of the line numbers of the code.
 * @returns {Element}
 */
function makeMarker() {
    var marker = document.createElement("div");
    marker.style.color = "#A00000";
    marker.style["font-size"] = "120%";
    //marker.innerHTML = "◉";
    //marker.innerHTML = "➲";
    //marker.innerHTML = "➟";
    //marker.innerHTML = "➔";
    //marker.innerHTML = "➜";
    marker.innerHTML = "➥";
    return marker;
}

/**
 * The function redraws all chosen breakpoints after a new display of the text area.
 */
function reDrawAllBreakPoints() {
    var n;
    for(var index = 0; index < breakPointList.length; index++) {
        n = breakPointList[index]-1;
        drawBreakPoint(n);
    }
}

/**
 * The function draws or deletes a breakpoint in a given position (line).
 * @param n - position of the breakpoint
 */
function drawBreakPoint(n) {
    var info = javaEditor.lineInfo(n);
    javaEditor.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
}

/**
 * The function goes directly up to the line signed by the next breakpoint and shows the related visualization status.
 * @param dataJSONFile
 */
function goNextBreakPoint(dataJSONFile) {
    d3.json(dataJSONFile, function(error, data) {
        if(!error) {
            var lineFound = false;
            var line = 0;
            var index = stepintoTimes.indexOf(currentTimes);
            while(index < stepintoTimes.length-1) {
                ++index;
                currentTimes = stepintoTimes[index];
                if(!data[index].source_line_no) { // end of code execution
                    break;
                }
                if(lineFound && (line != 0) && (line != data[stepintoTimesIndex[index]].source_line_no)) { // line found
                    break;
                } else { // continue searching
                    if(breakPointList.indexOf(data[stepintoTimesIndex[index]].source_line_no) != -1) {
                        //console.log("HI2");
                        lineFound = true;
                        line = data[stepintoTimesIndex[index]].source_line_no;
                    }
                }
            }
            if((index == stepintoTimes.length-1) && !lineFound) { // last line code execution
                currentTimes = stepintoTimes[index];
            } else {
                currentTimes = stepintoTimes[index-1];
            }
            // set sliders
            setSlider(idHTMLSlider_vis, idHTMLTextSlider_vis, stepintoTimes.length - 1, index);
            setSlider(idHTMLSlider_vis, idHTMLNavTextSlider_vis, stepintoTimes.length - 1, index);
            // show status
            showStackAndHeap(currentTimes, idHTMLStack_vis, idHTMLHeap_vis, idHTMLArrows_vis, dataFile);
            showSourceCode(currentTimes, idHTMLSourceCodeInfo, javaEditor, dataFile);
        }
    });
}



// ************************************** FUNCTIONS FOR STEPS BACK/FORWARD ************************************

/**
 * The function set the list having all times that will be used as steps for the history's execution.
 */
function setStepintoTimes() {
    d3.json(dataFile, function(error, data) {
        stepintoTimes = [0];
        stepintoTimesIndex = [0];
        for(var index = 0; index < data.length; index++) {
            if(data[index].source_line_no >= 0) {
                stepintoTimes.push(data[index].time);
                stepintoTimesIndex.push(index);
            }
        }
        currentTimes = stepintoTimes[0];
        // set all visualization settings
        setUpSlider(idHTMLSlider_vis, idHTMLTextSlider_vis, stepintoTimes.length-1);
        setUpSlider(idHTMLSlider_vis, idHTMLNavTextSlider_vis, stepintoTimes.length-1)
    });
}

/**
 * The function takes a command and sets the global variables for a back/forward step in the code execution.
 * @param move - string as command that says which next event the user wants to see
 */
function stepBackFor(move) {
    var index = stepintoTimes.indexOf(currentTimes);
    if(move.indexOf("backward") != -1) {
        if(index > 0) {
            index -= 1;
        }
    } else if(move.indexOf("forward") != -1) {
        if(index < stepintoTimes.length-1) {
            index += 1;
        }
    } else if(move.indexOf("first") != -1) {
        index = 0;
    } else if(move.indexOf("last") != -1) {
        index = stepintoTimes.length - 1;
    }
    currentTimes = stepintoTimes[index];
    setSlider(idHTMLSlider_vis, idHTMLTextSlider_vis, stepintoTimes.length-1, index);
    setSlider(idHTMLSlider_vis, idHTMLNavTextSlider_vis, stepintoTimes.length-1, index);
}



// *************************************** FUNCTIONS FOR SLIDERS CONTROL **************************************

/**
 * The function sets up all necessary attributes and its related text of a specific slider.
 * @param idHTMLSlider - HTML id of the wanted slider
 * @param idHTMLTextSlider - HTML id of the text related to the slider
 * @param max - it is the last/maximum step
 */
function setUpSlider(idHTMLSlider, idHTMLTextSlider, max) {
    document.getElementById(idHTMLSlider).setAttribute("min", 0);
    document.getElementById(idHTMLSlider).setAttribute("max", max);
    setSlider(idHTMLSlider, idHTMLTextSlider, max, 0);
}

/**
 * The function sets the value and related text of a specific slider.
 * @param idHTMLSlider - HTML id of the wanted slider
 * @param idHTMLTextSlider - HTML id of the text related to the slider
 * @param max - it is the last/maximum step
 * @param index - step of the execution
 */
function setSlider(idHTMLSlider, idHTMLTextSlider, max, index) {
    document.getElementById(idHTMLSlider).value = index;
    document.getElementById(idHTMLTextSlider).innerHTML = "Step " + index + " of " + max;
}



// **************************************** FUNCTIONS FOR ILLUSTRATION ****************************************

/**
 * The function takes a string as unique parameter and that text will be spoken and displayed.
 * @param text - a text that has to be spoken and displayed
 */
function illustrationTextVoice(text) {
    speechSynthesis(text); // spoken
    writeIllustration(text); // displayed
}

/**
 * The function takes a string as unique parameter and that text will be spoken.
 * @param text - a text that has to be spoken
 */
function speechSynthesis(text) {
    if('speechSynthesis' in window) { // the Speech Synthesis API is supported in Chrome 33+ and Safari
        if(window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); // this method will remove all utterances from the queue: if an utterance is currently being spoken, it will be stopped
        }
        var speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'en-US';
        speech.rate = 0.9;
        speech.volume = parseInt(document.getElementById(idHTMLVoiceVolume).value)/10;
        window.speechSynthesis.speak(speech);
    }
}

/**
 * The function takes the date from the JSON file and the current time of execution and the related text will be spoken again.
 * @param dataJSONFile - JSON object file where we have all data stored
 * @param time - current time of execution
 */
function speechSynthesisReplay(dataJSONFile, time) {
    d3.json(dataJSONFile, function(error, data) {
        if(!error) {
            var stackHeap = getJSONStackHeap(data, time);
            // illustration: text and voice
            illustrationTextVoice(stackHeap.illustration);
        } else {
            console.log("error: problem on reading the data JSON file");
        }
    });
}

/**
 * The function takes a string as unique parameter and that text will be displayed.
 * @param text - a text that has to be displayed
 */
function writeIllustration(text) {
    document.getElementById(idHTMLIllustration).innerHTML = "<u>Illustration:</u><br>" + text;
}



// ********************************************* HELPER FUNCTIONS *********************************************

/**
 * The function adds two numbers.
 * @param a - first element (number)
 * @param b - second element (number)
 * @returns {*} - sum of the two elements
 */
function add(a, b) {
    return a + b;
}

/**
 * The function returns the absolute bounding rectangle information of an HTML element to respect the screen that the client is currently viewing.
 * @param element - HTML element
 * @returns {{bottom: *, height: Number, left: *, right: *, top: *, width: Number}} - absolute bounding rectangle information of the given HTML element
 */
function getAbsoluteBoundingRect(element) {
    var offsetX, offsetY;
    if(window.pageXOffset !== undefined) { // scripts requiring high cross-browser compatibility
        offsetX = window.pageXOffset;
        offsetY = window.pageYOffset;
    } else {
        offsetX = (document.documentElement || document.body.parentNode || document.body).scrollLeft;
        offsetY = (document.documentElement || document.body.parentNode || document.body).scrollTop;
    }
    var rect = element.getBoundingClientRect();
    if(element !== document.body) {
        var parent = element.parentNode;
        while(parent !== document.body) {
            offsetX += parent.scrollLeft;
            offsetY += parent.scrollTop;
            parent = parent.parentNode;
        }
    }
    return {
        bottom: rect.bottom + offsetY,
        height: rect.height,
        left: rect.left + offsetX,
        right: rect.right + offsetX,
        top: rect.top + offsetY,
        width: rect.width
    };
}

/**
 * The function takes a JSON object with all bytecode events of a program and returns the status of stack/heap in a determinate time.
 * @param d - JSON object with all bytecode events
 * @param time - selected time
 * @returns {{}} - a new JSON object representing the current state of stack/heap of the code
 */
function getJSONStackHeap(d, time) {
    var j = {};
    j.stack = [];
    j.heap = [];
    j.illustration = "Nothing...";
    var frameToRemove = "main";
    for(var index = 0; index < d.length; index++) { // go through all bytecode events
        if (d[index].time > time) {
            break;
        }
        // text/voice illustration
        if (d[index].action) {
            j.illustration = d[index].action;
        } else {
            j.illustration = d[index].name;
        }
        // STACK: set color of all variables in the callstack
        for (var f = 0; f < j.stack.length; f++) {
            for (var v = 0; v < j.stack[f].content.length; v++) {
                j.stack[f].content[v].color = "#66CCFF"; // color: blue
            }
        }
        // if there is a return event...
        if ((d[index].name.indexOf("RETURN") != -1) || (d[index].name == "DUMMY")) { // memorize the name of the next frame to remove
            frameToRemove = d[index].activation.name;
        }
        // show the actual status...
        if (((d[index].name.indexOf("INVOKESPECIAL") != -1) || (d[index].name.indexOf("INVOKEVIRTUAL") != -1) || (d[index].name.indexOf("INVOKESTATIC(Returning: ") != -1)) && (frameToRemove != "main")) {
            for (var f = 0; f < j.stack.length; f++) {
                if (frameToRemove === j.stack[f].name) {
                    j.stack.splice(f);
                    break;
                }
            }
            frameToRemove = "main";
        } else if(d[index].name == "UNTRACED_DEFINER") {
            j = getJSONStackHeap_helperForObjects(j, d[index].object);
        } else if(d[index].activation.name != "UNTRACED") {
            // *************** STACK ***************
            var newFrame = {
                "name": d[index].activation.name,
                "content": []
            };
            var indexAt, variableValue;
            var activation = d[index].activation.locals;
            for(var f = 0; f < activation.length; f++) {
                variableValue = activation[f].value;
                indexAt = variableValue.indexOf("@");
                var val;
                if(indexAt !== -1) { // pointers (STACK -> HEAP)
                    val = "_pointer_" + variableValue.substring(indexAt);
                } else {
                    val = variableValue;
                }
                var newVariable = {
                    "name": activation[f].name,
                    "value": val,
                    "color": "#FFCC00" // color: yellow
                };
                newFrame.content.push(newVariable);
            }
            var isNew = true;
            for(var v = 0; v < j.stack.length; v++) {
                // in case the frame already exists in the STACK
                if(j.stack[v].name == d[index].activation.name) {
                    j.stack[v].line = d[index].source_line_no;
                    isNew = false;
                    for(var f = 0; f < newFrame.content.length; f++) {
                        if(j.stack[v].content.length <= f) { // new variable
                            j.stack[v].content.push(newFrame.content[f]);
                        } else {
                            if(j.stack[v].content[f].value != newFrame.content[f].value) {
                                j.stack[v].content[f].value = newFrame.content[f].value;
                                j.stack[v].content[f].color = "#FFCC00"; // color: yellow
                            } else {
                                j.stack[v].content[f].color = "#66CCFF"; // color: blue
                            }
                        }
                    }
                    break;
                }
            }
            // new frame in the STACK
            if(isNew) {
                newFrame["line"] = d[index].source_line_no;
                j.stack.push(newFrame);
            }
            // *************** HEAP ***************
            for(var o = 0; o < j.heap.length; o++) {
                for(var f = 0; f < j.heap[o].content.length; f++) {
                    j.heap[o].content[f].color = "#66CCFF"; // color: blue
                }
            }
            if(d[index].untraced_objects) {
                for(var o = 0; o < d[index].untraced_objects.length; o++) {
                    j = getJSONStackHeap_helperForObjects(j, d[index].untraced_objects[o].object);
                }
            }
            if(d[index].object) {
                j = getJSONStackHeap_helperForObjects(j, d[index].object);
            }
            if(d[index].array) { // in case there is an array to update
                for(var v = 0; v < j.heap.length; v++) {
                    if (j.heap[v].oid === d[index].array.oid) {
                        var arrayIndex = d[index].array.updated_element_index;
                        var fieldValue = d[index].array.elements[arrayIndex].value;
                        indexAt = fieldValue.indexOf("@");
                        if(indexAt !== -1) { // if there is a pointer
                            j.heap[v].content[arrayIndex].value = "_pointer_" + fieldValue.substring(indexAt);
                        } else {
                            j.heap[v].content[arrayIndex].value = fieldValue;
                        }
                        j.heap[v].content[arrayIndex].color = "#FFCC00"; // color: yellow
                    }
                }
            }
        }
    }
    return j;
}

/**
 * This is an helper function to support "getJSONStackHeap" in the construction of the heap.
 * @param j - working JSON object representing the current state of stack/heap of the code
 * @param object - JSON data about an object that has to be represented in the heap
 * @returns {*} - variable j updated
 */
function getJSONStackHeap_helperForObjects(j, object) {
    // new object or updated object on the HEAP
    var newObject = {};
    if (object.elements) {
        newObject = {
            "oid": object.oid,
            "name": "array",
            "content": []
        };
        var elements = object.elements;
        for (var f = 0; f < elements.length; f++) {
            var newField = {
                "value": elements[f].value,  // TODO: be careful for the pointers...
                //"color": "#339933" // color: green
                "color": "#FFCC00" // color: yellow
            };
            newObject.content.push(newField);
        }
    } else if(object.fields) {
        newObject = {
            "oid": object.oid,
            "content": []
        };
        var fields = object.fields;
        for (var f = 0; f < fields.length; f++) {
            var newField = {
                "name": fields[f].name,
                "value": fields[f].value,  // TODO: be careful for the pointers...
                //"color": "#339933" // color: green
                "color": "#FFCC00" // color: yellow
            };
            newObject.content.push(newField);
        }
    }
    var isNew = true;
    for(var v = 0; v < j.heap.length; v++) {
        // in case the object already exists in the HEAP
        if(j.heap[v].oid === object.oid) {
            var nameFieldChanged = object.updated_field_name;
            isNew = false;
            for(var f = 0; f < j.heap[v].content.length; f++) {
                if((j.heap[v].content[f].value != newObject.content[f].value) || (j.heap[v].content[f].name == nameFieldChanged)) {
                    j.heap[v].content[f].value = newObject.content[f].value;
                    j.heap[v].content[f].color = "#FFCC00"; // color: yellow
                } else {
                    j.heap[v].content[f].color = "#66CCFF"; // color: blue
                }
            }
            break;
        }
    }
    // new object in the HEAP
    if(isNew) {
        j.heap.push(newObject);
    }
    return j;
}

/**
 * The function takes an HTML element and checks if the element is current displayed on the screen that the user see.
 * @param element - HTML element to check
 * @returns {boolean} - true if the object is visible and false otherwise
 */
function checkElemVisibleOnScreen(element) {
    var rect = element.getBoundingClientRect();
    var navHeight = document.getElementById(idHTMLNav).getBoundingClientRect().height;
    return !(rect.top < -navHeight);
}

/**
 * The function takes a boolean parameter as unique input, and depending on it, it set the program in (no-)editable mode.
 * More specifically, if the input is "true", then it disable all possible operation and leave just the submit one possible.
 * @param isEditable - true if the textarea is set editable, false otherwise
 */
function textAreaEditableMode(isEditable) {
    if(isEditable) {
        editableMode = true;
        javaEditor.setOption("readOnly", false);
        document.body.style.backgroundColor = "rgba(224,224,224,0.3)";
        document.getElementById(idHTMLTextEdit).style.opacity = 0.5;
        document.getElementById(idHTMLTextSave).style.opacity = 1;
        document.getElementById(idHTMLAllSettings).style.opacity = 0.5;
        document.getElementById(idHTMLNavAllSettings).style.opacity = 0.5;
        document.getElementById(idHTMLIllustration).style.opacity = 0.5;
        document.getElementById(idHTMLStack_vis).style.opacity = 0.5;
        document.getElementById(idHTMLHeap_vis).style.opacity = 0.5;
        document.getElementById(idHTMLArrows_vis).style.opacity = 0.5;
    } else {
        editableMode = false;
        javaEditor.setOption("readOnly", true);
        document.body.style.backgroundColor = "rgba(224,224,224,0)";
        document.getElementById(idHTMLTextEdit).style.opacity = 1;
        document.getElementById(idHTMLTextSave).style.opacity = 0.5;
        document.getElementById(idHTMLAllSettings).style.opacity = 1;
        document.getElementById(idHTMLNavAllSettings).style.opacity = 1;
        document.getElementById(idHTMLIllustration).style.opacity = 1;
        document.getElementById(idHTMLStack_vis).style.opacity = 1;
        document.getElementById(idHTMLHeap_vis).style.opacity = 1;
        document.getElementById(idHTMLArrows_vis).style.opacity = 1;
    }
}