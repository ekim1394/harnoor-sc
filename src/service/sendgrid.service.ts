import axios from "axios";
import { GATSBY_CONFIRM_REDIRECT, BCC_EMAIL } from '../constants';

export function sendEmail(details, campersCnt, membershipSelected, weeks) {
    axios
        .post(`${window.location.href}.netlify/functions/email`, {
            recipient: details.payer.email_address,
            name: `${details.payer.name.given_name} ${details.payer.name.surname}`,
            BCC_EMAIL,
            camperCnt: campersCnt,
            membership: membershipSelected,
            weeks: weeks,
        })
        .catch((err) => console.error(err))
}