import Application from '@bitx/application/Application';
import Throttle from '@bitx/application/Middlewares/Throttle';
import Web from '@bitx/application/Middlewares/Web';
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

