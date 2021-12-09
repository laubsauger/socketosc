const io = require('socket.io-client');
const osc = require('osc');
const socketServer = "https://experiments.thornebrandt.com:8080";
let oscServer = null;


async function main() {
    await initOSC();
    if (oscServer != null) {
        console.log("osc setup complete. attempting to connect to : " + socketServer);
        initSocketConnection();
    } else {
        console.log("could not start osc server");
    }
}


const initSocketConnection = () => {
    const socket = io.connect(socketServer, { secure: true });
    socket.on('connect', () => {
        console.log('Successfully connected to ' + socketServer);

    });

    socket.on("connect_failed", (e) => {
        console.log("connect_failed");
    });

    socket.on("error", (e) => {
        console.log("error: " + e);
    });

    socket.on("introduction", (payload) => {
        var msg = {
            address: "/" + payload.client_index + "/",
            args: [
                {
                    type: "s",
                    value: "connected"
                },
                {
                    type: "s",
                    value: payload.id
                }
            ]
        };
        oscServer.send(msg);
    });

    socket.on("identity-declared", (payload) => {
        var msg = {
            address: "/" + payload.client_index + "/",
            args: [
                {
                    type: "s",
                    value: "identity-declared"
                },
                {
                    type: "s",
                    value: payload.identity,
                },
                {
                    type: "s",
                    value: payload.id
                }
            ]
        };
        oscServer.send(msg);
    });

    socket.on("onMessage", (payload) => {
        var msg = {
            address: "/" + payload.client_index + "/",
            args: [
                {
                    type: "s",
                    value: payload.message,
                },
                {
                    type: "s",
                    value: payload.id,
                }
            ]
        };
        oscServer.send(msg);
    });

    socket.on("onMouseMove", (payload) => {
        var msg = {
            address: "/" + payload.client_index + "/",
            args: [
                {
                    type: "s",
                    value: "mouseMove",
                },
                {
                    type: "f",
                    value: payload.x
                },
                {
                    type: "f",
                    value: payload.y
                }
            ]
        };
        oscServer.send(msg);
    });

};

async function initOSC() {
    /****************
 * OSC Over UDP *
 ****************/
    console.log("attempting to set up osc websocket port");

    var getIPAddresses = function () {
        var os = require("os"),
            interfaces = os.networkInterfaces(),
            ipAddresses = [];

        for (var deviceName in interfaces) {
            var addresses = interfaces[deviceName];
            for (var i = 0; i < addresses.length; i++) {
                var addressInfo = addresses[i];
                if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                    ipAddresses.push(addressInfo.address);
                }
            }
        }

        return ipAddresses;
    };

    oscServer = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: 57121
    });

    oscServer.on("ready", function () {
        var ipAddresses = getIPAddresses();

        console.log("Listening for OSC over UDP.");
        ipAddresses.forEach(function (address) {
            console.log(" Host:", address + ", Port:", oscServer.options.localPort);
        });
    });

    oscServer.on("message", function (oscMessage) {
        console.log(oscMessage);
    });

    oscServer.on("error", function (err) {
        console.log(err);
    });

    oscServer.open();



    // debug osc messages.

    // setInterval(function () {
    //     var msg = {
    //         address: "/hello/from/oscjs",
    //         args: [
    //             {
    //                 type: "f",
    //                 key: "x",
    //                 value: Math.random()
    //             },
    //             {
    //                 type: "f",
    //                 key: "y",
    //                 value: Math.random()
    //             }
    //         ]
    //     };
    //     oscServer.send(msg);
    // }, 1000);
}

main();






