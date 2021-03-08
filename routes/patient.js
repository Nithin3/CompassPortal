const express = require('express');
const router = express.Router();
const axios = require('axios');
const complianceService = require('../service/compliance-service');

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
    
    var dateArray = getDates(new Date(selectedWeekStartDate), (new Date(selectedWeekStartDate)).addDays(6));
    let week = [];
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

    console.log(week);
    console.log(formattedDates);
    res.render('patient.ejs', {
        dates: JSON.stringify(formattedDates),
        givenActivities: givenActivities,
        completedActivities: completedActivities
    })
});

module.exports = router;