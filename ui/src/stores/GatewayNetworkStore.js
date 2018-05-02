import { EventEmitter } from "events";

import sessionStore from "./SessionStore";
import { checkStatus, errorHandler } from "./helpers";

class GatewayNetworkStore extends EventEmitter {
  getAll(
    pageSize,
    offset,
    search,
    privateNetwork,
    organizationID,
    callbackFunc
  ) {
    fetch(
      "/api/gatewaynetworks?" +
        (pageSize ? "limit=" + pageSize : "") +
        (offset ? "&offset=" + offset : "") +
        (search ? "&search=" + search : "") +
        (privateNetwork ? "&privateNetwork=" + privateNetwork : "") +
        (organizationID ? "&organizationID=" + organizationID : ""),
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

  getAllForOrganization(organizationID, pageSize, offset, callbackFunc) {
    fetch(
      "/api/gatewaynetworks/organizations/" +
        organizationID +
        "?limit=" +
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

  getGatewayNetwork(id, callbackFunc) {
    fetch("/api/gatewaynetworks/" + id, { headers: sessionStore.getHeader() })
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        callbackFunc(responseData);
      })
      .catch(errorHandler);
  }

  getAllGatewaysOfNetwork(gatewayNetworkID, pageSize, offset, callbackFunc) {
    fetch(
      "/api/gatewaynetworks/" +
        gatewayNetworkID +
        "/gateways?limit=" +
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

  getGatewayOfNetwork(gatewayNetworkID, gatewayMAC, callbackFunc) {
    fetch(
      "/api/gatewaynetworks/" + gatewayNetworkID + "/gateways/" + gatewayMAC,
      { headers: sessionStore.getHeader() }
    )
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        callbackFunc(responseData);
      })
      .catch(errorHandler);
  }

  getAllOrganizationsOfNetwork(
    gatewayNetworkID,
    pageSize,
    offset,
    callbackFunc
  ) {
    fetch(
      "/api/gatewaynetworks/" +
        gatewayNetworkID +
        "/organizations?limit=" +
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

  createGatewayNetwork(gatewayNetwork, callbackFunc) {
    fetch("/api/gatewaynetworks", {
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

  updateGatewayNetwork(gatewayNetworkID, gatewayNetwork, callbackFunc) {
    fetch("/api/gatewaynetworks/" + gatewayNetworkID, {
      method: "PUT",
      body: JSON.stringify(gatewayNetwork),
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

  deleteGatewayNetwork(gatewayNetworkID, callbackFunc) {
    fetch("/api/gatewaynetworks/" + gatewayNetworkID, {
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

  deleteGatewayFromNetwork(gatewayNetworkID, gatewayMAC, callbackFunc) {
    fetch(
      "/api/gatewaynetworks/" + gatewayNetworkID + "/gateways/" + gatewayMAC,
      { method: "DELETE", headers: sessionStore.getHeader() }
    )
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        callbackFunc(responseData);
      })
      .catch(errorHandler);
  }

  deleteOrganizationFromNetwork(
    gatewayNetworkID,
    organizationID,
    callbackFunc
  ) {
    fetch(
      "/api/gatewaynetworks/" +
        gatewayNetworkID +
        "/organizations/" +
        organizationID,
      { method: "DELETE", headers: sessionStore.getHeader() }
    )
      .then(checkStatus)
      .then(response => response.json())
      .then(responseData => {
        callbackFunc(responseData);
      })
      .catch(errorHandler);
  }
}

const gatewayNetworkStore = new GatewayNetworkStore();

export default gatewayNetworkStore;
