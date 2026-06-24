
class AppState {
    constructor() {
        this.itemHistory = [];
    }

    push(items) {
        this.itemHistory.push(items);
    }

    pop() {
        return this.itemHistory.pop();
    }

    clear() {
        this.itemHistory = [];
    }

    get hasHistory() {
        return this.itemHistory.length > 0;
    }
}

export const state = new AppState();
