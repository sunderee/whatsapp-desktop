/* const { ipcRenderer:ipcRendererEvents } = require('electron');

ipcRendererEvents.on('eventsSended',(evt,data)=>{
    switch(data.type){
        case "changeTheme":
            if(data.theme == "dark"){
                $("body").addClass("dark");
            }else{
                $("body").removeClass("dark");
            }
            break;
    }
})

ipcRendererEvents.on('settings',(evt,data)=>{
    console.log(data);
    if (data.theme.value == "dark") {
        $("body").addClass("dark");
    } else {
        $("body").removeClass("dark");
    }
}) */
;((w)=>{
    w.eventMain = {
        send:(name, data) => {
            fetch(`events://${name}/${JSON.stringify({d:data})}`)
        },
        on:(name,cb) => {

        }
    }
})(window);
