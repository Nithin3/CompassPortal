const express = require('express');
const router = express.Router();

//Dasboard Handle
router.get('/dashboard', (req, res) => {
    res.render('dashboard')
});

//Trial
router.get('/dashboard/trial/:trialId', (req, res) => {
    res.send(req.params.trialId);
});

module.exports = router;