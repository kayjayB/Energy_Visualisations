let resourceName = "Water";
let shown = false;

// $(document).ready(function() {

//     document.getElementById("notesBox").value = "";
// });

function openReportOverlay() {
    document.getElementById("notesBox").value = "";
    document.getElementById("overlay").style.display = "block";
}


function report() {
    let type = document.getElementById("resourceType");
    resourceName = type.options[type.selectedIndex].value;

    let notes = document.getElementById("notesBox").value;
    let location = document.getElementById("location").value;
    let alertString = "Your report has been recorded.\n" + "Resource type: " + resourceName + "\nLocation: " + location + "\nDescription: " + notes;
    alert(alertString);
    document.getElementById("notesBox").value = "";
    document.getElementById("location").value = "";
    document.getElementById("overlay").style.display = "none";

}

function cancel() {
    document.getElementById("notesBox").value = "";
    document.getElementById("location").value = "";
    document.getElementById("overlay").style.display = "none";
}

function resources() {
    document.getElementById("resourceType").classList.toggle("show");
}