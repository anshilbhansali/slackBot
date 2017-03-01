'use strict'


const express = require('express');
const service = express();
const request = require('superagent');
const moment = require('moment');

//time
//https://maps.googleapis.com/maps/api/timezone/json?location=38.908133,-77.047119&timestamp=1458000000&key=AIzaSyAY0_wfkZa9Or-BoUcNDRul25-KM5EBhrg


//geo
//https://maps.googleapis.com/maps/api/geocode/json?address=&key=AIzaSyCrJi5GZabZ0In0XsinQ1e52abYQoDsLvI

//time microservice
service.get('/service/time/:location', (req, res, next) => {
	request.get('https://maps.googleapis.com/maps/api/geocode/json?address='+req.params.location+'&key=AIzaSyCrJi5GZabZ0In0XsinQ1e52abYQoDsLvI', 
		(err, response) => {
			if(err){
				console.log(err);
				return res.sendStatus(500);
			}

			const location = response.body.results[0].geometry.location;
			//+ is for integer return, X is for unix timestamp
			const timestamp = +moment().format('X');

			request.get('https://maps.googleapis.com/maps/api/timezone/json?location='+location.lat+','+location.lng+'&timestamp='+timestamp+'&key=AIzaSyAY0_wfkZa9Or-BoUcNDRul25-KM5EBhrg',
				(err, response) => {
					if(err){
						console.log(err);
						return res.sendStatus(500);
					}

					const result = response.body;
					const timeString = moment.unix(timestamp+result.dstOffset+result.rawOffset).utc()
					.format('dddd, MMMM Do YYYY, h:mm:ss a');

					res.json({result: timeString});
				});

			
		});
});

//weather
//https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid=71a4ca1270b35d826b45948fa3e08af7


//weather microservice
service.get('/service/weather/:location', (req, res, next) => {
	request.get('https://maps.googleapis.com/maps/api/geocode/json?address='+req.params.location+'&key=AIzaSyCrJi5GZabZ0In0XsinQ1e52abYQoDsLvI', 
		(err, response) => {
			if(err){
				console.log(err);
				return res.sendStatus(500);
			}

			const location = response.body.results[0].geometry.location;

			request.get('http://api.openweathermap.org/data/2.5/weather?lat='+location.lat+'&lon='+location.lng+'&appid=71a4ca1270b35d826b45948fa3e08af7', 
				(err, response) => {
					if(err){
						console.log(err);
						return res.sendStatus(500);
					}

					const result = response.body;

					const weather = result.weather[0].main;
					const descr = result.weather[0].description;
					const temp = Math.floor(result.main.temp - 273.15);//in celsius
					const pressure = result.main.pressure; //in millibars
					const humidity = result.main.humidity; // in %
					const wind = Math.floor(result.wind.speed/0.44704); //in mph

					console.log(result);

					const final_weather = 'approximately as follows: \n'
					+'weather: '+weather+'\n'
					+'description: '+descr+'\n'
					+'temperature: '+temp+' degrees celsius\n'
					+'pressure: '+pressure+' mb\n'
					+'humidity: '+humidity+'% \n'
					+'wind: '+wind+' mph\n';

					res.json({result: final_weather});
				});
			

			
		});
});

module.exports = service;


