const client = require('@sendgrid/mail');
const {
    SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL,
} = process.env;

exports.handler = async function (event, context, callback) {
    const { senderEmail, senderName } = JSON.parse(event.body);
    client.setApiKey(SENDGRID_API_KEY);

    const data = {
        from: SENDGRID_FROM_EMAIL,
        template_id: 'd-6ba6d50f1c564a8f8c6c17aba44039e7',
        personalizations: [{
            to: senderEmail,
            dynamic_template_data: {
                "firstName": senderName
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
            body: JSON.stringify({ msg: err.message }),
        };
    }
};