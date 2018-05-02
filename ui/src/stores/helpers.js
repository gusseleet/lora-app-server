import dispatcher from "../config/dispatcher";
import history from '../config/history';


export function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    throw response.json();
  }
};

export function errorHandler(error) {
  error
    .then((data) => {
      if (data.code === 16) {
        history.push("/login");
      } else {
        dispatcher.dispatch({
          type: "CREATE_ERROR",
          error: data,
        });
      }
    })
    .catch((error) => { throw error; });
};

export function errorHandlerIgnoreNotFound(error) {
  error.then((data) => {
    if (data.code === 16) {
      history.push("/login");
    } else if (data.code !== 5) {
      dispatcher.dispatch({
        type: "CREATE_ERROR",
        error: data,
      });
    }
  });
};
