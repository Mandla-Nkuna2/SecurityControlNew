
'use strict';
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const { Storage } = require('@google-cloud/storage');
const googleAuth = require('google-auth-library');
const admin = require('firebase-admin');
const google = require('googleapis');
const PdfPrinter = require('pdfmake/src/printer');
var pdfMake = require("pdfmake/build/pdfmake");
var pdfFonts = require("pdfmake/build/vfs_fonts");
pdfMake.vfs = pdfFonts.pdfMake.vfs;
const BUCKET = 'security-control-app.appspot.com';
admin.initializeApp();
var moment = require('moment');
const db = admin.database();
const axios = require('axios');
const cors = require('cors')({ origin: true });

const CONFIG_CLIENT_ID = '748137076693-2kb6mbas64tjv6vpogsk6t6tiuoo598b.apps.googleusercontent.com';
const CONFIG_CLIENT_SECRET = '27Hx3xP5cQWkiyIuMT54Rp0V';

const FUNCTIONS_REDIRECT = 'https://us-central1-security-control-app.cloudfunctions.net/oauthcallback';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new googleAuth();
const functionsOauthClient = new auth.OAuth2(CONFIG_CLIENT_ID, CONFIG_CLIENT_SECRET, FUNCTIONS_REDIRECT);
const PAYSTACK_SECRET_KEY = functions.config().paystack.secret;
const PAYSTACK_HOST = "https://api.paystack.co/";
let oauthTokens = null;
const stringify = require('json-stringify-safe');


const gmailEmail = 'support@securitycontrol.co.za';
const gmailPassword = 'S29217352';
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

var manSig = '';
var clientSig = '';
var empSig = '';
var witSig = '';
var signature = '';
var guardSig = '';
var sigUser = '';
var sigClient = '';
var sigOfficer = '';
var supervisorSign = '';

const runtimeOpts = {
  timeoutSeconds: 500,
  memory: '1GB'
}

exports.startTrial = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    let body = request.body;
    admin.firestore().collection('trials').doc(body.companyKey).set({
      companyKey: body.companyKey,
      customerCode: body.customerCode,
      firstChargeAmount: body.firstCharge,
      authCode: body.authCode,
      planCode: body.planCode,
      trialStartDate: moment().format("YYYY/MM/DD HH:mm:ss"),
      tier: body.tier
    }).then(() => {
      admin.firestore().collection('companies').doc(body.companyKey).update({
        access: true,
        accessType: body.tier
      }).then(() => {
        response.status(200).send({ text: "DONE" });
      }).catch((onError) => {
        functions.logger.error(onError)
        response.sendStatus(500)
      })
    }).catch((onError) => {
      functions.logger.error(onError)
      response.sendStatus(500)
    })
  })
})

exports.getMainCardAuth = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    let body = request.body;
    admin.firestore().collection('users').doc(body.key).collection('authCards').where("isMain", '==', true).get().then((onFulfilled) => {
      if (onFulfilled.empty) {
        response.status(200).send(null)
      }
      else {
        response.status(200).send(onFulfilled.docs[0].data())
      }
    }).catch(onError => {
      functions.logger.error(onError)
      response.sendStatus(500)
    })
  })
})

exports.checkForCardAuth = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    let body = request.body;
    admin.firestore().collection('users').doc(body.key).collection('authCards').get().then((onFulfilled) => {
      if (onFulfilled.empty) {
        response.status(200).send(null)
      }
      else {
        response.status(200).send(onFulfilled.docs[0].data())
      }
    }).catch(onError => {
      functions.logger.error(onError)
      response.sendStatus(500)
    })
  })
})

exports.noteCheck = functions.runWith(runtimeOpts).pubsub.schedule('25 8 * * *').timeZone('Africa/Johannesburg').onRun(() => {

  var token = 'd24vt2T4xIg:APA91bH-0eOil4-yCpVWArTgZNbznifv-wgdu3MBPMB4a64LlWoUeupBGKJ5Jt_aQfOt5tsH7DtDNLEGjrykpm_p2Zue92Xc5_Ivsi1aSXiuGVQM9a43oIlm7UjMU8WWTxJamMKt3LWe'

  const payload = {
    notification: {
      title: 'Truck Checked In!',
      body: `Truck just completed the Check In`,
      icon: 'https://firebasestorage.googleapis.com/v0/b/premier-logistics.appspot.com/o/logo.jpg?alt=media&token=7b4d2f5b-f59d-4822-9bd2-d9ad2392daf7',
    }
  }
  return admin.messaging().sendToDevice(token, payload);

})

exports.monitorTrials = functions.pubsub.schedule('5 0 * * *').timeZone('Africa/Johannesburg').onRun((context) => {
  return admin.firestore().collection('trials').get().then((onFulfilled) => {
    if (!onFulfilled.empty) {
      onFulfilled.docs.forEach((item) => {
        let doc = item.data();
        if (doc.trialStartDate) {
          if (moment(doc.trialStartDate).diff(moment(), 'days') >= 14) {
            return admin.firestore().collection('trials').doc(doc.companyKey).update({
              trialEndDate: moment().format("YYYY/MM/DD HH:mm:ss")
            }).then(() => {
              return triggerSubscription(
                doc.customerCode,
                doc.authCode,
                doc.planCode,
                doc.firstCharge,
                doc.email,
                doc.companyKey,
                doc.tier
              ).then((onResponse) => {
                if (!onResponse) {
                  removeAccess(doc.companyKey).then(() => {
                    functions.logger.error("Subscription failed")
                  }).catch((onError) => functions.logger.error(onError))
                } else {
                  functions.logger.log("Subscription created")
                }
              }).catch((onRejected) => {
                functions.logger.error("ERROR STARTING SUBSCRIPTION")
                functions.logger.error(onRejected)
              })
            }).catch((onError) => functions.logger.error(onError))
          }
          functions.logger.info("Trials checked on : " + moment().format("YYYY/MM/DD HH:mm:ss"))
        }
      })
    }
  }).catch((onError) => functions.logger.error(onError))
});

function removeAccess(companyKey) {
  return new Promise((resolve, reject) => {
    admin.firestore().collection('companies').doc(companyKey).update({
      access: false,
      accessType: ''
    }).then(() => {
      resolve("DONE")
    }).catch((onError) => {
      functions.logger.error(onError)
      reject(onError)
    })
  })
}

function triggerSubscription(customerCode, authCode, planCode, firstChargeAmount, email, companyKey, tier) {
  return new Promise((resolve, reject) => {
    axios.post(PAYSTACK_HOST + 'subscription', {
      customer: customerCode,
      plan: planCode,
      authorization: authCode
    }, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    }).then((onResponse) => {
      if (onResponse.data.message == "Subscription successfully created") {
        axios.post(`${PAYSTACK_HOST}transaction/charge_authorization`, {
          amount: firstChargeAmount,
          email: email,
          authorization_code: authCode
        }, {
          headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
          }
        }).then((chargeResponse) => {
          if (chargeResponse.data.data.gateway_response == "Approved") {
            admin.firestore().collection('memberships').doc(companyKey).set({
              companyKey: companyKey,
              email: email,
              startDate: moment().format("YYYY/MM/DD HH:mm:ss"),
              lastPaymentDate: moment().format("YYYY/MM/DD HH:mm:ss"),
              tier: tier,
              planCode: planCode,
              subscriptionCode: onResponse.data.data.subscription_code,
              active: true,
              emailToken: onResponse.data.data.email_token
            }).then(() => {
              functions.logger.debug(onResponse.data);
              resolve(onResponse.data)
            }).catch((onError) => {
              functions.logger.error(onError)
              reject(onError)
            })
          }
          else {
            cancelSubscription(onResponse.data.data.subscription_code, onResponse.data.data.email_token).then((res) => {
              functions.logger.debug(res);
              resolve(false)
            }).catch((onError) => {
              functions.logger.error(onError)
              reject(onError)
            })
          }
        }).catch((onError) => reject(onError))
      } else {
        reject(onResponse.data)
      }
    }).catch((onError) => reject(onError))
  })
}

exports.startSubscription = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    let body = request.body;
    triggerSubscription(
      body.customerCode,
      body.authCode,
      body.planCode,
      body.firstChargeAmount,
      body.email,
      body.companyKey,
      body.tier
    ).then((onResponse) => {
      if (onResponse) {
        response.status(200).send("DONE")
      }
      else {
        functions.logger.error("FAILED")
        response.status(500).send("Something went wrong")
      }
    }).catch((onError) => {
      functions.logger.error(onError)
      response.status(500).send("Something went wrong")
    })
  })
})

function cancelSubscription(code, emailToken) {
  return new Promise((resolve, reject) => {
    axios.post(`${PAYSTACK_HOST}subscription/disable`, {
      code: code,
      token: emailToken
    }, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    }).then((cancellationResponse) => {
      resolve(cancellationResponse)
    }).catch((onError) => reject(onError))
  })
}

exports.createCustomer = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    let body = request.body;
    axios.post(PAYSTACK_HOST + 'customer', {
      email: body.email,
      first_name: body.firstName,
      last_name: body.lastName
    }, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    }).then((onResponse) => {
      if (onResponse.data.message == "Customer created") {
        response.status(200).send(onResponse.data)
      }
      else {
        functions.logger.error(onResponse.data)
        response.status(500).send("Something went wrong")
      }
    }).catch((onError) => {
      functions.logger.error(onError)
      response.sendStatus(500)
    })
  })
})

exports.transactionWebhook = functions.https.onRequest((request, response) => {
  let paymentEvent = request.body;
  admin.firestore().collection('paymentEvents').add(paymentEvent).then(() => {
    functions.logger.info("event saved");
    functions.logger.debug(paymentEvent);
    response.sendStatus(200);
  }).catch(error => {
    functions.logger.error(error);
    response.sendStatus(500);
  })
});



exports.chargeAuthorization = functions.runWith(runtimeOpts).https.onRequest((request, response) => {
  return cors(request, response, () => {
    axios.post(`${PAYSTACK_HOST}transaction/charge_authorization`, {
      amount: body.amount,
      email: body.email,
      authorization_code: body.authCode
    }, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    }).then(res => {
      response.sendStatus(200);
    }).catch(error => {
      functions.logger.error(error);
      response.status(500).send(error);
    });
  })
});

exports.saveCardAuth = functions.https.onRequest((request, response) => {
  let body = request.body;
  return cors(request, response, () => {
    admin.firestore().collection('users').doc(body.key).collection('authCards').add(body.auth).then(() => {
      response.status(200).send({ text: "DONE" })
    }).catch(onError => {
      functions.logger.error(onError)
      response.sendStatus(500)
    })
  })
})

exports.initializePayment = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    axios.post(`${PAYSTACK_HOST}transaction/initialize`, {
      email: request.body.email,
      amount: request.body.amount,
      currency: request.body.currency
    }, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    }).then(res => {
      response.status(200).send(res.data);
    }).catch(error => {
      functions.logger.error(error)
      response.sendStatus(500);
    });
  })
});

exports.verifyTransaction = functions.runWith(runtimeOpts).https.onRequest((request, response) => {
  return cors(request, response, () => {
    let transactionRef = request.body.transactionRef;
    axios.get(`${PAYSTACK_HOST}transaction/verify/${transactionRef}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    }).then(res => {
      functions.logger.debug(res);
      response.send(res.data);
    }).catch(error => {
      functions.logger.error(error);
      response.status(500).send(error);
    });
  })
});

exports.deleteGuards = functions.firestore
  .document('guards/{uid}')
  .onCreate(snap => {

    return admin.firestore().collection('guards').where('companyId', '>', '0qbfVjnyuKE8EAdenn3T').limit(400).get().then(guards => {
      return guards.forEach(guard => {

        let companyId = guard.data().companyId;

        if (companyId.endsWith("KE8EAdenn3T")) {

          if (companyId.startsWith('0qbfVjnyuKE')) {
            return null;
          }

          return admin.firestore().collection('guards').doc(guard.data().Key).delete();

        }
        return null
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })


// EMAIL PDF REPORT FUNCTION

function sendPdfEmail(myPdf, report, type) {
  if (report.clientEmail !== '' && report.clientEmail !== undefined) {
    var clientEmail = ';' + report.clientEmail.toLowerCase();
  }
  else {
    clientEmail = ''
  }
  if (report.recipient !== '' && report.recipient !== undefined) {
    var recipient = ';' + report.recipient.toLowerCase();
  }
  else {
    recipient = ''
  }
  if (report.companyEmail !== '' && report.companyEmail !== undefined) {
    var companyEmail = ';' + report.companyEmail.toLowerCase();
  }
  else {
    companyEmail = ''
  }

  // Thompsons Site Visit Emails
  if (report.report === 'Site Visit' && report.companyId === '0qbfVjnyuKE8EAdenn3T') {
    recipient = ';devon@thompsec.co.za;hans@thompsec.co.za;admin@thompsec.co.za';
  }


  function removeDuplicateEmails(string) {
    console.log('into the function', string);
    let unique = [...new Set(string.replace(/,/g, ';').split(';'))];
    console.log('leaving function', unique.toString().replace(/,/g, ';'))
    return unique.toString().replace(/,/g, ';')
  }

  const reportMails = report.userEmail.toLowerCase() + clientEmail + recipient + companyEmail;

  const mailOptions = {
    from: '"Security Control" <system@securitycontrol.co.za>',
    to: removeDuplicateEmails(reportMails),
    subject: type,
    text: `Good Day,\n\nPlease find attached ${type}.\n\nKindly,\nSecurity Control Team`,
    attachments: [{
      filename: `${report.key}.pdf`,
      content: myPdf,
      contentType: 'application/pdf'
    }]
  };
  return mailTransport.sendMail(mailOptions)
    .then(() => console.log(`${type} Sent`))
    .catch(function (error) {
      return console.error("Failed!" + error);
    })
}

// PDF Email Functions

// PREPARE PDF DOC FUNCTION

function createPDF(docDefinition, file_name) {
  return new Promise(function (resolve, reject) {
    const fontDescriptors = {
      Roboto: {
        normal: 'fonts/Roboto-Regular.ttf',
        bold: 'fonts/Roboto-Bold.ttf',
        italics: 'fonts/Roboto-Italic.ttf',
        bolditalics: 'fonts/Roboto-BoldItalic.ttf',
      }
    }
    const printer = new PdfPrinter(fontDescriptors);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const storage = new Storage({
      projectId: 'security-control-app',
    });
    const myPdfFile = storage.bucket(BUCKET).file(file_name);

    pdfDoc.pipe(myPdfFile.createWriteStream())
      .on('finish', function () {
        resolve(file_name);
      })
      .on('error', function (error) {
        return console.error("Failed!" + error);
      });

    pdfDoc.end();
  })
}

// Signature Conversion

function checkSig(report) {
  return new Promise(function (resolve) {
    if (report.manSig !== '' && report.manSig !== undefined) {
      manSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.manSig,
        width: 150,
        alignment: 'center',
      };
    } else {
      manSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };
    }
    if (report.clientSig !== '' && report.clientSig !== undefined) {
      clientSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.clientSig,
        width: 150,
        alignment: 'center',
      };
    } else {
      clientSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };
    }
    if (report.empSig !== '' && report.empSig !== undefined) {
      empSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.empSig,
        width: 150,
        alignment: 'center',
      };
    } else {
      empSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };
    }

    if (report.witSig !== '' && report.witSig !== undefined) {
      witSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.witSig,
        width: 150,
        alignment: 'center',
      };
    } else {
      witSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };
    }

    if (report.signature !== '' && report.signature !== undefined) {
      signature = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.signature,
        width: 150,
        alignment: 'center',
      };
    } else {
      signature = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };
    }

    if (report.supervisorSign !== '' && report.supervisorSign !== undefined) {
      supervisorSign = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.supervisorSign,
        width: 150,
        alignment: 'center',
      };
    } else {
      supervisorSign = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };

    }

    if (report.guardSig !== '' && report.guardSig !== undefined) {
      guardSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.guardSig,
        width: 150,
        alignment: 'center',
      };
    } else {
      guardSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };
    }

    if (report.sigUser !== '' && report.sigUser !== undefined) {
      sigUser = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.sigUser,
        width: 150,
        alignment: 'center',
      };
    } else {
      sigUser = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };
    }

    if (report.sigClient !== '' && report.sigClient !== undefined) {
      sigClient = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.sigClient,
        width: 150,
        alignment: 'center',
      };
    } else {
      sigClient = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };
    }

    if (report.sigOfficer !== '' && report.sigOfficer !== undefined) {
      sigOfficer = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.sigOfficer,
        width: 150,
        alignment: 'center',
      };
    } else {
      sigOfficer = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };
    }
    resolve(true);
  });
}

/*
const body = [];
const body1 = [];
const body2 = [];
const body3 = [];
const body4 = [];
const body5 = [];

exports.convertSiteVisitImages = functions.firestore
    .document('sitevisits/{uid}')
    .onUpdate(change => {
        var report = change.after.data();
        if (report.fix === true) {
            covertImages(report).then(report => {
                report.fix = false;
                return admin.firestore().collection('sitevisits').doc(report.key).update(report);
            }).catch(err => console.error(err));
        } else {
            return console.log('Nothing to update')
        }
    })

function covertImages(report) {
    return new Promise(function (resolve) {
        const guardSig = report.guardSig;
        const manSig = report.manSig;
        const clientSig = report.clientSig;
        const photo = report.photo;
        const photo1 = report.photo1;
        const photo2 = report.photo2;
        const photo3 = report.photo3;
        const photo4 = report.photo4;
        const photo5 = report.photo5;
        const photo6 = report.photo6;
        const photo7 = report.photo7;
        const photo8 = report.photo8;
        const photo9 = report.photo9;
        const photo10 = report.photo10;
        const photo11 = report.photo11;
        const photo12 = report.photo12;
        const photo13 = report.photo13;
        const photo14 = report.photo14;
        const photo15 = report.photo15;
        if (report.guardSig && guardSig.startsWith('http')) {
            image2base64(guardSig).then((response) => {
                report.guardSig = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.manSig && manSig.startsWith('http')) {
            image2base64(manSig).then((response) => {
                report.manSig = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.clientSig && clientSig.startsWith('http')) {
            image2base64(clientSig).then((response) => {
                report.clientSig = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo && photo.startsWith('http')) {
            image2base64(photo).then((response) => {
                report.photo = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo1 && photo1.startsWith('http')) {
            image2base64(photo1).then((response) => {
                report.photo1 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo2 && photo2.startsWith('http')) {
            image2base64(photo2).then((response) => {
                report.photo2 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo3 && photo3.startsWith('http')) {
            image2base64(photo3).then((response) => {
                report.photo3 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo4 && photo4.startsWith('http')) {
            image2base64(photo4).then((response) => {
                report.photo4 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo5 && photo5.startsWith('http')) {
            image2base64(photo5).then((response) => {
                report.photo5 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo6 && photo6.startsWith('http')) {
            image2base64(photo6).then((response) => {
                report.photo6 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo7 && photo7.startsWith('http')) {
            image2base64(photo7).then((response) => {
                report.photo7 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo8 && photo8.startsWith('http')) {
            image2base64(photo8).then((response) => {
                report.photo8 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo9 && photo9.startsWith('http')) {
            image2base64(photo9).then((response) => {
                report.photo9 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo10 && photo10.startsWith('http')) {
            image2base64(photo10).then((response) => {
                report.photo10 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo11 && photo11.startsWith('http')) {
            image2base64(photo11).then((response) => {
                report.photo11 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo12 && photo12.startsWith('http')) {
            image2base64(photo12).then((response) => {
                report.photo12 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo13 && photo13.startsWith('http')) {
            image2base64(photo13).then((response) => {
                report.photo13 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo14 && photo14.startsWith('http')) {
            image2base64(photo14).then((response) => {
                report.photo14 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        if (report.photo15 && photo15.startsWith('http')) {
            image2base64(photo15).then((response) => {
                report.photo15 = response;
            }).catch((error) => {
                return reject(error)
            })
        }
        setTimeout(() => {
            resolve(report);
        }, 3000)
    })
}

*/


// Report Photos

function getPhoto(report) {
  return new Promise(function (resolve, reject) {
    const body = [];
    var columns = [{ text: 'No', style: 'headLabel', alignment: 'center' }, { text: 'Photo', style: 'headLabel', alignment: 'center' }];
    body.push(columns);
    if (report.photo1 !== '' && report.photo1 !== undefined) {
      body.push([{ text: '1', style: 'headLabel', alignment: 'center' }, { image: report.photo1, width: 100, alignment: 'center' }]);
      if (report.photo2 !== '' && report.photo2 !== undefined) {
        body.push([{ text: '2', style: 'headLabel', alignment: 'center' },
        { image: report.photo2, width: 100, alignment: 'center' }]);
        if (report.photo3 !== '' && report.photo3 !== undefined) {
          body.push([{ text: '3', style: 'headLabel', alignment: 'center' },
          { image: report.photo3, width: 100, alignment: 'center' }]);
          if (report.photo4 !== '' && report.photo4 !== undefined) {
            body.push([{ text: '4', style: 'headLabel', alignment: 'center' },
            { image: report.photo4, width: 100, alignment: 'center' }]);
            if (report.photo5 !== '' && report.photo5 !== undefined) {
              body.push([{ text: '5', style: 'headLabel', alignment: 'center' },
              { image: report.photo5, width: 100, alignment: 'center' }]);
              if (report.photo6 !== '' && report.photo6 !== undefined) {
                body.push([{ text: '6', style: 'headLabel', alignment: 'center' },
                { image: report.photo6, width: 100, alignment: 'center' }]);
              } else {
                resolve(body);
              }
            } else {
              resolve(body);
            }
          } else {
            resolve(body);
          }
        } else {
          resolve(body);
        }
      } else {
        resolve(body);
      }
    } else {
      body.push([{ text: 'No Photos Taken', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      resolve(body);
    }
  });
}

// Client Instruction

exports.emailCLIENT = functions.firestore
  .document('/instructions/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return processCLIENT(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `client_instruction/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Client Instruction';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processCLIENT(report, companyLogo, color) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'CLIENT INSTRUCTION REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'Client Name :', style: 'headLabel' }, { text: report.client }],
              [{ text: 'Details of Instruction:', style: 'headLabel' }, { text: report.details }],
              [{ text: 'Person Responsible:', style: 'headLabel' }, { text: report.responsible }],
              [{ text: 'Action By Date:', style: 'headLabel' }, { text: report.action }],
            ]
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                sigUser,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                sigClient,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'CLIENT SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}




// Transparency Report

exports.emailTRANS = functions.firestore
  .document('/transparencys/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return processTrans(report).then(function (body) {
          return getTrans(report, companyLogo, color, body).then(function (docDefinition) {
            const file_name = `trans_report/${report.key}.pdf`;
            return createPDF(docDefinition, file_name).then(function (file_name) {
              const st = new Storage();
              const buck = st.bucket(BUCKET);
              return buck.file(file_name).download()
                .then(data => {
                  const myPdf = data[0];
                  const type = 'Transparency Report';
                  return sendPdfEmail(myPdf, report, type)
                }).catch(function (error) {
                  return console.error("Failed!" + error);
                })
            }).catch(function (error) {
              return console.error("Failed!" + error);
            })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processTrans(report) {
  return new Promise(function (resolve, reject) {
    const body = [];
    body.push([{ text: 'SNAG REPORT & FINDINGS', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    if (report.photo1 !== '' && report.photo1 !== undefined) {
      body.push([{ text: 'Snag Photo 1', style: 'headLabel', alignment: 'center' }, { image: report.photo1, width: 100, alignment: 'center' }]);
      body.push([{ text: 'Details of Findings', style: 'headLabel' }, { text: report.details1 }]);
      body.push([{ text: 'Actions Taken', style: 'headLabel' }, { text: report.actions1 }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.recommendations1 }]);
      if (report.photo2 !== '' && report.photo2 !== undefined) {
        body.push([{ text: 'Snag Photo 2', style: 'headLabel', alignment: 'center' }, { image: report.photo2, width: 100, alignment: 'center' }]);
        body.push([{ text: 'Details of Findings', style: 'headLabel' }, { text: report.details2 }]);
        body.push([{ text: 'Actions Taken', style: 'headLabel' }, { text: report.actions2 }]);
        body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.recommendations2 }]);
        if (report.photo3 !== '' && report.photo3 !== undefined) {
          body.push([{ text: 'Snag Photo 3', style: 'headLabel', alignment: 'center' }, { image: report.photo3, width: 100, alignment: 'center' }]);
          body.push([{ text: 'Details of Findings', style: 'headLabel' }, { text: report.details3 }]);
          body.push([{ text: 'Actions Taken', style: 'headLabel' }, { text: report.actions3 }]);
          body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.recommendations3 }]);
          if (report.photo4 !== '' && report.photo4 !== undefined) {
            body.push([{ text: 'Snag Photo 4', style: 'headLabel', alignment: 'center' }, { image: report.photo4, width: 100, alignment: 'center' }]);
            body.push([{ text: 'Details of Findings', style: 'headLabel' }, { text: report.details4 }]);
            body.push([{ text: 'Actions Taken', style: 'headLabel' }, { text: report.actions4 }]);
            body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.recommendations4 }]);
          } else {
            resolve(body);
          }
        } else {
          resolve(body);
        }
      } else {
        resolve(body);
      }
    } else {
      body.push([{ text: 'No Photos Taken', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}])
      resolve(body);
    }
  });
}

function getTrans(report, companyLogo, color, body) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'TRANSPARENCY REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
              [{ text: 'OB NUMBER:', style: 'headLabel' }, { text: report.ob, alignment: 'center' },
              {}, {}],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                manSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                guardSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'GUARD SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

// Risk Assessment


exports.emailRISK = functions.firestore
  .document('/assessments/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return getRisk(report).then(function (body) {
          return processRisk(report, companyLogo, color, body).then(function (docDefinition) {
            const file_name = `risk_assessment/${report.key}.pdf`;
            return createPDF(docDefinition, file_name).then(function (file_name) {
              const st = new Storage();
              const buck = st.bucket(BUCKET);
              return buck.file(file_name).download()
                .then(data => {
                  const myPdf = data[0];
                  const type = 'Risk Assessment';
                  return sendPdfEmail(myPdf, report, type)
                }).catch(function (error) {
                  return console.error("Failed!" + error);
                })
            }).catch(function (error) {
              return console.error("Failed!" + error);
            })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function getRisk(report) {
  return new Promise(function (resolve, reject) {
    const body = [];
    body.push([{ text: 'PERIMETER', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    body.push([{ text: 'Perimeter Type', style: 'headLabel' }, { text: report.type }]);
    body.push([{ text: 'Perimeter Description ', style: 'headLabel' }, { text: report.description }]);
    body.push([{ text: 'Perimeter Height ', style: 'headLabel' }, { text: report.height }]);
    if (report.vulnerable === 'Yes') {
      body.push([{ text: 'Any Vulnerable or Damaged Area Risks?', style: 'headLabel' }, { text: report.vulnerable }]);
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.vulnerableDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.vulnerableLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.vulnerableRec }]);
      if (report.photo1 !== '' && report.photo1 !== undefined) {
        body.push([{ text: 'Photo 1', style: 'headLabel', alignment: 'center' }, { image: report.photo1, width: 100, alignment: 'center' }]);
      } else {
        body.push([{ text: 'Photo 1', style: 'headLabel', alignment: 'center' }, { text: 'No photo taken' }]);
      }
    } else {
      body.push([{ text: 'Any Vulnerable or Damaged Area Risks?', style: 'headLabel' }, { text: report.vulnerable }]);
    }
    body.push([{ text: 'Any Perimeter Alarms Related Risks?', style: 'headLabel' }, { text: report.palarms }]);
    if (report.palarms === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.palarmsDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.palarmsLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.palarmsRec }]);
      if (report.photo2 !== '' && report.photo2 !== undefined) {
        body.push([{ text: 'Photo 2', style: 'headLabel', alignment: 'center' }, { image: report.photo2, width: 100, alignment: 'center' }]);
      }
    }
    body.push([{ text: 'Any Electric Fence Related Risks?', style: 'headLabel' }, { text: report.elecfence }]);
    if (report.elecfence === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.elecfenceDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.elecfenceLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.elecfenceRec }]);
      if (report.photo3 !== '' && report.photo3 !== undefined) {
        body.push([{ text: 'Photo 3', style: 'headLabel', alignment: 'center' }, { image: report.photo3, width: 100, alignment: 'center' }]);
      }
    }
    body.push([{ text: 'Any Risks Related to Trees & Vegetation?', style: 'headLabel' }, { text: report.trees }]);
    if (report.trees === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.treesDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.treesLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.treesRec }]);
      if (report.photo4 !== '' && report.photo4 !== undefined) {
        body.push([{ text: 'Photo 4', style: 'headLabel', alignment: 'center' }, { image: report.photo4, width: 100, alignment: 'center' }]);
      }
    }
    body.push([{ text: 'Any Risks Related to Perimeter Lighting?', style: 'headLabel' }, { text: report.perimLight }]);
    if (report.perimLight === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.perimLightDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.perimLightLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.perimLightRec }]);
      if (report.photo5 !== '' && report.photo5 !== undefined) {
        body.push([{ text: 'Photo 5', style: 'headLabel', alignment: 'center' }, { image: report.photo5, width: 100, alignment: 'center' }]);
      }
    }

    body.push([{ text: 'PREMISES AND HOUSEKEEPING', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    body.push([{ text: 'Any High Risk Area’s the Premises?', style: 'headLabel' }, { text: report.areas }]);
    if (report.areas === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.areasDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.areasLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.areasRec }]);
      if (report.photo6 !== '' && report.photo6 !== undefined) {
        body.push([{ text: 'Photo 6', style: 'headLabel', alignment: 'center' }, { image: report.photo6, width: 100, alignment: 'center' }]);
      }
    }
    body.push([{ text: 'Any Risks with Storage of Dangerous Items?', style: 'headLabel' }, { text: report.danger }]);
    if (report.danger === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.dangerDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.dangerLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.dangerRec }]);
      if (report.photo7 !== '' && report.photo7 !== undefined) {
        body.push([{ text: 'Photo 7', style: 'headLabel', alignment: 'center' }, { image: report.photo7, width: 100, alignment: 'center' }]);
      }
    }
    body.push([{ text: 'Any Risks with stacked items against walls/fences or buildings?', style: 'headLabel' }, { text: report.stacked }]);
    if (report.stacked === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.stackedDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.stackedLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.stackedRec }]);
      if (report.photo8 !== '' && report.photo8 !== undefined) {
        body.push([{ text: 'Photo 8', style: 'headLabel', alignment: 'center' }, { image: report.photo8, width: 100, alignment: 'center' }]);
      }
    }
    body.push([{ text: 'Any High Risk Area’s in the Surroundings?', style: 'headLabel' }, { text: report.surround }]);
    if (report.surround === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.surroundDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.surroundLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.surroundRec }]);
      if (report.photo9 !== '' && report.photo9 !== undefined) {
        body.push([{ text: 'Photo 9', style: 'headLabel', alignment: 'center' }, { image: report.photo9, width: 100, alignment: 'center' }]);
      }
    }
    body.push([{ text: 'Any Premises Lighting Risks?', style: 'headLabel' }, { text: report.premLight }]);
    if (report.premLight === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.premLightDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.premLightLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.premLightRec }]);
      if (report.photo10 !== '' && report.photo10 !== undefined) {
        body.push([{ text: 'Photo 10', style: 'headLabel', alignment: 'center' }, { image: report.photo10, width: 100, alignment: 'center' }]);
      }
    }

    body.push([{ text: 'ENTRANCES / EXITS', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    body.push([{ text: 'Entry / Exit Type', style: 'headLabel' }, { text: report.method }]);
    body.push([{ text: 'Entrance/ Exit Description', style: 'headLabel' }, { text: report.entrance }]);
    body.push([{ text: 'Is Entry/ Exit Monitored & Documented?', style: 'headLabel' }, { text: report.monitored }]);
    body.push([{ text: 'Are Vehicles Searched on Entry/ Exit?', style: 'headLabel' }, { text: report.searched }]);
    body.push([{ text: 'Are Staff & Contractors Searched on Exit?', style: 'headLabel' }, { text: report.staff }]);
    body.push([{ text: 'Any Risks with Entrances / Exits?', style: 'headLabel' }, { text: report.entry }]);
    if (report.entry === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.entryDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.entryLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.entryRec }]);
      if (report.photo11 !== '' && report.photo11 !== undefined) {
        body.push([{ text: 'Photo 11', style: 'headLabel', alignment: 'center' }, { image: report.photo11, width: 100, alignment: 'center' }]);
      }
    }
    body.push([{ text: 'Any Risks Related to Entrance / Exit Lighting?', style: 'headLabel' }, { text: report.entryLight }]);
    if (report.entryLight === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.entryLightDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.entryLightLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.entryLightRec }]);
      if (report.photo12 !== '' && report.photo12 !== undefined) {
        body.push([{ text: 'Photo 12', style: 'headLabel', alignment: 'center' }, { image: report.photo12, width: 100, alignment: 'center' }]);
      }
    }

    body.push([{ text: 'DOORS & WINDOWS', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    body.push([{ text: 'Doors & Windows Burglar Proofed?', style: 'headLabel' }, { text: report.doors }]);
    body.push([{ text: 'Doors & Windows Lockable?', style: 'headLabel' }, { text: report.lock }]);
    body.push([{ text: 'Doors & Windows Alarmed?', style: 'headLabel' }, { text: report.armed }]);
    body.push([{ text: 'Any Risks with Doors & Windows?', style: 'headLabel' }, { text: report.doorsRisk }]);
    if (report.doorsRisk === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.doorsRiskDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.doorsRiskLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.doorsRiskRec }]);
      if (report.photo13 !== '' && report.photo13 !== undefined) {
        body.push([{ text: 'Photo 13', style: 'headLabel', alignment: 'center' }, { image: report.photo13, width: 100, alignment: 'center' }]);
      }
    }

    body.push([{ text: 'ALARMS, CCTV & PANIC BUTTONS', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    body.push([{ text: 'Does the Premises have an alarm/s?', style: 'headLabel' }, { text: report.alarms }]);
    body.push([{ text: 'Does the Premises have Panic Button/s?', style: 'headLabel' }, { text: report.panic }]);
    body.push([{ text: 'Are the Alarms/ Panics Linked to Armed Response?', style: 'headLabel' }, { text: report.response }]);
    body.push([{ text: 'Are the Alarms Regularly Tested?', style: 'headLabel' }, { text: report.tested }]);
    body.push([{ text: 'Who is the Armed Response Company?', style: 'headLabel' }, { text: report.arcompany }]);
    body.push([{ text: 'Does the Premises have CCTV?', style: 'headLabel' }, { text: report.cams }]);
    body.push([{ text: 'If Yes, Are the Cameras Monitored?', style: 'headLabel' }, { text: report.monitoredcams }]);
    body.push([{ text: 'Is CCTV Coverage Sufficient?', style: 'headLabel' }, { text: report.cctvsuf }]);
    body.push([{ text: 'Any Risks with Alarms & CCTV?', style: 'headLabel' }, { text: report.cctv }]);
    if (report.cctv === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.cctvDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.cctvLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.cctvRec }]);
      if (report.photo14 !== '' && report.photo14 !== undefined) {
        body.push([{ text: 'Photo 14', style: 'headLabel', alignment: 'center' }, { image: report.photo14, width: 100, alignment: 'center' }]);
      }
    }

    body.push([{ text: 'GUARDING & EQUIPMENT', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    body.push([{ text: 'How Many Guards are Currently Posted on Site?', style: 'headLabel' }, { text: report.guards }]);
    body.push([{ text: 'Is there a GuardRoom Available?', style: 'headLabel' }, { text: report.room }]);
    body.push([{ text: 'Is there a Patrolling System in use?', style: 'headLabel' }, { text: report.patrol }]);
    body.push([{ text: 'What kind of System is in Place?', style: 'headLabel' }, { text: report.system }]);
    body.push([{ text: 'List of Equipment in Place:', style: 'headLabel' }, { text: report.equipment }]);
    body.push([{ text: 'Any Risks with Guarding & Equipment?', style: 'headLabel' }, { text: report.guard }]);
    if (report.guard === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.guardDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.guardLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.guardRec }]);
      if (report.photo15 !== '' && report.photo15 !== undefined) {
        body.push([{ text: 'Photo 15', style: 'headLabel', alignment: 'center' }, { image: report.photo15, width: 100, alignment: 'center' }]);
      }
    }

    body.push([{ text: 'GENERAL HEALTH & SAFETY', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    body.push([{ text: 'Is there Fire Equipment Available?', style: 'headLabel' }, { text: report.fire }]);
    body.push([{ text: 'Fire Equipment Regulary Inspected & Serviced?', style: 'headLabel' }, { text: report.serviced }]);
    body.push([{ text: 'Is there First Aid Equipment Available?', style: 'headLabel' }, { text: report.aid }]);
    body.push([{ text: 'Is there Adequate H&S Signage displayed?', style: 'headLabel' }, { text: report.signs }]);
    body.push([{ text: 'Are there Emergency Evac Plans in place?', style: 'headLabel' }, { text: report.evac }]);
    body.push([{ text: 'Is there an Emergency Assembly Point/s?', style: 'headLabel' }, { text: report.assembly }]);
    body.push([{ text: 'Any Health & Safety Risks Identified?', style: 'headLabel' }, { text: report.health }]);
    if (report.health === 'Yes') {
      body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.healthDesc }]);
      body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.healthLevel }]);
      body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.healthRec }]);
      if (report.photo16 !== '' && report.photo16 !== undefined) {
        body.push([{ text: 'Photo 16', style: 'headLabel', alignment: 'center' }, { image: report.photo16, width: 100, alignment: 'center' }]);
      }
    }

    body.push([{ text: 'FINAL NOTES', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    body.push([{ text: 'Final Assessment Summary', style: 'headLabel' }, { text: report.notes }]);
    body.push([{ text: 'Email to Client?', style: 'headLabel' }, { text: report.emailToClient }]);
    resolve(body);
  });
}

function processRisk(report, companyLogo, color, body) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'RISK ASSESSMENT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                manSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}



// Uniform


exports.emailUNI = functions.firestore
  .document('/uniforms/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return getUniform(report).then(function (body) {
          return processUNI(report, companyLogo, color, body).then(function (docDefinition) {
            const file_name = `uniform/${report.key}.pdf`;
            return createPDF(docDefinition, file_name).then(function (file_name) {
              const st = new Storage();
              const buck = st.bucket(BUCKET);
              return buck.file(file_name).download()
                .then(data => {
                  const myPdf = data[0];
                  const type = 'Uniform Order';
                  return sendPdfEmail(myPdf, report, type)
                }).catch(function (error) {
                  return console.error("Failed!" + error);
                })
            }).catch(function (error) {
              return console.error("Failed!" + error);
            })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function getUniform(report) {
  return new Promise(function (resolve, reject) {
    const body = [];
    body.push([{ text: 'Item', style: 'headLabel' }, { text: 'Is it required?', style: 'headLabel' }]);
    body.push([{ text: 'Trousers', style: 'headLabel' }, { text: report.trousers }]);
    if (report.trousers === 'Yes') {
      body.push([{ text: 'Trouser Size', style: 'headLabel' }, { text: report.trouserSize }]);
      body.push([{ text: 'Qty Trousers', style: 'headLabel' }, { text: report.qty1 }]);
    }
    body.push([{ text: 'Shirt', style: 'headLabel' }, { text: report.shirt }]);
    if (report.shirt === 'Yes') {
      body.push([{ text: 'Shirt Size', style: 'headLabel' }, { text: report.shirtSize }]);
      body.push([{ text: 'Qty Shirts', style: 'headLabel' }, { text: report.qty2 }]);
    }
    body.push([{ text: 'Jacket', style: 'headLabel' }, { text: report.jacket }]);
    if (report.jacket === 'Yes') {
      body.push([{ text: 'Jacket Size', style: 'headLabel' }, { text: report.jacketSize }]);
      body.push([{ text: 'Qty Jackets', style: 'headLabel' }, { text: report.qty3 }]);
    }
    body.push([{ text: 'Jersey', style: 'headLabel' }, { text: report.jersey }]);
    if (report.jersey === 'Yes') {
      body.push([{ text: 'Jersey Size', style: 'headLabel' }, { text: report.jerseySize }]);
      body.push([{ text: 'Qty Jerseys', style: 'headLabel' }, { text: report.qty4 }]);
    }
    body.push([{ text: 'Step Out Boots', style: 'headLabel' }, { text: report.stepboots }]);
    if (report.stepboots === 'Yes') {
      body.push([{ text: 'Boot Size', style: 'headLabel' }, { text: report.stepbootSize }]);
      body.push([{ text: 'Qty Boots', style: 'headLabel' }, { text: report.stepqty5 }]);
    }
    body.push([{ text: 'Beanie', style: 'headLabel' }, { text: report.beanie }]);
    if (report.beanie === 'Yes') {
      body.push([{ text: 'Qty Beanies', style: 'headLabel' }, { text: report.qty6 }]);
    }
    body.push([{ text: 'Tie', style: 'headLabel' }, { text: report.tie }]);
    if (report.tie === 'Yes') {
      body.push([{ text: 'Qty Ties', style: 'headLabel' }, { text: report.qty7 }]);
    }
    body.push([{ text: 'Shoes', style: 'headLabel' }, { text: report.shoes }]);
    if (report.shoes === 'Yes') {
      body.push([{ text: 'Boot Size', style: 'headLabel' }, { text: report.shoeSize }]);
      body.push([{ text: 'Qty Boots', style: 'headLabel' }, { text: report.shoesqty5 }]);
    }
    body.push([{ text: 'Cap', style: 'headLabel' }, { text: report.cap }]);
    if (report.cap === 'Yes') {
      body.push([{ text: 'Qty Caps', style: 'headLabel' }, { text: report.qty8 }]);
    }
    body.push([{ text: 'Belt', style: 'headLabel' }, { text: report.belt }]);
    if (report.belt === 'Yes') {
      body.push([{ text: 'Belt Size', style: 'headLabel' }, { text: report.beltSize }]);
      body.push([{ text: 'Qty Belts', style: 'headLabel' }, { text: report.qty9 }]);
    }
    body.push([{ text: 'Combat Boots', style: 'headLabel' }, { text: report.boots }]);
    if (report.boots === 'Yes') {
      body.push([{ text: 'Boot Size', style: 'headLabel' }, { text: report.bootSize }]);
      body.push([{ text: 'Qty Boots', style: 'headLabel' }, { text: report.qty5 }]);
    }
    body.push([{ text: 'Rainsuit', style: 'headLabel' }, { text: report.rainsuit }]);
    if (report.rainsuit === 'Yes') {
      body.push([{ text: 'Rainsuit Size', style: 'headLabel' }, { text: report.rainsuitSize }]);
      body.push([{ text: 'Qty Rainsuits', style: 'headLabel' }, { text: report.qty10 }]);
      resolve(body);
    } else {
      resolve(body);
    }
  });
}


function processUNI(report, companyLogo, color, body) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'UNIFORM ORDER REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'Name of Employee :', style: 'headLabel' }, { text: report.so }],
              [{ text: 'Company Number :', style: 'headLabel' }, { text: report.companyNumber }],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                manSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}



// Meeting


exports.emailMEET = functions.firestore
  .document('/meetings/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return processMEET(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `meetings/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Meeting Report';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processMEET(report, companyLogo, color) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'CLIENT MEETING REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'Client Name:', style: 'headLabel' }, { text: report.client }],
              [{ text: 'OB Number:', style: 'headLabel' }, { text: report.ob }],
              [{ text: 'Meeting Agenda:', style: 'headLabel' }, { text: report.reason }],
              [{ text: 'Attendees:', style: 'headLabel' }, { text: report.attendees }],
              [{ text: 'Apologies:', style: 'headLabel' }, { text: report.apologies }],
              [{ text: 'Notes Arising from Previous Meeting Minutes:', style: 'headLabel' }, { text: report.prev }],
              [{ text: 'Meeting Minutes:', style: 'headLabel' }, { text: report.minutes }],
            ]
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                sigUser,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                sigClient,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'CLIENT SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

// Disciplinary Report


exports.emailDISC = functions.firestore
  .document('/disciplinarys/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return processDISC(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `disciplinary/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Disciplinary Report';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processDISC(report, companyLogo, color) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'DISCIPLINARY REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'Name of Employee:', style: 'headLabel' }, { text: report.so }],
              [{ text: 'Nature of Transgression:', style: 'headLabel' }, { text: report.nature }],
              [{ text: 'Warning Type:', style: 'headLabel' }, { text: report.type }],
              [{ text: 'Disciplinary Action:', style: 'headLabel' }, { text: report.action }],
            ]
          },
        },
        '\nTHE SIGNATURE OF THE EMPLOYEE SIGNIFIES THAT THE EMPLOYEE RECEIVED THE NOTICE OF THE DISCIPLINARY ACTION, WHETHER OR NOT THE EMPLOYEE AGREES WITH THE ACTION \n\n IF THE EMPLOYEE REFUSED TO SIGN, I AS THE MANAGER/ SUPERVISOR HEREBY SIGN ACKNOWLEDGEMENT THAT THE CONTENTS OF THIS DISCIPLINARY WERE EXPLAINED TO HIM/ HER.\n',
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'Witness:', style: 'headLabel' }, { text: report.witness }],
            ]
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                empSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'EMPLOYEE SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                witSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'WITNESS / TRANSLATOR SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                manSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER / SUPERVISOR SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

// Leave Application


exports.emailLEAVE = functions.firestore
  .document('/leaveApps/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return leavePhoto(report).then(function (body) {
          return processLeave(report, companyLogo, color, body).then(function (docDefinition) {
            const file_name = `leave_app/${report.key}.pdf`;
            return createPDF(docDefinition, file_name).then(function (file_name) {
              const st = new Storage();
              const buck = st.bucket(BUCKET);
              return buck.file(file_name).download()
                .then(data => {
                  const myPdf = data[0];
                  const type = 'Leave Application';
                  return sendPdfEmail(myPdf, report, type)
                }).catch(function (error) {
                  return console.error("Failed!" + error);
                })
            }).catch(function (error) {
              return console.error("Failed!" + error);
            })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function leavePhoto(report) {
  return new Promise(function (resolve, reject) {
    const body = [];
    if (report.type === 'FAMILY RESPONSIBILITY' || report.type === 'SICK LEAVE') {
      if (report.photo !== '' && report.photo !== undefined) {
        body.push([{ text: 'PHOTO OF PROOF - DOCTORS NOTE/ CERTIFICATE', style: 'headLabel', alignment: 'center' }]);
        body.push([{ image: report.photo, width: 100, alignment: 'center' }]);
        resolve();
      } else {
        body.push([{ text: 'PHOTO OF PROOF - DOCTORS NOTE/ CERTIFICATE', style: 'headLabel', alignment: 'center' }]);
        body.push([{ text: 'No Photo Taken', alignment: 'center' }]);
      }
    } else {
      body.push([]);
      resolve(body);
    }
  });
}

function processLeave(report, companyLogo, color, body) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'LEAVE APPLICATION', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'Name of Employee:', style: 'headLabel' }, { text: report.so }],
              [{ text: 'Type of Leave:', style: 'headLabel' }, { text: report.type }],
              [{ text: 'Previously Accrued Leave:', style: 'headLabel' }, { text: report.accruedLeave }],
              [{ text: 'Current Accrued Leave:', style: 'headLabel' }, { text: report.available }],
              [{ text: 'Current Used Leave:', style: 'headLabel' }, { text: report.usedLeave }],
              [{ text: 'Available Leave:', style: 'headLabel' }, { text: report.availableLeave }],
              [{ text: 'From Date:', style: 'headLabel' }, { text: report.from }],
              [{ text: 'To Date:', style: 'headLabel' }, { text: report.to }],
              [{ text: 'Days Requested / Taken:', style: 'headLabel' }, { text: report.days }],
              [{ text: 'Remaining Leave (If Approved):', style: 'headLabel' }, { text: report.remainingLeave }],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['100%'],
            headerRows: 1,
            body: body
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                manSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                guardSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'SECURITY OFFICERS SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

// Crime Incident Report


exports.emailCRIME = functions.firestore
  .document('/incidents/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return getPhoto(report).then(function (body) {
          return crimeIncBody1(report).then(function (body2) {
            return crimeIncBody2(report).then(function (body3) {
              return processCRIME(report, companyLogo, color, body, body2, body3).then(function (docDefinition) {
                const file_name = `crime_incident/${report.key}.pdf`;
                return createPDF(docDefinition, file_name).then(function (file_name) {
                  const st = new Storage();
                  const buck = st.bucket(BUCKET);
                  return buck.file(file_name).download()
                    .then(data => {
                      const myPdf = data[0];
                      const type = 'Crime Incident Report';
                      return sendPdfEmail(myPdf, report, type)
                    }).catch(function (error) {
                      return console.error("Failed!" + error);
                    })
                }).catch(function (error) {
                  return console.error("Failed!" + error);
                })
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
            }).catch(function (error) {
              return console.error("Failed!" + error);
            })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function crimeIncBody1(report) {
  return new Promise(function (resolve, reject) {
    const body2 = [];
    var columns3 = [{ text: 'PERSONAL DETAILS/ VICTIM/ SECURITY OFFICER', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}];
    body2.push(columns3);
    body2.push([{ text: 'Was there a person/ victim / security officer involved?', style: 'headLabel' }, { text: report.person }]);
    if (report.person === 'YES') {
      body2.push([{ text: 'Title ', style: 'headLabel' }, { text: report.title }]);
      body2.push([{ text: 'First Name ', style: 'headLabel' }, { text: report.name }]);
      body2.push([{ text: 'Surname ', style: 'headLabel' }, { text: report.surname }]);
      body2.push([{ text: 'Address ', style: 'headLabel' }, { text: report.address }]);
      body2.push([{ text: 'Contact Number ', style: 'headLabel' }, { text: report.contact }]);
      body2.push([{ text: 'Email Address ', style: 'headLabel' }, { text: report.email }]);
      body2.push([{ text: 'Employer ', style: 'headLabel' }, { text: report.employer }]);
      body2.push([{ text: 'Type of Injury Sustained ', style: 'headLabel' }, { text: report.injury }]);
      resolve(body2);
    } else {
      resolve(body2);
    }
  });
}
function crimeIncBody2(report) {
  return new Promise(function (resolve, reject) {
    const body3 = [];
    var columns4 = [{ text: 'SAPS INFORMATION', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}];
    body3.push(columns4);
    body3.push([{ text: 'Was the incident reported to the SAPS?', style: 'headLabel' }, { text: report.reported }]);
    if (report.reported === 'YES') {
      body3.push([{ text: 'Time Reported to SAPS', style: 'headLabel' }, { text: report.sapsRepTime }]);
      body3.push([{ text: 'SAPS Arrival Time', style: 'headLabel' }, { text: report.sapsArrTime }]);
      body3.push([{ text: 'SAPS Officer ', style: 'headLabel' }, { text: report.officer }]);
      body3.push([{ text: 'Case Number ', style: 'headLabel' }, { text: report.case }]);
      body3.push([{ text: 'SAPS Station Details ', style: 'headLabel' }, { text: report.saps }]);
      body3.push([{ text: 'Metro/ Traffic Police Details ', style: 'headLabel' }, { text: report.metro }]);
      body3.push([{ text: 'Ambulance/ Emergency Service Details ', style: 'headLabel' }, { text: report.ambulance }]);
      body3.push([{ text: 'Fire Brigade Details ', style: 'headLabel' }, { text: report.fire }]);
      resolve(body3);
    } else {
      resolve(body3);
    }
  });
}

function processCRIME(report, companyLogo, color, body, body2, body3) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'CRIME INCIDENT REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.company, alignment: 'center' },
              { text: 'MANAGER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'OB Number:', style: 'headLabel' }, { text: report.ob }],
              [{ text: 'Incident Date:', style: 'headLabel' }, { text: report.incDate }],
              [{ text: 'Incident Time:', style: 'headLabel' }, { text: report.incTime }],
              [{ text: 'Incident Category:', style: 'headLabel' }, { text: report.category }],
              [{ text: 'Incident Type:', style: 'headLabel' }, { text: report.type }],
              [{ text: 'Brief Details:', style: 'headLabel' }, { text: report.details }],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body2
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body3
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'Estimated Value of Loss:', style: 'headLabel' }, { text: report.value }],
              [{ text: 'Were any arrests made?', style: 'headLabel' }, { text: report.arrests }],
              [{ text: 'Arrest Details:', style: 'headLabel' }, { text: report.arrestDetails }],
              [{ text: 'Has Management been informed?', style: 'headLabel' }, { text: report.management }],
              [{ text: 'Has the client been informed?', style: 'headLabel' }, { text: report.client }],
              [{ text: 'Was an OB done?', style: 'headLabel' }, { text: report.obDone }],
              [{ text: 'OB Number:', style: 'headLabel' }, { text: report.incOb }],
              [{ text: 'Reason no OB was done?', style: 'headLabel' }, { text: report.noOb }],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['30%', '70%'],
            headerRows: 1,
            body: body
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                manSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER / SUPERVISOR SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

// Vehicle Inspection


exports.emailVEH = functions.firestore
  .document('/vehicles/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return getVehPhoto1(report).then(function (body) {
          return getVehPhoto2(report).then(function (body1) {
            return processVEH(report, companyLogo, color, body, body1).then(function (docDefinition) {
              const file_name = `vehicle_inspec/${report.key}.pdf`;
              return createPDF(docDefinition, file_name).then(function (file_name) {
                const st = new Storage();
                const buck = st.bucket(BUCKET);
                return buck.file(file_name).download()
                  .then(data => {
                    const myPdf = data[0];
                    const type = 'Vehicle Inspection';
                    return sendPdfEmail(myPdf, report, type)
                  }).catch(function (error) {
                    return console.error("Failed!" + error);
                  })
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
            }).catch(function (error) {
              return console.error("Failed!" + error);
            })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function getVehPhoto1(report) {
  return new Promise(function (resolve) {
    const body = [];
    var columns = [{ text: 'Photo of Spare Wheel, Jack & Spanner:', style: 'headLabel', alignment: 'center' }];
    body.push(columns);
    if (report.photo1 !== '' && report.photo1 !== undefined) {
      body.push([{ image: report.photo1, width: 100, alignment: 'center' }]);
    } else {
      body.push([{ text: 'No Photo Taken', style: 'headLabel', alignment: 'center' }]);
    }
    resolve(body);
  });
}

function getVehPhoto2(report) {
  return new Promise(function (resolve) {
    const body1 = [];
    var columns2 = [{ text: 'Photo of Damage Found:', style: 'headLabel', alignment: 'center' }];
    body1.push(columns2);
    if (report.photo2 !== '' && report.photo2 !== undefined) {

      report.photo2.forEach((element) => {
        body1.push([{ image: element, width: 100, alignment: 'center' }]);
      });

    } else {
      body1.push([{ text: 'No Photo Taken', style: 'headLabel', alignment: 'center' }]);
    }
    resolve(body1);
  });
}

function processVEH(report, companyLogo, color, body, body1) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'VEHICLE INSPECTION REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'COMPANY:', style: 'headLabel' }, { text: report.company, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.inspector, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
              [{ text: 'Registration:', style: 'headLabel' }, { text: report.registration, alignment: 'center' },
              { text: 'Odometer Reading:', style: 'headLabel' }, { text: report.odometer, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['70%', '30%'],
            height: 100,
            body: [
              [{ text: 'Vehicle Exterior', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}],
              [{ text: 'Are the tyres in an acceptable condition?', style: 'headLabel' }, { text: report.tires, alignment: 'center' }],
              [{ text: 'Are the Windscreen Wipers working correctly?', style: 'headLabel' }, { text: report.wipers, alignment: 'center' }],
              [{ text: 'Are the Headlights Working Correctly?', style: 'headLabel' }, { text: report.headlights, alignment: 'center' }],
              [{ text: 'Are the Tail and Break Lights Working?', style: 'headLabel' }, { text: report.tail, alignment: 'center' }],
              [{ text: 'Are the Indicators Working Correctly?', style: 'headLabel' }, { text: report.indicators, alignment: 'center' }],
              [{ text: 'Are the Hazard Lights Working Correctly?', style: 'headLabel' }, { text: report.hazards, alignment: 'center' }],
              [{ text: 'Are the Number Plates Correct and Undamaged?', style: 'headLabel' }, { text: report.plates, alignment: 'center' }],
              [{ text: 'Is the License Disc Still Valid?', style: 'headLabel' }, { text: report.disc, alignment: 'center' }],
              [{ text: 'Are the Oil and Water Levels Sufficient?', style: 'headLabel' }, { text: report.oil, alignment: 'center' }],
              [{ text: 'Is the Exterior Clean and Undamaged?', style: 'headLabel' }, { text: report.exterior, alignment: 'center' }],

              [{ text: 'Vehicle Interior', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}],
              [{ text: 'Are the Brakes Working Correctly?', style: 'headLabel' }, { text: report.breaks, alignment: 'center' }],
              [{ text: 'Is the Handbrake Working Correctly?', style: 'headLabel' }, { text: report.handbreak, alignment: 'center' }],
              [{ text: 'Is the Clutch Working Correctly?', style: 'headLabel' }, { text: report.clutch, alignment: 'center' }],
              [{ text: 'Are the Mirrors Correct and Undamaged?', style: 'headLabel' }, { text: report.mirrors, alignment: 'center' }],
              [{ text: 'Is the Hooter Working Correctly?', style: 'headLabel' }, { text: report.hooter, alignment: 'center' }],
              [{ text: 'Are the Interior Lights Working Correctly?', style: 'headLabel' }, { text: report.lights, alignment: 'center' }],
              [{ text: 'Are the Safety Belts Working Correctly?', style: 'headLabel' }, { text: report.belts, alignment: 'center' }],
              [{ text: 'Is the Spair Wheel Available and in Good Condition?', style: 'headLabel' }, { text: report.spare, alignment: 'center' }],
              [{ text: 'Are the Spanner & Jack Available?', style: 'headLabel' }, { text: report.jack, alignment: 'center' }],
              [{ text: 'Is the Interior Clean and Undamaged?', style: 'headLabel' }, { text: report.interior, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['100%'],
            headerRows: 1,
            body: body
          },
        },
        {
          style: 'table',
          table: {
            widths: ['100%'],
            headerRows: 1,
            body: body1
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                signature,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'INSPECTOR SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


// Training Form

exports.emailTRAIN = functions.firestore
  .document('/trainings/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return processTRAIN(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `training_report/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Training Report';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processTRAIN(report, companyLogo, color) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'TRAINING FORM', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'OB Number:', style: 'headLabel' }, { text: report.ob }],
              [{ text: 'Shift:', style: 'headLabel' }, { text: report.shift }],
              [{ text: 'Name of Employee:', style: 'headLabel' }, { text: report.so }],
              [{ text: 'Type of Training:', style: 'headLabel' }, { text: report.type }],
              [{ text: 'Reason For Training:', style: 'headLabel' }, { text: report.reason }],
              [{ text: 'How long has the Employee been on Site:', style: 'headLabel' }, { text: report.length }],
              [{ text: 'Is the Employee fit for the Duties of this Site:', style: 'headLabel' }, { text: report.fit }],
              [{ text: 'Is there a Job Description on Site:', style: 'headLabel' }, { text: report.jd }],
              [{ text: 'Did the Employee Sign the Job Description:', style: 'headLabel' }, { text: report.signJD }],
              [{ text: 'Does he/ she understand the site Procedures:', style: 'headLabel' }, { text: report.procedures }],
              [{ text: 'Summary of Training:', style: 'headLabel' }, { text: report.summary }],
            ]
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                sigUser,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'TRAINER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                sigOfficer,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'EMPLOYEE SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


// Tenant Report

exports.emailTENANT = functions.firestore
  .document('/tenant/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return processTENANT(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `tenant_visit/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Tenant Visit Report';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processTENANT(report, companyLogo, color) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'TENANT VISIT REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'Tenant Business Name:', style: 'headLabel' }, { text: report.name }],
              [{ text: 'Tenant Representative:', style: 'headLabel' }, { text: report.rep }],
              [{ text: 'Type of Locks & Handle:', style: 'headLabel' }, { text: report.locks }],
              [{ text: 'Hasp & Staple (Moon Lock):', style: 'headLabel' }, { text: report.hasp }],
              [{ text: 'Lock up Safes:', style: 'headLabel' }, { text: report.safes }],
              [{ text: 'Lock up & Closing Time Procedures:', style: 'headLabel' }, { text: report.procedures }],
              [{ text: 'Panic Buttons connected to Security:', style: 'headLabel' }, { text: report.panic }],
              [{ text: 'Does the Tenant have CCTV Cameras:', style: 'headLabel' }, { text: report.cctv }],
              [{ text: 'Are the Cameras Working:', style: 'headLabel' }, { text: report.working }],
              [{ text: 'Does the Tenant have Alarms:', style: 'headLabel' }, { text: report.alarms }],
              [{ text: 'Are the Alarms Working:', style: 'headLabel' }, { text: report.aworking }],
              [{ text: 'Have the Alarms been Tested:', style: 'headLabel' }, { text: report.tested }],
              [{ text: 'Is there in-store Security:', style: 'headLabel' }, { text: report.security }],
              [{ text: 'Action Items:', style: 'headLabel' }, { text: report.action }],
              [{ text: 'Action By:', style: 'headLabel' }, { text: report.by }],
              [{ text: 'Rating:', style: 'headLabel' }, { text: report.rating }],
              [{ text: 'Comments:', style: 'headLabel' }, { text: report.comments }],
            ]
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                sigUser,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                sigClient,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'TENANT REP SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


// OB Report

exports.emailOB = functions.firestore
  .document('/obs/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return getPhoto(report).then(function (body) {
          return processOB(report, companyLogo, color, body).then(function (docDefinition) {
            const file_name = `ob_entry/${report.key}.pdf`;
            return createPDF(docDefinition, file_name).then(function (file_name) {
              const st = new Storage();
              const buck = st.bucket(BUCKET);
              return buck.file(file_name).download()
                .then(data => {
                  const myPdf = data[0];
                  const type = 'OB Entry';
                  return sendPdfEmail(myPdf, report, type)
                }).catch(function (error) {
                  return console.error("Failed!" + error);
                })
            }).catch(function (error) {
              return console.error("Failed!" + error);
            })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processOB(report, companyLogo, color, body) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'OB ENTRY REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'Occurence Date:', style: 'headLabel' }, { text: report.incDate }],
              [{ text: 'Occurence Time:', style: 'headLabel' }, { text: report.incTime }],
              [{ text: 'OB Number:', style: 'headLabel' }, { text: report.number }],
              [{ text: 'Category:', style: 'headLabel' }, { text: report.category }],
              [{ text: 'Type:', style: 'headLabel' }, { text: report.type }],
              [{ text: 'Occurence Description:', style: 'headLabel' }, { text: report.description }],
            ]
          },
        },
        { text: 'Photos', style: 'subheader', pageBreak: 'before' },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                sigUser,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


// General Incident Report


exports.emailGenInc = functions.firestore
  .document('/genIncidents/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return getPhoto(report).then(function (body) {
          return processGenInc(report, companyLogo, color, body).then(function (docDefinition) {
            const file_name = `gen_incident/${report.key}.pdf`;
            return createPDF(docDefinition, file_name).then(function (file_name) {
              const st = new Storage();
              const buck = st.bucket(BUCKET);
              return buck.file(file_name).download()
                .then(data => {
                  const myPdf = data[0];
                  const type = 'General Incident Report';
                  return sendPdfEmail(myPdf, report, type)
                }).catch(function (error) {
                  return console.error("Failed!" + error);
                })
            }).catch(function (error) {
              return console.error("Failed!" + error);
            })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processGenInc(report, companyLogo, color, body) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'GENERAL INCIDENT REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'Incident Date:', style: 'headLabel' }, { text: report.incDate }],
              [{ text: 'Incident Time:', style: 'headLabel' }, { text: report.incTime }],
              [{ text: 'OB Number:', style: 'headLabel' }, { text: report.ob }],
              [{ text: 'Type of Incident:', style: 'headLabel' }, { text: report.type }],
              [{ text: 'Description of Incident:', style: 'headLabel' }, { text: report.description }],
              [{ text: 'Action Taken:', style: 'headLabel' }, { text: report.action }],
              [{ text: 'Recommendations:', style: 'headLabel' }, { text: report.recommendations }],
            ]
          },
        },
        { text: 'Photos', style: 'subheader', pageBreak: 'before' },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                sigUser,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


// Incident Notification

exports.emailINC = functions.firestore
  .document('/notifications/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return processINC(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `incident_note/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Incident Notification';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processINC(report, companyLogo, color) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'INCIDENT NOTIFICATION REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table2',
          table: {
            widths: ['50%', '50%'],
            height: 100,
            body: [
              [{ text: 'Incident Date:', style: 'headLabel' }, { text: report.incDate }],
              [{ text: 'Incident Time:', style: 'headLabel' }, { text: report.incTime }],
              [{ text: 'OB Number:', style: 'headLabel' }, { text: report.ob }],
              [{ text: 'Incident Type:', style: 'headLabel' }, { text: report.type }],
              [{ text: 'Reported By:', style: 'headLabel' }, { text: report.by }],
              [{ text: 'Reported To:', style: 'headLabel' }, { text: report.to }],
              [{ text: 'Nature of Incident:', style: 'headLabel' }, { text: report.description }],
            ]
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                sigUser,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

// PnP Visit Report

exports.emailPNP = functions.firestore
  .document('/pnpvisit/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return getPNP1(report).then(function (body) {
          return getPNP2(report).then(function (body1) {
            return getPNP3(report).then(function (body2) {
              return processPNP(report, companyLogo, color, body, body1, body2).then(function (docDefinition) {
                const file_name = `pnp_visit/${report.key}.pdf`;
                return createPDF(docDefinition, file_name).then(function (file_name) {
                  const st = new Storage();
                  const buck = st.bucket(BUCKET);
                  return buck.file(file_name).download()
                    .then(data => {
                      const myPdf = data[0];
                      const type = 'PnP Visit Report';
                      return sendPdfEmail(myPdf, report, type)
                    }).catch(function (error) {
                      return console.error("Failed!" + error);
                    })
                }).catch(function (error) {
                  return console.error("Failed!" + error);
                })
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
            }).catch(function (error) {
              return console.error("Failed!" + error);
            })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function getPNP1(report) {
  return new Promise(function (resolve, reject) {
    const body = [];
    body.push([{ text: 'Number of Officers on Duty' }, { text: report.duty, alignment: 'center' }]);
    if (report.duty !== 0) {
      if (report.so !== '' && report.so !== undefined) {
        body.push([{ text: '1) Security Officer on Duty' }, { text: report.so }]);
        if (report.so2 !== '' && report.so2 !== undefined) {
          body.push([{ text: '2) Security Officer on Duty' }, { text: report.so2 }]);
          if (report.so3 !== '' && report.so3 !== undefined) {
            body.push([{ text: '3) Security Officer on Duty' }, { text: report.so3 }]);
            if (report.so4 !== '' && report.so4 !== undefined) {
              body.push([{ text: '4) Security Officer on Duty' }, { text: report.so4 }]);
              if (report.so5 !== '' && report.so5 !== undefined) {
                body.push([{ text: '5) Security Officer on Duty' }, { text: report.so5 }]);
                if (report.so6 !== '' && report.so6 !== undefined) {
                  body.push([{ text: '6) Security Officer on Duty' }, { text: report.so6 }]);
                  if (report.so7 !== '' && report.so7 !== undefined) {
                    body.push([{ text: '7) Security Officer on Duty' }, { text: report.so7 }]);
                    if (report.so8 !== '' && report.so8 !== undefined) {
                      body.push([{ text: '8) Security Officer on Duty' }, { text: report.so8 }]);
                      if (report.so9 !== '' && report.so9 !== undefined) {
                        body.push([{ text: '9) Security Officer on Duty' }, { text: report.so9 }]);
                        if (report.so10 !== '' && report.so10 !== undefined) {
                          body.push([{ text: '10) Security Officer on Duty' }, { text: report.so10 }]);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    resolve(body);
  });
}

function getPNP2(report) {
  return new Promise(function (resolve, reject) {
    const body1 = [];
    body1.push([{ text: 'Any Incidents Reported Since Last Visit?' }, { text: report.incidents, alignment: 'center' }]);
    if (report.incidents === 'Yes') {
      body1.push([{ text: 'INCIDENT DETAILS', alignment: 'center', colSpan: 2 }, {}]);
      body1.push([{ text: 'Type of Incident' }, { text: report.incType, alignment: 'center' }]);
      body1.push([{ text: 'Date' }, { text: report.incDateTime, alignment: 'center' }]);
      body1.push([{ text: 'Reports Submitted?' }, { text: report.incReported, alignment: 'center' }]);
      body1.push([{ text: 'Follow-up Actions Taken?' }, { text: report.incActions, alignment: 'center' }]);
    }
    resolve(body1);
  });
}

function getPNP3(report) {
  return new Promise(function (resolve, reject) {
    const body2 = [];
    body2.push([{ text: 'Risk Detected During Site Visit?' }, { text: report.risk, alignment: 'center' }]);
    if (report.risk === 'Yes') {
      if (report.riskDesc1 !== '' && report.riskDesc1 !== undefined) {
        body2.push([{ text: 'Risk 1', alignment: 'center', colSpan: 2 }, {}]);
        if (report.photo1 !== '' && report.photo1 !== undefined) {
          body2.push([{ text: 'Photo 1' }, { image: report.photo1, width: 100, alignment: 'center' }]);
        }
        body2.push([{ text: 'Risk Detected' }, { text: report.riskDesc1 }]);
        body2.push([{ text: 'Recommendation' }, { text: report.riskRec1 }]);
      }
      if (report.riskDesc2 !== '' && report.riskDesc2 !== undefined) {
        body2.push([{ text: 'Risk 2', alignment: 'center', colSpan: 2 }, {}]);
        if (report.photo2 !== '' && report.photo2 !== undefined) {
          body2.push([{ text: 'Photo 2' }, { image: report.photo2, width: 100, alignment: 'center' }]);
        }
        body2.push([{ text: 'Risk Detected' }, { text: report.riskDesc2 }]);
        body2.push([{ text: 'Recommendation' }, { text: report.riskRec2 }]);
      }
      if (report.riskDesc3 !== '' && report.riskDesc3 !== undefined) {
        body2.push([{ text: 'Risk 3', alignment: 'center', colSpan: 2 }, {}]);
        if (report.photo3 !== '' && report.photo3 !== undefined) {
          body2.push([{ text: 'Photo 3' }, { image: report.photo3, width: 100, alignment: 'center' }]);
        }
        body2.push([{ text: 'Risk Detected' }, { text: report.riskDesc3 }]);
        body2.push([{ text: 'Recommendation' }, { text: report.riskRec3 }]);
      }
    }
    resolve(body2);
  });
}

function processPNP(report, companyLogo, color, body, body1, body2) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'PNP SITE VISIT REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
              [{ text: 'OB NUMBER:', style: 'headLabel' }, { text: report.ob, alignment: 'center' },
              {}, {}],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body1
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body2
          },
        },
        {
          style: 'table',
          table: {
            widths: ['60%', '20%', '20%'],
            body: [
              [{ text: 'CHECKLIST INSPECTION', alignment: 'center', style: 'headLabel', colSpan: 3 }, {}, {}],
              [{ text: 'Condition', style: 'headLabel' }, { text: 'Yes/No/NA', style: 'headLabel', alignment: 'center' }, { text: 'Comments', style: 'headLabel' }],

              [{ text: 'Are any cameras not working?', style: 'headLabel' }, { text: report.alarms, alignment: 'center' },
              { text: report.com1 }],
              [{ text: 'Are there any decorations obstructing the cameras?', style: 'headLabel' }, { text: report.uniforms, alignment: 'center' },
              { text: report.com2 }],
              [{ text: 'Are the daily reviews done?', style: 'headLabel' }, { text: report.guardroom, alignment: 'center' },
              { text: report.com3 }],
              [{ text: 'Are all monitors working?', style: 'headLabel' }, { text: report.obComplete, alignment: 'center' },
              { text: report.com4 }],
              [{ text: 'Is the telephone working and available?', style: 'headLabel' }, { text: report.registers, alignment: 'center' },
              { text: report.com5 }],
              [{ text: 'Is the control room neat and tidy?', style: 'headLabel' }, { text: report.radios, alignment: 'center' },
              { text: report.com6 }],
              [{ text: 'Are the hand radios in working order?', style: 'headLabel' }, { text: report.panic, alignment: 'center' },
              { text: report.com7 }],
              [{ text: 'Have there been any arrests since the last visit?', style: 'headLabel' }, { text: report.phone, alignment: 'center' },
              { text: report.com8 }],
              [{ text: 'Have there been any preventions since the last visit?', style: 'headLabel' }, { text: report.patrol, alignment: 'center' },
              { text: report.com9 }],
              [{ text: 'Have there been any recoveries since the last visit?', style: 'headLabel' }, { text: report.torch, alignment: 'center' },
              { text: report.com10 }],
              [{ text: 'Was the panic button tested since the last visit?', style: 'headLabel' }, { text: report.elec, alignment: 'center' },
              { text: report.com11 }],
              [{ text: 'Are the 80/20 report completed?', style: 'headLabel' }, { text: report.cameras, alignment: 'center' },
              { text: report.com12 }],
              [{ text: 'Do the controllers have any issues?', style: 'headLabel' }, { text: report.cont, alignment: 'center' },
              { text: report.com13 }],
              [{ text: 'Is the cash in transit officers monitored while on site?', style: 'headLabel' }, { text: report.cash, alignment: 'center' },
              { text: report.com14 }],
              [{ text: 'Is the Occurance book completed?', style: 'headLabel' }, { text: report.compl, alignment: 'center' },
              { text: report.com15 }],
              [{ text: 'Is the duty roster on site?', style: 'headLabel' }, { text: report.dutyRoster, alignment: 'center' },
              { text: report.com16 }],
              [{ text: 'Are all entrances monitored by CCTV cameras?', style: 'headLabel' }, { text: report.cctv, alignment: 'center' },
              { text: report.com17 }],
              [{ text: 'Are all entrances to the store monitored by CCTV cameras?', style: 'headLabel' }, { text: report.monitored, alignment: 'center' },
              { text: report.com18 }],
              [{ text: 'Can you clearly identify customers entering the store?', style: 'headLabel' }, { text: report.store, alignment: 'center' },
              { text: report.com19 }],
              [{ text: 'Is the cash office monitored by CCTV cameras?', style: 'headLabel' }, { text: report.office, alignment: 'center' },
              { text: report.com20 }],
              [{ text: 'Are there sufficient coverage in the cash office?', style: 'headLabel' }, { text: report.coverage, alignment: 'center' },
              { text: report.com21 }],
              [{ text: 'Are there sufficient cameras placed in strategic areas?', style: 'headLabel' }, { text: report.strategic, alignment: 'center' },
              { text: report.com22 }],
              [{ text: 'Do we have any blind spots in the store? ', style: 'headLabel' }, { text: report.blind, alignment: 'center' },
              { text: report.com23 }],
              [{ text: 'Are all hot products on 24 hour power supply?', style: 'headLabel' }, { text: report.hot, alignment: 'center' },
              { text: report.com24 }],
              [{ text: 'Does electricity saving process affect video recording at night?', style: 'headLabel' }, { text: report.video, alignment: 'center' },
              { text: report.com25 }],
              [{ text: 'Does control room review high risk areas every morning?', style: 'headLabel' }, { text: report.review, alignment: 'center' },
              { text: report.com26 }],
              [{ text: 'Does control room provide footage to management on request?', style: 'headLabel' }, { text: report.request, alignment: 'center' },
              { text: report.com27 }],
              [{ text: 'Is there limited authorized access to the control room?', style: 'headLabel' }, { text: report.limited, alignment: 'center' },
              { text: report.com28 }],
              [{ text: 'Is the control room permanently manned?', style: 'headLabel' }, { text: report.manned, alignment: 'center' },
              { text: report.com29 }],
              [{ text: 'Is the ingate monitored by CCTV cameras?', style: 'headLabel' }, { text: report.ingate, alignment: 'center' },
              { text: report.com30 }],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            body: [
              [{ text: 'CLIENT MEETING', alignment: 'center', style: 'headLabel', colSpan: 2 }, {}],
              [{ text: 'Client Name ', style: 'headLabel' }, { text: report.client, alignment: 'center' }],
              [{ text: 'Client Discussion', style: 'headLabel' }, { text: report.discussion, alignment: 'center' }],
              [{ text: 'Does the client have any issues with the service?', style: 'headLabel' }, { text: report.issues, alignment: 'center' }]
            ]
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                manSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                clientSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'CLIENT SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

// Site Visit
// new site visit
exports.emailSITE = functions.firestore
  .document('/sitevisits/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return getSiteVisit(report).then(function (body) {
          return processSITE(report, companyLogo, color, body).then(function (docDefinition) {
            const file_name = `site_visits/${report.key}.pdf`;
            return createPDF(docDefinition, file_name).then(function (file_name) {
              const st = new Storage();
              const buck = st.bucket(BUCKET);
              return buck.file(file_name).download()
                .then(data => {
                  const myPdf = data[0];
                  const type = report.status + ' Site Visit Report: ' + report.site
                  return sendPdfEmail(myPdf, report, type)
                }).catch(function (error) {
                  return console.error("Failed!" + error);
                })
            }).catch(function (error) {
              return console.error("Failed!" + error);
            })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function getSiteVisit(report) {
  return new Promise(function (resolve, reject) {
    const body = [];
    body.push([{ text: 'OB Number', style: 'headLabel' }, { text: report.ob }]);
    body.push([{ text: 'Number of Officers on Duty:', style: 'headLabel' }, { text: report.duty }]);

    if (report.duty > 0) {

      report.guards.forEach((element) => {

        body.push([{ text: 'Staff Member on Duty', style: 'headLabel' }, { text: element.guardName }]);

        if (element.guardPhoto !== '' && element.guardPhoto !== undefined) {
          body.push([{ text: 'Photo of Staff Member', style: 'headLabel', alignment: 'center' }, { image: element.guardPhoto, width: 100, alignment: 'center' }]);
        }
        if (element.guardSig !== '' && element.guardSig !== undefined) {
          body.push([{ text: 'Guard Signature', style: 'headLabel' },
          { image: element.guardSig, width: 100, alignment: 'center' }]);
        }

      });


    }

    body.push([{ text: 'Any Incidents Reported Since Last Visit?', style: 'headLabel' }, { text: report.incidents }]);
    if (report.incidents === 'Yes') {
      body.push([{ text: 'Type of Incident', style: 'headLabel' }, { text: report.incType }]);
      body.push([{ text: 'Date', style: 'headLabel' }, { text: report.incDateTime }]);
      body.push([{ text: 'Reports Submitted?', style: 'headLabel' }, { text: report.incReported }]);
      body.push([{ text: 'Follow-up Actions Taken?', style: 'headLabel' }, { text: report.incActions }]);
    }
    body.push([{ text: 'Risk Detected During Site Visit?', style: 'headLabel' }, { text: report.risk }]);
    if (report.risk === 'Yes') {
      if (report.photo1 !== '' && report.photo1 !== undefined) {
        body.push([{ text: 'RISK 1', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
        body.push([{ text: 'Risk 1 Photo', style: 'headLabel', alignment: 'center' },
        { image: report.photo1, width: 100, alignment: 'center' }]);
        body.push([{ text: 'Risk Detected', style: 'headLabel' }, { text: report.riskDesc1 }]);
        body.push([{ text: 'Recommendation', style: 'headLabel' }, { text: report.riskRec1 }]);
      }
      if (report.photo2 !== '' && report.photo2 !== undefined) {
        body.push([{ text: 'RISK 2', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
        body.push([{ text: 'Risk 2 Photo', style: 'headLabel', alignment: 'center' },
        { image: report.photo2, width: 100, alignment: 'center' }]);
        body.push([{ text: 'Risk Detected', style: 'headLabel' }, { text: report.riskDesc2 }]);
        body.push([{ text: 'Recommendation', style: 'headLabel' }, { text: report.riskRec2 }]);
      }
      if (report.photo3 !== '' && report.photo3 !== undefined) {
        body.push([{ text: 'RISK 3', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
        body.push([{ text: 'Risk 3 Photo', style: 'headLabel', alignment: 'center' },
        { image: report.photo3, width: 100, alignment: 'center' }]);
        body.push([{ text: 'Risk Detected', style: 'headLabel' }, { text: report.riskDesc3 }]);
        body.push([{ text: 'Recommendation', style: 'headLabel' }, { text: report.riskRec3 }]);
      }
    }
    body.push([{ text: 'CHECKLIST INSPECTION', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    body.push([{ text: 'Are all parking lights working?', style: 'headLabel' }, { text: report.parking }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com0 }]);
    body.push([{ text: 'Job Description on Site?', style: 'headLabel' }, { text: report.jobDesc }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com13 }]);
    body.push([{ text: 'Duty Roster on Site?', style: 'headLabel' }, { text: report.dutyRost }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com14 }]);
    body.push([{ text: 'Guards Scheduled for Training?', style: 'headLabel' }, { text: report.trainingShed }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com15 }]);
    body.push([{ text: 'Are alarms Functional?', style: 'headLabel' }, { text: report.alarms }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com1 }]);
    body.push([{ text: 'Is the Security officer’s uniform neat and Serviceable?', style: 'headLabel' }, { text: report.uniforms }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com2 }]);
    body.push([{ text: 'Is the guardroom neat and tidy?', style: 'headLabel' }, { text: report.guardroom }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com3 }]);
    body.push([{ text: 'Is the O.B book completed?', style: 'headLabel' }, { text: report.obComplete }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com4 }]);
    body.push([{ text: 'Is all registers in use and up to date?', style: 'headLabel' }, { text: report.registers }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com5 }]);
    body.push([{ text: 'Are all radios in working order?', style: 'headLabel' }, { text: report.radios }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com6 }]);
    body.push([{ text: 'Is the panic buttons Available and in working order during the visit?', style: 'headLabel' },
    { text: report.panic }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com7 }]);
    body.push([{ text: 'Is the site phone available and operational?', style: 'headLabel' }, { text: report.phone }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com8 }]);
    body.push([{ text: 'Is the Guard patrol system operational and in use?', style: 'headLabel' }, { text: report.patrol }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com9 }]);
    body.push([{ text: 'Is the torch available and working?', style: 'headLabel' }, { text: report.torch }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com10 }]);
    body.push([{ text: 'Is the Electric Fence & Energizer in working order?', style: 'headLabel' }, { text: report.elec }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com11 }]);
    body.push([{ text: 'When was the last time the Electric Fence Tested?', style: 'headLabel' }, { text: report.elecTested }]);
    body.push([{ text: 'What was the response time?', style: 'headLabel' }, { text: report.responseTime }]);
    body.push([{ text: 'Are all cameras in working order?', style: 'headLabel' }, { text: report.cameras }]);
    body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com12 }]);

    body.push([{ text: 'CLIENT MEETING', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    body.push([{ text: 'Client Name ', style: 'headLabel' }, { text: report.client }]);
    body.push([{ text: 'Client Discussion', style: 'headLabel' }, { text: report.discussion }]);
    body.push([{ text: 'Does the client have any Issues with the Service?', style: 'headLabel' }, { text: report.issues }]);
    resolve(body);
  });
}

function processSITE(report, companyLogo, color, body) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'SITE VISIT REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
              [{ text: 'END TIME:', style: 'headLabel' }, { text: report.timeEnd, alignment: 'center' },
              { text: 'VISIT DURATION:', style: 'headLabel' }, { text: report.timeStamp, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 0,
            body: body
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                manSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                clientSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'CLIENT SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}



// General Site Visit


exports.emailGenSite = functions.firestore
  .document('/visits/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return processGenSite1(report).then(function (body) {
          return processGenSite2(report).then(function (body1) {
            return getGenSite(report, companyLogo, color, body, body1).then(function (docDefinition) {
              const file_name = `site_visit/${report.key}.pdf`;
              return createPDF(docDefinition, file_name).then(function (file_name) {
                const st = new Storage();
                const buck = st.bucket(BUCKET);
                return buck.file(file_name).download()
                  .then(data => {
                    const myPdf = data[0];
                    const type = 'General Site Visit Report';
                    return sendPdfEmail(myPdf, report, type)
                  }).catch(function (error) {
                    return console.error("Failed!" + error);
                  })
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
            }).catch(function (error) {
              return console.error("Failed!" + error);
            })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processGenSite1(report) {
  return new Promise(function (resolve) {
    const body = [];
    if (report.photo1 !== '' && report.photo1 !== undefined) {
      body.push([{ text: 'Photo of site' }, { image: report.photo1, width: 100, alignment: 'center' }]);
    } else {
      body.push([{ text: 'No site photo taken', colSpan: 2, alignment: 'center' }, {}]);
    }
    resolve(body);
  });
}

function processGenSite2(report) {
  return new Promise(function (resolve) {
    const body1 = [];
    body1.push([{ text: 'STAFF MEMBER INSPECTION', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
    if (report.numSo === 0) {
      body1.push([{ text: 'Number of Staff on Duty', style: 'headLabel' }, { text: report.numSo }]);
    } else {
      if (report.photo2 !== '' && report.photo2 !== undefined) {
        body1.push([{ text: 'Number of Staff on Duty', style: 'headLabel' }, { text: report.numSo }]);
        body1.push([{ text: 'Staff Member on Duty', style: 'headLabel' }, { text: report.so }]);
        body1.push([{ text: 'Photo of the Staff Member', style: 'headLabel' }, { image: report.photo2, width: 100, alignment: 'center' }]);
        body1.push([{ text: 'Staff Member Post', style: 'headLabel' }, { text: report.soPost }]);
        body1.push([{ text: 'Is the Staff Members uniform neat and Serviceable?', style: 'headLabel' }, { text: report.uniforms }]);
        body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com1 }]);
        body1.push([{ text: 'Is the guardroom neat and tidy?', style: 'headLabel' }, { text: report.guardroom }]);
        body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com2 }]);
        body1.push([{ text: 'Is the O.B book completed?', style: 'headLabel' }, { text: report.obComplete }]);
        body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com3 }]);
        body1.push([{ text: 'Are all registers in use and up to date?', style: 'headLabel' }, { text: report.registers }]);
        body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com4 }]);
        if (report.guardSig !== '' && report.guardSig !== undefined) {
          body1.push([{ text: 'Staff Member Signature', style: 'headLabel' }, { image: report.guardSig, width: 100, alignment: 'center' }]);
        }
      } else {
        body1.push([{ text: 'Number of Staff on Duty', style: 'headLabel' }, { text: report.numSo }]);
        body1.push([{ text: 'Staff Member on Duty', style: 'headLabel' }, { text: report.so }]);
        body1.push([{ text: 'Photo of the Staff Member', style: 'headLabel' }, { text: 'No photo taken' }]);
        body1.push([{ text: 'Staff Member Post', style: 'headLabel' }, { text: report.soPost }]);
        body1.push([{ text: 'Is the Staff Members uniform neat and Serviceable?', style: 'headLabel' }, { text: report.uniforms }]);
        body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com1 }]);
        body1.push([{ text: 'Is the guardroom neat and tidy?', style: 'headLabel' }, { text: report.guardroom }]);
        body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com2 }]);
        body1.push([{ text: 'Is the O.B book completed?', style: 'headLabel' }, { text: report.obComplete }]);
        body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com3 }]);
        body1.push([{ text: 'Are all registers in use and up to date?', style: 'headLabel' }, { text: report.registers }]);
        body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com4 }]);
        if (report.guardSig !== '' && report.guardSig !== undefined) {
          body1.push([{ text: 'Staff Member Signature', style: 'headLabel' }, { image: report.guardSig, width: 100, alignment: 'center' }]);
        }
      }
    }
    resolve(body1);
  });
}

function getGenSite(report, companyLogo, color, body, body1) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'GENERAL SITE VISIT REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
              [{ text: 'OB NUMBER:', style: 'headLabel' }, { text: report.ob, alignment: 'center' },
              { text: 'SHIFT:', style: 'headLabel' }, { text: report.shift, alignment: 'center' }],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            headerRows: 1,
            body: body1
          },
        },
        {
          style: 'table',
          table: {
            widths: ['60%', '20%', '20%'],
            body: [
              [{ text: 'SITE CHECKLIST INSPECTION', alignment: 'center', style: 'headLabel', colSpan: 3 }, {}, {}],
              [{ text: 'Condition', style: 'headLabel' }, { text: 'Yes/No/NA', style: 'headLabel', alignment: 'center' }, { text: 'Comments', style: 'headLabel' }],

              [{ text: 'Are alarms functional?', style: 'headLabel' }, { text: report.alarms, alignment: 'center' },
              { text: report.com5 }],
              [{ text: 'Are all radios in working order?', style: 'headLabel' }, { text: report.radios, alignment: 'center' },
              { text: report.com6 }],
              [{ text: 'Is the panic buttons available and in working order during the visit?', style: 'headLabel' }, { text: report.panic, alignment: 'center' },
              { text: report.com7 }],
              [{ text: 'Is the site phone available and operational?', style: 'headLabel' }, { text: report.phone, alignment: 'center' },
              { text: report.com8 }],
              [{ text: 'Is the guard patrol system operational and in use?', style: 'headLabel' }, { text: report.patrol, alignment: 'center' },
              { text: report.com9 }],
              [{ text: 'Is the torch available and working?', style: 'headLabel' }, { text: report.torch, alignment: 'center' },
              { text: report.com10 }],
              [{ text: 'Are the Electric Fence & Energizer in working order?', style: 'headLabel' }, { text: report.elec, alignment: 'center' },
              { text: report.com11 }],
              [{ text: 'Are all cameras in working order?', style: 'headLabel' }, { text: report.cameras, alignment: 'center' },
              { text: report.com12 }],
            ]
          },
        },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            body: [
              [{ text: 'CLIENT MEETING', alignment: 'center', style: 'headLabel', colSpan: 2 }, {}],
              [{ text: 'Client Name ', style: 'headLabel' }, { text: report.client, alignment: 'center' }],
              [{ text: 'Client Discussion', style: 'headLabel' }, { text: report.discussion, alignment: 'center' }],
              [{ text: 'Does the client have any issues with the service?', style: 'headLabel' }, { text: report.issues, alignment: 'center' }]
            ]
          },
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                manSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'MANAGER SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                clientSig,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'CLIENT SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

// exports.emailSiteVisit = functions.firestore
//     .document(`/sitevisits/{uid}`)
//     .onWrite((change) => {
//         const report = change.after.data();
//         if (report.form) {
//             return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
//                 const base64 = doc.data().base64;
//                 return createVisitPDF(report, base64).then(function (file_name) {
//                     const st = new Storage();
//                     const buck = st.bucket('security-control-app.appspot.com');
//                     return buck.file(file_name).download()
//                         .then(data => {
//                             const myPdf = data[0];
//                             const type = report.status + ' Site Visit Report: ' + report.site
//                             return sendPdfEmail(myPdf, report, type)
//                         }).catch(function (error) {
//                             console.error("Failed!" + error);
//                         })
//                 }).catch(function (error) {
//                     console.error("Failed!" + error);
//                 })
//             }).catch(function (error) {
//                 console.error("Failed!" + error);
//             })
//         }
//         else {
//             return console.log('Old system...')
//         }
//     })

// function createVisitPDF(report, base64) {

//     return new Promise(function (resolve, reject) {
//         var incidentHeader = '';
//         var incidentTable = '';
//         var guard = '';
//         var riskHeader = '';
//         var riskBody = '';
//         var riskBody2 = '';
//         var riskBody3 = '';
//         var guardHeader = '';
//         var clientSig = '';
//         const incDate = moment(report.incDateTime).format('DD/MM/YYYY');
//         var manSig = '';
//         var gHead = '';
//         if (report.manSig !== '') {
//             manSig = {
//                 border: [false, false, false, true],
//                 margin: [0, 70, 0, 0],
//                 image: report.manSig,
//                 width: 150,
//                 alignment: 'center',
//             }
//         }
//         if (report.photo !== '' && report.guardSig !== '') {
//             gHead = {
//                 style: 'table',
//                 table: {
//                     widths: ['100%'],
//                     body: [
//                         [{ text: 'SECURITY OFFICER ON DUTY', bold: true, alignment: 'center', fillColor: '#969696' }],
//                     ]
//                 },
//             }
//             guardHeader = {
//                 style: 'table',
//                 table: {
//                     widths: ['25%', '25%', '25%', '25%'],
//                     body: [
//                         [{ text: 'SECURITY OFFICER:', style: 'headLabel' }, { text: report.so, alignment: 'center' }, { text: 'COMPANY NUMBER:', style: 'headLabel' }, { text: report.soCoNo, alignment: 'center' }],
//                     ]
//                 },
//             }
//             guard = {
//                 style: 'table',
//                 pageBreak: 'after',
//                 table: {
//                     widths: ['50%', '50%'],
//                     body: [
//                         [{ image: report.photo, fit: [250, 250], alignment: 'center', rowSpan: 35 }, { text: '', rowSpan: 33 }],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, { image: report.guardSig, width: 150, alignment: 'center' }],
//                         [{}, { text: 'GUARD SIGNATURE', bold: true, alignment: 'center' }],
//                     ]
//                 }
//             }
//         }
//         if (report.clientSig !== '') {
//             clientSig = {
//                 border: [false, false, false, true],
//                 margin: [0, 70, 0, 0],
//                 image: report.clientSig,
//                 width: 150,
//                 alignment: 'center',
//             }
//         }
//         if (report.clientSig !== '') {
//             clientSig = {
//                 border: [false, false, false, true],
//                 margin: [0, 70, 0, 0],
//                 image: report.clientSig,
//                 width: 150,
//                 alignment: 'center',
//             }
//         }

//         if (report.incidents === 'Yes') {
//             incidentHeader = {
//                 style: 'table',
//                 table: {
//                     widths: ['100%'],
//                     body: [
//                         [{ text: 'INCIDENT DETAILS', bold: true, alignment: 'center', fillColor: '#969696' }],
//                     ]
//                 },
//             }
//             incidentTable = {
//                 style: 'table',
//                 table: {
//                     widths: ['30%', '70%'],
//                     body: [
//                         [{ text: 'TYPE OF INCIDENT:', style: 'headLabel' }, { text: report.incType, alignment: 'center' }],
//                         [{ text: 'DATE OF INCIDENT:', style: 'headLabel' }, { text: incDate, alignment: 'center' }],
//                         [{ text: 'REPORT SUBMITTED?', style: 'headLabel' }, { text: report.incReported, alignment: 'center' }],
//                         [{ text: 'FOLLOW-UP ACTION TAKEN:', style: 'headLabel' }, { text: report.incActions, alignment: 'center' }],
//                     ]
//                 },
//             }
//         }
//         if (report.risk === 'Yes') {
//             riskHeader = {
//                 style: 'table',

//                 table: {
//                     widths: ['100%'],
//                     body: [
//                         [{ text: 'IDENTIFIED RISKS', bold: true, alignment: 'center', fillColor: '#969696' }],
//                     ]
//                 },
//             }
//         }
//         if (report.risk === 'Yes' && report.photo1 !== '' && report.photo2 === '') {
//             riskBody = {
//                 style: 'table',
//                 pageBreak: 'after',
//                 table: {
//                     widths: ['50%', '50%'],
//                     body: [
//                         [{ image: report.photo1, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskDesc1 }],
//                         [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskRec1, rowSpan: 7 }],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                     ]
//                 }
//             }
//         }
//         if (report.risk === 'Yes' && report.photo1 !== '' && report.photo2 !== '' && report.photo3 === '') {
//             riskBody = {
//                 style: 'table',
//                 table: {
//                     widths: ['50%', '50%'],
//                     body: [
//                         [{ image: report.photo1, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskDesc1 }],
//                         [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskRec1, rowSpan: 7 }],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                     ]
//                 }
//             }
//             riskBody2 = {
//                 style: 'table',
//                 pageBreak: 'after',
//                 table: {
//                     widths: ['50%', '50%'],
//                     body: [
//                         [{ image: report.photo2, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskDesc2 }],
//                         [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskRec2, rowSpan: 7 }],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                     ]
//                 }
//             }
//         }
//         if (report.risk === 'Yes' && report.photo1 !== '' && report.photo2 !== '' && report.photo3 !== '') {
//             riskBody = {
//                 style: 'table',
//                 table: {
//                     widths: ['50%', '50%'],
//                     body: [
//                         [{ image: report.photo1, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskDesc1 }],
//                         [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskRec1, rowSpan: 7 }],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                     ]
//                 }
//             }
//             riskBody2 = {
//                 style: 'table',
//                 table: {
//                     widths: ['50%', '50%'],
//                     body: [
//                         [{ image: report.photo2, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskDesc2 }],
//                         [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskRec2, rowSpan: 7 }],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                     ]
//                 }
//             }
//             riskBody3 = {
//                 style: 'table',
//                 pageBreak: 'after',
//                 table: {
//                     widths: ['50%', '50%'],
//                     body: [
//                         [{ image: report.photo3, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskDesc3 }],
//                         [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
//                         [{}, { text: report.riskRec3, rowSpan: 7 }],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                         [{}, {}],
//                     ]
//                 }
//             }
//         }
//         var docDefinition = {
//             pageSize: 'A4',
//             pageMargins: [10, 10, 10, 10],
//             content: [
//                 {
//                     image: base64,
//                     width: 480,
//                     alignment: 'center'
//                 },
//                 { text: 'SITE VISIT REPORT', style: 'header' },
//                 {
//                     style: 'table',
//                     table: {
//                         widths: ['25%', '25%', '25%', '25%'],
//                         body: [
//                             [{ text: 'DATE & TIME:', style: 'headLabel' }, { text: report.date + ' ' + report.time, alignment: 'center' }, { text: 'OB NUMBER:', style: 'headLabel' }, { text: report.ob, alignment: 'center' }],
//                             [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' }, { text: 'MANAGER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
//                             [{ text: 'ANY INCIDENTS REPORTED SINCE LAST VISIT?', style: 'headLabel', colSpan: 3 }, {}, {}, { text: report.incidents, alignment: 'center' }],
//                         ]
//                     },
//                 },
//                 incidentHeader,
//                 incidentTable,
//                 gHead,
//                 guardHeader,
//                 guard,
//                 riskHeader,
//                 riskBody,
//                 riskBody2,
//                 riskBody3,
//                 {
//                     style: 'table',
//                     table: {
//                         widths: ['100%'],
//                         body: [
//                             [{ text: 'SITE INSPECTION CHECKLIST', bold: true, alignment: 'center', fillColor: '#969696' }],
//                         ]
//                     },
//                 },
//                 {
//                     style: 'table5',
//                     pageBreak: 'after',
//                     table: {
//                         widths: ['70%', '30%'],
//                         body: [
//                             [{ text: 'ARE ALL PARKING LIGHTS WORKING?', bold: true }, { text: report.parking, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com0, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'ARE THERE JOB DESCRIPTIONS ON SITE?', bold: true }, { text: report.jobDesc, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com13, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'IS THE DUTY ROSTER ON SITE?', bold: true }, { text: report.dutyRost, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com14, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'ARE GUARDS SHCEDULED FOR TRAINING?', bold: true }, { text: report.trainingShed, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com15, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'ARE ALL ALARMS FUNCTIONAL?', bold: true }, { text: report.alarms, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com1, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'IS THE SECURITY OFFICERS UNIFORM NEAT AND SERVICEABLE?', bold: true }, { text: report.uniforms, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com2, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'IS THE GUARDROOM NEAT AND TIDY?', bold: true }, { text: report.guardroom, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com3, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'IS THE OB BOOK COMPLETED?', bold: true }, { text: report.obComplete, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com4, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'ARE ALL REGISTERS IN USE AND UP-TO-DATE?', bold: true }, { text: report.registers, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com5, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'ARE ALL RADIOS IN WORKING ORDER?', bold: true }, { text: report.radios, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com6, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'ARE PANIC BUTTONS AVAILABLE AND IN WORKING ORDER?', bold: true }, { text: report.panic, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com7, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'IS THE SITE PHONE AVAILABLE AND OPERATIONAL?', bold: true }, { text: report.phone, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com8, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'IS THE GUARD PATROL SYSTEM OPERATIONAL AND IN USE?', bold: true }, { text: report.patrol, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com9, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'IS THE TORCH AVAILABLE ANDWORKING?', bold: true }, { text: report.torch, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com10, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'ARE ALL CAMERAS IN WORKING ORDER?', bold: true }, { text: report.cameras, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com12, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'IS THE ELECTRICAL FENCE & ENERGIZER IN WORKING ORDER?', bold: true }, { text: report.elec, alignment: 'center' }],
//                             [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.com11, colSpan: 2, color: '#ff0000' }],
//                             [{ text: 'WHEN LAST WAS THE ELECTRICAL FENCE TESTED?', bold: true }, { text: report.elecTested, alignment: 'center' }],
//                             [{ text: 'WHAT WAS THE RESPONSE TIME?', bold: true }, { text: report.responseTime, alignment: 'center' }],
//                         ]
//                     },
//                 },
//                 {
//                     style: 'table',
//                     table: {
//                         widths: ['100%'],
//                         body: [
//                             [{ text: 'CLIENT MEETING', bold: true, alignment: 'center', fillColor: '#969696' }],
//                         ]
//                     },
//                 },
//                 {
//                     style: 'table',
//                     table: {
//                         widths: ['50%', '50%'],
//                         body: [
//                             [{ text: 'CLIENT NAME:', bold: true }, { text: report.client, alignment: 'center' }],
//                             [{ text: 'CLIENT DISCUSSION:', bold: true, alignment: 'center', colSpan: 2 }, {}],
//                             [{ text: report.discussion, rowSpan: 10, colSpan: 2 }, {}],
//                             [{}, {}],
//                             [{}, {}],
//                             [{}, {}],
//                             [{}, {}],
//                             [{}, {}],
//                             [{}, {}],
//                             [{}, {}],
//                             [{}, {}],
//                             [{}, {}],
//                             [{ text: 'DOES THE CLIENT HAVE ANY ISSUES WITH THE SERVICE?', bold: true }, { text: report.status, alignment: 'center' }],
//                         ]
//                     },
//                 },
//                 {
//                     style: 'table',
//                     table: {
//                         widths: [150, 200, 150],
//                         body: [
//                             [
//                                 manSig,
//                                 {
//                                     border: [false, false, false, false],
//                                     text: ''
//                                 },
//                                 clientSig,
//                             ],
//                             [
//                                 {
//                                     border: [false, false, false, false],
//                                     text: 'USER SIGNATURE',
//                                     alignment: 'center',
//                                 },
//                                 {
//                                     border: [false, false, false, false],
//                                     text: ''
//                                 },
//                                 {
//                                     border: [false, false, false, false],
//                                     text: 'CLIENT SIGNATURE',
//                                     alignment: 'center',
//                                 }
//                             ],
//                         ]
//                     }
//                 }
//             ],
//             styles: {
//                 header: {
//                     fontSize: 18,
//                     bold: true,
//                     alignment: 'center',
//                     margin: [0, 5, 0, 5]
//                 },
//                 subheader: {
//                     alignment: 'center',
//                     fontSize: 18,
//                     bold: true,
//                     margin: [0, 5, 0, 5]
//                 },
//                 headLabel: {
//                     bold: true
//                 },
//                 table: {
//                     margin: [0, 5, 0, 5]
//                 },
//                 table5: {
//                     fontSize: 10,
//                 },
//             }
//         };
//         const fontDescriptors = {
//             Roboto: {
//                 normal: 'fonts/Roboto-Regular.ttf',
//                 bold: 'fonts/Roboto-Bold.ttf',
//                 italics: 'fonts/Roboto-Italic.ttf',
//                 bolditalics: 'fonts/Roboto-BoldItalic.ttf',
//             }
//         }

//         const printer = new PdfPrinter(fontDescriptors);
//         const pdfDoc = printer.createPdfKitDocument(docDefinition);
//         const storage = new Storage({
//             projectId: 'security-control-app', //found in firebase console: click on Setting then on Project parameters
//         });
//         let file_name = `site-visits/${report.key}.pdf`;

//         const myPdfFile = storage.bucket(BUCKET).file(file_name);

//         pdfDoc.pipe(myPdfFile.createWriteStream())
//             .on('finish', function () {
//                 console.log('Pdf successfully created!');
//                 resolve(file_name);
//             })
//             .on('error', function (error) {
//                 return console.error("Failed!" + error);
//             });

//         pdfDoc.end();
//     }
//     );
// }

exports.authgoogleapi = functions.https.onRequest((req, res) => {
  res.set('Cache-Control', 'private, max-age=0, s-maxage=0');
  res.redirect(functionsOauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  }));
});

const DB_TOKEN_PATH = '/api_tokens';

exports.oauthcallback = functions.https.onRequest((req, res) => {
  res.set('Cache-Control', 'private, max-age=0, s-maxage=0');
  const code = req.query.code;
  functionsOauthClient.getToken(code, (err, tokens) => {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (err) {
      return res.status(400).send(err);
    }
    return db.ref(DB_TOKEN_PATH).set(tokens)
      .then(() => {
        return res.status(200).send('App successfully configured with new Credentials. '
          + 'You can now close this page.');
      });
  });
});

function appendPromise(requestWithoutAuth) {
  return new Promise((resolve, reject) => {
    return getAuthorizedClient().then((client) => {
      const sheets = google.sheets('v4');
      const request = requestWithoutAuth;
      request.auth = client;
      return sheets.spreadsheets.values.append(request, (err, response) => {
        if (err) {
          console.log(`The API returned an error: ${err}`);
          return reject(err);
        }
        return resolve(response.data);
      });
    });
  });
}

function getAuthorizedClient() {
  if (oauthTokens) {
    return Promise.resolve(functionsOauthClient);
  }
  return db.ref(DB_TOKEN_PATH).once('value').then((snapshot) => {
    oauthTokens = snapshot.val();
    functionsOauthClient.setCredentials(oauthTokens);
    return functionsOauthClient;
  });
}

exports.updateVisitDailySummaryReport = functions.firestore
  .document(`/sitevisits/{uid}`)
  .onCreate((snap) => {
    const newRecord = snap.data();
    return appendPromise({
      spreadsheetId: '1sw-PrsIOw4nneMkpE6mpXReKZmeTAdR9FM7whiwYh_U',
      range: 'A:D',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[newRecord.site, newRecord.date, newRecord.status, newRecord.timeStamp]]
      }
    })
  });

// Work Order notifications

exports.orderNotesTech = functions.firestore
  .document('/work-orders/{uid}')
  .onCreate((snap, context) => {
    const report = snap.data();

    return admin.firestore().collection('tokens').doc(report.assignedKey).get().then(token => {
      var tkn = token.token;

      const payload = {
        notification: {
          title: 'New Job Card',
          body: `A new job was created and assigned to you by ${report.manager}`,
          // icon: 'https://firebasestorage.googleapis.com/v0/b/premier-logistics.appspot.com/o/logo.jpg?alt=media&token=7b4d2f5b-f59d-4822-9bd2-d9ad2392daf7',
        }
      }
      return admin.messaging().sendToDevice(tkn, payload);
    })
  })

exports.orderNotesMan = functions.firestore
  .document('/work-orders/{uid}')
  .onCreate((snap, context) => {
    const report = snap.data();

    return admin.firestore().collection('users').where('type', '==', 'Technical Manager').get().then(managers => {
      return managers.forEach(manager => {
        return admin.firestore().collection('tokens').doc(manager.data().key).get().then(token => {
          var tkn = token.token

          const payload = {
            notification: {
              title: 'New Job Card',
              body: `A new job was created and assigned to ${report.assignedName} by ${report.manager}`,
              // icon: 'https://firebasestorage.googleapis.com/v0/b/premier-logistics.appspot.com/o/logo.jpg?alt=media&token=7b4d2f5b-f59d-4822-9bd2-d9ad2392daf7',
            }
          }
          return admin.messaging().sendToDevice(tkn, payload);
        })
      })
    })
  })

// Work Order PDF

exports.emailNewCards = functions.firestore
  .document('/work-orders/{uid}')
  .onCreate((snap, context) => {
    const report = snap.data();
    if (report.status === 'Closed') {
      return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
        const companyLogo = doc.data().base64;
        const color = doc.data().color;
        return processCARD(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `job_card/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Technical Job Card';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    } else {
      console.log('No form')
    }
  })

exports.emailORDERS = functions.firestore
  .document('/work-orders/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    if (report.status === 'Closed') {
      return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
        const companyLogo = doc.data().base64;
        const color = doc.data().color;
        return processCARD(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `job_card/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Technical Job Card';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    } else if (report.recipient !== '' && report.recipient !== undefined) {
      return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
        const companyLogo = doc.data().base64;
        const color = doc.data().color;
        return processCARD(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `job_card/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Technical Job Card';
                report.companyEmail = '';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }
  })

function processCARD(report, companyLogo, color) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'TECHNICAL JOB CARD', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['50%', '50%'],
            body: [
              [{ text: 'DATE CREATED:', style: 'headLabel' }, { text: report.date, alignment: 'center' }],
              [{ text: 'TIME CREATED:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
              [{ text: 'MANAGER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
              [{ text: 'ASSIGNED USER:', style: 'headLabel' }, { text: report.assignedName, alignment: 'center' }],
              [{ text: 'STATUS:', style: 'headLabel' }, { text: report.status, alignment: 'center' }],
              [{ text: 'TYPE:', style: 'headLabel' }, { text: report.type, alignment: 'center' }],
              [{ text: 'CUSTOMER NAME:', style: 'headLabel' }, { text: report.customer, alignment: 'center' }],
              [{ text: 'DESCRIPTION:', style: 'headLabel' }, { text: report.desc, alignment: 'center' }],
              [{ text: 'JOB CARD NO:', style: 'headLabel' }, { text: report.cardNo, alignment: 'center' }],
              [{ text: 'DATE ACTIONED:', style: 'headLabel' }, { text: report.actionDate, alignment: 'center' }],
              [{ text: 'TIME ACTIONED:', style: 'headLabel' }, { text: report.actionTime, alignment: 'center' }],
              [{ text: 'ACTIONED TAKEN:', style: 'headLabel' }, { text: report.actions, alignment: 'center' }],
              [{ text: 'EQUIPMENT USED:', style: 'headLabel' }, { text: report.material, alignment: 'center' }],
            ]
          },
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

////    Work Order Daily Report  /////

exports.dailyJobCard = functions.runWith(runtimeOpts).pubsub.schedule('00 17 * * *').timeZone('Africa/Johannesburg').onRun(() => {
  return new Promise((resolve, reject) => {

    return admin.firestore().collection('companies').doc('0qbfVjnyuKE8EAdenn3T').get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return getCards().then(function (body) {
        return processCARDS(body, companyLogo).then(function (docDefinition) {
          const file_name = `daily_job_cards.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Daily Technical Job Card Report';
                var report = {}
                report.recipient = 'SEAN@THOMPSEC.CO.ZA'
                //report.recipient = 'katrynchvdp@gmail.com'
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    });
  });
});

function getCards() {
  return new Promise(function (resolve, reject) {

    const body = [];
    body.push([{ text: 'Date Created', style: 'headLabel' }, { text: 'Site Name', style: 'headLabel' }, { text: 'Job Description', style: 'headLabel' }, { text: 'Assigned User', style: 'headLabel' }, { text: 'Status', style: 'headLabel' }]);

    return admin.firestore().collection('work-orders').orderBy('date', 'desc').get().then(reports => {
      reports.forEach(report => {

        if (report.data().status === 'Pending' || report.data().status === 'Received' || report.data().status === 'In Progress') {

          body.push([{ text: report.data().date }, { text: report.data().site }, { text: report.data().desc }, { text: report.data().assignedName }, { text: report.data().status }]);
        }
      });
      return resolve(body)
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  });
}


function processCARDS(body, companyLogo) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'DAILY TECHNICAL JOB CARDS REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['20%', '20%', '20%', '20%', '20%'],
            headerRows: 1,
            body: body
          },
        },
      ],
      styles: {
        headLabel: {
          color: 'black',
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: 'black',
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


// Other Functions


exports.sendEmailConfirmation = functions.firestore
  .document('/companies/{uid}')
  .onCreate((snap) => {
    const user = snap.data();

    const mailOptions = {
      from: '"Security Control" <support@securitycontrol.co.za>',
      to: user.email,
    };

    // Building Email message.
    mailOptions.subject = `Welcome to Security Control!`;
    mailOptions.text = `Hi ${user.rep}!\n\nThank you for subscribing to Security Control. If you need any assistance in getting started, get in touch and we will gladly get you up and running.\n\nSincerely,\nSecurity Control Team`;

    return mailTransport.sendMail(mailOptions)
      .then(() => console.log(`New user sign up email sent to:`,
        user.email))
      .catch((error) => console.error('There was an error while sending the email:', error));
  });

exports.sendNotification = functions.firestore
  .document('/companies/{uid}')
  .onCreate((snap) => {
    const user = snap.data();

    const mailOptions = {
      from: '"Security Control." <support@securitycontrol.co.za>',
      to: 'brad@innovativethinking.co.za',
    };
    mailOptions.subject = `New Sign Up!`;
    mailOptions.text = `New Sign up!\n\nCompany: ${user.name} \n\nUser: ${user.rep} \n\nEmail: ${user.email}`;

    return mailTransport.sendMail(mailOptions)
      .then(() => console.log(`New user sign up email sent to:`,
        user.email))
      .catch((error) => console.error('There was an error while sending the email:', error));
  });



exports.updateTransDailyReport = functions.firestore
  .document(`/transparencys/{uid}`)
  .onCreate((snap, context) => {
    const newRecord = snap.data();
    return appendPromise({
      spreadsheetId: '1sw-PrsIOw4nneMkpE6mpXReKZmeTAdR9FM7whiwYh_U',
      range: 'A:D',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[newRecord.site, newRecord.date, newRecord.status, newRecord.timeStamp]]
      }
    })
  });

exports.updatePnPDailyReport = functions.firestore
  .document(`/pnpvisit/{uid}`)
  .onCreate((snap) => {
    const newRecord = snap.data();
    return appendPromise({
      spreadsheetId: '1sw-PrsIOw4nneMkpE6mpXReKZmeTAdR9FM7whiwYh_U',
      range: 'A:D',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[newRecord.site, newRecord.date, newRecord.status, newRecord.timeStamp]]
      }
    })
  });

exports.createMember = functions.firestore
  .document('users/{uid}')
  .onCreate((snap, context) => {
    const newUser = snap.data();
    return admin.auth().createUser({
      uid: newUser.key,
      email: newUser.email,
      emailVerified: false,
      password: newUser.password,
      displayName: newUser.name,
      disabled: false
    }).then(function (userRecord) {
      return console.log("Successfully created new user:", userRecord.displayName);
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  });

exports.deleteMember = functions.firestore
  .document(`DeletedUsers/{Key}`)
  .onWrite((change, context) => {
    const oldUser = change.after.data();
    return admin.auth().deleteUser(oldUser.key).then(function (deletedUser) {
      return console.log("Successfully deleted old user!");
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  });

exports.trainingCount = functions.firestore
  .document('trainings/{uid}')
  .onWrite((change) => {
    const training = change.after.data();
    var companyId = training.companyId;
    var updatedCount = {};
    var monthCount = {};

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const d = new Date();
    var currentMonth = monthNames[d.getMonth()];

    return admin.firestore().collection('summaries').doc(companyId).get().then(doc => {
      if (doc.data().trainings) {
        updatedCount = {
          trainings: doc.data().trainings + 1
        }
      }
      else {
        updatedCount = {
          trainings: 1
        }
      }
      return admin.firestore().collection('summaries').doc(companyId).update(updatedCount).then(() => {
        if (currentMonth === 'July') {
          if (doc.data().julyTrainings) {
            monthCount = {
              julyTrainings: doc.data().julyTrainings + 1
            }
          }
          else {
            monthCount = {
              julyTrainings: 1
            }
          }
        }
        if (currentMonth === 'August') {
          if (doc.data().augustTrainings) {
            monthCount = {
              augustTrainings: doc.data().augustTrainings + 1
            }
          }
          else {
            monthCount = {
              augustTrainings: 1
            }
          }
        }
        if (currentMonth === 'September') {
          if (doc.data().septemberTrainings) {
            monthCount = {
              septemberTrainings: doc.data().septemberTrainings + 1
            }
          }
          else {
            monthCount = {
              septemberTrainings: 1
            }
          }
        }
        if (currentMonth === 'October') {
          if (doc.data().octoberTrainings) {
            monthCount = {
              octoberTrainings: doc.data().octoberTrainings + 1
            }
          }
          else {
            monthCount = {
              octoberTrainings: 1
            }
          }
        }
        if (currentMonth === 'November') {
          if (doc.data().novemberTrainings) {
            monthCount = {
              novemberTrainings: doc.data().novemberTrainings + 1
            }
          }
          else {
            monthCount = {
              novemberTrainings: 1
            }
          }
        }
        if (currentMonth === 'December') {
          if (doc.data().decemberTrainings) {
            monthCount = {
              decemberTrainings: doc.data().decemberTrainings + 1
            }
          }
          else {
            monthCount = {
              decemberTrainings: 1
            }
          }
        }
        return admin.firestore().collection('summaries').doc(companyId).update(monthCount);
      })
    })
  })

exports.incidentGenCount = functions.firestore
  .document('genIncidents/{uid}')
  .onWrite((change) => {
    const incident = change.after.data();
    var companyId = incident.companyId;
    var updatedCount = {};
    var monthCount = {};

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const d = new Date();
    var currentMonth = monthNames[d.getMonth()];

    return admin.firestore().collection('summaries').doc(companyId).get().then(doc => {
      if (doc.data().genIncidents) {
        updatedCount = {
          incidents: doc.data().incidents + 1,
          genIncidents: doc.data().genIncidents + 1
        }
      }
      else {
        updatedCount = {
          incidents: 1,
          genIncidents: genIncidents + 1
        }
      }
      return admin.firestore().collection('summaries').doc(companyId).update(updatedCount).then(() => {
        if (currentMonth === 'July') {
          if (doc.data().julyIncidents) {
            monthCount = {
              julyIncidents: doc.data().julyIncidents + 1
            }
          }
          else {
            monthCount = {
              julyIncidents: 1
            }
          }
        }
        if (currentMonth === 'August') {
          if (doc.data().augustIncidents) {
            monthCount = {
              augustIncidents: doc.data().augustIncidents + 1
            }
          }
          else {
            monthCount = {
              augustIncidents: 1
            }
          }
        }
        if (currentMonth === 'September') {
          if (doc.data().septemberIncidents) {
            monthCount = {
              septemberIncidents: doc.data().septemberIncidents + 1
            }
          }
          else {
            monthCount = {
              septemberIncidents: 1
            }
          }
        }
        if (currentMonth === 'October') {
          if (doc.data().octoberIncidents) {
            monthCount = {
              octoberIncidents: doc.data().octoberIncidents + 1
            }
          }
          else {
            monthCount = {
              octoberIncidents: 1
            }
          }
        }
        if (currentMonth === 'November') {
          if (doc.data().novemberIncidents) {
            monthCount = {
              novemberIncidents: doc.data().novemberIncidents + 1
            }
          }
          else {
            monthCount = {
              novemberIncidents: 1
            }
          }
        }
        if (currentMonth === 'December') {
          if (doc.data().decemberIncidents) {
            monthCount = {
              decemberIncidents: doc.data().decemberIncidents + 1
            }
          }
          else {
            monthCount = {
              decemberIncidents: 1
            }
          }
        }
        return admin.firestore().collection('summaries').doc(companyId).update(monthCount);
      })
    })
  })

exports.incidentCrimeCount = functions.firestore
  .document('incidents/{uid}')
  .onWrite((change) => {
    const incident = change.after.data();
    var companyId = incident.companyId;
    var updatedCount = {};
    var monthCount = {};

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const d = new Date();
    var currentMonth = monthNames[d.getMonth()];

    return admin.firestore().collection('summaries').doc(companyId).get().then(doc => {
      if (doc.data().crimeIncidents) {
        updatedCount = {
          incidents: doc.data().incidents + 1,
          crimeIncidents: doc.data().crimeIncidents + 1
        }
      }
      else {
        updatedCount = {
          incidents: 1,
          crimeIncidents: crimeIncidents + 1
        }
      }
      return admin.firestore().collection('summaries').doc(companyId).update(updatedCount).then(() => {
        if (currentMonth === 'July') {
          if (doc.data().julyIncidents) {
            monthCount = {
              julyIncidents: doc.data().julyIncidents + 1
            }
          }
          else {
            monthCount = {
              julyIncidents: 1
            }
          }
        }
        if (currentMonth === 'August') {
          if (doc.data().augustIncidents) {
            monthCount = {
              augustIncidents: doc.data().augustIncidents + 1
            }
          }
          else {
            monthCount = {
              augustIncidents: 1
            }
          }
        }
        if (currentMonth === 'September') {
          if (doc.data().septemberIncidents) {
            monthCount = {
              septemberIncidents: doc.data().septemberIncidents + 1
            }
          }
          else {
            monthCount = {
              septemberIncidents: 1
            }
          }
        }
        if (currentMonth === 'October') {
          if (doc.data().octoberIncidents) {
            monthCount = {
              octoberIncidents: doc.data().octoberIncidents + 1
            }
          }
          else {
            monthCount = {
              octoberIncidents: 1
            }
          }
        }
        if (currentMonth === 'November') {
          if (doc.data().novemberIncidents) {
            monthCount = {
              novemberIncidents: doc.data().novemberIncidents + 1
            }
          }
          else {
            monthCount = {
              novemberIncidents: 1
            }
          }
        }
        if (currentMonth === 'December') {
          if (doc.data().decemberIncidents) {
            monthCount = {
              decemberIncidents: doc.data().decemberIncidents + 1
            }
          }
          else {
            monthCount = {
              decemberIncidents: 1
            }
          }
        }
        return admin.firestore().collection('summaries').doc(companyId).update(monthCount);
      })
    })
  })


// Client Instruction

exports.emailAOD = functions.firestore
  .document('/aod/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return processAOD(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `aod/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'AOD';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processAOD(report, companyLogo, color) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'ACKNOWLEDGEMENT OF DEBT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['35%', '15%', '40%', '10%'],
            body: [
              [{ text: `I the undersigned (full name)`, style: 'headLabel', colSpan: 2 }, {}, { text: `                      ${report.name}                   `, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
              [{ text: 'Identification number ', style: 'headLabel', colSpan: 2 }, {}, { text: `               ${report.id}              `, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
              [{ text: 'Residential address: ', style: 'headLabel', colSpan: 2 }, {}, { text: `             ${report.address}             \n\n`, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
              [{ text: 'Hereby acknowledge being indebted to Thompsons Security Group in the sum of, R ', style: 'headLabel', colSpan: 3 }, {}, {}, { text: report.sum, style: 'headLabel', decoration: 'underline' }],
              [{ text: '(in words) ', style: 'headLabel' }, { text: `                ${report.sumWords}                    \n\n`, style: 'headLabel', colSpan: 3, decoration: 'underline' }, {}, {}],
              [{ text: 'Being the capital sum for ', style: 'headLabel', colSpan: 2 }, {}, { text: `             ${report.capital}             \n\n`, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
              [{ text: 'I agree to repay the said sum R  ', style: 'headLabel' }, { text: report.repay, style: 'headLabel', decoration: 'underline' }, { text: 'in monthly instalments of R ', style: 'headLabel' }, { text: report.instal, style: 'headLabel', decoration: 'underline' }],
              [{ text: '(amount in words) ', style: 'headLabel' }, { text: `                   ${report.instalWords}                    `, style: 'headLabel', colSpan: 3, decoration: 'underline' }, {}, {}],
              [{ text: 'Commencing from date ', style: 'headLabel' }, { text: `    ${report.date}      `, style: 'headLabel', decoration: 'underline' }, { text: 'and to this end hereby authorize and empower', style: 'headLabel', colSpan: 2 }, {}],
              [{ text: 'Thompsons Security Group to deduct each month from the numeration due to me. The said months an instalment until the full sum has been fully repaid.', style: 'headLabel', colSpan: 4 }, {}, {}, {}],
              [{ text: 'The debt incurred is in respect of', style: 'headLabel', colSpan: 2 }, {}, { text: `               ${report.respect}               \n\n`, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
              [{ text: 'I authorize and empower Thompsons Security Group to deduct from any amount owing to Thompsons Security Group by me the full balance of any sum still Payable under the said debt upon termination of employment.\n', style: 'headLabel', colSpan: 3 }, {}, {}, {}],

            ]
          },
          layout: 'noBorders'
        },
        {
          style: 'table',
          table: {
            widths: ['30%', '15%', '5%', '5%', '15%', '30%'],
            body: [
              [{ text: `This done and signed at`, style: 'headLabel' }, { text: `${report.time}`, decoration: 'underline', style: 'headLabel', }, { text: `this`, style: 'headLabel' }, { text: `${report.day}`, style: 'headLabel', decoration: 'underline' }, { text: `day of`, style: 'headLabel' }, { text: ` ${report.month}`, decoration: 'underline', style: 'headLabel', }],

            ]
          },
          layout: 'noBorders'
        },
        {
          style: 'table3',
          table: {
            widths: [250, 1, 250, 1],
            body: [
              [
                signature,
                {},
                witSig,
                {},
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'SIGNATURE',
                  alignment: 'center',
                },
                {},
                {
                  border: [false, false, false, false],
                  text: 'WITNESS',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


////// incident-report function

exports.incidentReport = functions.firestore
  .document('/incidentReport/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return processIR(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `incident-report/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Incident Report';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processIR(report, companyLogo, color) {
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'Incident Report', style: 'header' },

        {
          style: 'tableExample',
          table: {
            widths: [115, 115, 115, 115],
            body: [
              ['Reported By:', `${report.reportedBy}`, 'Date of Report', `${report.reportDate}`],
              ['Title/Role::', `${report.role}`, 'Incident OB Number:', `${report.incidentOB}`]
            ]
          }
        },


        { text: 'Incident Information', style: 'header1' },

        {
          style: 'tableExample',
          table: {
            widths: [115, 115, 115, 115],
            body: [
              ['Date of Incident:', `${report.incidentDate}`, 'Time of Incident: ', `${report.incidentTime}`],
              ['Type of Incident:', `${report.type}`, 'Site Name:', `${report.siteName}`],
              ['Guard Location During Incident:', `${report.guardLocation}`, '', '']

            ]
          }
        },

        {
          style: 'tableExample',
          table: {
            widths: [200, 200],
            body: [
              ['Alarm System', `${report.alarmSystem}`],
              ['Client Notified:', `${report.clientNotify}`],
              ['Number of Suspects:', `${report.suspectsNumber}`],
              ['Police Notified:', `${report.policeNotify}`],
              ['Panic Button Pressed:', `${report.panicButtonPressed}`],
              ['Crime Scene Cordoned Off:', `${report.crimeScene}`],
              ['Method of Discovery:', `${report.discoveryMethod}`],
              ['CCTV available:', `${report.cctv}`],
              ['What was taken:', `${report.taken}`],
              ['Any Injuries:', `${report.injuries}`],
              ['Point of Entry:', `${report.EntryPoint}`]
            ]
          }
        },

        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                supervisorSign,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Supervisor Signature',
                  alignment: 'center',
                },
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Supervisor Name: ${report.supervisorName}`,
                  alignment: 'center',
                },
                {}
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}



///// equipment-inventory function



exports.equipmentInventory = functions.firestore
  .document('/equipmentInventory/{uid}')
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      return checkSig(report).then(function () {
        return processER(report, companyLogo, color).then(function (docDefinition) {
          const file_name = `equipmentInventory/${report.key}.pdf`;
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Equipment Inventory';
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function processER(report, companyLogo, color) {

  const equipBody = [[{ text: 'Make', style: 'tableHeader' }, { text: 'Model', style: 'tableHeader' }, { text: 'Serial Number', style: 'tableHeader' }, { text: 'Tested with Control', style: 'tableHeader' }, { text: 'Mic Working', style: 'tableHeader' }]]
  // dynamic array table
  report.handRadio.forEach((element) => {
    equipBody.push([element.make, element.model, element.serial, element.controlWork, element.micWork]) // 100, 200, 300
  });


  return new Promise(function (resolve) {
    var docDefinition = {
      content: [
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'Weekly Equipment Inventory- Check List', style: 'header' },
        { text: `Site Name: ${report.siteName}`, style: 'header' },
        { text: `Date: ${report.date}` },

        { text: 'Base Radio', style: 'header1' },

        {
          style: 'tableExmple5',
          table: {
            widths: [90, 90, 90, 90, 90],
            body: [
              [{ text: 'Make', style: 'tableHeader' }, { text: 'Model', style: 'tableHeader' }, { text: 'Serial Number', style: 'tableHeader' }, { text: 'Tested with Control', style: 'tableHeader' }, { text: 'Mic Working', style: 'tableHeader' }],
              [`${report.baseRadio.make}`, `${report.baseRadio.model}`, `${report.baseRadio.serial}`, `${report.baseRadio.controlWork}`, `${report.baseRadio.micWork}`]
            ]
          },
        },
        { text: 'Hand-Held Radio', style: 'header1' },
        {
          style: 'tableExmple5',
          table: {
            widths: [90, 90, 90, 90, 90],
            body: equipBody
          },
        },
        { text: 'Panic Button', style: 'header1' },

        {
          style: 'tableExmple',
          table: {
            widths: [210, 210],
            body: [
              [`Total Panic Buttons on site:`, `${report.panicButtonTotal}`],
              [`Total Working:`, `${report.panicButtonWork}`],
              [`Total NOT Working:`, `${report.panicButtonNot}`],
              [`Tested and confirmed working with Control:`, `${report.panicButtonTest}`],
              [`OB Number:`, `${report.panicButtonOB}`],
            ]
          },
        },

        { text: `Was panics found in position of guards during inspection: ${report.panicInPosition}` },
        { text: `Remarks: ${report.panicInPositionRemark}` },

        { text: 'Cell Phone', style: 'header1' },
        {
          style: 'tableExmple',
          table: {
            widths: [210, 210],
            body: [
              [`Make/Model:`, `${report.phoneModel}`],
              [`Working:`, `${report.phoneWork}`],
              [`Charger Working:`, `${report.phoneCharge}`],
              [`Airtime & Data Available:`, `${report.airtime}`],
              [`Amount Available:`, `${report.airtimeAmount}`],
            ]
          },
        },

        { text: 'Torches', style: 'header1' },
        {
          style: 'tableExmple',
          table: {
            widths: [210, 210],
            body: [
              [`Type of Torches:`, `${report.torchType}`],
              [`Total Torches on Site:`, `${report.torchTotal}`],
              [`Total Torches Working:`, `${report.torchWork}`],
              [`Total Torches NOT Working:`, `${report.torchNot}`],
              [`Tested and confirmed working with Control:`, `${report.torchTest}`],
              [`Charger Working & Available:`, `${report.torchCharger}`],
            ]
          },
        },

        { text: `Pepper Spray:${report.pepperSpray}`, style: 'texx' },
        { text: `Handcuffs & Keys:${report.handCuff}`, style: 'texx' },
        { text: `Baton Sticks: ${report.baton}`, style: 'texx' },
        { text: `Umbrellas: ${report.umbrella}`, style: 'texx' },
        { text: `General Remarks: ${report.generalRemark}`, style: 'texx' },

        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                supervisorSign,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'SUPERVISOR SIGNATURE',
                  alignment: 'center',
                },
                {}
              ],
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          margin: [0, 5, 0, 15],
          widths: [250, 250]
        },
        tableExample5: {
          margin: [0, 5, 0, 15],
          widths: [100, 100, 100, 100, 100]
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },
        notes: {
          margin: [0, 20, 0, 20]
        },
        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        texx: {
          margin: [5, 5, 0, 5],

        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

///////////////
/////////////////////

// new function
// done tested, but check emp signiture
exports.appealForm = functions.firestore
  .document('/appealForms/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().appeal != undefined) { report.userEmail = report.userEmail + ';' + doc.data().appeal }

      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return appealForm(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `appeal-form/${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Appeal Form'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function appealForm(report, companyLogo, color) {  // change the name of the fuunction here
  let equipBody = []
  report.grounds.forEach((element) => {
    equipBody.push([element]) // 100, 200, 300
  });

  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        {
          style: 'tableExample',
          table: {
            widths: [115, 125, 100, 120],
            body: [
              ['Employee', `${report.employeeName}`, 'Date', `${report.date}`],
              ['Employee no', `${report.employeeNumber}`, 'position', `${report.employeePosition}`]
            ]
          }
        },

        { text: 'Grounds for Appeal', style: 'subheader' },

        {
          style: 'tableExample',
          table: {
            widths: [460],

            body: equipBody
          }
        },
        {
          style: 'tableExample',
          table: {
            widths: [460],

            body: [
              [{
                text: 'Details for Appeal:', style: 'subheader', alignment: 'center'
              }],

            ]
          }
        },


        {
          style: 'tableExample',
          table: {
            widths: [460],
            body: [
              [{ text: 'Date of disciplinary hearing:', bold: true }], [`${report.hearingDate}`],
              [{ text: 'Nature of disciplinary action taken: ', bold: true }], [`${report.actionTaken}`],
              [{ text: 'Give your reasons for lodging the appeal:', bold: true }], [`${report.reasons}`],
              [{ text: 'Relieve sought: ', bold: true }], [`${report.relieve}`],
            ]
          }
        },


        { text: 'Recieved by employeer', style: 'subheader' },


        {
          style: 'table3',
          table: {
            widths: [150, 150],
            body: [
              [
                manSig,
                witSig
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Supervisor Signature',
                  alignment: 'center',
                },
                {
                  border: [false, false, false, false],
                  text: 'Employee Signature',
                  alignment: 'center',
                },
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Supervisor Name: ${report.user}`,
                  alignment: 'center',
                },

                {
                  border: [false, false, false, false],
                  text: `Employee Name: ${report.employeeName}`,
                  alignment: 'center',
                },
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


/////////////////////

// new2 function
// tested working

exports.temperatureList = functions.firestore
  .document('/temperatureList/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().temperature != undefined) { report.userEmail = report.userEmail + ';' + doc.data().temperature }

      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return tempList(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Temperature-List/${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Temperature Report'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function tempList(report, companyLogo, color) {  // change the name of the fuunction here
  let equipBody = [[{ text: 'Comp #', bold: true }, { text: 'Site', bold: true }, { text: 'Temperatiure', bold: true }]]
  report.site.forEach((element) => {
    equipBody.push([element.compNumber, element.site, element.temp]) /// 100, 200, 300
  });

  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        {
          style: 'tableExample',
          table: {
            widths: [115, 300],
            body: [
              [{ text: 'Ops Area', bold: true }, `${report.area}`],
              [{ text: 'Supervisor', bold: true }, `${report.user}`],
              [{ text: 'Date', bold: true }, `${report.date}`]
            ]
          }
        },
        {
          style: 'tableExample',
          table: {
            widths: [115, 210, 90],
            body: equipBody
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


/////////////////////

// new function
// done testsed and needing a few edits
exports.performanceAppraisal = functions.firestore
  .document('/performanceAppraisal/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().performance != undefined) { report.userEmail = report.userEmail + ';' + doc.data().performance }

      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return perform(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Performance - Appraisal / ${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Performance Report'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function perform(report, companyLogo, color) {  // change the name of the fuunction here
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'Performance Appraisal Report', style: 'header' },

        {
          style: 'tableExample',
          table: {
            widths: [115, 115, 115, 115],
            body: [
              ['Employee Name:', `${report.employeeName}`, 'Company Number', `${report.companyNumber}`],
              ['Appraisal Date:', `${report.appraisalDate}`, 'Date Started:', `${report.dateStarted}`],
              ['Site:', `${report.site}`, 'Job Title:', `Security Guard`],
            ]
          }
        },



        {
          style: 'tableExample',
          table: {
            widths: [230, 230],
            body: [
              [{ text: 'Area', bold: true }, { text: `Performance`, bold: true }],
              [`1.	Access control: `, ``],
              [`1.1	Verification and authorisation of material removal pass`, `${report.acmaterial}`],
              [`1.2 	Verification and authorisation of visitors pass `, `${report.acvisitor}`],
              [`1.3	Verification and authorisation of declaration pass `, `${report.acdeclare}`],
              [`1.4	Verification and authorisation of patrol routes `, `${report.acpatrol}`],
              [`1.5	Verification and authorisation of vehicle audit after hours `, `${report.acvehicle}`],
              [`2.	Reporting: `, ``],
              [`2.1	Daily shift reporting`, `${report.report2}`],
              [`2.2	Incident reporting `, `${report.incident}`],
              [`2.3	Audit finding reporting `, `${report.audit}`],
              [`2.4	Non-conformance reporting `, `${report.conformance}`],
              [`2.5	Completion of handover documentation `, `${report.handover}`],
              [`3.	Patrolling `, `${report.patrolling}`],
              [`4.	Internal and client property audits participation `, `${report.participation}`],
              [`5.	Radio communication	 `, `${report.radio}`],
              [`6.	Documentation control / admin `, `${report.document}`],
              [`7.	Emergency procedures `, `${report.emergency}`],
              [`8.	Searching procedures `, `${report.search}`],
              [`9.	Arrest procedures  `, `${report.arrest}`],
              [`10.	Conflict management `, `${report.conflict}`],
              [`11.	Public relations `, `${report.relate}`],
              [`12.	Follow chain of command `, `${report.chain}`],
              [`13.	Ad hoc duties as per instructions `, `${report.duty}`],
              [`14. 	Adherence to Company Polices and Procedures `, `${report.policy}`],
              [`15.	Taking initiative `, `${report.initiative}`],
              [`16.	Self confidence `, `${report.confidence}`],
              [`17.	Willingness to work extended hours `, `${report.hours}`],
              [`18.	Willingness to cooperate `, `${report.cooperate}`],
              [`19.	Neatness `, `${report.neatness}`],
              [`20.	Compliance to shift rosters / attendance `, `${report.rosters}`],
              [`21.    Other `, `${report.other}`],

            ]
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: [460, 460],
            body: [
              [{ text: `Recommendation: \n `, bold: true, alignment: 'center' }], [` ${report.recommendation}`]
            ]
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [230, 230],
            body: [
              ['Performance acknowledgement:', `${report.approve}`],

            ]
          }
        },


        {
          style: 'table3',
          table: {
            widths: [150, 150, 150],
            body: [
              [
                supervisorSign,
                '',
                ''
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Manager Signature',
                  alignment: 'center',
                },
                {
                  border: [false, false, false, false],
                  text: 'HR Manager Signature',
                  alignment: 'center',
                },
                {
                  border: [false, false, false, false],
                  text: 'Employee Signature',
                  alignment: 'center',
                }
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `User Name: ${report.user}`,
                  alignment: 'center',
                },
                {
                  border: [false, false, false, false],
                  text: `HR Manager Name: `,
                  alignment: 'center',
                },
                {
                  border: [false, false, false, false],
                  text: `Employee Name: ${report.employeeName}`,
                  alignment: 'center',
                },
              ],

            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


/////////////////////

// new function
// works but needs double checking
exports.fenceInspection = functions.firestore
  .document('/fenceInspection/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().fence != undefined) { report.userEmail = report.userEmail + ';' + doc.data().fence }

      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return fenceIN(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Fence - Inspection / ${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Fence Report'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function fenceIN(report, companyLogo, color) {  // change the name of the fuunction here
  const equipBody = [[{ text: 'LACE/ZONE', bold: true }, { text: 'VOLTAGE', bold: true }, { text: 'KV READING', bold: true }]]
  // dynamic array table
  report.site.forEach((element) => {
    equipBody.push([element.site, element.voltage, element.kv]) // 100, 200, 300
  });
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },


        { text: 'FENCE INSPECTION', style: 'header' },

        {
          style: 'tableExample',
          table: {
            widths: [115, 115, 115, 115],
            body: [
              ['Inspection By:', `${report.by}`, 'Date', `${report.date}`],
              ['Start:', `${report.start}`, 'Finish:', `${report.finish}`],
              ['Ocurance Book Number:', `${report.book}`, 'Time:', `${report.time}`],
            ]
          }
        },

        {
          style: 'tableExample',
          table: {
            widths: [230, 115, 115],
            body: equipBody
          }
        },

        {
          style: 'tableExample',
          table: {
            widths: [230, 230],
            body: [
              [{ text: 'OBSERVATION & FEEDBACK', bold: true }, { text: 'COMMENT', bold: true }],
              ['Fence cleared from all vegetation', `${report.vegetation}`],
              ['Bobbins/ Insulators all in place and spaced correctly', `${report.bob}`],
              ['Strands/ wires tensioned correctly', `${report.wire}`],
              ['All fence brackets in place', `${report.brackets}`],
              ['All fence posts secured properly', `${report.posts}`],
              ['Siren working', `${report.siren}`],
              ['Energizer box locked', `${report.energizer}`],
              ['Three earth spikes around energizer boxes', `${report.spikes}`],
              ['Earth spikes every 30 meters from energizer box', `${report.thirtymeter}`],
              ['Condition of danger signs', `${report.danger}`],
              ['Danger signs displayed every 10 meters', `${report.tenmeter}`],
              ['Fence signal transmitted to armed reaction', `${report.signal}`],
              ['South Fence signal transmitted to armed reaction', `${report.south}`],
              ['Fence signal transmitted to guard room on Mimic Base', `${report.mimic}`],

            ]
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 150],
            body: [
              [
                sigUser,
                ''
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Supervisor Signature',
                  alignment: 'center',
                },
                ''
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Supervisor Name: ${report.user}`,
                  alignment: 'center',
                }, ''
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },


      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


/////////////////////

// new function
// add signature for

exports.grieve = functions.firestore
  .document('/grievance/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().grievance != undefined) { report.userEmail = report.userEmail + ';' + doc.data().grievance }
      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return grieve(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Grieve - report / ${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Grieve Report'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function grieve(report, companyLogo, color) {  // change the name of the fuunction here
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'Stage 1: LODGMENT OF A GRIEVANCE', style: 'header' },

        {
          style: 'tableExample',
          table: {
            widths: [115, 115, 115, 115],
            body: [
              ['Employee Name:', `${report.employeeName}`, 'Manager’s Name: ', `${report.managerName}`],
              ['Employee Position:', `${report.employeePosition}`, 'Manager’s Position:', `${report.managerPosition}`],
              ['Employee Number:', `${report.employeeNumber}`, '', ''],
              ['Company / Site:', `${report.site}`, 'Date:', `${report.date}`]

            ]
          }
        },

        {
          style: 'tableExample',
          table: {
            widths: [115, 345],
            body: [
              ['DATE OF GRIEVANCE: ', `${report.date}`],
              ['NATURE OF GRIEVANCE:', `${report.grievanceNature}`],
              ['SETTLEMENT DESIRED:', `${report.settlement}`],
            ]
          }
        },
        {
          style: 'tableExample',
          table: {
            body: [
              [`DO YOU REQUIRE AN INTERPRETER?: ${report.interpreter}`],
              [`NAME OF REPRESENTATIVE (IF REQUIRED; LIMITED TO A FELLOW EMPLOYEE): ${report.rep}`],
              [`DESIGNATION: ${report.designation}`],

            ]
          }
        },

        {
          style: 'table3',
          table: {
            widths: [150, 50, 150],
            body: [
              [
                manSig, '',
                empSig
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Supervisor Signature',
                  alignment: 'center',
                }, '',
                {
                  border: [false, false, false, false],
                  text: 'Employee Signature',
                  alignment: 'center',
                }
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Supervisor Name: ${report.user}`,
                  alignment: 'center',
                }, ' ',
                {
                  border: [false, false, false, false],
                  text: `Employee Name: ${report.employeeName}`,
                  alignment: 'center',
                }
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


//   /////////////////////

// // new function

exports.poly = functions.firestore
  .document('/polygraph/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().polygraph != undefined) { report.userEmail = report.userEmail + ';' + doc.data().polygraph }

      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return polyG(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Polygraph - Form / ${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Polygraph Form'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function polyG(report, companyLogo, color) {  // change the name of the fuunction here
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'NOTICE TO ATTEND A POLYGRAPH TEST', style: 'header' },

        {
          style: 'tableExample',
          table: {
            widths: [115, 345],
            body: [
              ['EMPLOYEE NAME:', `${report.employeeName}`],
              ['DATE:', `${report.date}`]
            ]
          }
        },


        {
          text: [`You are hereby informed that a polygraph test is going to be conducted on `, { text: `${report.polydate}`, bold: true }, ` at `, { text: `${report.polytime}`, bold: true }, `. You are required to attend and have a polygraph test conducted on yourself at EBS Security Admin Head Office, 1040 Clifton Court, Clifton Avenue, Lyttelton.
                Please report at least 30 minutes prior to the time scheduled for the test to be conducted.
                `]
        },

        {
          text: [`I, `, { text: `${report.employeeName}`, bold: true }, ` hereby confirm that I have read and understand that I have to attend a polygraph test on `, { text: `${report.polydate}`, bold: true }, ` at `, { text: `${report.polytime}`, bold: true }, `.
                Signed at `, { text: `${report.place}`, bold: true }, ` on `, { text: `${report.date}`, bold: true }, `.
                `]
        },

        {
          style: 'table3',
          table: {
            widths: [150, 150, 150],
            body: [
              [
                supervisorSign,
                witSig,
                empSig
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Supervisor Signature',
                  alignment: 'center',
                },
                {
                  border: [false, false, false, false],
                  text: 'Witness Signature',
                  alignment: 'center',
                },
                {
                  border: [false, false, false, false],
                  text: 'Employee Signature',
                  alignment: 'center',
                }
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Supervisor Name: ${report.supername}`,
                  alignment: 'center',
                },
                {
                  border: [false, false, false, false],
                  text: `Witness Name: ${report.witnessname}`,
                  alignment: 'center',
                },
                {
                  border: [false, false, false, false],
                  text: `Employee Name: ${report.employeeName}`,
                  alignment: 'center',
                }
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


//////////////////////

// // new function
// done ......
exports.pay = functions.firestore
  .document('/payQuery/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().payquery !== undefined) { report.userEmail = report.userEmail + ';' + doc.data().payquery }

      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return payQ(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Pay Query - Form / ${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Pay Query Form'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function payQ(report, companyLogo, color) {  // change the name of the fuunction here
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'Pay Query Form', style: 'header' },
        { text: '  ALL PAY QUERIES MUST BE SUBMITTED TO AREA SUPERVISORS OR  MANAGERS BY THE 7TH OF EACH MONTH. ALL RECTIFICATIONS WILL BE DEPOSITED ON THE FOLLOWING PAY CYCLE.' },

        {
          style: 'tableExample',
          table: {
            widths: [115, 345],
            body: [
              ['Name & Surname:', `${report.employeeName}`],
              ['Company Number', `${report.companyNumber}`],
              ['Site Posted', `${report.site}`]
            ]
          }
        },
        { text: 'Particulars of Query ', style: 'header' },

        {
          style: 'tableExample',
          table: {
            widths: [460],
            body: [
              [`${report.reason}`,],

            ]
          }
        },

        {
          style: 'tableExample',
          table: {
            widths: [230, 230],
            body: [
              [`Date submitted: ${report.date}`, `Submitted to: ${report.supervisorName}`],

            ]
          }
        },
        {
          style: 'tableExample',
          table: {
            widths: [230],
            body: [
              [empSig],
              [{ text: `Employee Signature: ${report.employeeName}`, alignment: 'center' }],


            ]
          }
        },



        { text: 'For office use only ', style: 'header' },
        {
          style: 'tableExample',
          table: {
            widths: [460],
            body: [
              ['Date Received at Head Office:'], ['Name of Manager:'],


            ]
          }
        },
        {
          style: 'tableExample',
          table: {
            widths: [460],
            heights: [150, 20],
            body: [
              ['Feedback on Query:'], ['(Please include supporting documentation)']

            ]
          }
        },


        {
          style: 'tableExample',
          table: {
            heights: [20, 20, 20, 50, 20],

            widths: [230, 230],
            body: [
              ['Date Resolved', ` `],
              ['Amount to be paid', ''],
              ['Checked by HR Manager', 'Approved by Managing Director'],
              [
                '',
                ''
              ],
              [
                {
                  text: 'HR Manager Signature'
                },
                {
                  text: 'Managing Director Signature'
                }
              ]

            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


//   /////////////////////

// // new function
// firerereport
exports.injury = functions.firestore
  .document('/injury/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().injury != undefined) { report.userEmail = report.userEmail + ';' + doc.data().injury }

      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return injuryR(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Injury - report / ${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Injury Report'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function injuryR(report, companyLogo, color) {  // change the name of the fuunction here
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'INJURY / CASUALTY', style: 'header' },

        {
          style: 'tableExample',
          table: {
            widths: [115, 345],
            body: [
              ['CASUALTIES AT:', `${report.at}`],
              ['AS A RESULT OF', `${report.result}`],
              ['REPORTED ON :', `${report.report2}`],
              ['FROM:', `${report.from}`],
              ['DATE OF REPORT:', `${report.date}`],
            ]
          }
        },

        {
          style: 'tableExample',
          table: {
            widths: [115, 60, 285],
            body: [
              ['Notified Ambulance Service:', `${report.ambulancetime}`, `${report.ambulance}`],
              ['Activated first aid team (specify):', `${report.aidtime}`, `${report.aid}`],
              ['Alerted Tenants in area:', `${report.tenanttime}`, `${report.tenant}`],
              ['Established casualty section, Specify where :', `${report.esttime}`, `${report.est}`],
              ['Nearest Provincial Hospital Notified:', `${report.hospitaltime}`, `${report.hospital}`],
              ['Number of casualties evacuated:', `${report.casualtiestime}`, `${report.casualties}`],
              ['Next of kin notified:', `${report.kintime}`, `${report.kin}`],
              ['Any other items (specify):', `${report.othertime}`, `${report.other}`],

            ]
          }
        },

        {
          style: 'tableExample',
          table: {
            widths: [460],
            body: [
              [{ text: `ADDITIONAL INFORMATION: `, bold: true }],
              [`${report.add}`],

            ]
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                supervisorSign,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Signature',
                  alignment: 'center',
                },
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Compiled by: ${report.compile}`,
                  alignment: 'center',
                },
                {}
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


//   /////////////////////

// // new function

exports.firerereport = functions.firestore
  .document('/fire/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;

      if (doc.data().fire != undefined) { report.userEmail = report.userEmail + ';' + doc.data().fire }
      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return fireR(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Fire - report / ${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Fire Report'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function fireR(report, companyLogo, color) {  // change the name of the fuunction here
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'FIRE SITUATIONS', style: 'header' },

        {
          style: 'tableExample',
          table: {
            widths: [115, 345],
            body: [
              ['FIRE AT:', `${report.at}`],
              ['REPORTED ON', `${report.reporttime}, ${report.report}`],
              ['REPORTED BY :', `${report.by}`],
              ['FROM:', `${report.from}`],
            ]
          }
        },



        {
          style: 'tableExample',
          table: {
            widths: [115, 60, 285],
            body: [
              ['Notify Fire Department:', `${report.firetime}`, `${report.fire}`],
              ['Alerted Tenants in area:', `${report.tenanttime}`, `${report.tenant}`],
              ['Affected Area Specify where:', `${report.affectedtime}`, `${report.affected}`],
              ['Floor(s) Above:', `${report.floorabovetime}`, `${report.floorabove}`],
              ['Floor(s) Below:', `${report.floorbelowtime}`, `${report.floorbelow}`],
              ['Evacuated affected floor area:', `${report.evacuatedtime}`, `${report.evacuated}`],
              ['If necessary, evacuated lower:', `${report.lowtime}`, `${report.low}`],
              ['If necessary, evacuated higher floor (s):', `${report.hightime}`, `${report.high}`],
              ['If necessary instituted emergency shutdown:', `${report.shutdowntime}`, `${report.shutdown}`],
              ['Emergency shutdown completed:', `${report.completetime}`, `${report.complete}`],
              ['Any other items (specify):', `${report.othertime}`, `${report.other}`],

            ]
          }
        },

        {
          style: 'tableExample',
          table: {
            widths: [460],
            body: [
              [{ text: `ADDITIONAL INFORMATION: `, bold: true }],
              [`${report.add}`],

            ]
          }
        },

        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                supervisorSign,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Signature',
                  alignment: 'center',
                },
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Compiled by: ${report.user}`,
                  alignment: 'center',
                },
                {}
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


//   /////////////////////

// // new function

exports.explosion = functions.firestore
  .document('/explosion/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().gas != undefined) { report.userEmail = report.userEmail + ';' + doc.data().gas }

      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return explosionR(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Explosion - report / ${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Explosion Report'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function explosionR(report, companyLogo, color) {  // change the name of the fuunction here
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'Gas Explosion', style: 'header' },

        {
          style: 'tableExample',
          table: {
            widths: [115, 345],
            body: [
              ['REPORTED AT :', `${report.at}`],
              ['REPORTED ON', `${report.report}`],
              ['REPORTED BY :', `${report.by}`],
              ['FROM:', `${report.from}`],
              ['CAUSE OF EXPLOSION KNOWN?:', `${report.cause}`],
            ]
          }
        },



        {
          style: 'tableExample',
          table: {
            widths: [115, 60, 285],
            body: [
              ['SAP Notified:', `${report.saptime}`, `${report.sap}`],
              ['Fire Brigade notified:', `${report.brigadetime}`, `${report.brigade}`],
              ['Alerted Tenants in area:', `${report.tenanttime}`, `${report.tenant}`],
              ['Areas Evacuated:', `${report.areatime}`, `${report.area}`],
              ['Emergency shutdown instituted:', `${report.shutdowntime}`, `${report.shutdown}`],
              ['Emergency shutdown completed:', `${report.institutedtime}`, `${report.instituted}`],
              ['Any other items (specify):', `${report.othertime}`, `${report.other}`],

            ]
          }
        },

        {
          style: 'tableExample',
          table: {
            widths: [460],
            body: [
              [{ text: `ADDITIONAL INFORMATION: `, bold: true }],
              [`${report.add}`]
            ]
          }
        },


        {
          style: 'table3',
          table: {
            widths: [150, 1],
            body: [
              [
                supervisorSign,
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Signature',
                  alignment: 'center',
                },
                {}
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Compiled by: ${report.user}`,
                  alignment: 'center',
                },
                {}
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

//   /////////////////////

// // new function

exports.resignation = functions.firestore
  .document('/resign/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().resignate != undefined) { report.userEmail = report.userEmail + ';' + doc.data().resignate }

      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return resignationF(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Resignation / ${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Resignation'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function resignationF(report, companyLogo, color) {  // change the name of the fuunction here
  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },
        { text: 'Voluntary Resignation Letter', style: 'header' },
        { text: `Date: ${report.date}`, style: 'header' },


        {
          text: [`I, `, { text: `${report.employeeName}`, bold: true }, ` with company number:  `, { text: `${report.companyNumber}`, bold: true }, ` herewith notify you that I am resigning from my position as (Position held in company) `, { text: `${report.position}`, bold: true }, ` at (Site name) `, { text: `${report.site}`, bold: true }, `.
                  My last day of employment will be `, { text: `${report.last}`, bold: true }, `.
                  `]
        },
        {
          text: `I appreciate the opportunities I have been given during my time with your company, as well as your professional guidance and support.
                    I wish you and the company all the best of success in the future.
                    `
        }
        ,
        { text: `${report.notice}`, bold: true },

        { text: [`Thus resignation signed at `, { text: `${report.place}`, bold: true }, ` on `, { text: `${report.date}`, bold: true },] }

        ,
        {
          style: 'table3',
          table: {
            widths: [150],
            body: [
              [
                empSig
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Employee Signature',
                  alignment: 'center',
                }
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Employee Name: ${report.employeeName}`,
                  alignment: 'center',
                }
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
        { text: [`Thus accept and signed at `, { text: `${report.place}`, bold: true }, ` on `, { text: `${report.date}`, bold: true }] },
        {
          style: 'table3',
          table: {
            widths: [150],
            body: [
              [
                supervisorSign
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Supervisor Signature',
                  alignment: 'center',
                }
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Supervisor Name: ${report.user}`,
                  alignment: 'center',
                }
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },

      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


exports.extinguisher = functions.firestore
  .document('/extinguisher/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().extinguisher != undefined) { report.userEmail = report.userEmail + ';' + doc.data().extinguisher }

      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return extinguisherR(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Fire-Extinguisher-Checklist/${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Fire-Extinguisher-Checklist'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function extinguisherR(report, companyLogo, color) {  // change the name of the fuunction here
  let equipBody = [[{ text: 'LOCATION', bold: true }, { text: 'FIRE EXT. NO.', bold: true }, { text: 'COMMENTS', bold: true }, { text: 'HOSE REEL NO.', bold: true }, { text: 'COMMENTS', bold: true }, { text: 'FIRE BOX NO.', bold: true }, { text: 'COMMENTS', bold: true }]]
  report.site.forEach((element) => {
    equipBody.push([element.location, element.fireNum, element.fireComm, element.hoseNum, element.hoseComm, element.boxNum, element.boxComm]) /// 100, 200, 300
  });

  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },

        { text: 'FIRE EXTINGUISHER & HOSE REEL CHECKLIST', style: `header` },
        // {text:'Check the following:'},
        // {text:'FIRE EXTINGUISHER & HOSE REEL CHECKLIST', style: `header`},

        {
          style: 'tableExample',
          table: {
            widths: [80, 380],
            body: [
              [{ text: `Date: ` }, `${report.date}`,],
              [{ text: `User: ` }, `${report.by}`,
              ],

              [{ text: `Company No. :` }, ` ${report.compnum}`,
              ]
            ]
          }
        },


        {
          style: 'tableExample',
          table: {
            widths: [70, 55, 70, 60, 75, 60, 75],
            body: equipBody
          }
        },
        {
          style: 'table3',
          table: {
            widths: [150],
            body: [
              [
                supervisorSign
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Supervisor Signature',
                  alignment: 'center',
                }
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Supervisor Name: ${report.user}`,
                  alignment: 'center',
                }
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}


exports.theftForm = functions.firestore
  .document('/theft/{uid}') /// change here
  .onWrite((change) => {
    const report = change.after.data();
    return admin.firestore().collection('companies').doc(report.companyId).get().then(doc => {  // make sure there is companyid
      const companyLogo = doc.data().base64;
      const color = doc.data().color;
      if (doc.data().theft != undefined) { report.userEmail = report.userEmail + ';' + doc.data().theft }
      return checkSig(report).then(function () { // ADD THE SIGNITURES
        return theft(report, companyLogo, color).then(function (docDefinition) { // THE SPECIFIC FUNVTION
          const file_name = `Theft-form/${report.key}.pdf`; // CHANGE name here
          return createPDF(docDefinition, file_name).then(function (file_name) {
            const st = new Storage();
            const buck = st.bucket(BUCKET);
            return buck.file(file_name).download()
              .then(data => {
                const myPdf = data[0];
                const type = 'Theft Form'; // change name here
                return sendPdfEmail(myPdf, report, type)
              }).catch(function (error) {
                return console.error("Failed!" + error);
              })
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
        }).catch(function (error) {
          return console.error("Failed!" + error);
        })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    }).catch(function (error) {
      return console.error("Failed!" + error);
    })
  })

function theft(report, companyLogo, color) {  // change the name of the fuunction here


  return new Promise(function (resolve) {
    var docDefinition = {
      content: [ // add the content here of pdf
        {
          image: companyLogo,
          width: 300,
          alignment: 'center'
        },

        { text: 'THEFT REPORT', style: 'header' },

        {
          style: 'tableExample',
          table: {
            widths: [150, 310],
            body: [
              [{ text: `DATE: `, bold: true }, `${report.date}`],
              [{ text: `FULL NAME:`, bold: true }, ` ${report.full}`],
              [{ text: `HOME ADDRESS: `, bold: true }, ` ${report.add}`
              ], [{ text: `CONTACT TEL. NO: `, bold: true }, ` ${report.cell}`
              ], [{ text: `OB NUMBER: `, bold: true }, ` ${report.ob}`
              ],


            ]
          }
        },
        {
          style: 'tableExample',
          table: {
            widths: [460],
            body: [

              [{ text: `FULL DISCRIPTION OF THE INCIDENT: `, bold: true }], [` ${report.description}`
              ],
              [{ text: `DETAILED DESCRIPTION OF THE LOCATION WHEN THE INCIDENT OCCURRED:  `, bold: true }], [`${report.location}`
              ],
              [{ text: `DETAILED DESCRIPTION OF THE SUSPECT: `, bold: true }], [` ${report.suspect}`
              ],
              [{ text: `DESCRIPTION OF THE ARREST, IF APPLICABLE: `, bold: true }], [` ${report.arrest}`
              ],
              [{ text: `DESCRIPTION OF THE VALUE OF THE ITEMS TAKEN: `, bold: true }], [` ${report.value}`
              ],
              [{ text: `OUTCOME OF THE EVENT: `, bold: true }], [` ${report.outcome}`
              ],
              [{ text: `DO YOU WISH TO LAY A CHARGE AGAINST THE SUPECT WITH THE SAP? IF YES, PLEASE PROVIDE THE DETAILS AND CASE NUMBER PROVIDED BY THE SAPS: `, bold: true }], [` ${report.cause}`],


            ]
          }
        },





        { text: `I FURTHER DECLARE THAT THIS STATEMENT IS TRUE TO THE BEST OF MY KNOWLEDGE AND BELIEVE THAT I HAVE MADE THIS STATEMENT KNOWING THAT, IF IT WERE TENDERED EVIDENCE, I WOULD BE LIABLE FOR PROSECUTION, IF I WILLFULLY STATED IN IT ANYTHING WHICH I KNEW TO BE FALSE, OR WHICH I DID NOT BELIEVE TO BE TRUE. I HAVE NO OBJECTION TO TAKING THE PRESCRIBED OATH. I CONSIDER THE PRESCRIBED OATH TO BE BINDING ON MY CONSCIENCE.` },

        {
          style: 'table3',
          table: {
            widths: [150, 150],
            body: [
              [
                empSig,
                sigUser
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Signature',
                  alignment: 'center',
                },
                {
                  border: [false, false, false, false],
                  text: 'User Signature',
                  alignment: 'center',
                },
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Name: ${report.full}`,
                  alignment: 'center',
                },

                {
                  border: [false, false, false, false],
                  text: `User Name: ${report.user}`,
                  alignment: 'center',
                },
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },


        {
          style: 'table3',
          table: {
            widths: [150, 150],
            body: [
              [
                witSig,
                sigOfficer
              ],
              [
                {
                  border: [false, false, false, false],
                  text: 'Witness Signature',
                  alignment: 'center',
                },
                {
                  border: [false, false, false, false],
                  text: 'SAPS Signature',
                  alignment: 'center',
                },
              ],
              [
                {
                  border: [false, false, false, false],
                  text: `Witness Name: ${report.witnessesName}`,
                  alignment: 'center',
                },

                {
                  border: [false, false, false, false],
                  text: `SAPS Name: ${report.sapsnom} `,
                  alignment: 'center',
                },
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        },

        { text: [`THE ABOVE WAS SIGNED AT `, { text: `${report.place}`, bold: true }, ` ON`, { text: ` ${report.date}`, bold: true }] },
      ],
      styles: {
        headLabel: {
          color: color,
          bold: true
        },
        tableExample: {
          alignment: 'left',
          margin: [0, 5, 0, 15],
          widths: [200, 200]

        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        header1: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 20]
        },

        subheader: {
          alignment: 'center',
          color: color,
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        table2: {
          fontSize: 10,
        },
        table3: {
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justiSfy'
      }
    }
    resolve(docDefinition);
  })
}

exports.newSalesMsg = functions.firestore
  .document(`/chats/{uid}/sales-messages/{uid2}`)
  .onCreate((snap) => {
    const newMsg = snap.data();
    if (newMsg.fromUser) {
      var data = newMsg;

      var config = {
        method: 'post',
        url: 'https://us-central1-innovative-thinking-support.cloudfunctions.net/SCSalesMsg',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      return axios(config)
        .then(function (response) {
          return functions.logger.info(response);
        })
        .catch(function (error) {
          return functions.logger.info('Error: ', error);
        });
    } else {
      return
    }
  });

exports.newSalesReply = functions.https.onRequest((req, res) => {
  var newMsg = req.body;
  var msg;
  return admin.firestore().collection(`chats/${req.body.userId}/sales-messages`).doc(newMsg.key).set(newMsg).then(() => {
    msg = JSON.stringify('Done');
    return res.send(msg);
  }).catch((error) => {
    msg = JSON.stringify('Error');
    return res.send(msg);
  })
})

exports.newSupportMsg = functions.firestore
  .document(`/chats/{uid}/messages/{uid2}`)
  .onCreate((snap) => {
    const newMsg = snap.data();
    if (newMsg.fromUser) {
      var data = newMsg;

      var config = {
        method: 'post',
        url: 'https://us-central1-innovative-thinking-support.cloudfunctions.net/SCSupportMsg',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      return axios(config)
        .then(function (response) {
          return functions.logger.info(response);
        })
        .catch(function (error) {
          return functions.logger.info('Error: ', error);
        });
    } else {
      return
    }
  });

exports.newSupportReply = functions.https.onRequest((req, res) => {
  var newMsg = req.body;
  var msg;
  return admin.firestore().collection(`chats/${req.body.userId}/messages`).doc(newMsg.key).set(newMsg).then(() => {
    msg = JSON.stringify('Done');
    return res.send(msg);
  }).catch((error) => {
    msg = JSON.stringify('Error');
    return res.send(msg);
  })
})

exports.readSalesMsg = functions.firestore
  .document(`/chats/{uid}/sales-messages/{uid2}`)
  .onUpdate((snap) => {
    const newMsg = snap.after.data();
    const oldMsg = snap.before.data();
    functions.logger.info(newMsg, oldMsg);
    if (oldMsg.read === false && newMsg.read === true) {
      console.log('Read Msg')
      var data = newMsg;

      var config = {
        method: 'post',
        url: 'https://us-central1-innovative-thinking-support.cloudfunctions.net/SCSalesMsgRead',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      return axios(config)
        .then(function (response) {
          return functions.logger.info(response);
        })
        .catch(function (error) {
          return functions.logger.info('Error: ', error);
        });
    } else {
      return
    }
  });

exports.readSupportMsg = functions.firestore
  .document(`/chats/{uid}/messages/{uid2}`)
  .onUpdate((snap) => {
    const newMsg = snap.after.data();
    const oldMsg = snap.before.data();
    functions.logger.info(newMsg, oldMsg);
    if (oldMsg.read === false && newMsg.read === true) {
      console.log('Read Msg')
      var data = newMsg;

      var config = {
        method: 'post',
        url: 'https://us-central1-innovative-thinking-support.cloudfunctions.net/SCSupportMsgRead',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      return axios(config)
        .then(function (response) {
          return functions.logger.info(response);
        })
        .catch(function (error) {
          return functions.logger.info('Error: ', error);
        });
    } else {
      return
    }
  });

exports.SupportMsgRead = functions.https.onRequest((req, res) => {
  var newMsg = req.body;
  var msg;
  return admin.firestore().collection(`chats/${req.body.userId}/messages`).doc(newMsg.key).update({ read: true }).then(() => {
    msg = JSON.stringify('Done');
    return res.send(msg);
  }).catch((error) => {
    msg = JSON.stringify('Error');
    return res.send(msg);
  })
})

exports.SalesMsgRead = functions.https.onRequest((req, res) => {
  var newMsg = req.body;
  var msg;
  return admin.firestore().collection(`chats/${req.body.userId}/sales-messages`).doc(newMsg.key).update({ read: true }).then(() => {
    msg = JSON.stringify('Done');
    return res.send(msg);
  }).catch((error) => {
    msg = JSON.stringify('Error');
    return res.send(msg);
  })
})

exports.newFormNotification = functions.firestore
  .document(`/newForms/{uid}`)
  .onCreate((snap) => {
    const form = snap.data();
    const mailOptions = {
      from: '"Security Control" <system@securitycontrol.co.za>',
      to: 'support@securitycontrol.co.za, lamu@innovativethinking.co.za, kathryn@innovativethinking.co.za',
      subject: 'SC: New Form Uploaded',
      text: `Good Day,\n\nAn Enterprise client has uploaded a new form.\n\nKindly,\nSecurity Control Team`,
    };
    return mailTransport.sendMail(mailOptions)
      .then(() => console.log(`Sent`))
      .catch(function (error) {
        return console.error("Failed!" + error);
      })
  });

exports.deleteAccountNotification = functions.firestore
  .document(`/deleteRequests/{uid}`)
  .onCreate((snap) => {
    const form = snap.data();
    const mailOptions = {
      from: '"Security Control" <system@securitycontrol.co.za>',
      to: 'support@securitycontrol.co.za, lamu@innovativethinking.co.za, kathryn@innovativethinking.co.za',
      subject: 'SC: Delete Account Request',
      text: `Good Day,\n\nA user has submitted a request to delete their account\n\nUser Key: ${form.user.key}\nUser Name: ${form.user.name}\nCompany Key: ${form.user.companyId}\nCompany Name: ${form.user.company}\n\nKindly,\nSecurity Control Team`,
    };
    return mailTransport.sendMail(mailOptions)
      .then(() => console.log(`Sent`))
      .catch(function (error) {
        return console.error("Failed!" + error);
      })
  });

exports.enterpriseInquiry = functions.firestore
  .document(`/enterpriseInquiry/{uid}`)
  .onCreate((snap) => {
    const form = snap.data();
    const mailOptions = {
      from: '"Security Control" <system@securitycontrol.co.za>',
      to: 'support@securitycontrol.co.za, lamu@innovativethinking.co.za, kathryn@innovativethinking.co.za',
      subject: 'SC: Enterprise Inquiry',
      text: `Good Day,\n\nA user has inquired about Enterprise access\n\nUser Name: ${form.user}\nUser Key: ${form.userId}\nUser Email: ${form.userEmail}\nCompany Name: ${form.company}\nCompany Key: ${form.companyId}\n\nKindly,\nSecurity Control Team`,
    };
    return mailTransport.sendMail(mailOptions)
      .then(() => console.log(`Sent`))
      .catch(function (error) {
        return console.error("Failed!" + error);
      })
  });

exports.validatePurchase = functions.https.onCall((data, context) => {
  var config = {
    method: 'post',
    url: 'https://validator.fovea.cc/v1/validate?appName=com.innovativethinking.adminforms&apiKey=561f8169-eec5-4a83-9f6a-556058eb3215',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };
  return makeCall(config).then(resp => {
    console.log(resp);
    return resp
  })
})

function makeCall(config) {
  return new Promise((resolve, reject) => {
    axios(config).then(function (response) {
      return resolve(response.data.ok);
    })
      .catch(function (error) {
        functions.logger.info('Error: ', error);
        return resolve(error);
      });
  })
}

exports.checkSubscriptions = functions.runWith(runtimeOpts).pubsub.schedule('0 12 * * *').timeZone('Africa/Johannesburg').onRun(() => {
  return admin.firestore().collection('subscriptions').get().then(subs => {
    return subs.forEach(sub => {
      // Check is day after sub
      var nextDate = moment(sub.data().date, 'YYYY/MM/DD').add(1, 'month').add(1, 'days').format('YYYY/MM/DD');
      var today = moment(new Date()).format('YYYY/MM/DD');
      if (today === nextDate) {
      // Check is app or paystack
      if (sub.data().type === 'App') {
        console.log('Do check app')
        checkAppVerify(sub.data()).then((msg) => {
          if (msg === 'Verified') {
            console.log('Still fine')
            // Update subscription date
            admin.firestore().collection('subscriptions').doc(sub.data().companyId).update({ date: today, number: sub.data().number + 1 });
            // Send monthly invoive pdf
            sendMonthlyInvoice(sub.data());
          } else {
            console.log('Removed premium')
            admin.firestore().collection('subscriptions').doc(sub.data().companyId).delete();
            admin.firestore().collection('companies').doc(sub.data().companyId).update({ access: false, accessType: '' });
            sendCancelEmail(sub.data());
          }
        })
      } else {
        console.log('Do check web')

      }
      } else {
        console.log('No check needed')
      }
    })
  })
})

function sendCancelEmail(subscription) {
  const mailOptions = {
    from: '"Security Control" <system@securitycontrol.co.za>',
    to: 'support@securitycontrol.co.za, lamu@innovativethinking.co.za, kathryn@innovativethinking.co.za',
    subject: 'SC: Cancelled Account',
    text: `Good Day,\n\nA user has cancelled their account\n\nUser: ${subscription.user.name}\nUser Key: ${subscription.user.key}\nCompany Key: ${subscription.user.companyId}\nCompany Name: ${subscription.user.company}\n\nKindly,\nSecurity Control Team`,
  };
  return mailTransport.sendMail(mailOptions)
    .then(() => console.log(`Cancel Email Sent`))
    .catch(function (error) {
      return console.error("Failed!" + error);
    })
}

function checkAppVerify(subscription) {
  return new Promise((resolve, reject) => {
    var transaction = subscription.transaction;
    if (transaction) {
      var data = JSON.stringify(transaction);
      var config = {
        method: 'post',
        url: 'https://validator.fovea.cc/v1/validate?appName=com.innovativethinking.adminforms&apiKey=561f8169-eec5-4a83-9f6a-556058eb3215',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };
      return makeCall(config).then(resp => {
        console.log('Resp: ', resp);
        var msg;
        if (resp === true) {
          msg = 'Verified';
        } else {
          console.log('Invalid')
          msg = 'Invalid';
        }
        return resolve(msg);
      })
    }
  })
}
exports.emailInspectionPDF = functions.https.onCall((data, context) => {
  let docDefinition = data.docDefinition;
  let report = data.newFormObj;
  let name = data.name;
  let key = name.key
  const file_name = `${name.toLowerCase().replace(/ /g, '-')}/${key}.pdf`;
  return createPDF(docDefinition, file_name).then((file_name1) => {
    const st = new Storage();
    const buck = st.bucket(BUCKET);
    return buck.file(file_name1).download()
      .then(data => {
        const myPdf = data[0];
        const type = name;
        return sendPdfEmail(myPdf, report, type).then((s) => {
        })
      }).catch(function (error) {
        return sendErrorEmail(error).then(() => {
          return console.error("Failed!" + error);
        }).catch((error) => {
          return console.error("Failed!" + error);
        })
      })
  }).catch(function (error) {
    return sendErrorEmail(error).then(() => {
      return console.error("Failed!" + error);
    }).catch((error) => {
      return console.error("Failed!" + error);
    })
  })
})
function sendErrorEmail(error) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: '"Security Control" <support@securitycontrol.co.za>',
      to: 'lamu@innovativethinking.co.za',
    };
    // Building Email message.
    mailOptions.subject = 'There seems to be a problem with emailInspectionPDF function';
    mailOptions.text = error;
    mailTransport.sendMail(mailOptions).then(() => {
      resolve('sent');
    })
  })
}
exports.updateClients = functions.https.onRequest((req, res) => {
  return admin.firestore().collection(`companies`).get().then(companies => {
    companies.forEach(comp => {
      // Excluse EBS, Thompsons and PSO
      if (comp.data().key === 'gC9ZUArZzn1rlIBRZHLv' || comp.data().key === '0qbfVjnyuKE8EAdenn3T' || comp.data().key === '59d35dc7-c772-f7c8-ab49-9e7fc716538b') {
        admin.firestore().collection('companies').doc(comp.data().key).update({
          access: true,
          accessType: 'Enterprise'
        })
      } else {
        admin.firestore().collection('companies').doc(comp.data().key).update({
          access: false,
          accessType: ''
        })
      }
    })
  }).catch((error) => {
    return console.log(error)
  })
})

function sendMonthlyInvoice(subscription) {
  return new Promise((resolve, reject) => {
    var invoiceNumber = '';
    if (subscription.number < 10) {
      invoiceNumber = 'SC' + subscription.companyId.substring(0, 4) + '00' + (subscription.number).toString();
    } else if (9 < subscription.number < 100) {
      invoiceNumber = 'SC' + subscription.companyId.substring(0, 4) + '0' + (subscription.number).toString();
    } else {
      invoiceNumber = 'SC' + subscription.companyId.substring(0, 4) + (subscription.number).toString();
    }
    console.log(invoiceNumber);
    return createInvoice(subscription, invoiceNumber).then(function (docDefinition) {
      const file_name = `Monthly_Invoice/${invoiceNumber}.pdf`;
      return createPDF(docDefinition, file_name).then(function (file_name) {
        const st = new Storage();
        const buck = st.bucket(BUCKET);
        return buck.file(file_name).download()
          .then(data => {
            const myPdf = data[0];
            return sendInvoiceEmail(myPdf, subscription, invoiceNumber)
          }).catch(function (error) {
            return console.error("Failed!" + error);
          })
      }).catch(function (error) {
        return console.error("Failed!" + error);
      })
    })
  })
}

function sendInvoiceEmail(myPdf, subscription, invoiceNumber) {
  const mailOptions = {
    from: '"Security Control" <system@securitycontrol.co.za>',
    to: 'kathryn@innovativethinking.co.za', // subscription.user.email
    subject: 'Security Control: Monthly Invoice',
    html: `Good Day,<br><br>Please find your monthly invoice attached.<br><br>Kindly,<br>Security Control Team`,
    //text: `Monthly invoice`,
    attachments: [{
      filename: `${invoiceNumber}.pdf`,
      content: myPdf,
      contentType: 'application/pdf'
    },
    ]
  };
  return mailTransport.sendMail(mailOptions)
    .then(() => console.log(`Invoice Sent`))
    .catch(function (error) {
      return console.error("Failed!" + error);
    })
}

function createInvoice(subscription, invoiceNumber) {
  return new Promise((resolve, reject) => {
    var today = moment(new Date()).format('DD/MM/YYYY');
    var price = subscription.transaction.priceMicros / 1000000;
    var amountExTax = (price * 0.85).toFixed(2);
    var amountTax = (price * 0.15).toFixed(2);

    var docDefinition = {
      content: [
        {
          style: 'section',
          table: {
            widths: ['100%'],
            body: [
              [{
                text: 'SECURITY CONTROL',
                fillColor: '#FF4343',
                color: '#000000',
                alignment: 'center'

              }],
            ]
          },
          layout: 'noBorders'
        },
        {
          image: 'data:image/jpeg;base64,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',
          height: 100,
          width: 75,
          alignment: 'center'
        },
        {
          text: 'Tax Invoice',
          width: 200,
          style: 'header',
          alignment: 'center'
        },

        {
          style: 'table',
          layout: 'noBorders',

          table: {
            widths: ['30%', '30%'],
            body: [

              [{ text: 'Billed To', style: 'headLabel' }, { text: subscription.user.name }],
              [{ text: 'Invoice Number', style: 'headLabel' }, { text: invoiceNumber }],
              [{ text: 'Date of Issue', style: 'headLabel' }, { text: today }],
            ]
          },
        },

        {
          layout: 'headerLineOnly',
          width: 400,
          style: 'table',
          table: {
            widths: ['35%', '25%', '15%', '25%'],

            body: [
              [{ text: 'Description', style: 'headLabel' }, { text: 'Rate', style: 'headLabel' },
              { text: 'Qty', style: 'headLabel' }, { text: 'Amount', style: 'headLabel' }],
              [{ text: subscription.transaction.title }, { text: `R${price} /month` },
              { text: '1' }, { text: `R${price}` }]
            ]
          },
        },
        {
          width: 400,
          style: 'table',

          table: {

            widths: ['34%', '43%', '25%'],
            body: [
              [{ border: [false, true, false, false], text: '', style: 'headLabel', }, { border: [false, true, false, false], text: 'Sub Total', style: 'headLabel' }, { border: [false, true, false, false], text: amountExTax }],
              [{ border: [false, false, false, false], text: '', style: 'headLabel', }, { border: [false, false, false, false], text: 'Tax', style: 'headLabel' }, { border: [false, false, false, false], text: amountTax }],
              [{ border: [false, false, false, false], text: '', style: 'headLabel', }, { border: [false, false, false, false], text: 'Total', style: 'headLabel' }, { border: [false, false, false, false], text: price }],
              [{ border: [false, false, false, false], text: '', style: 'headLabel', }, { border: [false, true, false, false], text: 'Balance Due (ZAR)', style: 'headLabel' }, { border: [false, true, false, false], text: price }],
            ]
          },
        },

        {
          text: 'Please ensure your subscription payment details are correct.\nPlease note that if your payment is not successful, your access will be restricted',
        },


      ],
      styles: {
        headLabel: {
          color: '#FF4343',
          bold: true
        },
        heading: {
          color: '#FF4343',
          bold: true,
          fontSize: 13,
        },
        headCost: {
          bold: true,
          fontSize: 14,
        },
        details: {
          alignment: 'right'
        },
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 20],
          width: '200px',
          fillColor: '#FF4343'
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        section: {
          margin: [0, 0, 0, 0]
        },
      },
    }
    resolve(docDefinition);
  })
}
