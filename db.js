const mongoose = require('mongoose');
const localMongoDBUri = 'mongodb://localhost:27017/compassapi_db';
mongoose.connect(localMongoDBUri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
} , (err) => {
    if(!err){
        console.log('MongoDB connection succesfull.');
    }else{
        console.log('Error in DB connection: ' + JSON.stringify(err, undefined, 2));
    }
});

module.exports = mongoose;