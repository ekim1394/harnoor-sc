import * as React from "react";
import { graphql } from "gatsby";
import { PaypalButton } from "../components/PaypalButton";
import CamperForm from '../components/camper-form';
import SEOHead from "../components/head";
import * as ui from "../components/ui";
import CamperSelect from "../components/camper-select";
import { GATSBY_BRANCH, GATSBY_CONFIRM_REDIRECT, GATSBY_PAYPAL_CLIENT_ID, NODE_ENV } from '../constants';
import { sendEmail } from "../service/sendgrid.service";
import { saveRowToSheets } from "../service/google-sheets.service";
import { createWeeks } from "../utils";

export default function Schedule(props) {
    const { contentfulSchedule } = props.data
    const [checkedList, setCheckedList] = React.useState([])

    // {startDate: {precare: true, postcare: true}}
    const [weeks, setWeeks] = React.useState([])
    const weeksRef = React.useRef()
    let allWeeks = []
    contentfulSchedule.summerCampSessions.map((dates) => {
        allWeeks = [...allWeeks, ...createWeeks(dates.startDate, dates.endDate)]
        return allWeeks
    })

    const [campersCnt, setCampersCnt] = React.useState(1)
    const [camperInfo, setCamperInfo] = React.useState({})

    const [totalPrice, setTotalPrice] = React.useState(0)
    const priceRef = React.useRef()

    const [membershipSelected, setMembershipSelected] = React.useState(false)
    const membershipPrice = 6000

    const [dates] = React.useState({ today: new Date() })

    // Calculate total price on page load
    React.useEffect(() => {
        if (membershipSelected) {
            let totalPrice = membershipPrice * campersCnt
            priceRef.current = totalPrice
            setTotalPrice(totalPrice)
        } else {
            let totalPrice = calcTotalPrice(weeks) * campersCnt
            priceRef.current = totalPrice
            setTotalPrice(totalPrice)
        }
    }, [membershipSelected, campersCnt, weeks])

    // Reload page every hour
    React.useEffect(() => {
        setTimeout(function () {
            window.location.reload()
        }, 3600000)
    }, [])

    // Keep track of selected weeks
    React.useEffect(() => {
        const selectedWeeks = []
        if (membershipSelected) {
            const weeks = []
            allWeeks.forEach((elem) => {
                const weekObj = {
                    dates: `${elem[0]} - ${elem[1]}`,
                    precare: true,
                    postcare: true
                }
                weeks.push(weekObj)
            })
            weeksRef.current = weeks
            setWeeks(weeks)
            return
        }
        checkedList.forEach(date => {
            const startDate = date.split(':')[1]
            const d = {
                dates: document.getElementById(`${startDate}-span`).innerHTML,
                precare: checkSelectedCare(startDate, 'precare'),
                postcare: checkSelectedCare(startDate, 'postcare')
            }
            selectedWeeks.push(d)
        })
        weeksRef.current = selectedWeeks
        setWeeks(selectedWeeks)
    }, [membershipSelected, checkedList])

    // Update camperInfo list based on camperCnt
    React.useEffect(() => {
        let numCampersInfo = Object.entries(camperInfo).length
        if (numCampersInfo > campersCnt) {
            for (let i = 0; i < (numCampersInfo - campersCnt); i++) {
                delete camperInfo[numCampersInfo - i - 1]
            }
        }
    }, [campersCnt, camperInfo])

    function checkSelectedCare(startDate, careType) {
        let careTypeSelect = document.getElementById(`${startDate}-${careType}`)
        if (careTypeSelect.checked) {
            return true
        }
        return false
    }

    const calcWeeklyPrice = (numWeeks) => {
        let price
        if (numWeeks <= 3) {
            price = 435
        } else if (4 <= numWeeks && numWeeks <= 8) {
            price = 425
        } else if (numWeeks >= 9) {
            price = 415
        }

        let nyJan = new Date().setFullYear(2024, 0, 30)
        let nyJun = new Date().setFullYear(2024, 4, 31)
        if (dates.today < nyJan) {
            return price
        }
        if (nyJan <= dates.today && dates.today < nyJun) {
            return price + 25
        }
        if (dates.today >= nyJun) {
            return 495
        }
    }

    const calcTotalPrice = (weeks) => {
        const weeklyPrice = calcWeeklyPrice(weeks.length)
        let totalPrice = 0
        weeks.forEach(week => {
            const precarePrice = week.precare ? 50 : 0
            const postcarePrice = week.postcare ? 100 : 0
            const price = weeklyPrice + precarePrice + postcarePrice
            if (week.dates === "Jul 01") {
                totalPrice += price * 0.4
            } else {
                totalPrice += price
            }
        })
        return totalPrice
    }

    const handleSelect = (event) => {
        const value = event.target.name + ":" + event.target.value
        const isChecked = event.target.checked
        var selected_list
        if (isChecked) {
            //Add checked item into checkList
            selected_list = [...checkedList, value]
        } else {
            //Remove unchecked item from checkList
            selected_list = checkedList.filter((item) => item !== value)
            // Remove any pre/post care options
            document.getElementById(event.target.id + "-precare").checked = false
            document.getElementById(event.target.id + "-postcare").checked = false
        }
        selected_list.sort(
            (a, b) => new Date(a.split(":")[1]) - new Date(b.split(":")[1])
        )
        setCheckedList([...selected_list])
    }

    function createOrder(data, actions, err) {
        return actions.order.create({
            purchase_units: [
                {
                    amount: { value: priceRef.current },
                },
            ],
            application_context: {
                shipping_preference: "NO_SHIPPING",
            },
        })
    }

    function isDev() {
        if (GATSBY_BRANCH) {
            if (GATSBY_BRANCH === "main") {
                return false
            }
            return true
        }
        return true
    }

    function onApprove(data, actions) {
        return actions.order.capture().then((details) => {
            // Send Email
            sendEmail(details, campersCnt, membershipSelected, weeksRef.current)
            saveRowToSheets(camperInfo, details.payer, weeksRef.current, membershipSelected, allWeeks)
            // Redirect to Thank You Page
            if (NODE_ENV !== "development") {
                window.location.replace(GATSBY_CONFIRM_REDIRECT);
            }
        })
    }

    function onError(err) {
        console.error(err)
    }

    function onClick() {
        console.debug("When clicked, amount was", totalPrice)
    }

    function handleMembershipSelect() {
        // Disable other buttons
        let toggle = !membershipSelected
        setMembershipSelected(toggle)
        // Set New Price
        if (!toggle) {
            setCheckedList([])
        }
    }

    function handleCareType(ev) {
        let startDate = ev.target.id.split("-")[0]
        let careType = ev.target.id.split("-")[1]
        let dateSelect = document.getElementById(startDate)
        if (!dateSelect.checked) {
            // Block selection if week is not set
            document.getElementById(ev.target.id).checked = false
            return
        }
        const updatedWeek = weeks.find(x => x.dates === document.getElementById(`${startDate}-span`).innerHTML)
        updatedWeek[careType] = ev.target.checked
        const updatedWeeks = weeks.map(week => {
            return week.dates === startDate ? updatedWeek : week
        })
        weeksRef.current = updatedWeeks
        setWeeks(updatedWeeks)
    }

    let environment = ""
    if (isDev()) {
        environment = `Running on ${NODE_ENV
            } with client_id ${GATSBY_PAYPAL_CLIENT_ID.substring(0, 8)}`
    }

    function handleCamperForm(index, name, age) {
        let camper = { name, age }
        let updatedCamperInfo = camperInfo
        updatedCamperInfo[index] = camper
        setCamperInfo(updatedCamperInfo)
    }

    return (
        <>
            <ui.Container width="narrow">
                <ui.Heading center={true}>{contentfulSchedule.name}</ui.Heading>
                <CamperSelect handleChange={(ev) => setCampersCnt(ev.target.value)} />
                <ui.Flex variant="center" responsive={true}>
                    <ui.Heading variant="h5">Please provide camper's name and age</ui.Heading>
                </ui.Flex>
                {Array.from({ length: campersCnt }).map((it, index) => {
                    return <CamperForm key={`camperInfo${index}`} index={index} handleChange={handleCamperForm} />
                })}
                <ui.Box center={true} background="primary" padding={3}>
                    <ui.Heading>Premium Founders Membership</ui.Heading>
                    <ui.Container>
                        <ui.Subhead>${membershipPrice} per camper</ui.Subhead>
                        <ui.PillBox
                            id="membership"
                            value="Select Membership"
                            handleSelect={handleMembershipSelect}
                        />
                        <ui.Text>
                            Includes pre and post camp care, access to all weeks, and a
                            private one hour consultation with Dr. Harnoor Singh
                        </ui.Text>
                    </ui.Container>
                </ui.Box>
                {!membershipSelected && (
                    <>
                        <ui.Text variant="subheadSmall" center>A La Carte: Choose Your Own Weeks</ui.Text>
                        <ui.Text variant="small" center>Precare 8-9AM $50</ui.Text>
                        <ui.Text variant="small" center>Postcare 3-5:30PM $100</ui.Text>
                        {contentfulSchedule.summerCampSessions.map((dates) => {
                            const sessionWeeks = createWeeks(dates.startDate, dates.endDate)
                            return (
                                <ui.Container key={dates.name}>
                                    <ui.WeeklyList
                                        name={dates.name}
                                        startDate={dates.startDate}
                                        endDate={dates.endDate}
                                        weeks={sessionWeeks}
                                        handleSelect={handleSelect}
                                        handleCareType={handleCareType}
                                    />
                                </ui.Container>
                            )
                        })}
                    </>
                )}
                <br style={{ clear: "both" }} />
                <ui.Subhead center={true}>Total Price: ${totalPrice}</ui.Subhead>
                {(checkedList.length > 0 || membershipSelected) && totalPrice > 0 && (
                    <PaypalButton
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onClick={onClick}
                        onError={onError}
                        amount={totalPrice}
                    />
                )}
            </ui.Container >
            <footer>
                <ui.Flex variant="center">{environment}</ui.Flex>
            </footer>
        </>
    )
}
export const Head = (props) => {
    const { contentfulSchedule } = props.data
    return <SEOHead {...contentfulSchedule} />
}

export const query = graphql`
  {
    contentfulSchedule {
      name
      summerCampSessions {
        name
        startDate
        endDate
      }
    }
  }
`
