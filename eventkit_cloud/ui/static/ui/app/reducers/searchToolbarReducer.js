import * as types from '../actions/actionTypes';
import initialState from './initialState';

export function getGeonamesReducer(state = initialState.geonames, action) {
    switch(action.type) {
        case types.FETCHING_GEONAMES:
            return {fetching: true, fetched: false, geonames: [], error: null};
        case types.RECEIVED_GEONAMES:
            return {fetching: false, fetched: true, geonames: action.geonames, error: null};
        case types.FETCH_GEONAMES_ERROR:
            return {fetching: false, fetched: false, geonames: [], error: action.error};
        default:
            return state;
    }
}

export function searchBboxReducer(state = initialState.searchBbox, action) {
    switch(action.type) {
        case types.DRAW_SEARCH_BBOX:
            return action.searchBbox;
        case types.CLEAR_SEARCH_BBOX:
            return [];
        default:
            return state;
    }
}
