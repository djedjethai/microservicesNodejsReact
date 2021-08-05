import Link from 'next/link'

export default ({ currentUser }) => {

	const links = [
		// tricks if the first condition is true the second will be render
		// if first condition is false return false
		!currentUser && {labels:'Sign Up', href:'/auth/signup'},
		!currentUser && {labels:'Sign In', href:'/auth/signin'},
		currentUser && {labels:'Sell Tickets', href:'/tickets/new'},
		currentUser && {labels:'My Orders', href:'/orders'},
		currentUser && {labels:'Sign Out', href:'/auth/signout'}
	]
		.filter(linkConfig => linkConfig) // to return only true elemt
		.map(({ labels, href }) => {
			return <li key={href} className="nav-item">
				<Link href={href}>
					<a className="nav-link">{labels}</a>
				</Link>
			</li>
		})

	return <nav className="navbar navbar-light bg-light">
		<Link href="/">
			<a className="navbar-brand">GitTix</a>
		</Link>
		<div className="d-flex justify-content-end">
			<ul className="nav d-flex align-items-center">
				{links}
			</ul>
		</div>
	</nav>
}
