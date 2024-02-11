const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const serviceAccountKeyFile = 'google-api-credentials.json';
const sheetId = process.env.GOOGLE_SHEET_ID
const range = 'A:G'

const fs = require('fs');
const credentials = {
    type: 'service_account',
    project_id: 'physiokids',
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
};

fs.writeFileSync(
    serviceAccountKeyFile,
    JSON.stringify(credentials, null, 2)
);

async function _getGoogleSheetClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountKeyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    return google.sheets({
        version: 'v4',
        auth: authClient,
    });
}

async function _checkIfTabExists(googleSheetClient, sheetId, tabName) {
    const res = await googleSheetClient.spreadsheets.get({
        spreadsheetId: sheetId,
    });
    const sheet = res.data.sheets.find((sheet) => sheet.properties.title === tabName);
    if (!sheet) {
        await googleSheetClient.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: tabName,
                            },
                        },
                    },
                ],
            },
        });
        const res = await googleSheetClient.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: `${tabName}!A1`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                "majorDimension": "ROWS",
                "values": [["Camper Name", "Camper Age", "Parent Name", "Parent Email", "Parent Phone", "Precare", "Postcare"]]
            },
        });
        return res
    }
    return true
}

async function _writeGoogleSheet(googleSheetClient, sheetId, tabName, range, data) {
    return await googleSheetClient.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${tabName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            "majorDimension": "ROWS",
            "values": data
        },
    });
}

class RegistrationRow {
    camperName: string; // name of camper
    age: number; // age of camper
    parentName: string;
    parentEmail: string; // parent's email
    parentPhone: string; // parent's phone number
}

exports.handler = async function main(event, context, callback) {
    console.log(event.body)
    const { registration, createTabs } = JSON.parse(event.body)
    // Generating google sheet client
    const googleSheetClient = await _getGoogleSheetClient();
    let dataToBeInserted: any[] = [];
    registration.campers.forEach((camper) => {
        let row = new RegistrationRow
        row.camperName = camper.name
        row.age = camper.age
        row.parentName = registration.parentName
        row.parentEmail = registration.parentEmail
        row.parentPhone = registration.parentPhone
        dataToBeInserted.push(Object.values(row));
    });

    registration.weeks.forEach((week) => {
        let tabName = week.dates
        if (createTabs) {
            _checkIfTabExists(googleSheetClient, sheetId, tabName).then(() => {
            });
        } else {
            let dataRowCopy = JSON.parse(JSON.stringify(dataToBeInserted))
            dataRowCopy.forEach((row) => {
                row.push(week.precare)
                row.push(week.postcare)
            })
            _writeGoogleSheet(googleSheetClient, sheetId, tabName, range, dataRowCopy).then(() => { console.log(`Inserted ${dataRowCopy.length} rows for ${tabName}`) });
        }
    })

    return {
        "statusCode": 200, "body": `Rows inserted for campers ${JSON.stringify(registration.campers)}`
    }
}