const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const sheetId = process.env.GOOGLE_SHEET_ID
const range = 'A:G'

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

async function _getGoogleSheetClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: credentials,
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

async function _saveCamperInfoToSheet(event, googleSheetClient) {
    const { registration } = JSON.parse(event.body)
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

    try {
        for (const week of registration.weeks) {
            let tabName;
            if (process.env.NODE_ENV !== 'production') {
                tabName = 'test'
            } else {
                tabName = week.dates
                if (tabName === 'Jul 01 - Jul 05*') {
                    tabName = 'Jul 01 - Jul 05'
                }
            }
            let dataRowCopy = JSON.parse(JSON.stringify(dataToBeInserted))
            dataRowCopy.forEach((row) => {
                row.push(week.precare)
                row.push(week.postcare)
            })
            const res = await _writeGoogleSheet(googleSheetClient, sheetId, tabName, range, dataRowCopy)
            console.log(res.status)
            console.log(`Inserted ${dataRowCopy.length} rows for ${tabName}`);
        }
        return {
            statusCode: 200, body: JSON.stringify({ msg: 'Data inserted successfully' })
        }
    } catch (err) {
        console.error(err)
        return {
            statusCode: err.code,
            body: JSON.stringify({ msg: err }),
        };
    }
}

async function _validateDiscount(event, googleSheetClient) {
    const { code } = JSON.parse(event.body)
    let discount = 0;
    let today = new Date().getTime();
    try {
        const res = await googleSheetClient.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `Discounts!A2:D`,
        });
        const discounts = res.data.values;
        for (const discountRow of discounts) {
            const start = Date.parse(discountRow[2])
            const end = Date.parse(discountRow[3])
            if (discountRow[0] === code && today >= start && today < end) {
                console.log(`Discount code ${code} is valid for ${discountRow[1]}% off`)
                discount = discountRow[1]
                return {
                    statusCode: 200, body: JSON.stringify({ discount })
                }
            }
        }
        console.log('Discount code not found')
        return {
            statusCode: 404, body: JSON.stringify({ msg: 'Discount code not found', discount })
        }
    } catch (err) {
        console.error(err)
        return {
            statusCode: err.code,
            body: JSON.stringify({ msg: err }),
        };
    }

}

exports.handler = async function main(event, context, callback) {
    console.log(event.body)
    // Generating google sheet client
    const googleSheetClient = await _getGoogleSheetClient();
    const { type } = JSON.parse(event.body)

    switch (type) {
        case 'discount':
            return await _validateDiscount(event, googleSheetClient)
        case 'registration':
        default:
            return await _saveCamperInfoToSheet(event, googleSheetClient)
    }
}
