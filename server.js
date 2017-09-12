const express = require('express');
const app = express();
const rp = require('request-promise');
const request = require('request');
const port = process.env.PORT || 3000;
const oid = process.env.okta_cid || "12345";
const oktaauthn = process.env.oktaauthn;
const oktaauthorize = process.env.oktaauthorize;
const redirct_uri = process.env.redirecturi;
//require('request-debug')(rp);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, uuid, zap_mobile_session");
  next();
});

app.get('/index.html', function (req, res, next) {
  let getSessionToken = function() {
    let options = {
        uri: oktaauthn,
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'username': req.query.username,
          'password': req.query.password,
          'options': {
            "multiOptionalFactorEnroll": false,
            "warnBeforePasswordExpired": false
          }
        })
    }
    rp(options).then(function (a) {
       let respJson = JSON.parse(a);
       //res.send(respJson.sessionToken);
       getAuthCode(respJson.sessionToken);
    })
    .catch(function (err) {
      // Deal with the error
      returnResponseToClient(err);
    })
  }
  getSessionToken();

  let getAuthCode = function (st) {
    let options = {
        uri: oktaauthorize,
        method: "GET",
        qs: {
            client_id: oid,
            sessionToken: st,
            response_type: "id_token code",
            response_mode: "fragment",
            scope: "openid",
            redirect_uri: redirct_uri,
            nonce: "static-once",
            state: "static-state"
        },
        followRedirect: false,
        resolveWithFullResponse: true,
        followOriginalHttpMethod: false,
        removeRefererHeader: false,
        useQuerystring: true,
        simple: false //handle promise other than 200
    };
	console.log('options log: ', options);
    rp(options).then(function (a) {
      var arry = a.headers.location.split("&"),
          result;
      for(var i=0; i< arry.length; i++) {
        if(arry[i].indexOf("code=") > -1) {
          result = arry[i].substr(5);
        }
      }

      var res = {
        id_token: result,
        cookie: a.headers['set-cookie']
      }
      returnResponseToClient(res);
      // Handle the response
    })
    .catch(function (err) {
      // Deal with the error
      returnResponseToClient(err);
    })
  }

  function returnResponseToClient(r) {
    res.send(r);
  }

});

app.listen(port);
