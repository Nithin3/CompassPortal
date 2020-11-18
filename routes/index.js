const express = require('express');
const router = express.Router();

//Dasboard Handle
router.get('/', (req, res) => {
    res.send('this is dashboard')
});

module.exports = router;