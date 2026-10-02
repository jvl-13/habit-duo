const { io } = require('socket.io-client');

const token = 'BOB_ACCESS_TOKEN';

const socket = io(
  'http://localhost:4000',
  {
    auth: {
      token,
    },
  },
);

socket.on('connect', () => {
  console.log(
    'Connected:',
    socket.id,
  );
});

socket.on(
  'notification:new',
  (notification) => {
    console.log(
      'NEW NOTIFICATION:',
    );

    console.log(
      JSON.stringify(
        notification,
        null,
        2,
      ),
    );
  },
);

socket.on('disconnect', (reason) => {
  console.log(
    'Disconnected:',
    reason,
  );
});

socket.on('connect_error', (error) => {
  console.error(
    'Connection error:',
    error.message,
  );
});