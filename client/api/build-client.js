import axios from 'axios'

export default ({ req }) => {
	if(typeof window === 'undefined'){
		
		// that s how we create a prconfigured version of axios
		return axios.create({
			baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
			headers: req.headers
		})
	}
	else{
		return axios.create({
			baseURL: '/',
			headers: {'Accept': 'application/json'}
			// headers: req.headers
		})
	}
}
