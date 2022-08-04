function createStateMachine(player) {
    machine = {
        movement: {
            foward: {
                state: 'OFF',
                transitions: {
                    OFF: {
                        set(self) {
                            self.state = 'OFF';
                        }
                    },
                    ON: {
                        set(self) {
                            self.state = 'ON';
                        },
                    }, 
                }, //forward transitions 
            },// foward
            backward: {
                state: 'OFF',
                transitions: {
                    OFF: {
                        set(self) {
                            self.state = 'OFF';
                        }
                    },
                    ON: {
                        set(self) {
                            self.state = 'ON';
                        },
                    }, 
                }, //backward transitions 
            },// backward
            left: {
                state: 'OFF',
                transitions: {
                    OFF: {
                        set(self) {
                            self.state = 'OFF';
                        }
                    },
                    ON: {
                        set(self) {
                            self.state = 'ON';
                        },
                    }, 
                }, //left transitions 
            },// left
            right: {
                state: 'OFF',
                transitions: {
                    OFF: {
                        set(self) {
                            self.state = 'OFF';
                        }
                    },
                    ON: {
                        set(self) {
                            self.state = 'ON';
                        },
                    }, 
                }, //right transitions 
            },// right
            shooting: {
                state: 'OFF',
                transitions: {
                    OFF: {
                        set(self) {
                            self.state = 'OFF';
                        }
                    },
                    ON: {
                        set(self) {
                            self.state = 'ON';
                        },
                    }, 
                }, //shooting transitions 
            },// shooting

            dispatchEvent(transition,event) {
                // console.log(` > [dispatchEvent]<Server> Transição: ${JSON.stringify(transition)} |  Evento: ${event}`);
                const action = transition.transitions[event];
                if (action && event != transition.state) {
                    action.set(transition);
                }
            },// dispatchEvent
        }, // movement
    }

    return machine;
}

module.exports = {
    createStateMachine,
}



// OLD STATE MACHINE
machine = {
    movement: {
        state: 'IDLE', // idle, foward, backward
        transitions: {
            IDLE: {
                set(movement) {
                    movement.state = 'IDLE';
                }
            }, // IDLE

            FOWARD: {
                set(movement) {
                    movement.state = 'FOWARD';
                },
            }, // FOWARD

            BACKWARD: {
                set(movement) {
                    movement.state = 'BACKWARD';
                },
            }, // BACKWARD
        }, // transitions
        dispatchEvent(event) {
            // console.log(` > [dispatchEvent]<Server> Evento: ${event} Estado atual: ${this.state}`);
            const action = this.transitions[event];
            if (action && event != this.state) {
                action.set(this);
            }
        },// dispatchEvent
    }, // movement

    rotation: {
        state: 'IDLE', // idle, left, right
        transitions: {
            IDLE: {
                set(rotation) {
                    rotation.state = 'IDLE';
                },
            },
            LEFT: {
                set(rotation) {
                    rotation.state = 'LEFT';
                },
            },
            RIGHT: {
                set(rotation) {
                    rotation.state = 'RIGHT';
                },
            },
        },
        dispatchEvent(event) {
            // console.log(` > [dispatchEvent]<Server> Evento: ${event} Estado atual: ${this.state}`);
            const action = this.transitions[event];
            if (action && event != this.state) {
                action.set(this);
            }
        },// dispatchEvent
    } // rotation
}