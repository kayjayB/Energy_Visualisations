let resourceName = "Water";
let shown = false;

$(document).ready(function() {

    document.getElementById("notesBox").value = "";
});


function report() {
    let notes = document.getElementById("notesBox").value;
    let location = document.getElementById("location").value;
    let alertString = "Your report has been recorded.\n" + "Resource type: " + resourceName + "\nLocation: " + location + "\nDescription: " + notes;
    alert(alertString);
    document.getElementById("notesBox").value = "";
    document.getElementById("location").value = "";
}

function cancel() {
    document.getElementById("notesBox").value = "";
    document.getElementById("location").value = "";
}

function resources() {
    document.getElementById("resourceType").classList.toggle("show");
}

function hideDropdown() {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
    }
}

window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        if (event.target.parentNode.id.includes('resourceType')) {
            resourceName = event.target.id;
        }
        hideDropdown();
    }
}