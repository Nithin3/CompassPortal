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
const CREATED = "created";
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

function getIndividualActivityCompliance(obj, complianceData){
    var totalActivities = 7;
    let activityTitle = "";
    axios.get(obj._links.activity_type.href)
    .then(response => {
        activityTitle = response.data.activity.title;
    })
    .catch(error => {
        console.log(error);
    });
    if (obj.activity_instance.state === COMPLETED) {
        switch (activityTitle.toLowerCase()){
            case DAILY_DIARY.toLowerCase():
                complianceData.dailyDiary.push(100/totalActivities);
                break;
            case WORRY_HEADS.toLowerCase():
                complianceData.worryHeads.push(100/totalActivities);
                break;
            case MAKE_BELIEVE.toLowerCase():
                complianceData.makeBelieve.push(100/totalActivities);
                break;
            case EMOTIONS.toLowerCase():
                complianceData.emotions.push(100/totalActivities);
                break;
            case RELAXATION.toLowerCase():
                complianceData.relaxation.push(100/totalActivities);
                break;
            case STAND_UP.toLowerCase():
                complianceData.standUp.push(100/totalActivities);
                break;
            case WEEKLY_SURVEY.toLowerCase():
                complianceData.weeklySurvey.push(100/totalActivities);
                break;
            default:
            // do nothing
        }
    } else {
        switch (activityTitle.toLowerCase()){
            case DAILY_DIARY.toLowerCase():
                complianceData.dailyDiary.push(0);
                break;
            case WORRY_HEADS.toLowerCase():
                complianceData.worryHeads.push(0);
                break;
            case MAKE_BELIEVE.toLowerCase():
                complianceData.makeBelieve.push(0);
                break;
            case EMOTIONS.toLowerCase():
                complianceData.emotions.push(0);
                break;
            case RELAXATION.toLowerCase():
                complianceData.relaxation.push(0);
                break;
            case STAND_UP.toLowerCase():
                complianceData.standUp.push(0);
                break;
            case WEEKLY_SURVEY.toLowerCase():
                complianceData.weeklySurvey.push(0);
                break;
            default:
            // do nothing
        }
    }

    return complianceData;
}