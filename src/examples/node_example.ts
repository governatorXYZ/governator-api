import * as NodeEventSource from 'eventsource';

// create event source and subscribe
// optional config: const eventSourceInitDict = { https: { rejectUnauthorized: false } };
const evtSource = new NodeEventSource(
    'http://localhost:3000/governator/sse',
    // eventSourceInitDict,
);

// do something when onmessage event is emitted
evtSource.onmessage = ({ data, lastEventId }) => {
    console.log('New message', JSON.parse(data), lastEventId);
};
