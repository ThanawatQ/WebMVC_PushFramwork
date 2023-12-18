>## Setup Service Worker
1 Page `_Layout.cshtml` import `script push-notifications-controller.js`  and `push-notifications.js`
  
![image](https://github.com/ThanawatQ/WebMVC_PushFramwork/assets/146691621/a7f28775-7ac1-47bf-9148-2d4bd76f2a63)
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@ViewBag.Title - My ASP.NET Application</title>
    @Styles.Render("~/Content/css")
    @Scripts.Render("~/bundles/modernizr")
</head>
<body>

    <script src="~/Scripts/notification/push-notifications-controller.js"></script>
    <script src="~/Scripts/notification/push-notifications.js"></script>

    @Scripts.Render("~/bundles/jquery")
    @Scripts.Render("~/bundles/bootstrap")
    @RenderSection("scripts", required: false)
</body>
</html>

```
2 Change Url API file `script push-notifications-controller.js`
- line 3 `let url = "https://localhost:63051/";`

> ## ทดสอบการใช้งาน
- JSON ฝั่ง API 
- actionType มี 2 ประเภท  `1 openlink`  `2 API`

```
{
  "notification": "เนื้อหา",
  "urgency": "Normal",
  "icon":"https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  "Title": "หัวข้อ",
    "data":[
      {
      "url":"https://www.google.com",
      "type":"openlink"
      },
      {
      "url":"https://www.google.com",
      "type":"API"
      }
    ],
   "action":[
    {
      "title":"Open Now"
    },
    {
      "title":"Close Now"
    }
   ]
  
}

```

- file `push-service-worker.js`

```

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

```

