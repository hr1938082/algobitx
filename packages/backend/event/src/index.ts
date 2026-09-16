abstract class Event {

    static listen<TEvent extends Event>(
        this: new (...args: any[]) => TEvent,
        ...newListeners: Listener<TEvent>[]
    ) {
        Dispatcher.listen(this, new Set(newListeners));
    }

    static dispatch<TArgs extends unknown[]>(
        this: new (...args: TArgs) => Event,
        ...args: TArgs
    ) {
        return Dispatcher.dispatch(new this(...args));
    }

}

interface Listener<TEvent extends Event> {
    handle(event: TEvent): void | Promise<void>
}

type EventConstructor<
    TEvent extends Event,
    TArgs extends unknown[] = unknown[]
> = new (...args: TArgs) => TEvent;

class Dispatcher {
    private static readonly listeners = new Map<EventConstructor<any>, Set<Listener<any>>>();

    static listen<TEvent extends Event>(event: EventConstructor<TEvent>, newListeners: Set<Listener<TEvent>>) {
        let listeners = this.listeners.get(event);

        if (!listeners) {
            listeners = newListeners;
            this.listeners.set(event, listeners);
            return;
        }

        for (const newListener of newListeners)
            listeners.add(newListener);
    }

    static async dispatch<TEvent extends Event>(event: TEvent) {
        const listeners = this.listeners.get(
            event.constructor as EventConstructor<TEvent>
        );

        if (!listeners)
            return;

        await Promise.all(
            [...listeners].map(listener =>
                listener.handle(event)
            )
        );
    }


}

export { Listener };
export default Event;