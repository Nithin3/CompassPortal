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

function addDummyData(complianceData, totalLabels){
    let loopCounter = 0;

    //daily-diary
    if(complianceData.dailyDiary.length < totalLabels){
        loopCounter = totalLabels-complianceData.dailyDiary.length;
        for(let i = 0; i < loopCounter; i++){
            complianceData.dailyDiary.push(0);
        }
    }

    //worry-heads
    if(complianceData.worryHeads.length < totalLabels){
        loopCounter = totalLabels-complianceData.worryHeads.length;
        for(let i = 0; i < loopCounter; i++){
            complianceData.worryHeads.push(0);
        }
    }

    //make-believe
    if(complianceData.makeBelieve.length < totalLabels){
        loopCounter = totalLabels-complianceData.makeBelieve.length;
        for(let i = 0; i < loopCounter; i++){
            complianceData.makeBelieve.push(0);
        }
    }

    //emotions
    if(complianceData.emotions.length < totalLabels){
        loopCounter = totalLabels-complianceData.emotions.length;
        for(let i = 0; i < loopCounter; i++){
            complianceData.emotions.push(0);
        }
    }

    //Relaxation
    if(complianceData.relaxation.length < totalLabels){
        loopCounter = totalLabels-complianceData.relaxation.length;
        for(let i = 0; i < loopCounter; i++){
            complianceData.relaxation.push(0);
        }
    }

    //StandUp
    if(complianceData.standUp.length < totalLabels){
        loopCounter = totalLabels-complianceData.standUp.length;
        for(let i = 0; i < loopCounter; i++){
            complianceData.standUp.push(0);
        }
    }

    //weekly-survey
    if(complianceData.weeklySurvey.length < totalLabels){
        loopCounter = totalLabels-complianceData.weeklySurvey.length;
        for(let i = 0; i < loopCounter; i++){
            complianceData.weeklySurvey.push(0);
        }
    }

    return complianceData;
}

function getUniqueElements(arr){
    arr = arr.filter (function (value, index, array) {
        return array.indexOf (value) === index;
    });

    return arr;
}

function generateComplianceActivities(queryResults){
    queryResults.forEach(function(obj){
        obj.activity_instance.startTime = moment(new Date(obj.activity_instance.startTime)).format(viewDateTimeFormat);
        obj.activity_instance.endTime = moment(new Date(obj.activity_instance.endTime)).format(viewDateTimeFormat);

        // modify/update the state of the instance
        obj.activity_instance = getActivityInstanceState(obj.activity_instance);

        obj.activity_instance.status = getStatus(obj.activity_instance.state);

        if (obj.activity_instance.userSubmissionTime !== null) {
            obj.activity_instance.userSubmissionTime = moment(new Date(obj.activity_instance.userSubmissionTime)).format(viewDateTimeFormat);
        } else {
            obj.activity_instance.userSubmissionTime = 'N/A';
        }
    });

    return queryResults;
}

function getActivityInstanceState(activityInstance){
    // check if the state is created or pending and whether the endDate is passed, if yes set the state as 'Expired'
    if ((activityInstance.state === PENDING || activityInstance.state === CREATED) && moment().isAfter(new Date(activityInstance.endTime))){
        activityInstance.state = capitalize('expired');
    } else {
        activityInstance.state = capitalize(activityInstance.state);
    }

    return activityInstance;
}

function getStatus(state){
    // success | warning | info | danger
    var status = "danger";

    switch (state.toLowerCase()){
        case COMPLETED:
            status = "success";
            break;
        case CREATED:
            status = "warning";
            break;
        case IN_PROGRESS:
            status = "warning";
            break;
        case PENDING:
            status = "info";
            break;
        case EXPIRED:
            status = "danger";
            break;
        default:
            // do nothing
    }

    return status;
}

function capitalize(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function generateActivityStats(queryResults){
    let stats = {completed: 0, created:0, inProgress: 0, expired: 0, pending:0};

    queryResults.forEach(function(obj){

        switch(obj.activity_instance.state.toLowerCase()){
            case COMPLETED:
                stats.completed++;
                break;
            case CREATED:
                stats.created++;
                break;
            case IN_PROGRESS:
                stats.inProgress++;
                break;
            case PENDING:
                stats.pending++;
                break;
            case EXPIRED:
                stats.expired++;
                break;
            default:
                // do nothing
        }
    });

    return stats;
}

module.exports.fetchPatientComplianceData = getPatientComplianceData;
module.exports.fetchComplianceChartData = generateComplianceChartData;
module.exports.fetchComplianceActivities = generateComplianceActivities;
module.exports.fetchActivitiesStats = generateActivityStats;