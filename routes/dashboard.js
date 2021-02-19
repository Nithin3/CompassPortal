const express = require('express');
const router = express.Router();
const axios = require('axios');
const complianceService = require('../service/compliance-service');
const { connect } = require('./patient');

//Dasboard Handle
router.get('/dashboard', (req, res) => {
    res.render('dashboard')
});

//Trial
router.get('/dashboard/trial/:trialId', async (req, res) => {
    
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
        
        res.render('trial', {patients : response.data._embedded.patients, compliant: compliant, 
            partially_compliant: partially_compliant, non_compliant: non_compliant, compliantStatus: compliantStatus});
    }catch(err){
        console.log(err);
    }
    

});

module.exports = router;