const express = require('express');
const router = express.Router();

//Handling patient route. Display details about patient

//----------------------------------------------------------------------------------
// TO DO: TRIAL ID HAS BEEN MOCKED HERE. NEED TO CHANGE TRIAL ID TO MAKE IT DYNAMIC
//----------------------------------------------------------------------------------

router.get('/trials/5a946ff566684905df608446/patients/:patientId', (req, res) => {
    res.render('patient')
});

module.exports = router;