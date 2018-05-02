import { EventEmitter } from "events";
import dispatcher from "../config/dispatcher";

class ErrorStore extends EventEmitter {
  constructor() {
    super();
    this.errors = [];
  }

  getAll() {
    return this.errors;
  }

  clear() {
    this.errors = [];
    this.emit("change");
  }

  createError(error) {
    const id = Date.now();

    this.errors.push({
      id: id,
      error: error,
    });

    this.emit("change");
  }

  deleteError(id) {
    for(var error of this.errors) {
      if(error.id === id) {
        this.errors.splice(this.errors.indexOf(error.id), 1);
      }
    }    
    this.emit("change");
  }

  handleActions(action) {
    switch(action.type) {
      case "CREATE_ERROR": {
        this.createError(action.error);
        break;
      }
      case "DELETE_ERROR": {
        this.deleteError(action.id);
        break;
      }
      default:
        break;
    }
  }
}

const errorStore = new ErrorStore();
dispatcher.register(errorStore.handleActions.bind(errorStore));

export default errorStore;
