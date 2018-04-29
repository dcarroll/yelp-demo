let callbacks = {};

const register = (eventName, callback) => {
    if (!callbacks[eventName]) {
        callbacks[eventName] = new Set();
    }
    callbacks[eventName] = callbacks[eventName].add(callback);
};

const unregister = (eventName, callback) => {
    if (callbacks[eventName]) {
        callbacks[eventName].delete(callback);
    }
};

const fire = (eventName, payload) => {
    if (callbacks[eventName]) {
        callbacks[eventName].forEach(callback => {
            callback(payload);
        });
    }
};

export default {
    register: register,
    unregister: unregister,
    fire: fire,
};
