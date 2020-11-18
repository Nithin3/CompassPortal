const express = require('express');
const router = express.Router();

//Dasboard Handle
router.get('/', (req, res) => {
    res.render('home')
});

module.exports = router;