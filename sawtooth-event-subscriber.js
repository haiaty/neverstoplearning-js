/*

 "engines": {
    "node": "<=12.16.1"
  },
  "dependencies": {
    "axios": "^0.27.2",
    "lodash": "^4.17.21",
    "sawtooth-sdk": "^1.0.5",
    "zeromq": "^4.6.0"
  }
*/

'use strict'

const _ = require('lodash')
const { Stream } = require('sawtooth-sdk/messaging/stream')
const {
    Message,
    EventList,
    EventSubscription,
    EventFilter,
    StateChangeList,
    ClientEventsSubscribeRequest,
    ClientEventsSubscribeResponse
} = require('sawtooth-sdk/protobuf')

const  {FAMILY_NAME, HANDLER_VERSION, validator_rest_api_url, validator_tcp} = require ('./env.js')
const {hash} = require('./src/helpers')


const PREFIX = hash(FAMILY_NAME).substring(0, 6);
const NULL_BLOCK_ID = '0000000000000000'

const stream = new Stream(validator_tcp)

// Parse Block Commit Event
const getBlock = events => {
    const block = _.chain(events)
        .find(e => e.eventType === 'sawtooth/block-commit')
        .get('attributes')
        .map(a => [a.key, a.value])
        .fromPairs()
        .value()

    return {
        blockNum: parseInt(block.block_num),
        blockId: block.block_id,
        stateRootHash: block.state_root_hash
    }
}

// Parse State Delta Event
const getChanges = events => {
    const event = events.find(e => e.eventType === 'sawtooth/state-delta')
    if (!event) return []

    const changeList = StateChangeList.decode(event.data)
    return changeList.stateChanges
        .filter(change => change.address.slice(0, 6) === PREFIX)
}

// Handle event message received by stream
const handleEvent = msg => {
    if (msg.messageType === Message.MessageType.CLIENT_EVENTS) {
        const events = EventList.decode(msg.content).events
        console.log("BLOCKS");
        console.log(getBlock(events));

        console.log("DELTA CHANGES TO ADRESS");
        var deltaChanges =  getChanges(events);

        deltaChanges.forEach((change) => {

            console.log(change.address);
            console.log(Buffer.from(change.value).toString("utf8"));

        });

        //console.log(getChanges(events));
    } else {
        console.warn('Received message of unknown type:', msg.messageType)
    }
}

// Send delta event subscription request to validator
const subscribe = () => {
    const blockSub = EventSubscription.create({
        eventType: 'sawtooth/block-commit'
    })
    const deltaSub = EventSubscription.create({
        eventType: 'sawtooth/state-delta',
        filters: [EventFilter.create({
            key: 'address',
            matchString: `^${PREFIX}.*`,
            filterType: EventFilter.FilterType.REGEX_ANY
        })]
    })

    return stream.send(
        Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
        ClientEventsSubscribeRequest.encode({
            lastKnownBlockIds: [NULL_BLOCK_ID],
            subscriptions: [blockSub, deltaSub]
        }).finish()
    )
        .then(response => ClientEventsSubscribeResponse.decode(response))
        .then(decoded => {
            const status = _.findKey(ClientEventsSubscribeResponse.Status,
                val => val === decoded.status)
            if (status !== 'OK') {
                throw new Error(`Validator responded with status "${status}"`)
            }
        })
}


// Start stream and send delta event subscription request
const start = () => {
    return new Promise(resolve => {
        stream.connect(() => {
            stream.onReceive(handleEvent)
            subscribe().then(resolve)
        })
    })
}

async function main() {
    console.log("starting");
    start()
}

main();
