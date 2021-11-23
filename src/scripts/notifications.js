//solo para hacer un cambio
let _Notification = window.Notification
let notificationsCount = 1;
const charLen = 200
window.Notification = function (name, props) {
    if(props.body.length > charLen){
        props.body = `${props.body.substr(0,charLen)}...`
    }
    let n = new _Notification(`whatsdesk - ${name}`, props);
    n.__id = notificationsCount++;
    eventMain.send("notifications", n.__id);
    setTimeout(() => {
        n._onclick = n.onclick;
        n.onclick = function (evt) {
            eventMain.send("notification:click", true);
            if (n._onclick) n._onclick.call(this, evt);
        }

    }, 500)
    n._close = n.close;
    n.close = function () {
        eventMain.send("notification:close", n.__id);
        n._close.apply(this, arguments);
    }
    return n;
}
Notification.requestPermission = _Notification.requestPermission
Notification.permission = _Notification.permission;
