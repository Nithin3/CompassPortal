/*jslint node: true */
'use strict';

//import modules
const axios = require('axios');
const moment = require('moment');
const viewDateTimeFormat = "MM/DD/YYYY hh:mm a";
const chartDateFormat = "MM/DD/YYYY";

//captions
const DAILY_DIARY = "DailyDiary";
const WORRY_HEADS = "WorryHeads";
const MAKE_BELIEVE = "MakeBelieve";
const EMOTIONS = "Emotions";
const RELAXATION = "Relaxation";
const STAND_UP = "StandUp";

//activity state captions
const PENDING = "pending";
const IN_PROGRESS = "in progress";
const COMPLETED = "completed";
const EXPIRED = "expired";

function getPatientComplianceData(patientPin){
    var arr = []
    axios.get('http://localhost:8080/CompassAPI/rest/activityinstances?patientPin='+patientPin)
    .then(response => {
        arr = (response.data._embedded.activityInstances);
        arr.sort(function(a, b) {
            return (a.activityInstance.startTime < b.activityInstance.startTime) ? -1 : ((a.activityInstance.startTime > b.activityInstance.startTime) ? 1 : 0);
        });
        return arr;
    })
    .catch(error => {
        console.log(error);
    });
}