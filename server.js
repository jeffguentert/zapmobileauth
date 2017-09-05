const express = require('express');
const app = express();
const rp = require('request-promise');
const port = process.env.PORT || 3000;
const oid = process.env.okta_cid || "123";

app.use(function(req, res, next) {
  //res.header("Access-Control-Allow-Origin", "http://localhost");
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, uuid, zap_mobile_session");
  next();
});

app.get('/index.html', function (req, res, next) {

  //if(req.query.username) {
    let getSessionToken = function() {
      let options = {
          uri: 'https://dev-505299-admin.oktapreview.com/api/v1/authn',
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
         //res.write( response);
         var respJson = JSON.parse(a);
         //res.send(respJson.sessionToken);
         console.log('r', respJson.sessionToken);
         getAuthCode(respJson.sessionToken);
      })
      .catch(function (err) {
        // Deal with the error
        returnResponseToClient(err);
      })
    }
    getSessionToken();
//  }
  //else {
//    res.send('other');
//  }

  //openIdUrl ="https://" + orgUrl + "/oauth2/v1/authorize?sessionToken="+sessionToken+"
  //&client_id="+clientId+"&scope=openid+phone+email+profile+groups&response_type=" + tokenType + "
  //&response_mode=fragment&nonce=staticNonce&redirect_uri="+redirectUri+"&state=staticState"




  let getAuthCode = function (st) {
    let options = {
        uri: "https://dev-505299-admin.oktapreview.com/oauth2/v1/authorize",
        method: "GET",
        qs: {
            client_id: oid,
            sessionToken: st,
            response_type: "id_token",
            response_mode: "fragment",
            scope: "openid",
            redirect_uri: "https://zapmobileauth.herokuapp.com/index.html",
            nonce: "static-state",
            state: "static-state"
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        useQuerystring: true,
        json: true,
        resolveWithFullResponse: true,
        followAllRedirects: true,
        simple: false //handle promise other than 200
    };
    console.log(options);
    rp(options).then(function (a) {
       returnResponseToClient(a);
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
