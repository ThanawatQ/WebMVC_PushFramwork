self.importScripts('/scripts/push-notifications-controller.js');

const pushNotificationTitle = 'Notification';

self.addEventListener('push', function (event) {

    let jsonObject = JSON.parse(event.data.text());
    var actionType = jsonObject.action.actionType;
    var redirectUrl = jsonObject.action.Url;

    if (actionType === "uninstall") {

        console.log('On notification click: ', redirectUrl);

        event.stopImmediatePropagation();
        event.waitUntil(
            self.registration.unregister().then(function (success) {
                console.log('Service worker unregistered successfully', success);
            }).catch(function (error) {
                console.error('Failed to unregister service worker:', error);
            })
        );
    } else {
        event.waitUntil(
            self.registration.showNotification(jsonObject.Title, {
                body: jsonObject.Notification,
                icon: jsonObject.icon,
                tag: "vibration-sample",
                data: jsonObject.data,
                actions: jsonObject.action,
            })
        );
    }
});


self.addEventListener('pushsubscriptionchange', function (event) {
    const handlePushSubscriptionChangePromise = Promise.resolve();

    if (event.oldSubscription) {
        handlePushSubscriptionChangePromise = handlePushSubscriptionChangePromise.then(function () {
            return PushNotificationsController.discardPushSubscription(event.oldSubscription);
        });
    }

    if (event.newSubscription) {
        handlePushSubscriptionChangePromise = handlePushSubscriptionChangePromise.then(function () {
            return PushNotificationsController.storePushSubscription(event.newSubscription);
        });
    }

    if (!event.newSubscription) {
        handlePushSubscriptionChangePromise = handlePushSubscriptionChangePromise.then(function () {
            return PushNotificationsController.retrievePublicKey().then(function (applicationServerPublicKey) {
                return pushServiceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerPublicKey
                }).then(function (pushSubscription) {
                    return PushNotificationsController.storePushSubscription(pushSubscription);
                });
            });
        });
    }

    event.waitUntil(handlePushSubscriptionChangePromise);
});


self.addEventListener("notificationclick", function (event) {
    // event.stopImmediatePropagation();
    event.notification.close();
    console.log('On notification click: ');
    var actions = event.notification.data;

    actions.map((actionType) => {

        if (actionType.type == "openlink") {
            if (actionType.url) {
                //---------- for open link
                event.waitUntil(clients.matchAll({
                    type: "window"
                }).then(function (clientList) {
                    for (var i = 0; i < clientList.length; i++) {
                        var client = clientList[i];
                        if (client.url == actionType.url && 'focus' in client)
                            return client.focus();
                    }
                    if (clients.openWindow) {
                        clients
                            .openWindow(actionType.url)
                            .then((windowClient) => (windowClient ? windowClient.focus() : null));
                    }
                }));
            }
        }
        else if (actionType == "API") {
            //---------- for fatch data  sample ---------------------------------------
            return fetch(url + 'push-notifications-api/public-key').then(function (response) {
                if (response.ok) {
                    return response.text().then(function (applicationServerPublicKeyBase64) {
                       
                    });
                } 
            });
        }
    })
});
