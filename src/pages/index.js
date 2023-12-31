import * as React from "react"
import SEOHead from "../components/head"
import { graphql } from "gatsby"
import * as ui from "../components/ui"
import { PaypalButton } from "../components/PaypalButton"
import axios from 'axios'


export default function Schedule(props) {
    const { contentfulSchedule } = props.data
    const [checkedList, setCheckedList] = React.useState([]);
    const [campers, setCampers] = React.useState(1);
    const [totalPrice, setTotalPrice] = React.useState(0)
    const priceRef = React.useRef(totalPrice)
    const camperRef = React.useRef(campers)
    const [dates] = React.useState({ today: new Date() })
    const [membershipSelected, setMembershipSelected] = React.useState(false);
    const membershipPrice = 6000

    React.useEffect(() => {
        priceRef.current = totalPrice
    }, [totalPrice])

    React.useEffect(() => {
        camperRef.current = campers
    }, [campers])

    React.useEffect(() => {

    }, [dates])

    const calcWeeklyDiscount = (numWeeks) => {
        let price;
        if (numWeeks <= 3) {
            price = 435
        }
        else if (4 <= numWeeks && numWeeks <= 8) {
            price = 425
        }
        else if (numWeeks >= 9) {
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

    const calcTotalPrice = (campers, numWeeks) => {
        if (numWeeks === 0) {
            return 0
        }
        let weeklyDiscount = calcWeeklyDiscount(numWeeks)
        console.log(campers, weeklyDiscount, numWeeks)
        switch (campers) {
            case 0:
            case '0':
                return 0;
            case 1:
            case '1':
                return weeklyDiscount * numWeeks * parseInt(campers)
            case '2':
                return Math.ceil(weeklyDiscount * .95) * numWeeks * parseInt(campers)
            default:
                return Math.ceil(weeklyDiscount * .90) * numWeeks * parseInt(campers)

        }
    }

    const handleSelect = (event) => {
        const value = event.target.name + ':' + event.target.value;
        const isChecked = event.target.checked;
        var selected_list
        if (isChecked) {
            //Add checked item into checkList
            selected_list = [...checkedList, value]
        } else {
            //Remove unchecked item from checkList
            selected_list = checkedList.filter((item) => item !== value);
            // Remove any pre/post care options
            document.getElementById(event.target.id + '-precare').checked = false
            document.getElementById(event.target.id + '-postcare').checked = false
        }
        selected_list.sort((a, b) => new Date(a.split(':')[1]) - new Date(b.split(':')[1]))
        setCheckedList([...selected_list]);

        let totalPrice = calcTotalPrice(campers, selected_list.length)
        setTotalPrice(totalPrice)
    };

    const handleChange = (event) => {
        if (membershipSelected) {
            setCampers(event.target.value)
            setTotalPrice(membershipPrice * event.target.value)
        }
        else {
            setCampers(event.target.value)
            var totalPrice = calcTotalPrice(event.target.value, checkedList.length)
            setTotalPrice(totalPrice)
        }
    }


    function createOrder(data, actions, err) {
        return actions.order.create({
            purchase_units: [
                {
                    amount: { value: priceRef.current },
                    payee: { email_address: "info@physiokids.com" }
                }
            ],
            application_context: {
                shipping_preference: 'NO_SHIPPING'
            }
        })
    }

    function onApprove(data, actions) {
        return actions.order.capture().then(function (details) {
            console.log(details.payer)
            axios.post(`${window.location.href}.netlify/functions/email`, {
                "recipient": details.payer.email_address,
                "name": details.payer.name.given_name
            }).then((response) => {
                console.log(response)
                window.location.replace(process.env.GATSBY_CONFIRM_REDIRECT)
            }).catch((err) => console.log(err))
            console.log(`Transaction completed by ${details.payer.name.given_name}!`)
        });
    }

    function onError(err) {
        console.log(err)
    }

    function onClick() {
        console.log("When clicked, amount was", priceRef.current);
    }

    function handleMembershipSelect() {
        // Disable other buttons 
        let toggle = !membershipSelected
        setMembershipSelected(toggle)
        // Set New Price
        if (toggle) {
            let totalPrice = membershipPrice * camperRef.current
            setTotalPrice(totalPrice)
        } else {
            setTotalPrice(0)
            setCheckedList([])
        }
    }

    function handlePrePostCare(ev) {
        let startDate = ev.target.id.split('-')[0]
        let careType = ev.target.id.split('-')[1]
        let price = (careType === "precare") ? 50 : 100
        let dateSelect = document.getElementById(startDate)
        if (!dateSelect.checked) {
            // Block selection if week is not set
            document.getElementById(ev.target.id).checked = false
            return
        }
        if (campers > 0) {
            if (ev.target.checked) {
                setTotalPrice(totalPrice + price)
            } else {
                setTotalPrice(totalPrice - price)
            }
        }
    }

    let environment = "";
    if (process.env.GATSBY_BRANCH) {
        if (process.env.GATSBY_BRANCH !== "main") {
            environment = `Running on ${process.env.GATSBY_BRANCH} with client_id ${process.env.GATSBY_PAYPAL_CLIENT_ID.substring(0, 8)}`
        }
    }
    else {
        environment = `Running on ${process.env.NODE_ENV} with client_id ${process.env.GATSBY_PAYPAL_CLIENT_ID.substring(0, 8)}`
    }

    return (
        <>
            <ui.Container width="fullbleed">
                {/* <FlexList>
                    {checkedList.map((item, index) => {
                        return (
                            <li key={item} className="chip-label">{index}: {item}</li>
                        );
                    })}
                </FlexList> */}
                <ui.Heading center={true}>{contentfulSchedule.name}</ui.Heading>
                {/* <ui.Flex variant="center" responsive={true}>
                    <button type="button" onClick={(e) => { dates.today = new Date() }}>Current Day</button>
                    <button type="button" onClick={(e) => { dates.today.setFullYear(2024, 0, 31) }}>Jan31</button>
                    <button type="button" onClick={(e) => {dates.today.setFullYear(2024, 4, 31)}}>May31</button>
                    <p>Todays date {dates.today.toDateString()}</p>
                </ui.Flex> */}
                <ui.Flex variant="center" responsive={true}>
                    <h1># of campers: </h1>
                    <input id="camperInput" type="number" defaultValue={1} min="1" onChange={handleChange} />
                </ui.Flex>
                <br />
                <ui.Box center={true} background="primary">
                    <br />
                    <ui.Heading>
                        Premium Founders Membership
                    </ui.Heading>
                    <ui.Container width="narrow">
                        <ui.Subhead>
                            ${membershipPrice} per camper
                        </ui.Subhead>
                        <ui.PillBox id="membership" value="Select Membership" handleSelect={handleMembershipSelect} />
                        <ui.Text>
                            Includes pre and post camp care, access to all weeks, and a private one hour consultation with Dr. Harnoor Singh
                        </ui.Text>
                    </ui.Container>
                    <br />
                </ui.Box>
                <br />
                {!membershipSelected &&
                    <ui.Flex variant="column">
                        <ui.Subhead>A La Carte: Choose Your Own Weeks</ui.Subhead>
                        {
                            contentfulSchedule.summerCampSessions.map(
                                (dates) => {
                                    return (<ui.Container key={dates.name}>
                                        <ui.WeeklyList name={dates.name} startDate={dates.startDate} endDate={dates.endDate} handleSelect={handleSelect} handlePrePostCare={handlePrePostCare} />
                                        <br style={{ clear: 'both' }} />
                                        <br style={{ clear: 'both' }} />

                                    </ui.Container>
                                    )
                                }
                            )
                        }
                    </ui.Flex>}
                <ui.Subhead center={true}>Total Price: ${totalPrice}
                </ui.Subhead>
                {(checkedList.length > 0 || membershipSelected) && totalPrice > 0 &&
                    <PaypalButton createOrder={createOrder} onApprove={onApprove} onClick={onClick} onError={onError} />}
            </ui.Container>
            <footer>
                <ui.Flex variant='center'>
                    {environment}
                </ui.Flex>
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