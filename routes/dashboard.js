const express = require('express');
const router = express.Router();

//Dasboard Handle
router.get('/dashboard', (req, res) => {
    res.render('dashboard')
});

module.exports = router;