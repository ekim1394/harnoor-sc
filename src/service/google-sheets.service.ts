import axios from "axios";

class RegistrationRequest {
    registration: RegistrationInfo
}

class RegistrationInfo {
    campers: CamperInfo[]
    parentPhone: string;
    parentEmail: string;
    parentName: string;
    weeks: CamperSchedule[]

}

class CamperSchedule {
    dates: string;
    precare: boolean
    postcare: boolean
}
interface CamperInfo {
    name: string;
    age: number;
}

export function saveRowToSheets(camperInfo, payerDetails, weeks) {
    let req = new RegistrationRequest();
    const regInfo = new RegistrationInfo();
    regInfo.parentPhone = payerDetails.phone;
    regInfo.parentEmail = payerDetails.email_address;
    regInfo.parentName = `${payerDetails.name.given_name} ${payerDetails.name.surname}`
    regInfo.campers = []
    regInfo.weeks = []
    for (const [_, value] of Object.entries(camperInfo)) {
        const camper = value as CamperInfo; // Type assertion
        regInfo.campers.push(camper);
    }
    for (const [_, value] of Object.entries(weeks)) {
        regInfo.weeks.push(value as CamperSchedule)
    }
    req.registration = regInfo;
    axios.post('/.netlify/functions/drive',
        req
    ).catch((err) => console.error(err));

}