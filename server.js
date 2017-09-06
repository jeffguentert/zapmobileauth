const express = require('express');
const app = express();
const rp = require('request-promise');
const request = require('request');
const port = process.env.PORT || 3000;
const oid = process.env.okta_cid || "0oabwlejtqISPrMij0h7";
//require('request-debug')(rp);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, uuid, zap_mobile_session");
  next();
});

app.get('/index.html', function (req, res, next) {
  let getSessionToken = function() {
    let options = {
        uri: 'https://dev-505299.oktapreview.com/api/v1/authn',
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
        uri: "https://dev-505299.oktapreview.com/oauth2/v1/authorize",
        method: "GET",
        qs: {
            client_id: oid,
            sessionToken: st,
            response_type: "id_token",
            response_mode: "fragment",
            scope: "openid",
            redirect_uri: "https://zapmobileauth.herokuapp.com/index.html",
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

    rp(options).then(function (a) {
      var start = a.headers.location.indexOf("#id_token=") + 10;
      var end = a.headers.location.indexOf("&state=") - 42;
      var result = a.headers.location.substr(start,end)
      console.log(result);
      returnResponseToClient(result);
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
