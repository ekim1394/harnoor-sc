const client = require('@sendgrid/mail');
const {
    SENDGRID_API_KEY,
} = process.env;

exports.handler = async function (event, context, callback) {
    const { recipient, name } = JSON.parse(event.body);
    client.setApiKey(SENDGRID_API_KEY);

    switch (event.httpMethod) {
        case 'POST':
            const data = {
                from: 'simplyeugene94@gmail.com',
                template_id: 'd-6ba6d50f1c564a8f8c6c17aba44039e7',
                personalizations: [{
                    to: recipient,
                    dynamic_template_data: {
                        "firstName": name
                    }
                }]
            };
            try {
                await client.send(data);
                return {
                    statusCode: 200,
                    body: 'Message sent',
                };
            } catch (err) {
                return {
                    statusCode: err.code,
                    body: JSON.stringify({ msg: err }),
                };
            }
        case 'OPTIONS':
            const headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST'
            };

            if (event.httpMethod !== 'POST') {
                // To enable CORS
                return {
                    statusCode: 200, // <-- Important!
                    headers,
                    body: 'This was not a POST request!'
                };
            }
    }
    return {
        statusCode: 500,
        body: 'Unsupported HTTP method requested'
    }
};