// currentUser is destructured from response.data
const LandingPage = ({ currentUser }) => {
	return currentUser ? 
		<h1>You are signin</h1> :
		<h1>You are not signin</h1>
}

LandingPage.getInitialProps = async (context, client, currentUser) => {

	return {}
};

export default LandingPage;



// export const getServerSideProps = async({ req }) => {
// 	console.log('the contacttt: ', req.headers)
// 
// 	// the url is to req.get from  a pod/container into a namespace to anotherone
// 	// here from default namespace to ingress-nginx namespace
// 	// see the ingress-nginx namespace's services: $k get svc -n ingress-nginx
// 	// the url is: <service-name>.<namespace-name>.svc.cluster.local
// 
// 	// to determine if we are on the server or on the browser
// 	if(typeof window === 'undefined'){
// 		// we are on the server
// 		// req should be made to http://serviceName.namespaceName.svc.....
// 		const { data } = axios.get(
// 		'/ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
// 			{
// 				// this option will inform ingress-nginx of the target host
// 				headers: {
// 					Host:'ticketing.dev'
// 				}
// 			}
// 		)
// 
// 
// 		return { props: data }
// 	}
// 	else{
// 		// we are on the browser, req can be made with a base url of ''
// 		const { data } = await axios.get(
// 			'/api/users/currentuser'
// 		)
// 		
// 		return { props: data }
// 	}
// 
// }
// 
// export default LandingPage



