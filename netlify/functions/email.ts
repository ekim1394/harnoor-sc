const client = require('@sendgrid/mail');
const {
    SENDGRID_API_KEY,
    BCC_EMAIL,
    NODE_ENV
} = process.env;
const fs = require('fs')
const glob = require('glob')
const path = require('path')

// Load all pdf files


exports.handler = async function (event, context, callback) {
    console.log(event.body)
    const { recipient, name, camperCnt, membership, weeks } = JSON.parse(event.body);
    console.log(`Sending email to ${recipient},${BCC_EMAIL}`)
    client.setApiKey(SENDGRID_API_KEY);

    function forms2attachments() {
        var attachments: object[] = []
        glob.sync('./forms/**.pdf').forEach(file => {
            attachments.push(
                {
                    content: fs.readFileSync(file).toString("base64"),
                    filename: file.split('/').pop(),
                    type: 'application/pdf',
                    disposition: 'attachment'
                }
            )
        });
        return attachments;
    }

    if (NODE_ENV === 'development') {
        return {
            statusCode: 200, body: JSON.stringify({ msg: 'No email sent for development environment' })
        }
    }

    const data = {
        from: 'info@physio-kids.com',
        replyTo: 'info@physio-kids.com',
        template_id: 'd-6ba6d50f1c564a8f8c6c17aba44039e7',
        personalizations: [{
            to: recipient,
            dynamic_template_data: {
                "firstName": name,
                "formLink": "https://form.jotform.com/232527821060045",
                camperCnt,
                membership,
                weeks,
            },
            bcc: BCC_EMAIL
        }],
        attachments: forms2attachments()
    };
    try {
        await client.send(data);
        return {
            statusCode: 200,
            body: 'Message sent',
        };
    } catch (err) {
        console.log(err)
        return {
            statusCode: err.code,
            body: JSON.stringify({ msg: err }),
        };
    }
};