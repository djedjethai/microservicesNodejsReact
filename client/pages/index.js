import Link from 'next/link'

// currentUser is destructured from response.data
const LandingPage = ({ currentUser, tickets }) => {
	
	const ticketList = tickets.map((ticket) => {
		return(
			<tr key={ticket.id}>
				<td>{ticket.title}</td>
				<td>{ticket.price}</td>
				<td>
					<Link 
						href="/tickets/[ticketId]" 
						as={`/tickets/${ticket.id}`}
					>
						<a>View</a>
					</Link>
				</td>
			</tr>
		)
	})

	return(
		<div>
			<h2>Tickets</h2>
			<table className="table">
				<thead>
				<tr>
					<th>Title</th>
					<th>Price</th>
					<th>Link</th>
				</tr>
				</thead>
				<tbody>
					{ticketList}
				</tbody>
			</table>
		</div>
	)	
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
	const { data } = await client.get('/api/tickets')

	return {tickets: data}
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



