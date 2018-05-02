import { EventEmitter } from "events";
import "whatwg-fetch";
import sessionStore from "./SessionStore";
import { checkStatus, errorHandler } from "./helpers";

class PaymentPlanStore extends EventEmitter {
  getAll(organizationID, search, pageSize, offset, callbackFunc) {
    fetch(
      "/api/paymentplans?limit=" +
        pageSize +
        "&offset=" +
        offset +
        "&search=" +
        search +
        "&organizationID=" +
        organizationID,
      {
        headers: sessionStore.getHeader()
      }
    )
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        typeof responseData.result === "undefined"
          ? callbackFunc(0, [])
          : callbackFunc(responseData.totalCount, responseData.result);
      })
      .catch(errorHandler);
  }

  getPaymentPlan(paymentPlanID, callbackFunc) {
    fetch("/api/paymentplans/" + paymentPlanID, {
      headers: sessionStore.getHeader()
    })
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        callbackFunc(responseData);
      })
      .catch(errorHandler);
  }

  getAllNetworksOfPaymentPlan(paymentPlanID, pageSize, offset, callbackFunc) {
    fetch(
      "/api/paymentplans/" +
        paymentPlanID +
        "gatewaynetworks?limit=" +
        pageSize +
        "&offset=" +
        offset,
      { headers: sessionStore.getHeader() }
    )
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        typeof responseData.result === "undefined"
          ? callbackFunc(0, [])
          : callbackFunc(responseData.totalCount, responseData.result);
      })
      .catch(errorHandler);
  }

  getNetworkOfPaymentPlan(paymentPlanID, GatewayNetworkID, callbackFunc) {
    fetch(
      "/api/paymentplans/" +
        paymentPlanID +
        "/gatewaynetworks/" +
        GatewayNetworkID,
      { headers: sessionStore.getHeader() }
    )
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        callbackFunc(responseData);
      })
      .catch(errorHandler);
  }

  createPaymentPlan(organizationID, paymentPlan, callbackFunc) {
    fetch("/api/paymentplans/" + organizationID, {
      method: "POST",
      body: JSON.stringify(paymentPlan),
      headers: sessionStore.getHeader()
    })
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        callbackFunc(responseData);
      })
      .catch(errorHandler);
  }

  createNetworkOfPaymentPlan(paymentPlanID, gatewayNetwork, callbackFunc) {
    fetch("/api/paymentplans/" + paymentPlanID + "gatewaynetworks", {
      method: "POST",
      body: JSON.stringify(gatewayNetwork),
      headers: sessionStore.getHeader()
    })
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        callbackFunc(responseData);
      })
      .catch(errorHandler);
  }

  deletePaymentPlan(paymentPlanID, callbackFunc) {
    fetch("/api/paymentplans/" + paymentPlanID, {
      method: "DELETE",
      headers: sessionStore.getHeader()
    })
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        callbackFunc(responseData);
      })
      .catch(errorHandler);
  }

  deleteNetworkOfPaymentPlan(paymentPlanID, GatewayNetworkID, callbackFunc) {
    fetch(
      "/api/paymentplans/" +
        paymentPlanID +
        "/gatewaynetworks/" +
        GatewayNetworkID,
      { method: "DELETE", headers: sessionStore.getHeader() }
    )
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        callbackFunc(responseData);
      })
      .catch(errorHandler);
  }

  updatePaymentPlan(paymentPlanID, paymentPlan, callbackFunc) {
    fetch("/api/gateways/" + paymentPlanID, {
      method: "PUT",
      body: JSON.stringify(paymentPlan),
      headers: sessionStore.getHeader()
    })
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        this.emit("change");
        callbackFunc(responseData);
      })
      .catch(errorHandler);
  }
}

const paymentPlanStore = new PaymentPlanStore();

export default paymentPlanStore;
