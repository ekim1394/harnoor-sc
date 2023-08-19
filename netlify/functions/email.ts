const client = require('@sendgrid/mail');
const {
    SENDGRID_API_KEY,
} = process.env;

exports.handler = async function (event, context, callback) {
    const { recipient, name } = JSON.parse(event.body);
    client.setApiKey(SENDGRID_API_KEY);

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
};