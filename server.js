const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json())

app.listen(3001, ()=>{
    console.log('Enrollment system is listening on port 3000');
})