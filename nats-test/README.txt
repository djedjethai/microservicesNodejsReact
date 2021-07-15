// start the deployment file of nats into infra

// get the name of the pod
[jerome@thearch exposeApp]$ $k get pod
NAME                        READY   STATUS    RESTARTS   AGE
nats-depl-95f8f556d-j8tcq   1/1     Running   0          9m18s

// connect this deployment to outside using this command
$k port-forward nats-depl-95f8f556d-j8tcq 4222:4222

// to see the channels/streams logs, we open another shell
$k port-forward nats-depl-95f8f556d-j8tcq 8222:8222
// then we can visualize the logs on the browser at the address
// the nats streaming server monitoring page
http://localhost:8222/streaming
// on the channels page, add this query params to get more info
http://localhost:8222/streaming/channelsz?subs=1
 
