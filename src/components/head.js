import * as React from "react"

export default function Head({ title, description, image }) {
    let paypal_api_url = "https://www.paypal.com/sdk/js?client-id=" + process.env.REACT_APP_PAYPAL_CLIENT_ID

    return (
        <>
            <meta charSet="utf-8" />
            <title>{title}</title>
            {description && (
                <meta
                    name="description"
                    property="og:description"
                    content={description}
                />
            )}
            <meta property="og:title" content={title} />
            {image && <meta property="og:image" content={image.url} />}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={title} />
            <script src={paypal_api_url}></script>

            {description && <meta name="twitter:description" content={description} />}
            {image && <meta name="twitter:image" content={image.url} />}
        </>
    )
}
