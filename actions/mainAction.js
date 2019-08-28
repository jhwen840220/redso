/**
 * 共用Action 行為
 */

import axios from "axios";
const CancelToken = axios.CancelToken;

import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

let cancel; /** 用於abort request */
let debug = false; /** 用於debug */

export var token = "";
//setting default axios post、get
export function post(url, data, req = false, abort = false) {
    if (cancel) {
        cancel();
    }
    const isServer = !!req;
    let protocol = !!req
        ? req.headers.protocol
        : process.browser
            ? location.protocol
            : "http:";
    let host = !!req ? req.headers.host : process.browser ? location.host : "";
    const serverUrl = `${protocol}//${host}/api/`;
    const dataUrl = serverUrl + url;
    if (!!req && debug) {
        console.log(`---client fetch server ${dataUrl}---`);
    }
    return axios({
        method: "POST",
        url: dataUrl,
        data: data, // post Data
        timeout: 6000, // timeout
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Accept: "application/json;"
        },
        cancelToken: abort
            ? new CancelToken(function executor(c) {
                cancel = c;
            })
            : undefined
    })
        .then(response => {
            if (!!req && response && debug) {
                // console.log(`------------------res:${url}------------------`)
                // console.log(response)
            }
            return response;
        })
        .catch(e => {
            catchError(e);
        });
}

export function catchError(e) {
    if (
        e &&
        e.response !== 200 &&
        e.response &&
        e.response.statusText &&
        e.response.statusText === "Unauthorized" &&
        e.response.request.responseURL !== "/logout"
    ) {
        /** token 失效時 */
        // if (process.browser) {
        //     if (!!localStorage.getItem('token')) {
        //         // message.error('連線過期已登出')
        //         const cacheStore = window['__NEXT_MOBX_STORE__'];
        //         cacheStore.loginStore.logOut()
        //     }
        // }
    } else {
        /** 無回應時 */
        // if (process.browser) message.error('response error')
    }
}
