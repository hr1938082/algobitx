import Application from '@algobitx/application/Application';
import Throttle from '@algobitx/application/Routing/Middlewares/Throttle';
import Web from '@algobitx/application/Routing/Middlewares/Web';
import TestEvent from './events/TestEvent';
import TestListener from './listeners/TestListener';

const app = new Application([
    {
        path: 'routes/main.ts',
        middleware: [Throttle(2, 60), Web]
    },
    {
        path: 'routes/api.ts',
        prefix: 'api',
        middleware: Throttle(1, 1)
    }
]);
app.onBoot(() => {
    TestEvent.listen(new TestListener());
})

app.start();

