const express = require('express');
const router = express.Router();
const axios = require('axios');
const complianceService = require('../service/compliance-service');

//Handling patient route. Display details about patient

//----------------------------------------------------------------------------------
// TO DO: TRIAL ID HAS BEEN MOCKED HERE. NEED TO CHANGE TRIAL ID TO MAKE IT DYNAMIC
//----------------------------------------------------------------------------------

router.get('/trials/5a946ff566684905df608446/patients/:patientPin', (req, res) => {

    var chartData = undefined;
    axios.get('http://localhost:8080/CompassAPI/rest/activityinstances?patientPin='+req.params.patientPin)
    .then(response => {
        
        res.render('patient.hbs', {
            complianceChartData: JSON.stringify(complianceService.fetchComplianceChartData(response.data._embedded.activity_instances))
        })
    })
    .catch(error => {
        console.log(error);
    });

    // axios.get('http://localhost:8080/CompassAPI/rest/patients/'+req.params.patientPin)
    // .then(response => {
    //     Promise.all([
    //         complianceService.fetchPatientComplianceData(req.params.patientPin),
    //     ]).then(function(values){
    //         res.render('patient', {
    //             patient: response.data.patient,
    //             complianceChartData: complianceService.fetchComplianceChartData(values[0])
    //         })
    //     });
    //     //res.render('patient', {patient : response.data.patient});
    //     //console.log(response.data._embedded.patients[0].patient);
    // })
    // .catch(error => {
    //     console.log(error);
    //     res.send({code:500, message: 'Something went wrong!'}).code(500);
    // });
});

module.exports = router;