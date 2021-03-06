'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

app.set('port', (process.env.PORT || 5000))

// Allows us to process the data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// ROUTES

app.get('/', function(req, res) {
	res.send("Hi I am a chatbot")
})

let token = ""

// Facebook 

app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] === "devs") {
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong token")
})

app.post('/webhook/', function(req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			decideMessage(sender, text)
		}
		if (event.postback) {
		let text = JSON.stringify(event.postback)
		decideMessage(sender, text)
		continue
	}
	}

	res.sendStatus(200)
})

function decideMessage(sender, text1){
	let text = text1.toLowerCase()
	if (text.includes("summer")){
		sendImageMessage(sender)
	} else if (text.includes("winter")){
	  sendGenericMessage(sender)
	} else {
		sendText(sender, "I like Fall")
		sendButtonMessage(sender, "What is your season?")
}
}

function sendText(sender, text) {
	let messageData = {text: text}
	sendRequest(sender, messageData)
}

function sendButtonMessage(sender, text) {
	let messageData = {
	"attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text": text,
        "buttons":[
          {
            "type":"postback",
            "title":"Summer",
            "payload":"summer"
          },
          {
            "type":"postback",
            "title":"Winter",
            "payload":"winter"
          }
        ]
      }
    }	

}
	sendRequest(sender, messageData)
}

function sendImageMessage(sender) {
	let messageData = {
    "attachment":{
      "type":"image",
      "payload":{
        "url":"http://985thejewel.com/wp-content/uploads/summer-time-1405961074jXc.jpg"
      }
    }
  }
	sendRequest(sender, messageData)

}

function sendGenericMessage(sender) {
	let messageData = { "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Winter",
            "image_url":"http://cdn-image.travelandleisure.com/sites/default/files/styles/tnl_redesign_article_landing_page/public/winterdrives1015-lake-tahoe.jpg?itok=NRJER3l1",
            "subtitle":"I love winter!",
     
            "buttons":[
              {
                "type":"web_url",
                "url":"https://en.wikipedia.org/wiki/Winter",
                "title":"More about Winter"
              }
                         
            ]      
          }
        ]
      }
	}
	}
	sendRequest(sender, messageData)
}

function sendRequest(sender, messageData) {
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error")
		}
	})
}

app.listen(app.get('port'), function() {
	console.log("running: port")
})








