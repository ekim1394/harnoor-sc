import axios from "axios";

export function sendEmail(details, campersCnt, membershipSelected, weeks) {
    axios
        .post(`${window.location.href}.netlify/functions/email`, {
            recipient: details.payer.email_address,
            name: `${details.payer.name.given_name} ${details.payer.name.surname}`,
            camperCnt: campersCnt,
            membership: membershipSelected,
            weeks: weeks,
        })
        .catch((err) => console.error(err))
}