import * as React from "react"
import SEOHead from "../components/head"
import { graphql } from "gatsby"
import * as ui from "../components/ui"
import { PaypalButton } from "../components/PaypalButton"
import axios from "axios"

export default function Schedule(props) {
    const { contentfulSchedule } = props.data
    const [checkedList, setCheckedList] = React.useState([])

    // {startDate: {precare: true, postcare: true}}
    const [weeks, setWeeks] = React.useState([])
    const weeksRef = React.useRef()

    const [campers, setCampers] = React.useState(1)

    const [totalPrice, setTotalPrice] = React.useState(0)
    const priceRef = React.useRef()

    const [membershipSelected, setMembershipSelected] = React.useState(false)
    const membershipPrice = 6000

    const [dates] = React.useState({ today: new Date() })

    React.useEffect(() => {
        if (membershipSelected) {
            let totalPrice = membershipPrice * campers
            priceRef.current = totalPrice
            setTotalPrice(totalPrice)
        } else {
            let totalPrice = calcTotalPrice(weeks)
            priceRef.current = totalPrice
            setTotalPrice(totalPrice)
        }
    }, [membershipSelected, campers, weeks])

    React.useEffect(() => {
        // Reload page every hour
        setTimeout(function () {
            window.location.reload()
        }, 3600000)
    }, [])

    React.useEffect(() => {
        const selectedWeeks = []
        if (membershipSelected) {
            setWeeks([])
            return
        }
        checkedList.forEach(date => {
            const startDate = date.split(':')[1]
            const d = {
                dates: startDate,
                precare: checkSelectedCare(startDate, 'precare'),
                postcare: checkSelectedCare(startDate, 'postcare')
            }
            selectedWeeks.push(d)
        })
        weeksRef.current = selectedWeeks
        setWeeks(selectedWeeks)
    }, [membershipSelected, checkedList])

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

    const handleChange = (event) => {
        setCampers(event.target.value)
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
        if (process.env.GATSBY_BRANCH) {
            if (process.env.GATSBY_BRANCH === "main") {
                return false
            }
            return true
        }
        return true
    }

    function onApprove(data, actions) {
        return actions.order.capture().then(function (details) {
            const bccEmail = isDev()
                ? "simplyeugene94@gmail.com"
                : "info@physio-kids.com"
            console.log(weeksRef.current)
            axios
                .post(`${window.location.href}.netlify/functions/email`, {
                    recipient: details.payer.email_address,
                    name: details.payer.name.given_name,
                    bccEmail,
                    camperCnt: campers,
                    membership: membershipSelected,
                    weeks: weeksRef,
                })
                .then((response) => {
                    window.location.replace(process.env.GATSBY_CONFIRM_REDIRECT)
                })
                .catch((err) => console.error(err))
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
        const updatedWeek = weeks.find(x => x.dates === startDate)
        updatedWeek[careType] = ev.target.checked
        const updatedWeeks = weeks.map(week => {
            return week.dates === startDate ? updatedWeek : week
        })
        weeksRef.current = updatedWeeks
        setWeeks(updatedWeeks)
    }

    let environment = ""
    if (isDev()) {
        environment = `Running on ${process.env.NODE_ENV
            } with client_id ${process.env.GATSBY_PAYPAL_CLIENT_ID.substring(0, 8)}`
    }

    return (
        <>
            <ui.Container width="fullbleed">
                <ui.Heading center={true}>{contentfulSchedule.name}</ui.Heading>
                <ui.Flex variant="center" responsive={true}>
                    <h1># of campers: </h1>
                    <input
                        id="camperInput"
                        type="number"
                        defaultValue={1}
                        min="1"
                        onChange={handleChange}
                    />
                </ui.Flex>
                <br />
                <ui.Box center={true} background="primary">
                    <br />
                    <ui.Heading>Premium Founders Membership</ui.Heading>
                    <ui.Container width="narrow">
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
                    <br />
                </ui.Box>
                <br />
                {!membershipSelected && (
                    <ui.Flex variant="column">
                        <ui.Subhead>A La Carte: Choose Your Own Weeks</ui.Subhead>
                        {contentfulSchedule.summerCampSessions.map((dates) => {
                            return (
                                <ui.Container key={dates.name}>
                                    <ui.WeeklyList
                                        name={dates.name}
                                        startDate={dates.startDate}
                                        endDate={dates.endDate}
                                        handleSelect={handleSelect}
                                        handleCareType={handleCareType}
                                    />
                                    <br style={{ clear: "both" }} />
                                    <br style={{ clear: "both" }} />
                                </ui.Container>
                            )
                        })}
                    </ui.Flex>
                )}
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
            </ui.Container>
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
