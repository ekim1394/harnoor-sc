import * as React from "react"
import SEOHead from "../components/head"
import { graphql } from "gatsby"
import * as ui from "../components/ui"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"



export default function Schedule(props) {
    const { contentfulSchedule } = props.data
    const [checkedList, setCheckedList] = React.useState([]);
    const [campers, setCampers] = React.useState(0);
    const [totalPrice, setTotalPrice] = React.useState(0)
    const weeklyPrice = 50

    const handleSelect = (event) => {
        console.log(event.target.checked)
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
        setTotalPrice(campers * selected_list.length * weeklyPrice)
    };

    const handleChange = (event) => {
        setCampers(event.target.value)
        setTotalPrice(event.target.value * checkedList.length * weeklyPrice)
    }

    function createOrder(data, actions, err) {
        return actions.order.create({
            purchase_units: [
                {amount: {value: totalPrice}}
            ],
            application_context: {
                shipping_preference: 'NO_SHIPPING'
            }
        })
    }

    function onApprove(data, actions) {
        // TODO Redirect and send email
        return actions.order.capture().then(function (details) {
            console.log(details.payer)
            console.log(`Transaction completed by ${details.payer.name.given_name}!`)
        });
    }

    function onError(err) {
        console.log(err)
    }

    function onClick() {
        console.log("When clicked, amount was", totalPrice);
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
                                clientId: "AfJI1B6OY9dOr4-tkGAnFdqEE96782Phgmw1I5XZ2ftHlBKNrBhse9ozglYUP303Fv3aOcS3AFXpH-YP",
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