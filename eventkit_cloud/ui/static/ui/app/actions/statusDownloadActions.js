import {Config} from '../config';
import types from './actionTypes';
import axios from 'axios'
import cookie from 'react-cookie'
import {browserHistory} from 'react-router';

export const getDatacartDetails = (jobuid) => dispatch => {
    dispatch({
        type: types.GETTING_DATACART_DETAILS
    });

    return axios({
        url: '/api/runs?job_uid='+ jobuid,
        method: 'GET',
    }).then((response) => {

        let data = {...response.data[0]};

        dispatch({
            type: types.DATACART_DETAILS_RECEIVED,
            datacartDetails: {
                data: [data]
            }
        });
    }).catch((error) => {console.log(error)
        dispatch({
            type: types.DATACART_DETAILS_ERROR, error: error
        });
    });
};

export function setDatacartDetailsReceived() {
    return {
        type: types.DATACART_DETAILS_RECEIVED_FLAG,
        datacartDetailsReceived: true
    }
};

export function deleteRun(uid) {
    return (dispatch) => {

        dispatch({type: types.DELETING_RUN});

        const csrftoken = cookie.load('csrftoken');

        const form_data = new FormData();
        form_data.append('csrfmiddlewaretoken', csrftoken);

        return axios({
            url: '/api/runs/' + uid,
            method: 'DELETE',
            data: form_data,
            headers: {"X-CSRFToken": csrftoken}
        }).then((response) => {
            dispatch({type: types.DELETED_RUN});
        }).catch(error => {
            dispatch({type: types.DELETE_RUN_ERROR, error: error});
        });
    }
};

export const rerunExport = jobuid => dispatch => {
    dispatch({
        type: types.RERUNNING_EXPORT
    });

    const csrfmiddlewaretoken = cookie.load('csrftoken');
    return axios({
        url: '/api/jobs/'+jobuid+'/run',
        method: 'POST',
        contentType: 'application/json; version=1.0',
        headers: {"X-CSRFToken": csrfmiddlewaretoken}
    }).then((response) => {
        dispatch({
            type: types.RERUN_EXPORT_SUCCESS,
            exportReRun: {
                data: response.data
            }
        });
        //browserHistory.push('/status/')
    }).catch((error) => {console.log(error)
        dispatch({
            type: types.RERUN_EXPORT_ERROR, error: error
        });
    });
}
export function clearReRunInfo() {
    return {
        type: types.CLEAR_RERUN_INFO,
    }
};
export function cancelProviderTask(uid) {
    return (dispatch) => {

        dispatch({type: types.CANCELING_PROVIDER_TASK});

        const csrftoken = cookie.load('csrftoken');

        const form_data = new FormData();
        form_data.append('csrfmiddlewaretoken', csrftoken);

        return axios({
            url: '/api/provider_tasks/' + uid,
            method: 'PATCH',
            data: form_data,
            headers: {"X-CSRFToken": csrftoken}
        }).then((response) => {
            dispatch({type: types.CANCELED_PROVIDER_TASK});
        }).catch(error => {
            dispatch({type: types.CANCEL_PROVIDER_TASK_ERROR, error: error});
        });
    }
};