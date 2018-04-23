let listeners = {};

const register = (eventName, callback) => {
    if (!listeners[eventName]) {
        listeners[eventName] = [];
    }
    listeners[eventName].push(callback);
} 

const fire = (eventName, payload) => {
    if (listeners[eventName]) {
        listeners[eventName].forEach(callback => {
            callback(payload);
        });
    }
} 

export default {
    register: register,
    fire: fire
}