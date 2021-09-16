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

const CONFIG_CLIENT_ID = '748137076693-2kb6mbas64tjv6vpogsk6t6tiuoo598b.apps.googleusercontent.com';
const CONFIG_CLIENT_SECRET = '27Hx3xP5cQWkiyIuMT54Rp0V';

const FUNCTIONS_REDIRECT = 'https://us-central1-security-control-app.cloudfunctions.net/oauthcallback';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new googleAuth();
const functionsOauthClient = new auth.OAuth2(CONFIG_CLIENT_ID, CONFIG_CLIENT_SECRET, FUNCTIONS_REDIRECT);

let oauthTokens = null;

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
        mailOptions.text = `Hi ${user.rep}!\n\nThank you for signing up on Security Control. Your 30 Day Free Trial is active. If you need any assistance in getting started, get in touch and we will gladly get you up and running.\n\nSincerely,\nSecurity Control Team`;

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
