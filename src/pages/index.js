import * as React from "react"
import SEOHead from "../components/head"
import { graphql } from "gatsby"
import * as ui from "../components/ui"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import axios from 'axios'


export default function Schedule(props) {
    const { contentfulSchedule } = props.data
    const [checkedList, setCheckedList] = React.useState([]);
    const [campers, setCampers] = React.useState(0);
    const [totalPrice, setTotalPrice] = React.useState(0)
    const priceRef = React.useRef(totalPrice)
    const camperRef = React.useRef(campers)
    const [dates, setDates] = React.useState({today: new Date()})
    
    React.useEffect(()=> {
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
        switch(campers) {
            case 0:
            case '0':
                return 0;
            case '1':
                return weeklyDiscount * numWeeks
            case '2':
                return Math.ceil(weeklyDiscount * .95) * numWeeks
            default:
                return Math.ceil(weeklyDiscount * .90) * numWeeks

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
        }
        selected_list.sort((a, b) => new Date(a.split(':')[1]) - new Date(b.split(':')[1]))
        setCheckedList([...selected_list]);

        let totalPrice = calcTotalPrice(campers, selected_list.length)
        setTotalPrice(totalPrice)
    };

    const handleChange = (event) => {
        setCampers(event.target.value)
        var totalPrice = calcTotalPrice(event.target.value, checkedList.length)
        setTotalPrice(totalPrice)
    }


    function createOrder(data, actions, err) {
        return actions.order.create({
            purchase_units: [
                { 
                    amount: { value: priceRef.current },
                    payee: { email_address: "sb-6wxdu26929620@business.example.com"}
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
            axios.post("https://physiokids.netlify.app/.netlify/functions/email", {
                "recipient": details.payer.email_address,
                "name": details.payer.name.given_name
            }).then((response) => {
                console.log(response)
            })
            console.log(`Transaction completed by ${details.payer.name.given_name}!`)
        });
    }

    function onError(err) {
        console.log(err)
    }

    function onClick() {
        console.log("When clicked, amount was", priceRef.current);
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
                    <input type="number" defaultValue={0} onChange={handleChange} />
                </ui.Flex>
                <ui.Flex variant="column">
                    {
                        contentfulSchedule.summerCampSessions.map(
                            (dates) => {
                                var startDateStr = new Date(dates.startDate).toString().substring(4, 10)
                                var endDateStr = new Date(dates.endDate).toString().substring(4, 10)
                                return (<ui.Container width='wide'>
                                    <ui.Subhead center={true}>{startDateStr} - {endDateStr}</ui.Subhead>
                                    <ui.WeeklyList name={dates.name} startDate={dates.startDate} endDate={dates.endDate} handleSelect={handleSelect} />
                                    <br style={{ clear: 'both' }} />
                                    <br style={{ clear: 'both' }} />

                                </ui.Container>
                                )
                            }
                        )
                    }
                </ui.Flex>
                <ui.Subhead center={true}>Total Price: ${totalPrice}
                </ui.Subhead>

                {checkedList.length > 0 && totalPrice > 0 &&
                    <ui.Flex variant='center'>
                        <PayPalScriptProvider options={
                            {
                                // TODO replace this with a call to functions to grab script
                                clientId: "AVqKStG6bLSMfYeSgas_wA4peglTsSOq4r_E867tXdRyvmvwEURSHJP6uCjsf2uzSbi0VAu_SOeUyX_y",
                                "enable-funding": "venmo",
                            }
                        }>
                            <PayPalButtons style={{ color: "blue", shape: "pill", disableMaxWidth: false }} className="paypalButton"
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                            onClick={onClick}/>
                        </PayPalScriptProvider>
                    </ui.Flex>}


            </ui.Container>
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