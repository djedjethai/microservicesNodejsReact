import { useEffect, useState } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/use-request'

const OrderShow = ({ order, currentUser }) => {
	const [timeLeft, setTimeLeft] = useState(0)
	const { doRequest, errors } = useRequest({
		url:'/api/payments',
		method: 'post',
		body: {
			token: "tok_visa", // i add it myself
			orderId: order.id
		},
		onSuccess: (payment) => console.log('the payment: ', payment)
	})

	// to make sure the component render only one time
	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft =  new Date(order.expireAt) - new Date
			setTimeLeft(Math.round(msLeft/1000))
		}

		findTimeLeft() // i invoke first as setInterval will start a second late
		const interval = setInterval(findTimeLeft, 1000)

		// a return func in useEffect is invoke asa the component re-render
		return () => {
			clearInterval(interval)
		}
	}, [])

	if(timeLeft < 0) return <div>Order expired</div>


	return (
		<div>
		Time left to pay: {timeLeft} seconds
		<StripeCheckout
			token={({ id }) => doRequest({ token: id })}
			stripeKey="pk_test_51JEt8RC6YmDI1rQ4ogzdjI8XZVDWsYU08jyDklkXqZmPnMor2BEabPCTEIKTL6eZDmrc8fmVjEjarnUb5k6pufOn00wctspD0X"
			amount={order.ticket.price * 100}
			email={currentUser.email}
		/>
		{errors}
		</div>

	)
}

OrderShow.getInitialProps = async(context, client) => {
	// 'orderId' bc we named the file like it
	const { orderId } = context.query
	const { data } = await client.get(`/api/orders/${orderId}`)

console.log("dataaa: ", data)

	return { order: data }
}

export default OrderShow
