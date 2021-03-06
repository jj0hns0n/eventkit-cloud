import React, {PropTypes, Component} from 'react'
import ol from 'openlayers';
import '../tap_events'
import DataPackDetails from './DataPackDetails'
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import moment from 'moment'

export class DataCartDetails extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            cartDetails: {},
            status: '',
            statusBackgroundColor: '',
            statusFontColor: '',
            deleteDialogOpen: false,
            rerunDialogOpen: false,
            cloneDialogOpen: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.cartDetails.status != this.state.status) {
            switch(nextProps.cartDetails.status) {
                case 'COMPLETED':
                    return this.setState({status: 'COMPLETED', statusBackgroundColor: 'rgba(188,223,187, 0.4)', statusFontColor: '#55ba63'});
                case 'SUBMITTED':
                    return this.setState({status: 'SUBMITTED', statusBackgroundColor: 'rgba(250,233,173, 0.4)', statusFontColor: '#f4d225'});
                case 'INCOMPLETE':
                    return this.setState({status: 'INCOMPLETE', statusBackgroundColor: 'rgba(232,172,144, 0.4)', statusFontColor: '#ce4427'});
                default:
                    return this.setState({status: '', statusBackgroundColor: '#f8f8f8', statusFontColor: '#8b9396'});
            }
        }
    }

    componentDidMount(){
        this._initializeOpenLayers();
        this._setTableColors();
    }

    _setTableColors() {
        switch(this.props.cartDetails.status) {
            case 'COMPLETED':
                return this.setState({status: 'COMPLETED', statusBackgroundColor: 'rgba(188,223,187, 0.4)', statusFontColor: '#55ba63'});
            case 'SUBMITTED':
                return this.setState({status: 'SUBMITTED', statusBackgroundColor: 'rgba(250,233,173, 0.4)', statusFontColor: '#f4d225'});
            case 'INCOMPLETE':
                return this.setState({status: 'INCOMPLETE', statusBackgroundColor: 'rgba(232,172,144, 0.4)', statusFontColor: '#ce4427'});
            default:
                return this.setState({status: '', statusBackgroundColor: '#f8f8f8', statusFontColor: '#8b9396'});
        }
    }
    _initializeOpenLayers() {
        var osm = new ol.layer.Tile({
            source: new ol.source.OSM()
        });

        this._map = new ol.Map({
            interactions: ol.interaction.defaults({
                keyboard: false,
                altShiftDragRotate: false,
                pinchRotate: false,
                mouseWheelZoom: false
            }),
            layers: [osm],
            target: 'summaryMap',
            view: new ol.View({
                projection: "EPSG:3857",
                center: [110, 0],
                zoom: 2,
                minZoom: 2,
                maxZoom: 22,
            })
        });
        const source = new ol.source.Vector();
        const geojson = new ol.format.GeoJSON();
        const feature = geojson.readFeatures(this.props.cartDetails.job.extent, {
            'featureProjection': 'EPSG:3857',
            'dataProjection': 'EPSG:4326'
        });
        source.addFeatures(feature);
        const layer = new ol.layer.Vector({
            source: source,
        });

        this._map.addLayer(layer);
        this._map.getView().fit(source.getExtent(), this._map.getSize());

    }
    handleDeleteOpen = () => {
        this.setState({deleteDialogOpen: true});
    };

    handleDeleteClose = () => {
        this.setState({deleteDialogOpen: false});
    };

    handleRerunOpen = () => {
        this.setState({rerunDialogOpen: true});
    };

    handleRerunClose = () => {
        this.setState({rerunDialogOpen: false});
    };
    handleCloneOpen = () => {
        this.setState({cloneDialogOpen: true});
    };

    handleCloneClose = () => {
        this.setState({cloneDialogOpen: false});
    };

    handleDelete = () => {
        this.props.onRunDelete(this.props.cartDetails.uid)
        this.setState({deleteDialogOpen: false});
    };

    handleRerun = () => {
        this.props.onRunRerun(this.props.cartDetails.job.uid)
        this.setState({rerunDialogOpen: false});
    };

    handleClone = () => {
        let providerArray = [];
        this.props.cartDetails.provider_tasks.forEach((provider) => {
            if(provider.display == true) {
                providerArray.push(provider);
            };
        })
        this.props.onClone(this.props.cartDetails, providerArray);
        this.setState({cloneDialogOpen: false});

    };

    render() {

        const providers = this.props.cartDetails.provider_tasks.filter((provider) => {
            return provider.display != false;
        });

        const styles = {
            tdHeader: {backgroundColor: '#f8f8f8', padding: '10px', fontWeight: 'bold'},
            tdData: {backgroundColor: '#f8f8f8', padding: '10px', color: '#8b9396'},
            subHeading: {fontSize: '16px', alignContent: 'flex-start', color: 'black', paddingBottom: '10px', paddingTop: '30px', fontWeight: 'bold'}
        }

        const deleteActions = [
            <RaisedButton
                style={{margin: '10px'}}
                labelStyle={{color: '#4598bf', fontWeight: 'bold'}}
                buttonStyle={{backgroundColor: 'whitesmoke'}}
                disableTouchRipple={true}
                label="Cancel"
                primary={false}
                onTouchTap={this.handleDeleteClose.bind(this)}
            />,<RaisedButton
                style={{margin: '10px'}}
                labelStyle={{color: 'red', fontWeight: 'bold'}}
                buttonStyle={{backgroundColor: 'whitesmoke'}}                
                disableTouchRipple={true}
                label="Delete"
                primary={true}
                onTouchTap={this.handleDelete.bind(this)}
            />,
        ];
        const rerunExportActions = [
            <RaisedButton
                style={{margin: '10px'}}
                labelStyle={{color: '#4598bf', fontWeight: 'bold'}}
                buttonStyle={{backgroundColor: 'whitesmoke'}}
                disableTouchRipple={true}
                label="Cancel"
                primary={false}
                onTouchTap={this.handleRerunClose.bind(this)}
            />,
            <RaisedButton
                style={{margin: '10px'}}
                buttonStyle={{backgroundColor: '#4598bf'}}
                label="Rerun"
                primary={true}
                onTouchTap={this.handleRerun.bind(this)}
            />,
        ];
        const cloneExportActions = [
            <RaisedButton
                style={{margin: '10px'}}
                labelStyle={{color: '#4598bf', fontWeight: 'bold'}}
                buttonStyle={{backgroundColor: 'whitesmoke'}}
                disableTouchRipple={true}
                label="Cancel"
                primary={false}
                onTouchTap={this.handleCloneClose.bind(this)}
            />,
            <RaisedButton
                style={{margin: '10px'}}
                buttonStyle={{backgroundColor: '#4598bf'}}
                label="Clone"
                primary={true}
                onTouchTap={this.handleClone.bind(this)}
            />,
        ];
        return (
        <div>
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td style={{...styles.tdHeader, width: '15%'}}>Name</td>
                            <td style={styles.tdData}>{this.props.cartDetails.job.name}</td>
                        </tr>
                        <tr>
                            <td style={{...styles.tdHeader, backgroundColor: this.state.statusBackgroundColor, width: '15%'}}>Status</td>
                            <td style={{...styles.tdData, backgroundColor: this.state.statusBackgroundColor, color: this.state.statusFontColor}}>
                                {this.props.cartDetails.status}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{paddingBottom:'10px'}}>
                <DataPackDetails providerTasks={this.props.cartDetails.provider_tasks}
                                 onProviderCancel={this.props.onProviderCancel}/>
            </div>
            <div style={{width:'100%', float:'left', paddingTop:'10px',paddingBottom:'30px'}}>
                <div style={styles.subHeading}>
                    Other Options
                </div>
                <div>
                    <RaisedButton
                        style={{margin: '10px'}}
                        disabled={this.state.status == "SUBMITTED"}
                        backgroundColor={'rgba(226,226,226,0.5)'}
                        disableTouchRipple={true}
                        labelColor={'#4598bf'}
                        labelStyle={{fontWeight:'bold'}}
                        onTouchTap={this.handleRerunOpen.bind(this)}
                        label="RUN EXPORT AGAIN"
                         />
                    <Dialog
                        contentStyle={{width:'30%'}}
                        actions={rerunExportActions}
                        modal={false}
                        open={this.state.rerunDialogOpen}
                        onRequestClose={this.handleRerunClose.bind(this)}
                    >
                        <strong>Are you sure you want to run this export again?</strong>
                    </Dialog>
                    <RaisedButton
                        style={{margin: '10px'}}
                        backgroundColor={'rgba(226,226,226,0.5)'}
                        disableTouchRipple={true}
                        labelColor={'#4598bf'}
                        labelStyle={{fontWeight:'bold'}}
                        onTouchTap={this.handleCloneOpen.bind(this)}
                        label="CLONE"
                    />
                    <Dialog
                        contentStyle={{width:'30%'}}
                        actions={cloneExportActions}
                        modal={false}
                        open={this.state.cloneDialogOpen}
                        onRequestClose={this.handleCloneClose.bind(this)}
                    >
                        <strong>Are you sure you want to Clone this DataPack?</strong>
                    </Dialog>
                    <RaisedButton
                        style={{margin: '10px'}}
                        backgroundColor={'rgba(226,226,226,0.5)'}
                        disableTouchRipple={true}
                        labelColor={'#ff0000'}
                        labelStyle={{fontWeight:'bold'}}
                        onTouchTap={this.handleDeleteOpen.bind(this)}
                        label="DELETE"
                    />

                    <Dialog
                        contentStyle={{width:'30%'}}
                        actions={deleteActions}
                        modal={false}
                        open={this.state.deleteDialogOpen}
                        onRequestClose={this.handleDeleteClose.bind(this)}
                    >
                        <strong>Are you sure you want to delete the DataPack?</strong>
                    </Dialog>
                </div>

            </div>
            <div style={{width:'100%', paddingTop:'10px',paddingBottom:'20px'}}>

                    <div style={styles.subHeading}>
                        General Information
                    </div>
                    <table>
                        <tbody>
                            <tr>
                                <td style={styles.tdHeader}>Description</td>
                                <td style={styles.tdData}>{this.props.cartDetails.job.description}</td>
                            </tr>
                            <tr>
                                <td style={styles.tdHeader}>Project/Category</td>
                                <td style={styles.tdData}>{this.props.cartDetails.job.event}</td>
                            </tr>
                            <tr>
                                <td style={styles.tdHeader}>Published</td>
                                <td style={styles.tdData}>{this.props.cartDetails.job.published.toString()}</td>
                            </tr>
                            <tr>
                                <td style={styles.tdHeader}>Layer Data</td>
                                <td style={styles.tdData} >{
                                    providers.map((provider) => {
                                            return <p key={provider.name}>{provider.name}</p>
                                    })}
                                </td>
                            </tr>
                            <tr>
                                <td style={styles.tdHeader}>File Formats</td>
                                <td style={styles.tdData}>.gpkg</td>
                            </tr>
                            <tr>
                                <td style={styles.tdHeader}>Projection</td>
                                <td style={styles.tdData}>EPSG:4326 - World Geodetic System 1984 (WGS84)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>


            <div style={{width:'100%', float:'left', paddingBottom:'30px'}}>
                <div style={styles.subHeading}>
                        Selected Area of Interest (AOI)
                </div>
                <div id="summaryMap" style={{maxHeight: '400px'}}></div>
            </div>
            <div style={{width:'100%', paddingTop:'30px'}}>
                <div style={styles.subHeading}>
                    Export Information
                </div>
                <table>
                    <tbody>
                        <tr>
                            <td style={styles.tdHeader}>Run By</td>
                            <td style={styles.tdData}>{this.props.cartDetails.user}</td>
                        </tr>
                        <tr>
                            <td style={styles.tdHeader}>Run Id</td>
                            <td style={styles.tdData}>{this.props.cartDetails.uid}</td>
                        </tr>
                        <tr>
                            <td style={styles.tdHeader}>Started</td>
                            <td style={styles.tdData}>{moment(this.props.cartDetails.started_at).format('h:mm:ss a, MMMM Do YYYY')}</td>
                        </tr>
                        {this.props.cartDetails.finished_at ? 
                            <tr>
                                <td style={styles.tdHeader}>Finished</td>
                                <td style={styles.tdData}>{moment(this.props.cartDetails.finished_at).format('h:mm:ss a, MMMM Do YYYY')}</td>
                            </tr>
                        :
                            null
                        }
                    </tbody>
                </table>
            </div>

        </div>

        )
    }
}

DataCartDetails.propTypes = {
    cartDetails: PropTypes.object,
    onRunDelete: PropTypes.func.isRequired,
    onRunRerun:  PropTypes.func.isRequired,
    onClone:     PropTypes.func.isRequired,
    onProviderCancel: PropTypes.func.isRequired,
}

export default DataCartDetails;

