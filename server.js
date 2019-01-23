//* Dependencies ----*//

var express = require("express");
var path = require('path');
var cheerio = require("cheerio");
var axios = require("axios");


var mongoose = require("mongoose")

//* Initialize Express ----*//
var app = express();

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];
var models = require('./models');

//* Static Public Folder ----*//
app.use(express.static('public'));

var PORT = process.env.PORT || 8000;



//* Connecting to DB ---*//
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);



app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '/public/index.html'))
});

// First, tell the console what server3.js is doing
console.log("\n******************************************\n" +
            "Looking for every article in the NYTimes ,\n" +
            "\n******************************************\n");
app.get('/scrape', function(req, res){
      // Make request via axios to grab the HTML from `NYTimes` clean website section
      axios.get("https://www.nytimes.com/section/arts").then(function(response) {
        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);
      
        // An empty array to save the data that we'll scrape
       
      
        // Select each element in the HTML body from which you want information.
        // NOTE: Cheerio selectors function similarly to jQuery's selectors,
        // but be sure to visit the package's npm page to see how it works
        $("h2.headline").each(function(i, element) {
      
          var headline = $(element).children().text();
          var p = $(element).children().text();
          var link = $(element).children("a").attr("href");
          var result = {
            title : headline,
            link: link
          }
          
          models.Article.create(result, function(article){
            console.log("articl crated")
          })
          // Save these results in an object that we'll push into the results array we defined earlier
         
        });
      
        // Log the results once you've looped through each of the elements found with cheerio
        
      });
      res.send("scrape complete")

});

app.get('/articles', function(req, res){
  console.log("in articles route")
    models.Article.find({}, function(err, result){
      console.log(result, "these are the results")
      res.send(result);
    })
})


app.listen(PORT, function(){
  console.log("Listening on port : " + PORT)
});