import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html >
        <Head />
        <body className="loading bg-accent-9" >
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
