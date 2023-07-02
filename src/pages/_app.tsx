import { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '../contexts/AuthContext';
import { SiderBarDrawerProvider } from '../contexts/SidebarDrawerContext';
import Head from 'next/head';
import { theme } from '../style/theme';

function MyApp({ Component, pageProps }: AppProps) {
  	return (
		<ChakraProvider theme={theme}>
			<AuthProvider>
				<SiderBarDrawerProvider>
					<Head>
                    	<title>SOL</title>
					</Head>
					<Component {...pageProps} />
				</SiderBarDrawerProvider>
			</AuthProvider>
		</ChakraProvider>
	) 
}

export default MyApp;
