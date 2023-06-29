# Context
This just echos the audio back at you.

# Setup

Set these in main.cjs
```
BASE_URL = '[YOUR NGROK URL].ngrok-free.app' // ngrok url
TO_NUMBER= '+1[YOUR-PHONE-NUMBER]' // your phone number
SIGNALWIRE_NUMBER = '+16504426442' // signalwire number
```

Also set the host and port on the last line.

Set these in a local .env file
```
SIGNAL_WIRE_PROJECT_ID="[ID]"
SIGNAL_WIRE_TOKEN="[TOKEN]"
SIGNAL_WIRE_SPACE_URL="[XXXXX].signalwire.com"
```

Tested with node.js 20.3.1

```
npm install
```

```
node main.cjs
```

In separate terminal run ngrok

```
ngrok http 4000
```

in browser, hit the ngrok url. This will trigger a call to your phone.

