const BASE_URL = '[YOUR NGROK URL].ngrok-free.app' // ngrok url
const TO_NUMBER = '+1[YOUR-PHONE-NUMBER]' // your phone number
const SIGNALWIRE_NUMBER = '+16504426442' // signalwire number

require('dotenv').config()

const Fastify = require('fastify')
const FastifyFormBody = require('@fastify/formbody')
const FastifyWS = require('@fastify/websocket')
const { RestClient } = require("@signalwire/compatibility-api");

const app = Fastify({ logger: true })
app.register( FastifyFormBody, {} )
app.register( FastifyWS, {} )

const signalwire = RestClient(
  process.env.SIGNAL_WIRE_PROJECT_ID,
  process.env.SIGNAL_WIRE_TOKEN,
  { signalwireSpaceUrl: process.env.SIGNAL_WIRE_SPACE_URL }
);

app.get( '/', async (req,rep) => {
  const call = await signalwire.calls.create({
    url: `https://${BASE_URL}/xml/initiate_call/test_convo_id`,
    to: TO_NUMBER,
    from: SIGNALWIRE_NUMBER,
  })
  rep.send(call.sid)
})

app.post( '/xml/initiate_call/:id', (req,rep) => {
  const id = req.params.id
  response = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="wss://${BASE_URL}/connect_call/${id}" />
    </Connect>
</Response>`

  req.log.info({response},'XML')
  rep.header('Content-Type', 'text/xml');
  rep.send(response)
})

app.register( async (app) => {
  app.get('/connect_call/:id', { websocket: true }, async (connection, req) => {
    let state = 'waiting_for_start'
    connection.socket.on('message', async message => {
      try {
        const data = JSON.parse(message)
        switch (state) {

          case 'waiting_for_start': {
              if (data.event === 'start') {
                state = 'start_received'
              }
            }
            break;

          case 'start_received':
            switch (data.event) {
              case 'media': {
                  const media = data.media
                  const chunk = Buffer.from(media.payload,'base64')
                  const twilio_message = {
                    event: 'media',
                    media: {
                      payload: chunk.toString('base64')
                    }
                  }
                await connection.socket.send(JSON.stringify(twilio_message))
                }
                break
              case 'stop': {
                const twilio_message = { event: 'stop' }
                await connection.socket.send(JSON.stringify(twilio_message))
              }
            }
            break
        }
      } catch (err) { req.log.error(err) }
    })
  })
})

app.listen({ port: 4000, host: '::' })
