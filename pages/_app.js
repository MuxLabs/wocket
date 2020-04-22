import Head from 'next/head';

import '../styles/reset.css';
import '../styles/global.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
          key="viewport"
        />
        <link rel="stylesheet" href="//static.mux.com/fonts/fonts.css" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
