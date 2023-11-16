const client = require('@sendgrid/mail');
const {
    SENDGRID_API_KEY,
} = process.env;
const fs = require('fs')
const glob = require('glob')
const path = require('path')

// Load all pdf files


exports.handler = async function (event, context, callback) {
    const { recipient, name } = JSON.parse(event.body);
    client.setApiKey(SENDGRID_API_KEY);
    console.log(event)

    function forms2attachments () {
        var attachments : object[] = []
        glob.sync('./forms/**.pdf').forEach(file => {
            console.log(file)
            attachments.push(
                { 
                    content: fs.readFileSync(file).toString("base64"), 
                    filename: file.split('/').pop(),
                    type: 'application/pdf', 
                    disposition: 'attachment' 
                }
            )
        });
        return attachments
    }    
    
    const data = {
        from: 'info@physio-kids.com',
        replyTo: 'info@physio-kids.com',
        template_id: 'd-6ba6d50f1c564a8f8c6c17aba44039e7',
        personalizations: [{
            to: recipient,
            dynamic_template_data: {
                "firstName": name,
                "formLink": "https://form.jotform.com/232527821060045"
            },
            bcc: 'info@physio-kids.com'
        }],
        attachments: [
            forms2attachments()
        ]
    };
    console.log(data)
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