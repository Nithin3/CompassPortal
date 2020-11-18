const express = require('express');
const router = express.Router();
const axios = require('axios');

//Handling patient route. Display details about patient

//----------------------------------------------------------------------------------
// TO DO: TRIAL ID HAS BEEN MOCKED HERE. NEED TO CHANGE TRIAL ID TO MAKE IT DYNAMIC
//----------------------------------------------------------------------------------

router.get('/trials/5a946ff566684905df608446/patients/:patientPin', (req, res) => {
    console.log(req.params.patientId);
    axios.get('http://localhost:8080/CompassAPI/rest/patients/'+req.params.patientPin)
    .then(response => {
        res.send((response.data.patient));
        //res.render('patient', {patient : response.data.patient});
        //console.log(response.data._embedded.patients[0].patient);
    })
    .catch(error => {
        console.log(error);
    });
});

module.exports = router;