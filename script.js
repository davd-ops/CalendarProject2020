let dt = new Date();
let rdt = new Date();
let tmpdt = new Date();
let year;
let ISOdate;
let tmpISOdate;
let country;
let prevCountry = country;
let language = "en-EN";
const langoptions = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
let prevDate;
let nextDate;
let cellCount;
let cells;
let endDate;
let notesDates = getNotes();
let checklistArray = getChecklist();

let monthsUS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

let monthsDE = [
    "Jänner",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember"
];

let monthsCZ = [
    "Leden",
    "Únor",
    "Březen",
    "Duben",
    "Květen",
    "Červen",
    "Červenec",
    "Srpen",
    "Září",
    "Říjen",
    "Listopad",
    "Prosinec"
];

//IndexedDB
const list = document.querySelector('ul');
const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#body');
const form = document.querySelector('form');
let db;

//checklist
const checklistForm = document.querySelectorAll('form')[1];
const checklistList = document.querySelectorAll('ul')[1];
checklistForm.onsubmit = addDataToChecklist;


//Holiday API
//const api_url = 'https://calendarific.com/api/v2/holidays?&api_key=6c375f949eb158e40d2608c58e11c6d78d05356d';
const holiday_api_url = 'https://calendarific.com/api/v2/holidays?&api_key=ae91c6300174fe2db7afe6a7b6dde1ff4ae549c7';
let holiday_api_country;
let api_year;


//Nameday API
const nameday_api_url = 'https://api.abalin.net/namedays?';
let nameday_api_country;
let holiday_final_url;
let api_month;
let api_day;
let nameday_final_url;


//rendering whole calendar
function renderDate() {
    if (localStorage.getItem('local_country')) {
        country = JSON.parse(localStorage.getItem('local_country'));
        changeTextsAcordingToLanguage();
    } else {
        localStorage.setItem('local_country', JSON.stringify('US'));
        country = 'US';
    }
    getNamedaysFromAPI();
    dt.setDate(1);
    getNameOfHolidayDataFromAPI();

    endDate = new Date(
        dt.getFullYear(),
        dt.getMonth() + 1,
        0
    ).getDate();

    prevDate = new Date(
        dt.getFullYear(),
        dt.getMonth(),
        0
    ).getDate();

    switch (country) {
        case "US": {
            document.getElementById("month").innerHTML = monthsUS[dt.getMonth()];
            break;
        }
        case "DE": {
            document.getElementById("month").innerHTML = monthsDE[dt.getMonth()];
            break;
        }
        case "CZ": {
            document.getElementById("month").innerHTML = monthsCZ[dt.getMonth()];
            break;
        }
    }
    nextDate = 0;
    cellCount = 0;
    cells = "";
    addDays(prevDate, nextDate, cellCount, cells, endDate);
}

//loading whole "days" section
function addDays(prevDate, nextDate, cellCount, cells, endDate) {

    tmpdt = dt;
    tmpdt.setDate(1);
    let day = tmpdt.getDay();

    switch (country) {
        case 'DE': {
            if (day !== 0){
                day -= 1;
            }else{
                day+=6;
            }
            break;
        }
        case 'CZ': {
            if (day !== 0){
                day -= 1;
            }else{
                day+=6;
            }
            break;
        }
    }

    //adding previous month date cells to the calendar
    for (let x = day; x > 0; x--) {
        let tmp = prevDate - x + 1;
        cells += `<div class='prev_date' tabindex="${tmp}" onclick='moveDate("prev");dayChanger(this);' data-value='${tmp}'>${tmp}</div>`;
        cellCount++;
    }

    //adding this month date cells to the calendar
    for (let i = 1; i <= endDate; i++) {

        if (!(i === rdt.getDate() && dt.getMonth() === rdt.getMonth() && dt.getFullYear() === rdt.getFullYear())) {
            const noteAvailable = isThereANote(i);
            let noteDot = "";
            if (noteAvailable) {
                noteDot = "dot";
            }
            cells += `<div id="${i}" tabindex="${i}" onclick='dayChanger(this);' data-value='${i}'>${i}<span class="${noteDot}"></span></div>`;
            cellCount++;

        } else {
            //today cell
            const noteAvailable = isThereANote(i);
            let noteDot = "";
            if (noteAvailable) {
                noteDot = "dot";
            }
            cells += `<div class='today' id="${i}" tabindex="${i}" onclick='dayChanger(this);' data-value='${i}'>${i}<span class="${noteDot}"></span></div>`;
            cellCount++;
        }
    }


    //adding next month date cells to the calendar
    for (; cellCount < 42;) {
        nextDate += 1;
        cells += `<div class='prev_date' tabindex="${nextDate}" onclick=' moveDate("next");dayChanger(this);' data-value='${nextDate}'>${nextDate}</div>`;
        cellCount++;
    }
    document.getElementsByClassName("days")[0].innerHTML = cells;
    changeColorOfDots();
}

//switching months to previous or next
function moveDate(para) {
    if (para === 'prev') {
        dt.setDate(1);
        dt.setMonth(dt.getMonth() - 1);
    } else if (para === 'next') {
        dt.setDate(1);
        dt.setMonth(dt.getMonth() + 1);
    }
    setDatePickerDate();
    dateString();
    renderDate();
    setFocusToTextBox(1);
    changeTodayColors();
}

//displaying current date string in the top of the page
function dateString() {
    document.getElementById("date_str").innerHTML = dt.toLocaleDateString(language, langoptions);
}

//converting date to YYYY-MM-DD string format
function dateISOString() {
    let dateTmp = dt.toISOString();
    ISOdate = dateTmp.substring(0, 10);
}

//converting temporary date which i need for loading notes into localstorage to YYYY-MM-DD string format
function tmpdateISOString() {
    let dateTmp = tmpdt.toISOString();
    tmpISOdate = dateTmp.substring(0, 10);
}

//setting date on the date picker
function setDatePickerDate() {
    setTitle();
    let x = document.getElementById("pick-date");
    x.value = ISOdate;
}

//converting this year to YYYY string format
function yearString() {
    let dateTmp = dt.toString();
    year = dateTmp.substring(11, 15);
}

//changing days onclick
function dayChanger(e) {
    dt.setDate(e.getAttribute('data-value'));
    getNameOfHolidayDataFromAPI();
    dateString();
    setFocusToTextBox(e.getAttribute('data-value'));
    setDatePickerDate();
    setTitle();
    loadIndexedDB();
    getNamedaysFromAPI();
}

//changing date to selected date in input at the top of page
function searchForDate() {
    let insertedDate = document.getElementById("pick-date").value;
    let newYear = insertedDate.substring(0, 4);
    let newMonth = insertedDate.substring(5, 7);
    let newDay = insertedDate.substring(8, 10);
    dt.setMonth(newMonth - 1);
    dt.setFullYear(newYear);
    renderDate();
    dt.setDate(newDay);
    getNameOfHolidayDataFromAPI();
    setDatePickerDate();
    dateString();
    getNamedaysFromAPI();

    //input gives you number with 0 prefix, but in calendar we dont 0 prefix
    if (newDay === "01" || newDay === "02" || newDay === "03" || newDay === "04" || newDay === "05" || newDay === "06" || newDay === "07" || newDay === "08" || newDay === "09"){
        newDay = newDay.substring(1, 2);
    }
    setFocusToTextBox(newDay);
    changeTodayColors();
    setTitle();
    loadIndexedDB();
}

//setting "focus" to the next month date
function setFocusToTextBox(e) {
    let x = document.querySelector(".selectedDay");
    if (x != null) {
        x.classList.remove("selectedDay");
    }
    document.getElementById(e).classList.add("selectedDay");
}

//adding add note form to the notes or hiding him
function addNote() {
    let x = document.getElementById("form");
    let y = document.getElementById("note-display-ul");
    if (x.style.display == "block") {
        y.style.maxHeight = "87vh";
        x.style.display = 'none';
    } else {
        y.style.maxHeight = '67vh';
        x.style.borderTop = '1px solid black';
        x.style.display = "block";
    }
}

//adding add note form to the notes or hiding him
function addNoteToChecklist() {
    let x = document.getElementById("checklist-form");
    let y = document.getElementById("checklist-display-ul");
    if (x.style.display == "block") {
        y.style.maxHeight = "87vh";
        x.style.display = 'none';
    } else {
        y.style.maxHeight = '67vh';
        x.style.borderTop = '1px solid black';
        x.style.display = "block";
    }
}

function setTitle() {
    dateISOString();
    let days = ISOdate.substring(8, 10);
    let months = ISOdate.substring(5, 7);
    let years = ISOdate.substring(0, 4);
    let title = `${days}-${months}-${years}`;
    switch (country) {
        case "US": {
            document.title = `CALENDAR | ${title}`;
            break;
        }
        case "DE": {
            document.title = `KALENDER | ${title}`;
            break;
        }
        case "CZ": {
            document.title = `KALENDÁŘ | ${title}`;
            break;
        }
    }
}

//showing language options onclick to main language image
function showHideLanguages() {
    let us = document.getElementById('US');
    let de = document.getElementById('DE');
    let cz = document.getElementById('CZ');

    if ((de.style.display == 'block' && cz.style.display == 'block') ||
        (us.style.display == 'block' && cz.style.display == 'block') ||
        (us.style.display == 'block' && de.style.display == 'block')) {
        us.style.display = 'none';
        de.style.display = 'none';
        cz.style.display = 'none';
    } else {
        us.style.display = 'block';
        de.style.display = 'block';
        cz.style.display = 'block';
    }
}

//swapping order of languages - changing main language image + changing language on whole page
function changeLanguage(e) {
    prevCountry = country;
    country = e.getAttribute('id');
    localStorage.setItem('local_country', JSON.stringify(country));
    changeTextsAcordingToLanguage();
    dateString();
    loadIndexedDB();
    getNameOfHolidayDataFromAPI();
    let x = document.querySelector(".selectedDay");
    if (x != null) {
        let y = x.getAttribute('data-value');
        addDays(prevDate, nextDate, cellCount, cells, endDate);
        changeTodayColors();
        setFocusToTextBox(y);
        dt.setDate(Number(y));
    } else {
        addDays(prevDate, nextDate, cellCount, cells, endDate);
        dt.setDate(rdt.getDate());
        changeTodayColors();
    }
    setTitle();
    getNamedaysFromAPI();
}

function changeTextsAcordingToLanguage(){
    let usweekdays = document.getElementById("weekdaysUS");
    let deweekdays = document.getElementById("weekdaysDE");
    let czweekdays = document.getElementById("weekdaysCZ");

    switch (country) {
        case 'US': {
            document.getElementById("lang-image").src = "images/united-states.png";
            language = "en-EN";
            document.getElementById("month").innerHTML = monthsUS[dt.getMonth()];
            document.getElementById("notes-h2").innerHTML = "NOTES";
            document.getElementById("enter-note").innerHTML = "Enter a new note";
            document.getElementById("enter-title").innerHTML = "Note title";
            document.getElementById("enter-body").innerHTML = "Note text";
            document.getElementById("create-button").innerHTML = "Create";
            document.getElementById("pick-date-btn").innerHTML = "Search";
            document.getElementById("light").innerHTML = "Light";
            document.getElementById("dark").innerHTML = "Dark";


            usweekdays.style.display = "flex";
            deweekdays.style.display = "none";
            czweekdays.style.display = "none";

            break;
        }
        case 'DE': {
            document.getElementById("lang-image").src = "images/germany.png";
            language = "de-DE";
            document.getElementById("month").innerHTML = monthsDE[dt.getMonth()];
            document.getElementById("notes-h2").innerHTML = "NOTIZEN";
            document.getElementById("enter-note").innerHTML = "Neue Notiz";
            document.getElementById("enter-title").innerHTML = "Titel";
            document.getElementById("enter-body").innerHTML = "Text";
            document.getElementById("create-button").innerHTML = "Erstellen";
            document.getElementById("pick-date-btn").innerHTML = "Suchen";
            document.getElementById("light").innerHTML = "Licht";
            document.getElementById("dark").innerHTML = "Dunkel";

            usweekdays.style.display = "none";
            deweekdays.style.display = "flex";
            czweekdays.style.display = "none";

            break;
        }
        case 'CZ': {
            document.getElementById("lang-image").src = "images/czech-republic.png";
            language = "cz-CZ";
            document.getElementById("month").innerHTML = monthsCZ[dt.getMonth()];
            document.getElementById("notes-h2").innerHTML = "POZNÁMKY";
            document.getElementById("enter-note").innerHTML = "Vložte novou poznámku";
            document.getElementById("enter-title").innerHTML = "Nadpis";
            document.getElementById("enter-body").innerHTML = "Text";
            document.getElementById("create-button").innerHTML = "Vytvořit";
            document.getElementById("pick-date-btn").innerHTML = "Vyhledat";
            document.getElementById("light").innerHTML = "Světlý";
            document.getElementById("dark").innerHTML = "Tmavý";

            usweekdays.style.display = "none";
            deweekdays.style.display = "none";
            czweekdays.style.display = "flex";

            break;
        }
    }
}

//toggling information overlay on
function infoOverlay() {
    let is_blured = document.getElementById("wrapper-blur");
    if (is_blured.style.display !== "block"){
        is_blured.style.display = "block";
        document.getElementById("info-swap_month").style.display = "block";
        document.getElementById("info-date_selector").style.display = "block";
        document.getElementById("info-language_selector").style.display = "block";
        document.getElementById("info-note_picker").style.display = "block";
        document.getElementById("info-checklist_picker").style.display = "block";
        document.getElementById("info-holidays").style.display = "block";
        document.getElementById("info-darkmode").style.display = "block";
        document.getElementById("month").style.display = "none";
        document.getElementById("nameday_str").style.display = "none";
        document.getElementById("date_str").style.display = "none";
    }else{
        is_blured.style.display = "none";
        document.getElementById("info-swap_month").style.display = "none";
        document.getElementById("info-date_selector").style.display = "none";
        document.getElementById("info-language_selector").style.display = "none";
        document.getElementById("info-note_picker").style.display = "none";
        document.getElementById("info-checklist_picker").style.display = "none";
        document.getElementById("info-holidays").style.display = "none";
        document.getElementById("info-darkmode").style.display = "none";
        document.getElementById("month").style.display = "block";
        document.getElementById("nameday_str").style.display = "block";
        document.getElementById("date_str").style.display = "block";
    }
}

//toggling between dark and light mode
function toggleMode() {
    if (getDarkMode()) {
        setDarkMode(false);
    } else {
        setDarkMode(true);
    }
    changeColorsOfPage();
}

//this is bugging when u add new note and render days again, so u want to change the color
//of "today cell" back to black and u dont want to change everything again
function changeTodayColors() {
    let today = document.querySelector(".today");
    if (!getDarkMode()) {
        if (dt.getMonth() === rdt.getMonth() && dt.getFullYear() === rdt.getFullYear()) {
            today.style.backgroundColor = "#ff8080";
        }
    } else {
        if (dt.getMonth() === rdt.getMonth() && dt.getFullYear() === rdt.getFullYear()) {
            today.style.backgroundColor = "#678998";
        }
    }
}

//changing whole page colors to dark or light
function changeColorsOfPage() {
    let wrapper = document.getElementById("wrapper");
    let days = document.getElementById("calendar");
    let month = document.getElementById("month_div");
    let weekdaysUS = document.getElementById("weekdaysUS");
    let weekdaysDE = document.getElementById("weekdaysDE");
    let weekdaysCZ = document.getElementById("weekdaysCZ");
    let today = document.querySelector(".today");
    let holiday_name = document.getElementById("holiday_name");
    let holidayDescriptionContent = document.getElementById("holidayDescriptionContent");
    let notesHeadingBackground = document.getElementById("notesHeadingBackground");
    let notesContent = document.getElementById("notesContent");
    let label = document.querySelector(".label");
    let checkbox = document.querySelector("#switch");
    let dateInput = document.querySelector("#pick-date");
    let dateInputBtn = document.querySelector("#pick-date-btn");
    let checklistContent = document.getElementById("checklistContent");
    let checklistHeadingBackground = document.getElementById("checklistHeadingBackground");
    changeColorOfDots();

    if (!getDarkMode()) {
        wrapper.style.backgroundColor = "#dfe6e9";
        wrapper.style.color = "black";
        days.style.backgroundColor = "#fff";
        month.style.backgroundColor = "#ff8080";
        weekdaysUS.style.backgroundColor = "#ff6666";
        weekdaysDE.style.backgroundColor = "#ff6666";
        weekdaysCZ.style.backgroundColor = "#ff6666";
        holiday_name.style.backgroundColor = "#ffcccc";
        holidayDescriptionContent.style.backgroundColor = "#ffcccc";
        notesHeadingBackground.style.backgroundColor = "#ff8080";
        notesContent.style.backgroundColor = "#ffe6e6";
        checklistContent.style.backgroundColor = "#ffe6e6";
        checklistHeadingBackground.style.backgroundColor = "#ff8080";
        label.style.backgroundColor = "rgba(0,0,0,.1)";
        dateInput.style.color = "#262626";
        dateInputBtn.style.color = "#262626";
        document.getElementById("info-swap_month").style.color = "black";
        document.getElementById("info-date_selector").style.color = "black";
        document.getElementById("info-language_selector").style.color = "black";
        document.getElementById("info-note_picker").style.color = "black";
        document.getElementById("info-holidays").style.color = "black";
        document.getElementById("info-darkmode").style.color = "black";


        if (dt.getMonth() === rdt.getMonth() && dt.getFullYear() === rdt.getFullYear()) {
            today.style.backgroundColor = "#ff8080";
        }

    } else {
        checkbox.checked = true;
        wrapper.style.backgroundColor = "#151b1e";
        wrapper.style.color = "white";
        month.style.backgroundColor = "#678998";
        days.style.backgroundColor = "#34454c";
        weekdaysUS.style.backgroundColor = "#48606a";
        weekdaysDE.style.backgroundColor = "#48606a";
        weekdaysCZ.style.backgroundColor = "#48606a";
        holiday_name.style.backgroundColor = "#95adb7";
        holidayDescriptionContent.style.backgroundColor = "#95adb7";
        notesHeadingBackground.style.backgroundColor = "#678998";
        notesContent.style.backgroundColor = "#95adb7";
        checklistContent.style.backgroundColor = "#95adb7";
        checklistHeadingBackground.style.backgroundColor = "#678998";
        label.style.backgroundColor = "#34323D";
        dateInput.style.color = "#e6e6e6";
        dateInputBtn.style.color = "#e6e6e6";
        document.getElementById("info-swap_month").style.color = "white";
        document.getElementById("info-date_selector").style.color = "white";
        document.getElementById("info-language_selector").style.color = "white";
        document.getElementById("info-note_picker").style.color = "white";
        document.getElementById("info-holidays").style.color = "white";
        document.getElementById("info-darkmode").style.color = "white";

        if (dt.getMonth() === rdt.getMonth() && dt.getFullYear() === rdt.getFullYear()) {
            today.style.backgroundColor = "#678998";
        }

    }
}

function changeColorOfDots() {
    let dots = document.querySelectorAll(".dot");
    if (dots) {
        for (let i = 0; i < dots.length; i++) {
            if (!getDarkMode()) {
                dots[i].style.backgroundColor = "#8c8c8c";
            } else {
                dots[i].style.backgroundColor = "#f2f2f2";
            }
        }
    }
}

//getting true or false from localstorage
function getDarkMode() {
    return JSON.parse(localStorage.getItem('darkMode'));
}

//uploading "if dark mode is enabled" to localstorage
function setDarkMode(isDark) {
    localStorage.setItem('darkMode', isDark);
}

//getting and parsing array with checklist (from localstorage) to normal array
function getChecklist() {
    return JSON.parse(localStorage.getItem('checklist'));
}

//adding data submited by checklist form to localstorage
function addDataToChecklist(e) {
    e.preventDefault();
    let checklistPreTitle = document.getElementsByTagName("input")[2].value;
    let checklistPreText = document.getElementsByTagName("input")[3].value;
    setChecklist({"checklistTitle":checklistPreTitle,"checklistText":checklistPreText, "isDone":false});
    document.getElementsByTagName("input")[2].value = "";
    document.getElementsByTagName("input")[3].value = "";
}

//pushing new item to the end of the array
function setChecklist(item) {
    updateChecklist();
    if (checklistArray) {
        checklistArray = getChecklist();
    } else {
        let checklistText = '{"checklistItems":[]}';
        checklistArray = JSON.parse(checklistText);
    }
    checklistArray.checklistItems.push(item);
    updateChecklist();
    displayChecklistData();
}

//uploading updated checklist array to localstorage
function updateChecklist() {
    let checklistString = JSON.stringify(checklistArray);
    localStorage.setItem('checklist', checklistString);
}

//displaying data from localstorage to checklist
function displayChecklistData(){
    // if you didn't do this, you will get duplicates each time a new note is added
    while (checklistList.firstChild) {
        checklistList.removeChild(checklistList.firstChild);
    }
    if (getChecklist()) {
        checklistArray.checklistItems.sort((a,b) => a.isDone - b.isDone);
        for (let item_position = 0;item_position<checklistArray.checklistItems.length; item_position++){
            const listItem = document.createElement('li');
            const h3 = document.createElement('h3');
            const para = document.createElement('p');

            listItem.appendChild(h3);
            listItem.appendChild(para);
            checklistList.appendChild(listItem);

            h3.textContent = checklistArray.checklistItems[item_position].checklistTitle;
            para.textContent = checklistArray.checklistItems[item_position].checklistText;
            console.log(checklistArray.checklistItems[item_position]);
            listItem.setAttribute('checklist-id', item_position);

            const checklistDeleteBtn = document.createElement('button');
            const checklistFinishedBtn = document.createElement('button');
            checklistFinishedBtn.id = "checklistFinishedBtn";
            listItem.appendChild(checklistFinishedBtn);
            listItem.appendChild(checklistDeleteBtn);

            if (checklistArray.checklistItems[item_position].isDone){
                h3.style.textDecoration = "line-through";
                h3.style.color = "#cccccc";
                para.style.textDecoration = "line-through";
                para.style.color = "#cccccc";

                switch (country) {
                    case "US": {
                        checklistFinishedBtn.textContent = 'Undone';
                        checklistDeleteBtn.textContent = 'Delete';
                        break;
                    }
                    case "DE": {
                        checklistFinishedBtn.textContent = 'Unvollendet';
                        checklistDeleteBtn.textContent = 'Löschen';
                        break;
                    }
                    case "CZ": {
                        checklistFinishedBtn.textContent = 'Nedokončeno';
                        checklistDeleteBtn.textContent = 'Vymazat';
                        break;
                    }
                }
            } else {
                switch (country) {
                    case "US": {
                        checklistFinishedBtn.textContent = 'Done';
                        checklistDeleteBtn.textContent = 'Delete';
                        break;
                    }
                    case "DE": {
                        checklistFinishedBtn.textContent = 'Erledigt';
                        checklistDeleteBtn.textContent = 'Löschen';
                        break;
                    }
                    case "CZ": {
                        checklistFinishedBtn.textContent = 'Hotovo';
                        checklistDeleteBtn.textContent = 'Vymazat';
                        break;
                    }
                }
            }

            //making a note "done"
            checklistFinishedBtn.onclick = function(e){
                //checklistDeleteBtn.click();
                let noteId = Number(e.target.parentNode.getAttribute('checklist-id'));
                if (checklistArray.checklistItems[noteId].isDone){
                    checklistArray.checklistItems[noteId].isDone = false;
                }else{
                    checklistArray.checklistItems[noteId].isDone = true;
                }
                updateChecklist();
                noNotesStored(checklistList);
                displayChecklistData();
                console.log(checklistArray);

            };
            checklistDeleteBtn.onclick = deleteItem;
        }
    } else {
        noNotesStored(checklistList);
    }

    // this is deleting specific index of array onclick
    function deleteItem(e) {
        let noteId = Number(e.target.parentNode.getAttribute('checklist-id'));
        checklistArray.checklistItems.splice(noteId, 1);
        console.log(checklistArray);
        updateChecklist();
        noNotesStored(checklistList);
        displayChecklistData();
    }
}

//getting and parsing array with all note dates (from localstorage) to normal array
function getNotes() {
    return JSON.parse(localStorage.getItem('notes'));
}

//pushing new notes to the end of the array
function setNotes(date) {
    updateNotes();
    if (notesDates) {
        notesDates = getNotes();
    } else {
        notesDates = [];
    }
    notesDates.push(date);
    updateNotes();
}

//uploading updated note array to localstorage
function updateNotes() {
    let notesString = JSON.stringify(notesDates);
    localStorage.setItem('notes', notesString);
}

//return true if selected index is equal to today (then it deleting it)
function findTodayNote(dateOfNote) {
    return dateOfNote === ISOdate;
}

//checking if today match some note
function isThereANote(id) {
    tmpdt = dt;
    tmpdt.setDate(id);
    tmpdateISOString();
    if (notesDates != null) {
        for (let i = 0; i <= notesDates.length - 1; i++) {
            if (notesDates[i] === tmpISOdate) {
                return true
            }
        }
        return false
    }
}

//updating days when u add or delete a note
function updateDaysWithNotes() {
    let tmpdate = dt.getDate();
    addDays(prevDate, nextDate, cellCount, cells, endDate);
    dt.setDate(tmpdate);
    setDatePickerDate();
    setFocusToTextBox(tmpdate);
    changeTodayColors();
}

function noNotesStored(list) {
    if (!list.firstChild) {
        const listItem = document.createElement('li');
        switch (country) {
            case "US": {
                listItem.textContent = 'No notes stored.';
                break;
            }
            case "DE": {
                listItem.textContent = 'Keine Notizen gespeichert.';
                break;
            }
            case "CZ": {
                listItem.textContent = 'Žádné uložené poznámky.';
                break;
            }
        }
        list.appendChild(listItem);
    }
}

function setupApiVariables(){
    holiday_api_country = '&country=' + country;
    nameday_api_country = 'country=' + country;
    api_year = '&year=' + year;
    holiday_final_url = holiday_api_url + holiday_api_country + api_year;
    api_month = '&month=' + (dt.getMonth()+1);
    api_day = '&day=' + dt.getDate();
    nameday_final_url = nameday_api_url + nameday_api_country + api_month + api_day;
}

//showing namedays from API
async function getNamedaysFromAPI(){
    setupApiVariables();
    if (!localStorage.getItem('nameday_' + country + '_'+ (dt.getMonth()+1) + '_' + dt.getDate())) {
        switch (country) {
            case "US": document.getElementById("nameday_str").innerHTML = "Loading.."; break;
            case "DE": document.getElementById("nameday_str").innerHTML = "lade Daten.."; break;
            case "CZ": document.getElementById("nameday_str").innerHTML = "Načítání.."; break;
        }
        setupApiVariables();
        fetch(nameday_final_url)
            .then(response => response.json())
            .then(function (json){
                let namedays_data;
                switch (country) {
                    case "US": {
                        namedays_data = (json.data.namedays.us).split(' ').slice(0,6).join(' ').substring(0,(json.data.namedays.us).length);
                    } break;
                    case "DE": {
                        namedays_data = (json.data.namedays.de).split(' ').slice(0,6).join(' ').substring(0,(json.data.namedays.de).length);
                    } break;
                    case "CZ": {
                        namedays_data = (json.data.namedays.cz).split(' ').slice(0,6).join(' ').substring(0,(json.data.namedays.cz).length);
                    } break;
                }
                if (namedays_data.substring(namedays_data.length - 1, namedays_data.length) === ",") namedays_data = namedays_data.slice(0,namedays_data.length-1);
                localStorage.setItem('nameday_' + country + '_'+ (dt.getMonth()+1) + '_' + dt.getDate(), JSON.stringify(namedays_data));
                document.getElementById("nameday_str").innerHTML = namedays_data;
            })
            .catch(err => console.log(err));
    } else {
        document.getElementById("nameday_str").innerHTML = JSON.parse(localStorage.getItem('nameday_' + country + '_'+ (dt.getMonth()+1) + '_' + dt.getDate()));
    }
}

//showing holiday name from API
async function getNameOfHolidayDataFromAPI() {
    yearString();
    let data;
    if (localStorage.getItem('holiday_' + country + '_' + year)) {
        data = JSON.parse(localStorage.getItem('holiday_' + country + '_' + year));
      } else {
        setupApiVariables();
        const response = await fetch(holiday_final_url);
        data = await response.json();
        localStorage.setItem('holiday_' + country + '_' + year, JSON.stringify(data));
    }

    let todayISO = dt.toISOString().substring(0, 10);
    for (i = 0; i < data.response.holidays.length; i++) {
        if (data.response.holidays[i].date.iso.substring(0, 10) == todayISO) {
            document.getElementById("holiday_name").style.display = "block";
            document.getElementById("holidayDescriptionContent").style.display = "block";
            document.getElementById("holiday_name").innerHTML =
                data.response.holidays[i].name;
            document.getElementById("holidayDescriptionContent").innerHTML =
                data.response.holidays[i].description;
            break;
        } else {
            document.getElementById("holiday_name").style.display = "none";
            document.getElementById("holidayDescriptionContent").style.display = "none";
        }
    }
}

//showing holidays description from API
async function getDescriptionOfHolidayDataFromAPI() {
    let x = document.getElementById('holidayDescription');
    let y = document.getElementById('holidayBar');
    if (x.style.display == 'block') {
        x.style.display = 'none';
        y.style.display = 'block';
    } else {
        x.style.display = 'block';
        y.style.display = 'none';
    }
}

//loading indexed database - data will stay in browser memory until you clear them
//I used it for saving, loading and displaying notes which are different for every day
function loadIndexedDB() {
    let request = window.indexedDB.open('notes_db', 1);

    request.onerror = function () {
        console.log('Database failed to open');
    };

    request.onsuccess = function () {
        db = request.result;
        displayData();
    };

    //creating database schedule (if not creted yet)
    request.onupgradeneeded = function (e) {
        let db = e.target.result;
        let objectStore = db.createObjectStore('notes_os', {keyPath: 'id', autoIncrement: true});
        objectStore.createIndex('title', 'title', {unique: false});
        objectStore.createIndex('body', 'body', {unique: false});
        objectStore.createIndex('date', 'date', {unique: false});
    };
    form.onsubmit = addData;

    //adding notes data to indexedDB
    function addData(e) {
        e.preventDefault();
        dateISOString();
        let newItem = {title: titleInput.value, body: bodyInput.value, date: ISOdate};
        let transaction = db.transaction(['notes_os'], 'readwrite');
        let objectStore = transaction.objectStore('notes_os');
        let request = objectStore.add(newItem);
        setNotes(ISOdate);
        updateDaysWithNotes();

        request.onsuccess = function () {
            titleInput.value = '';
            bodyInput.value = '';
        };

        transaction.oncomplete = function () {
            displayData();
        };

        transaction.onerror = function () {
            console.log('Transaction not opened due to error');
        };
    }

    //showing notes data
    function displayData() {
        // if you didn't do this, you will get duplicates each time a new note is added
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        let objectStore = db.transaction('notes_os').objectStore('notes_os');
        objectStore.openCursor().onsuccess = function (e) {
            let cursor = e.target.result;

            if (cursor) {
                if (cursor.value.date == ISOdate) {
                    const listItem = document.createElement('li');
                    const h3 = document.createElement('h3');
                    const para = document.createElement('p');

                    listItem.appendChild(h3);
                    listItem.appendChild(para);
                    list.appendChild(listItem);

                    h3.textContent = cursor.value.title;
                    para.textContent = cursor.value.body;

                    listItem.setAttribute('data-note-id', cursor.value.id);

                    const deleteBtn = document.createElement('button');
                    listItem.appendChild(deleteBtn);
                    switch (country) {
                        case "US": {
                            deleteBtn.textContent = 'Delete';
                            break;
                        }
                        case "DE": {
                            deleteBtn.textContent = 'Löschen';
                            break;
                        }
                        case "CZ": {
                            deleteBtn.textContent = 'Vymazat';
                            break;
                        }
                    }
                    deleteBtn.onclick = deleteItem;
                }
                cursor.continue();
            } else {
                noNotesStored(list);
            }
        };
    }

    // this is deleting the notes onclick
function deleteItem(e) {
    let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));
    let transaction = db.transaction(['notes_os'], 'readwrite');
    let objectStore = transaction.objectStore('notes_os');
    objectStore.delete(noteId);

    //deleting and updating selected day note
    notesDates.splice(notesDates.findIndex(findTodayNote), 1);
    updateNotes();
    updateDaysWithNotes();

    transaction.oncomplete = function () {

        e.target.parentNode.parentNode.removeChild(e.target.parentNode);
        noNotesStored(list);
    };
}
}

//notes animations
function notesFadeInLeft() {
    let e = document.getElementById("notes");
    e.classList.remove('fadeOutRight');
    e.classList.add('animated');
    e.classList.add('fadeInLeft');
}

function notesFadeOutRight() {
    let e = document.getElementById("notes");
    e.classList.add('animated');
    e.classList.add('fadeOutRight');
    e.classList.remove('fadeInLeft');
}

function notesFadeOut() {
    let e = document.getElementById("sidePanel");
    e.classList.add('animatedOut');
    e.classList.add('fadeOut');
    e.classList.remove('animatedIn');
    e.classList.remove('fadeIn');
}

function notesFadeIn() {
    let e = document.getElementById("sidePanel");
    e.classList.remove('animatedOut');
    e.classList.remove('fadeOut');
    e.classList.add('animatedIn');
    e.classList.add('fadeIn');
}

function checklistFadeInLeft() {
    let e = document.getElementById("checklist");
    e.classList.remove('fadeOutRight');
    e.classList.add('animated');
    e.classList.add('fadeInLeft');
}

function checklistFadeOutRight() {
    let e = document.getElementById("checklist");
    e.classList.add('animated');
    e.classList.add('fadeOutRight');
    e.classList.remove('fadeInLeft');
}

function checklistFadeOut() {
    let e = document.getElementById("checklist-panel");
    e.classList.add('animatedOut');
    e.classList.add('fadeOut');
    e.classList.remove('animatedIn');
    e.classList.remove('fadeIn');
}

function checklistFadeIn() {
    let e = document.getElementById("checklist-panel");
    e.classList.remove('animatedOut');
    e.classList.remove('fadeOut');
    e.classList.add('animatedIn');
    e.classList.add('fadeIn');
}

//flags animation
function fadingFlags() {
    let country1 = document.getElementById("US");
    let country2 = document.getElementById("DE");
    let country3 = document.getElementById("CZ");
    if (country1.style.display == "block") {
        country1.classList.remove('animatedFlagsIn');
        country1.classList.remove('fadeInRightFlag1');
        country2.classList.remove('animatedFlagsIn');
        country2.classList.remove('fadeInRightFlag2');
        country3.classList.remove('animatedFlagsIn');
        country3.classList.remove('fadeInRightFlag3');

        country1.classList.add('animatedFlagsOut');
        country1.classList.add('fadeOutLeftFlag1');
        country2.classList.add('animatedFlagsOut');
        country2.classList.add('fadeOutLeftFlag2');
        country3.classList.add('animatedFlagsOut');
        country3.classList.add('fadeOutLeftFlag3');

        document.getElementById('language-panel').removeAttribute("onclick");
        setTimeout(function () {
            document.getElementById('language-panel').setAttribute("onclick", "fadingFlags();");
            showHideLanguages();
        }, 700);

    } else {
        showHideLanguages();
        country1.classList.remove('animatedFlagsOut');
        country1.classList.remove('fadeOutLeftFlag1');
        country2.classList.remove('animatedFlagsOut');
        country2.classList.remove('fadeOutLeftFlag2');
        country3.classList.remove('animatedFlagsOut');
        country3.classList.remove('fadeOutLeftFlag3');

        country1.classList.add('animatedFlagsIn');
        country1.classList.add('fadeInRightFlag1');
        country2.classList.add('animatedFlagsIn');
        country2.classList.add('fadeInRightFlag2');
        country3.classList.add('animatedFlagsIn');
        country3.classList.add('fadeInRightFlag3');

        document.getElementById('language-panel').removeAttribute("onclick");
        setTimeout(function () {
            document.getElementById('language-panel').setAttribute("onclick", "fadingFlags();");
        }, 700);
    }
}