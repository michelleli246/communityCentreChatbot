"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var inMemoryStorage = new builder.MemoryBotStorage;

var useEmulator = true;
var userName = "";
var age = "";
var type = "";

var act1 = {
    name: "Scrabble",
    beginAge: 0,
    endAge: 30,
    type: "Tabletop Games",
    locationName: "Cummer Community Centre"
}

var act2 = {
    name: "Seniors Swimming",
    beginAge: 60,
    endAge: 150,
    type: "Fitness",
    locationName: "Pleasantview Community Centre"
}

var act3 = {
    name: "Youth Soccer",
    beginAge: 5,
    endAge: 15,
    type: "Sports",
    locationName: "Scarborough Village Recreation Centre"
}

var act4 = {
    name: "Youth Basketball",
    beginAge: 5,
    endAge: 15,
    type: "Sports",
    locationName: "Scarborough Village Recreation Centre"
}

var activities = [act1, act2, act3, act4];
var recActivities = [];

function getMatchedActivity(age, type){
    recActivities = [];
    for(var i = 0; i < activities.length; i++){
        if(age >= activities[i].beginAge && age <= activities[i].endAge && type == activities[i].type){
            recActivities.push(activities[i]);
        }
    }
    return recActivities;
}

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

var bot = new builder.UniversalBot(connector, [

function (session) {
    builder.Prompts.text(session, "Hello, and welcome to the City of Toronto recreation chatbot! What's your name?");
},

function (session, results) {
    userName = results.response;
    builder.Prompts.number(session, "Hi " + userName + ", what is your age?");
},

function (session, results) {
    age = results.response;
    builder.Prompts.choice(session, "What activity type are you interested in?", ["Sports", "Fitness", "Arts and Crafts", "Tabletop Games"]);
},

function (session, results) {
    type = results.response.entity;

    session.send("Okay, " + userName + ", your information is" +
        " Age is " + age + " years," +
        " and you are interested in " + type + ".");

    var output = [];
    output = getMatchedActivity(age, type);
    if(output[0] != null)
        builder.Prompts.confirm(session, "Does " + output[0].name + " at " + output[0].locationName + " interest you?");
    else{
        session.beginDialog('noSuggestions');
    }
},

function (session, results){
    if(results.response){
        session.endDialog("great");
    }else{
        var output = getMatchedActivity(age, type);
        if(output[1] != null)
            builder.Prompts.confirm(session, "Does " + output[1].name + " at " + output[1].locationName + " interest you?");
        else{
            session.beginDialog('noSuggestions');
        }
    }
},

function(session, results){
    if(results.response){
        session.endDialog("great");
    }else{
        session.beginDialog('noSuggestions');
    }
}
]);

bot.dialog('noSuggestions',[
    function(session){
        session.endDialog("We weren't able to find an activity matching all requirements, please try again.");
    }
]);

var restify = require('restify');
var server = restify.createServer();

server.listen(3978, function() {
    console.log('test bot endpoint at http://localhost:3978/api/messages');
});

server.post('/api/messages', connector.listen());