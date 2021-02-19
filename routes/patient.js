const express = require('express');
const router = express.Router();
const axios = require('axios');
const complianceService = require('../service/compliance-service');

//Handling patient route. Display details about patient

//----------------------------------------------------------------------------------
// TO DO: TRIAL ID HAS BEEN MOCKED HERE. NEED TO CHANGE TRIAL ID TO MAKE IT DYNAMIC
//----------------------------------------------------------------------------------

router.get('/trials/5a946ff566684905df608446/patients/:patientPin', async (req, res) => {

    try{
        var response = await axios.get("http://localhost:8080/CompassAPI/rest/activityinstances?patientPin="+req.params.patientPin)
    }catch (err){
        console.log(err);
    }
    
    res.render('patient.hbs', {
        complianceChartData: JSON.stringify(complianceService.fetchComplianceChartData(response.data._embedded.activity_instances))
    })
});

module.exports = router;