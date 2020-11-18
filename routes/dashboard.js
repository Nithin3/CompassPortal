const express = require('express');
const router = express.Router();
const axios = require('axios');

//Dasboard Handle
router.get('/dashboard', (req, res) => {
    res.render('dashboard')
});

//Trial
router.get('/dashboard/trial/:trialId', (req, res) => {
    axios.get('http://localhost:8080/CompassAPI/rest/patients?trialId='+req.params.trialId)
    .then(response => {
        res.render('trial', {patients : response.data._embedded.patients});
        //console.log(response.data._embedded.patients[0].patient);
    })
    .catch(error => {
        console.log(error);
    });
});

module.exports = router;