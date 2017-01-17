
import {combineReducers} from 'redux';
import {exportJobsReducer, exportModeReducer, exportBboxReducer} from './exportsReducer';
import {drawExtensionReducer, drawCancelReducer, drawRedrawReducer, drawSetReducer, drawBoxButtonReducer, drawFreeButtonReducer} from './drawToolBarReducer';
import {zoomToSelectionReducer, resetMapReducer} from './setAoiToolbarReducer.js';
import {getGeonamesReducer, searchBboxReducer} from './searchToolbarReducer.js';

const rootReducer = combineReducers({
    // short hand property names
    drawExtensionVisible: drawExtensionReducer,
    drawCancel: drawCancelReducer,
    drawRedraw: drawRedrawReducer,
    drawSet: drawSetReducer,
    drawBoxButton: drawBoxButtonReducer,
    drawFreeButton: drawFreeButtonReducer,
    mode: exportModeReducer,
    jobs: exportJobsReducer,
    bbox: exportBboxReducer,
    searchBbox: searchBboxReducer,
    zoomToSelection: zoomToSelectionReducer,
    resetMap: resetMapReducer,
    geonames: getGeonamesReducer,
})

export default rootReducer;
