/************************
 * Made by [MR Ferry™]  *
 *  on February 2019    *
 ************************/

'use strict';
let controller;
const CLEAR = "Clear";

class PrimaryObject{
    constructor(Builder){
        if(Builder.duplicateActionsField === undefined || Builder.filesField === undefined){
            throw Error("Must have parameter");
        }
        this._duplicateActionsField = _(Builder.duplicateActionsField);
        this._duplicateAction = _(`${Builder.duplicateActionsField}:checked`)[0].value;
        this._filesField = _(Builder.filesField);
        this._files = this._filesField.files;
        PrimaryObject.batch = 0;
        PrimaryObject.seconds = 1;
        PrimaryObject.totalSeconds = 1;
        PrimaryObject.average = 0;
        PrimaryObject.loaded = 0;
        Object.freeze(this);
        return this;
    }

    get duplicateActionsField(){
        return this._duplicateActionsField;
    }

    get duplicateAction(){
        return this._duplicateAction;
    }

    get filesField(){
        return this._filesField;
    }

    get files(){
        return this._files;
    }

    get currentFile(){
        return this.files[PrimaryObject.batch];
    }

    static get Builder(){
        class Builder{
            withDuplicateActionsField(duplicateActionsField){
                this.duplicateActionsField = duplicateActionsField;
                return this;
            }

            withFilesField(filesField){
                this.filesField = filesField;
                return this;
            }

            build(){
                return new PrimaryObject(this);
            }
        }

        return new Builder();
    }
}

class FetchController{
    constructor(ajax, abortSignal){
        if(ajax === undefined || abortSignal === undefined){
            throw Error("Must have parameter");
        }
        this.abortSignal = abortSignal;
        this.ajax = ajax;
        Object.seal(this);
    }
}

function traverseFileTree(item, path) {
    path = path || "";
    if (item.isFile) {
        // Get file
        item.file(function(file) {
            console.log("File:", path + file.name);
        });
    } else if (item.isDirectory) {
        // Get folder contents
        var dirReader = item.createReader();
        dirReader.readEntries(function(entries) {
            for (var i=0; i<entries.length; i++) {
                traverseFileTree(entries[i], path + item.name + "/");
            }
        });
    }
}

function uploadFile(event = null){
    if(event !== null){
        var items = event.dataTransfer.items;
        for(var i = 0; i < items.length; i++){
            // webkitGetAsEntry is where the magic happens
            var item = items[i].webkitGetAsEntry();
            if(item){
                traverseFileTree(item);
            }
        }
        return;
    }
    const obj = PrimaryObject.Builder
        .withDuplicateActionsField("[name=actions]")
        .withFilesField("#files")
        .build();
    _("#button").innerHTML = "Abort";
    clearHistory();
    toggleButtons(obj, true);
    showList(obj);
    checkFile(obj);
}

function toggleButtons(obj, disable){
    if(disable){
        for(const any of Array.from(obj.duplicateActionsField)){
            any.setAttribute("disabled", "disabled");
        }
        obj.filesField.setAttribute("disabled", "disabled");
    } else{
        for(const any of Array.from(obj.duplicateActionsField)){
            any.removeAttribute("disabled");
        }
        obj.filesField.removeAttribute("disabled");
    }
}

function abortOrClear(event){
    event.preventDefault();
    if(_("#button").innerHTML === CLEAR){
        _("#total").innerHTML = "";
        _("#upload-status").innerHTML = "";
        _("#loaded-total").innerHTML = "";
        _("#progress-bar").value = 0;
        _(".st-viewport")[0].style.display = "none";
        clearHistory();
    } else{
        if(controller !== undefined){
            controller.abortSignal.abort();
            controller.ajax.abort();
        }
    }
}

function clearHistory(){
    const completedStatuses = _(".completed-statuses");
    for(const node of Array.from(completedStatuses)){
        node.remove();
    }
}

function checkFile(obj){
    controller = new FetchController(new XMLHttpRequest(), new AbortController());
    if(obj.currentFile.size === 0){
        handleUploadError(obj);
    }
    const options = {
        method: "POST",
        body: JSON.stringify({"fileName": obj.currentFile.name}),
        signal: controller.abortSignal.signal,
        headers: {
            "Content-Type": "application/json"
        }
    };
    fetch(`${path}/cek`, options)
        .then(res => res.json())
        .then(res => handleCompleteCheck(res, obj))
        .catch(e =>{
            if(e.name === "AbortError"){
                handleUploadAbort(obj);
            } else{
                handleUploadError(obj);
            }
        })
}

function showAskAlert(obj){
    swal({
        title: `'${obj.currentFile.name}' Already Exists`,
        closeOnClickOutside: false,
        closeOnEsc: false,
        className: 'ask-alert',
        text: "What would you do?",
        buttons: {
            cancel: "Cancel upload",
            overwrite: "Overwrite with this",
            keep: "Keep all files",
            skip: "Skip this file",
        },
        icon: `${path}/assets/img/duplicate.png`
    }).then((value) =>{
        switch(value){
            case null:
                handleUploadAbort(obj);
                break;

            case "overwrite":
                sendFile(true, obj);
                break;

            case "keep":
                sendFile(false, obj);
                break;

            default:
                handleUploadComplete(obj);
        }
    });
}

function handleCompleteCheck(exist, obj){
    if(exist){
        if(obj.duplicateAction === "ask"){
            showAskAlert(obj);
        } else if(obj.duplicateAction === "overwrite"){
            sendFile(true, obj);
        } else if(obj.duplicateAction === "keep"){
            sendFile(false, obj);
        } else{
            handleUploadComplete(obj);
        }
    } else{
        sendFile(true, obj);
    }
}

function calculateSize(fileSize){
    if(fileSize <= 0){
        return "";
    }
    let result = fileSize;
    let count = 0;
    while(result > 1000 && count < 3){
        result /= 1000;
        count++;
    }
    let suffix;
    if(count === 1){
        suffix = "KB";
    } else if(count === 2){
        suffix = "MB";
    } else if(count === 3){
        suffix = "GB";
    } else{
        suffix = "B";
    }
    return `${result.toFixed(2)} ${suffix}`;
}

function resetSpeedVars(){
    PrimaryObject.seconds = 1;
    PrimaryObject.average = 0;
}

function resetSpeedInterval(speedInterval){
    if(speedInterval != null){
        clearInterval(speedInterval.secondsCounter);
        clearInterval(speedInterval.secondsAllCounter);
        clearInterval(speedInterval.avgCounter);
    }
}

function SpeedInterval(){
    this.secondsCounter = setInterval(() => ++PrimaryObject.seconds, 1000);
    this.secondsAllCounter = setInterval(() => ++PrimaryObject.totalSeconds, 1000);
    this.avgCounter = setInterval(() => PrimaryObject.average = PrimaryObject.loaded / PrimaryObject.seconds, 1000);
    Object.seal(this);
}

function prepareSpeedCalculation(obj){
    _("#upload-status").innerHTML = `Uploading ${obj.currentFile.name}`;
    _("#progress-bar").value = 0;
    resetSpeedVars();
}

function buildFormData(obj, overwritten){
    const formdata = new FormData();
    console.log(obj.currentFile);
    formdata.append("file", obj.currentFile);
    formdata.append("overwritten", overwritten);
    return formdata;
}

function sendFile(overwritten, obj){
    prepareSpeedCalculation(obj);
    const speedInterval = new SpeedInterval();
    const formdata = buildFormData(obj, overwritten);

    const ajax = controller.ajax;
    ajax.upload.addEventListener("progress", event => handleUploadProgress(event, obj), false);
    ajax.addEventListener("load", (event) => handleUploadComplete(obj, event.target.response, speedInterval), false);
    ajax.addEventListener("error", () => handleUploadError(obj, speedInterval), false);
    ajax.addEventListener("abort", () => handleUploadAbort(obj, speedInterval), false);
    ajax.open("POST", `${path}/aplod`);
    ajax.send(formdata);
}

function getTime(total){
    const time = calculateTime(Math.round((total - PrimaryObject.loaded) / PrimaryObject.average));
    return time.startsWith("Calculating") ? time : `${time} left`;
}

function calculateSpeed(avg){
    const speed = calculateSize(avg);
    return !!speed ? `at ${speed}/s` : speed;
}

function handleUploadProgress(event, obj){
    PrimaryObject.loaded = event.loaded;
    const percent = (PrimaryObject.loaded / event.total) * 100;
    const name = obj.currentFile.name;
    _("#progress-bar").value = percent;
    const loadedSize = calculateSize(PrimaryObject.loaded);
    const fileSize = calculateSize(obj.currentFile.size);
    if(event.total > PrimaryObject.loaded){
        const speed = calculateSpeed(PrimaryObject.average);
        _("#loaded-total").innerHTML = `Loaded ${loadedSize} of ${fileSize} ${speed}`;

        const time = getTime(event.total);
        _("#upload-status").innerHTML = `Uploading '${name}'</br> ${Math.round(percent)}% uploaded (${time}).`;
    } else{
        _("#loaded-total").innerHTML = `Loaded ${loadedSize} of ${fileSize}`;
        _("#upload-status").innerHTML = `Finalizing '${name}'</br> Please Wait...`;
    }
}

function showList(obj){
    _("#total").innerHTML = `Uploaded 0/${obj.files.length}`;
    _(".st-viewport")[0].style.display = "inline-block";
    for(let i = 0; i < obj.files.length; i++){
        const newRow = document.createElement('div');
        const newFileName = document.createElement('div');
        const newStatus = document.createElement('div');
        const newStatusIcon = document.createElement('i');
        _(".st_table")[0].appendChild(newRow);

        newRow.setAttribute("id", `completed-row${i}`);
        newRow.setAttribute("class", "completed-statuses st-row");
        newRow.appendChild(newFileName);
        newRow.appendChild(newStatus);

        newFileName.setAttribute("id", `completed-file${i}`);
        newFileName.setAttribute("class", "st-column file-name");
        newFileName.innerHTML = obj.files[i].name;

        newStatus.setAttribute("id", `completed-status${i}`);
        newStatus.setAttribute("class", "st-column status");
        newStatus.setAttribute("data-tooltip", "Processing");
        newStatus.appendChild(newStatusIcon);

        newStatusIcon.setAttribute("class", "material-icons");
        newStatusIcon.setAttribute("id", `material-icon${i}`);
        newStatusIcon.setAttribute("title", "Processing");
        newStatusIcon.innerHTML = "slow_motion_video";
    }
}

function handleUploadComplete(obj, fileName = null, speedInterval = null){
    const length = obj.files.length;
    let status;
    if(fileName !== null){
        _(`#completed-file${PrimaryObject.batch}`).innerHTML = fileName;
        status = {icon: "done_all", desc: "Completed"};
    } else{
        _("#progress-bar").value = 100;
        status = {icon: "skip_next", desc: "Skipped"};
    }
    const iconStatus = _(`#material-icon${PrimaryObject.batch}`);
    iconStatus.innerHTML = status.icon;
    iconStatus.setAttribute("title", status.desc);

    _(`#completed-status${PrimaryObject.batch++}`).setAttribute("data-tooltip", status.desc);
    _("#total").innerHTML = `Uploaded ${PrimaryObject.batch}/${length}`;
    if(PrimaryObject.batch < length){
        resetSpeedInterval(speedInterval);
        checkFile(obj);
    } else{
        showEventAlert(`${length} File${getPlural(length)} Finished 😃`,
            `Completed in ${calculateTime(PrimaryObject.totalSeconds)}`, false);
        _("#completed-sound").play();
        handleDefaultAction("", obj, speedInterval);
    }
}

function calculateTime(timeInSeconds){
    if(!isFinite(timeInSeconds)){
        return "Calculating time..."
    }
    if(timeInSeconds >= 1){
        let result = "";
        const minutes = 60;
        const hours = minutes * 60;
        if(timeInSeconds >= hours){
            const time = parseInt((timeInSeconds / hours).toString());
            result += `${time} hour${getPlural(time)} `;
            timeInSeconds %= hours;
        }
        if(timeInSeconds >= minutes){
            const time = parseInt((timeInSeconds / minutes).toString());
            result += `${time} minute${getPlural(time)} `;
            timeInSeconds %= minutes;
        }
        result += `${timeInSeconds} second${getPlural(timeInSeconds)} `;
        return result;
    } else{
        return "0 seconds";
    }
}

function showEventAlert(title, text, dangerMode){
    swal({
        title: title,
        className: 'error-alert',
        dangerMode: dangerMode,
        icon: dangerMode ? 'error' : 'success',
        closeOnClickOutside: false,
        closeOnEsc: false,
        text: text
    });
}

function handleUploadError(obj, speedInterval = null){
    showEventAlert("Upload Error", "Something gone wrong!", true);
    _("#failed-sound").play();
    handleDefaultAction('Upload has failed', obj, speedInterval);
}

function showFailedFiles(obj){
    for(let i = PrimaryObject.batch; i < obj.files.length; i++){
        _(`#completed-status${i}`).setAttribute("data-tooltip", "Failed");
        _(`#material-icon${i}`).innerHTML = "error";
        _(`#material-icon${i}`).setAttribute("title", "Failed");
    }
}

function handleUploadAbort(obj, speedInterval = null){
    showEventAlert("Upload Aborted", "You abort the upload process!", true);
    handleDefaultAction('Upload has been canceled', obj, speedInterval);
}

function handleDefaultAction(uploadMsg, obj, speedInterval){
    _("#button").innerHTML = CLEAR;
    showFailedFiles(obj);
    PrimaryObject.batch = 0;
    _("#loaded-total").innerHTML = "";
    _("#upload-status").innerHTML = uploadMsg;
    obj.filesField.value = "";
    toggleButtons(obj, false);
    resetSpeedInterval(speedInterval);
}
