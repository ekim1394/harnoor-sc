import * as ui from "../components/ui"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import * as React from "react"


export function PaypalButton(props) {

    return <ui.Flex variant='center'>
        <PayPalScriptProvider options={
            {
                clientId: `${process.env.GATSBY_PAYPAL_CLIENT_ID}`,
                "enable-funding": "venmo",
                "merchantId": "info@physiokids.com"
            }
        }>
            <PayPalButtons style={{ color: "blue", shape: "pill", disableMaxWidth: false }} className="paypalButton"
                createOrder={props.createOrder}
                onApprove={props.onApprove}
                onError={props.onError}
                onClick={props.onClick} />
        </PayPalScriptProvider>
    </ui.Flex>
}
