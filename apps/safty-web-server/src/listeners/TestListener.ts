import { Listener } from "@bitx/event";
import TestEvent from "../events/TestEvent";

class TestListener implements Listener<TestEvent> {
    handle(event: TestEvent): void | Promise<void> {
        console.log('test listener', event.userId);
    }
}

export default TestListener;