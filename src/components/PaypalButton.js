import * as ui from "./ui"
import { PayPalButtons, PayPalMessages, PayPalScriptProvider } from "@paypal/react-paypal-js"
import * as React from "react"
import { GATSBY_PAYPAL_CLIENT_ID } from "../constants";


export function PaypalButton(props) {

    return <ui.Flex variant='center'>
        <PayPalScriptProvider options={
            {
                clientId: GATSBY_PAYPAL_CLIENT_ID,
                enableFunding: 'venmo,paylater,card',
                components: 'messages,buttons'
            }
        }>
            <PayPalButtons style={{ color: "blue", shape: "pill", disableMaxWidth: false }} className="paypalButton"
                createOrder={props.createOrder}
                onApprove={props.onApprove}
                onError={props.onError}
                onClick={props.onClick} />
            <ui.Flex variant='center'>
                <PayPalMessages amount={props.amount} forceReRender={[props.amount]} />
            </ui.Flex>
        </PayPalScriptProvider>
    </ui.Flex>
}
