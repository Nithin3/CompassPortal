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
        var response = await axios.get('http://localhost:8080/CompassAPI/rest/patients?trialId='+req.params.trialId);
        for(var i = 0; i < response.data._embedded.patients.length; i++){
            var obj = response.data._embedded.patients[i];
            var patientPin = obj.patient.pin;
            var activityInstancesResponse = await axios.get("http://localhost:8080/CompassAPI/rest/activityinstances?patientPin="+patientPin)
            
            var activityInstances = activityInstancesResponse.data._embedded.activity_instances;
            var stats = complianceService.fetchActivitiesStats(activityInstances);
            
            //DO THIS WHEN WE INSERT MOCK DATA IN MONGO
            
            //var percent = (stats.completed/activityInstances.length)*100;
            
            var percent = Math.floor(Math.random() * Math.floor(100));
            
            console.log("Patient Pin = "+patientPin+" --> activityInstances = "+activityInstances.length);
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
        
        console.log(compliant);
        console.log(partially_compliant);
        console.log(non_compliant);
        console.log("Length = " + compliantStatus.length);
        res.render('trial', {patients : response.data._embedded.patients, compliant: compliant, 
            partially_compliant: partially_compliant, non_compliant: non_compliant, compliantStatus: compliantStatus});
    }catch(err){
        console.log(err);
    }
    

});

module.exports = router;