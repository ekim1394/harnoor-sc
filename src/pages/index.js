import * as React from "react"
import SEOHead from "../components/head"
import { graphql } from "gatsby"
import { Container, Heading, WeeklyList, ButtonList, Subhead, Flex } from "../components/ui"
import { Slice } from "gatsby"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"



export default function Schedule(props) {
    const { contentfulSchedule } = props.data
    const [checkedList, setCheckedList] = React.useState([]);
    
    const handleSelect = (event) => {
        const value = event.target.name + ':' + event.target.value;
        const isChecked = event.target.checked;

        if (isChecked) {
            //Add checked item into checkList
            const selected_list = [...checkedList, value]
            selected_list.sort((a, b) => new Date(a.split(':')[1]) - new Date(b.split(':')[1]))
            setCheckedList([...selected_list]);
        } else {
            //Remove unchecked item from checkList
            const filteredList = checkedList.filter((item) => item !== value);
            filteredList.sort((a, b) => new Date(a.split(':')[1]) - new Date(b.split(':')[1]))
            setCheckedList(filteredList);

        }
    };

    return (
        <>
            <Container>
                {/* <FlexList>
                    {checkedList.map((item, index) => {
                        return (
                            <li key={item} className="chip-label">{index}: {item}</li>
                        );
                    })}
                </FlexList> */}
                <Heading center={true}>{contentfulSchedule.name}</Heading>

                {
                    contentfulSchedule.summerCampSessions.map(
                        (dates) => {
                            var startDateStr = new Date(dates.startDate).toString().substring(4, 10)
                            var endDateStr = new Date(dates.endDate).toString().substring(4, 10)
                            return (<Container width='wide'>
                                <Subhead center={true}>{startDateStr} - {endDateStr}</Subhead>
                                <WeeklyList name={dates.name} startDate={dates.startDate} endDate={dates.endDate} handleSelect={handleSelect} />
                                <br style={{ clear: 'both' }} />
                                <br style={{ clear: 'both' }} />

                            </Container>
                            )
                        }
                    )
                }
                {checkedList.length > 0 &&
                <Flex variant='center'>
                    <PayPalScriptProvider options={
                        {
                                clientId: "AfJI1B6OY9dOr4-tkGAnFdqEE96782Phgmw1I5XZ2ftHlBKNrBhse9ozglYUP303Fv3aOcS3AFXpH-YP",
                            "enable-funding": "venmo"
                        }
                    }>
                            <PayPalButtons style={{ color: "blue", shape: "pill", disableMaxWidth: false}} className="paypalButton"/>
                    </PayPalScriptProvider>
                </Flex>}
            </Container>

            <Slice alias='footer' />
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