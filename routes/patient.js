const express = require('express');
const router = express.Router();
const axios = require('axios');
const complianceService = require('../service/compliance-service');
const localMongoDBUri = 'mongodb://localhost:27017/compassapi_db';
const MongoClient = require('mongodb').MongoClient;

//Handling patient route. Display details about patient

//----------------------------------------------------------------------------------
// TO DO: TRIAL ID HAS BEEN MOCKED HERE. NEED TO CHANGE TRIAL ID TO MAKE IT DYNAMIC
//----------------------------------------------------------------------------------

function completedCheck(activityInstance){
    if(activityInstance.state.toLowerCase() === "expired"){
        return false;
    }else if(activityInstance.state.toLowerCase() === "completed" && (activityInstance.userSubmissionTime <= activityInstance.endTime &&
                activityInstance.startTime <= activityInstance.userSubmissionTime)){
        return true;
    }else{
        return false;
    }
}

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

function getDates(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(currentDate)
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

router.get('/trials/5a946ff566684905df608446/patients/:patientPin', async (req, res) => {

    try{
        response = await axios.get('http://localhost:8080/CompassAPI/rest/patients/'+req.params.patientPin);
    }catch(err){
        console.log(err);
    }
    
    // If there are no activity instances for the patient
    
    if(!response.data._links.activity_instance){
    
        res.send("There are no activity instances for this patient");
    }
    
    let activityInstancesLinks = response.data._links.activity_instance;
    //GET THIS DATE FROM THE USER INPUT, CURRENTLY MOCKING
    let selectedWeekStartDate = new Date(1540036800000);
    
    var dateArray = getDates(new Date(selectedWeekStartDate), (new Date(selectedWeekStartDate)).addDays(6));
    let formattedDates = []
    let givenActivities = []
    let completedActivities = []

    for(let i = 0; i < dateArray.length; i++){
        
        let date = dateArray[i];
        formattedDates.push((date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear()+"")
        let completedTasks = 0;
        let givenTasks = 0;

        for(let index = 0; index < activityInstancesLinks.length; index++){

            let link = activityInstancesLinks[index];
    
            if(link.href === 'http://localhost:8080/CompassAPI/rest/activityinstances/5cbfbade555ab30a12474e24'
                || link.href === 'http://localhost:8080/CompassAPI/rest/activityinstances/5cbfbc58555ab30a12474e27'){
                continue;
            }
    
            let activityInstance = undefined;
            try{
                activityInstance = (await axios.get(link.href)).data.activity_instance;
            }catch(error){
                console.log(error);
            }
            let endDate = new Date(activityInstance.endTime);

            if(date.getDate() == endDate.getDate() && 
                date.getMonth() == endDate.getMonth() &&
                    date.getFullYear() == endDate.getFullYear()){
                
                givenTasks++;
                if(completedCheck(activityInstance)){
                   completedTasks++;
                }
            }
        }
        givenActivities.push(givenTasks);
        completedActivities.push(completedTasks);
    }
    res.render('patient.ejs', {
        patientPin: req.params.patientPin,
        dates: JSON.stringify(formattedDates),
        givenActivities: givenActivities,
        completedActivities: completedActivities
    })
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Activity compliance detail
router.post('/trials/5a946ff566684905df608446/patients/:patientPin/activity-compliance-detail', async (req, res) => {
    
    let patientScores = undefined;
    let scoreData = undefined;
    let scores = [];

    let apiResponse = undefined;

    try{
        apiResponse = await axios.get("http://localhost:8080/CompassAPI/rest/activities?domain=Preventive Anxiety");
    }catch(err){
        console.log(err);
    }

    let activities = apiResponse.data._embedded.activities;
    let activityIds = [];
    let activityNames = [];

    for(let i = 0; i < activities.length; i++){
        activityIds.push(activities[i].activity.activityId);
        activityNames.push(activities[i].activity.title);
        scores.push([]);
        scores[i].push(null);
    }

    // Connect to the db
    MongoClient.connect(localMongoDBUri, async function (err, db) {
        await db.collection('patientScores', async function (err, collection) {
            await collection.find().toArray(async function(err, items) {
                if(err) throw err;    
                patientScores = await items;  
                for(let i = 0; i < patientScores.length; i++){      
                    if(patientScores[i].patientPin == req.params.patientPin){
                        scoreData = patientScores[i].scoreData;
                    }
                }
            });
        });     
    });
    await sleep(100);

    let avgScore = [0]
    for(let i = 0; i < scoreData.length; i++){
        data = scoreData[i];
        if(data.activityScores.length > 1){
            let sum = 0;
            for(let j = 0; j < data.activityScores.length; j++){
                sum += data.activityScores[j].score; 
            }
            avgScore.push(sum/data.activityScores.length);
        }else{
            avgScore.push(data.activityScores[0].score);
        }
        
    }

    for(let i = 0; i < scoreData.length; i++){
        data = scoreData[i];
        for(let m = 0; m < data.activityScores.length; m++){
            for(let j = 0; j < activityIds.length; j++){
                if(//activityIds[j] == data.activityScores[m].activityId &&
                    activityNames[j] == data.activityScores[m].activityName){
                        for(let k = 0; k < scores.length; k++){
                            if(j == k){
                                scores[j].push(data.activityScores[m].score);
                            }else{
                                scores[k].push(null);
                            }
                        }
                    break;
                }
            }
        }
        
    }

    try{
        response = await axios.get('http://localhost:8080/CompassAPI/rest/patients/'+req.params.patientPin);
    }catch(err){
        console.log(err);
    }
    
    // If there are no activity instances for the patient
    
    if(!response.data._links.activity_instance){
    
        res.send("There are no activity instances for this patient");
    }
    
    let activityInstancesLinks = response.data._links.activity_instance;

    let selectedWeekStartDate = new Date(req.body.startDate).addDays(1);
    let selectedWeekEndDate = new Date(req.body.endDate).addDays(1);

    var dateArray = getDates(new Date(selectedWeekStartDate), (new Date(selectedWeekEndDate)));
    let formattedDates = []
    let givenActivities = []
    let completedActivities = []
    let activity_instances = []

    for(let i = 0; i < dateArray.length; i++){
        
        let date = dateArray[i];
        formattedDates.push((date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear()+"")
        let completedTasks = 0;
        let givenTasks = 0;
        
        for(let index = 0; index < activityInstancesLinks.length; index++){

            let link = activityInstancesLinks[index];
    
            if(link.href === 'http://localhost:8080/CompassAPI/rest/activityinstances/5cbfbade555ab30a12474e24'
                || link.href === 'http://localhost:8080/CompassAPI/rest/activityinstances/5cbfbc58555ab30a12474e27'){
                continue;
            }
    
            let activityInstance = undefined;
            try{
                activityInstance = (await axios.get(link.href)).data.activity_instance;
                if(i == 0){
                    activity_instances.push(activityInstance);
                }
                
            }catch(error){
                console.log(error);
            }
            let endDate = new Date(activityInstance.endTime);

            if(date.getDate() == endDate.getDate() && 
                date.getMonth() == endDate.getMonth() &&
                    date.getFullYear() == endDate.getFullYear()){
                
                givenTasks++;
                if(completedCheck(activityInstance)){
                   completedTasks++;
                }
            }
        }
        givenActivities.push(givenTasks);
        completedActivities.push(completedTasks);
    }

    res.render('compliance-detail.ejs', {
        patientPin: req.params.patientPin,
        dates: JSON.stringify(formattedDates),
        givenActivities: givenActivities,
        completedActivities: completedActivities,
        activity_instances: activity_instances,
        scores: scores,
        avgScore: avgScore,
        activityNames: activityNames,
        activityIds: activityIds
    })
});

module.exports = router;