# homebridge-http-lock

This is a Homebridge plugin for connected locks that expose their controls over HTTP.

Locks enabled through this plugin appear as locks in HomeKit.

### Installation

1. Install [Homebridge](https://homebridge.io/).
1. Install the plugin: `npm install -g homebridge-http-door-lock`.
1. Configure the sensors in `config.json`.

### Configuration

```json
{
    "platforms": [
        {
            "platform": "HTTPDoorLock",
            "locks": [
                {
                    "name": "Simple Lock",
                    "openEndpoint": {
                        "url": "https://api.example.com/locks/simple/unlock",
                        "method": "POST"
                    },
                    "closeEndpoint": {
                        "url": "https://api.example.com/locks/simple/lock",
                        "method": "POST"
                    }
                },
                {
                    "name": "Buzzer Lock",
                    "openEndpoint": {
                        "url": "https://api.example.com/locks/buzzer/unlock",
                        "method": "POST",
                        "headers": {
                            "Authorization": "Bearer bearer-token"
                        }
                    },
                    "resetLock": {
                        "enabled": true,
                        "delay": 5
                    }
                },
                {
                    "name": "Complex Lock",
                    "manufacturer": "Lock Manufacturer",
                    "model": "HTTP-Lock",
                    "serial": "000000000000",
                    "openEndpoint": {
                        "url": "https://api.example.com/locks/complex/unlock",
                        "method": "POST",
                        "headers": {
                            "Authorization": "Bearer bearer-token"
                        }
                    },
                    "closeEndpoint": {
                        "url": "https://api.example.com/locks/complex/unlock",
                        "method": "POST",
                        "headers": {
                            "Authorization": "Bearer bearer-token"
                        }
                    },
                    "autoLock": {
                        "enabled": true,
                        "delay": 5
                    }
                }
            ]
        }
    ]
}
```

### Supported Sensors

This plugin has been tested with Zigbee locks exposed through the SmartThings API. It should also work with other locks that exposed their controls through HTTP.