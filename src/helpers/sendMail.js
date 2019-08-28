import sgMail from '@sendgrid/mail'

const sendMail = (email, html) => {
    return new Promise((resolve, reject) => {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: email,
            from: 'challenge@turing.com',
            subject: 'Order Confirmation [ACTION REQUIRED]',
            html
        };
        try {
            sgMail.send(msg);
            console.log('sent to ' + email)
            resolve()
        }
        catch (e) {
            console.log(error)
            reject(e)
        }
    })
}

module.exports = sendMail