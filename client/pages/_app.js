import 'bootstrap/dist/css/bootstrap.css' 
import buildClient from '../api/build-client'
import Header from '../components/header'

// pageProps && currentUser come from the return
const AppComponent = ({ Component, pageProps, currentUser }) => {
	return (<div>
		<Header currentUser={currentUser} />
		<Component currentUser={currentUser} {...pageProps} />
		</div>
	)	
} 

// !!! the .getInitialProps() for a Page and for Custom App are differents
// here we r in a Custom App
AppComponent.getInitialProps = async (appContext) => {
	// console.log(Object.keys(appContext))
	const client = buildClient(appContext.ctx)
	const { data } = await client.get('/api/users/currentuser')
	
	// getInitialProps for individual page
	let pageProps = {}
	// only if the page got an initial props, as signup page won't for e.g
	if(appContext.Component.getInitialProps){
		pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser)
	}

	return {
		pageProps,
		...data
	}
}

export default AppComponent
