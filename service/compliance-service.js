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
const WEEKLY_SURVEY = 'Compass Weekly Survey';

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
            return (a.activity_instance.startTime < b.activity_instance.startTime) ? -1 : ((a.activity_instance.startTime > b.activity_instance.startTime) ? 1 : 0);
        });
        return arr;
    })
    .catch(error => {
        console.log(error);
    });
}

function generateComplianceChartData(queryResults){
    var result = generateLabelsAndDataPropertyOfChart(queryResults);

    var chartData = {
        labels: result.labels,
        datasets: [
            {
                label: DAILY_DIARY,
                data: result.complianceData.dailyDiary,
                backgroundColor: '#E74C3C'
            },
            {
                label: WORRY_HEADS,
                data: result.complianceData.worryHeads,
                backgroundColor: '#2C3E50'
            },
            {
                label: MAKE_BELIEVE,
                data: result.complianceData.makeBelieve,
                backgroundColor: "orange"
            },
            {
                label: EMOTIONS,
                data: result.complianceData.emotions,
                backgroundColor: "green"
            },
            {
                label: RELAXATION,
                data: result.complianceData.relaxation,
                backgroundColor: "brown"
            },
            {
                label: STAND_UP,
                data: result.complianceData.standUp,
                backgroundColor: "yellow"
            },
            {
                label: WEEKLY_SURVEY,
                data: result.complianceData.weeklySurvey,
                backgroundColor: "red"
            }
        ]
    };

    return chartData;
}

function generateLabelsAndDataPropertyOfChart(queryResults){
    var weeks = [];
    var complianceData = {
        dailyDiary = [],
        worryHeads = [],
        makeBelieve = [],
        emotions = [],
        relaxation = [],
        standUp = [],
        weeklySurvey = []
    }
    queryResults.forEach((obj)=>{
        // format the date-time relative to date
        obj.activity_instance.startTime = moment.utc(obj.activity_instance.startTime).format(chartDateFormat);
        obj.activity_instance.endTime = moment.utc(obj.activity_instance.endTime).format(chartDateFormat);
        
        //for labels
        weeks.push(obj.activity_instance.startTime+' - '+obj.activity_instance.endTime);
        complianceData = getIndividualActivityCompliance(obj, complianceData);
    });

    let chartLabels = getUniqueElements(weeks);
    complianceData = addDummyData(complianceData, chartLabels.length);

    return {labels: chartLabels, complianceData: complianceData};
}