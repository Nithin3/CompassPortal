const express = require('express');
const router = express.Router();
const axios = require('axios');
const complianceService = require('../service/compliance-service');
const { connect } = require('./patient');

//Dasboard Handle
router.get('/dashboard', async (req, res) => {
    try{
        let response = await axios.get('http://localhost:8080/CompassAPI/rest/trials');
        let trials = response.data._embedded.trials;
        let trialSpecificData = [];
        for(let i = 0; i < trials.length; i++){
            trialSpecificData[i] = trials[i].trial;
        }
        res.render('dashboard', {
            trials: trialSpecificData
        });
    }catch(err){
        console.log(err);
    }
    
});

//Trial
router.get('/dashboard/trial/:trialId', async (req, res) => {
    
    let trialSpecificData = [];
    let compassTrial = undefined;
    try{
        let response = await axios.get('http://localhost:8080/CompassAPI/rest/trials');
        compassTrial = response.data._embedded.trials[0].trial;
        
    }catch(err){
        console.log(err);
    }

    try{
        var compliant = 0;
        var partially_compliant = 0;
        var non_compliant = 0;
        var compliantStatus = []
        var response = undefined;
        try{
            response = await axios.get('http://localhost:8080/CompassAPI/rest/patients?trialId='+req.params.trialId);
        }catch(err){
            console.log(err);
        }

        if(response.data._embedded == undefined){
            res.send("There are no patients for the selected trial. Please check some other time.");
            return;
        }
        
        for(var i = 0; i < response.data._embedded.patients.length; i++){
            var obj = response.data._embedded.patients[i];
            var patientPin = obj.patient.pin;
            
            var stats = await complianceService.fetchActivitiesStats(patientPin);
            var percent = (stats.completed/(stats.numOfActivityInstances))*100;
            
            if(percent >= 70){
                compliant++;
                compliantStatus.push("Compliant");
            }else if(percent >= 30 && percent < 70){
                partially_compliant++;
                compliantStatus.push("Partially-Compliant");
            }else{
                non_compliant++;
                compliantStatus.push("Non-Compliant");
            }
        }
        
        res.render('trial', {trialId: req.params.trialId, trial: compassTrial, patients : response.data._embedded.patients, compliant: compliant, 
            partially_compliant: partially_compliant, non_compliant: non_compliant, compliantStatus: compliantStatus});
    }catch(err){
        console.log(err);
    }
    
});

module.exports = router;