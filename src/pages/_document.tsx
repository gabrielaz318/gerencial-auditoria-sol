import Document, { Html, Main, NextScript, Head } from "next/document";

export default class Mydocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <link rel="preconnect" href="https://fonts.googleapis.com"/>
                    <link rel="shortcut icon" href="./favicon.ico" type="image/x-icon" />
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet"/>
                </Head>
                <body style={{backgroundColor: '#E2E8F0'}}>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}