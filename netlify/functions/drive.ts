const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const serviceAccountKeyFile = 'google-api-credentials.json';
const sheetId = '1Rv-pxfeZdlZp68HMWISGRnXQm9UiGLk7rI2yOfvk7xY'
const tabName = process.env.GATSBY_BRANCH === 'main' ? 'Summer2024' : 'Test'
const range = 'A:P'

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

interface RegistrationRow {
    camperName: string; // name of camper
    age: number; // age of camper
    parentEmail: string; // parent's email
    parentPhone: string; // parent's phone number
    weeks: boolean[]; // array of weeks selected. 0th index is week 1, 1st index is week 2, etc.
}

exports.handler = async function main(event, context, callback) {
    const { registration } = JSON.parse(event.body)
    console.log(registration)
    // Generating google sheet client
    const googleSheetClient = await _getGoogleSheetClient();

    let dataToBeInserted: any[] = [];
    registration.forEach((row: RegistrationRow) => {
        let temp: any[] = [];
        temp.push(row.camperName);
        temp.push(row.age);
        temp.push(row.parentEmail);
        temp.push(row.parentPhone);
        temp = temp.concat(row.weeks);
        dataToBeInserted.push(temp);
    });

    let res = await _writeGoogleSheet(googleSheetClient, sheetId, tabName, range, dataToBeInserted);

    return {
        "statusCode": 200, "body": JSON.stringify(res.data)
    }
}