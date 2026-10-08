import Event from "@bitx/event";

class TestEvent extends Event {
    constructor(public readonly userId: number) {
        super();
    }
}

export default TestEvent;