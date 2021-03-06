import React, {PropTypes, Component} from 'react'
import {Link} from 'react-router';
import {Card, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment';
import style from '../../styles/DataPackPage.css';
import ol from 'openlayers';
import NavigationMoreVert from 'material-ui/svg-icons/navigation/more-vert';
import SocialGroup from 'material-ui/svg-icons/social/group';
import SocialPerson from 'material-ui/svg-icons/social/person';
import NotificationSync from 'material-ui/svg-icons/notification/sync';
import NavigationCheck from 'material-ui/svg-icons/navigation/check';
import AlertError from 'material-ui/svg-icons/alert/error';
import {browserHistory} from 'react-router';

export class DataPackGridItem extends Component {
    constructor(props) {
        super(props);
        this.initMap = this.initMap.bind(this);
        this.toggleExpanded = this.toggleExpanded.bind(this);
        this.handleExpandChange = this.handleExpandChange.bind(this);
        this.state = { 
            expanded: false,
            overflow: false,
        };
    }

    componentDidMount() {
        this.setState({expanded: true});
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevState.expanded != this.state.expanded) {
            if(this.state.expanded) {
                this.initMap();
            }
        }
    }

    initMap() {
        const map = new ol.Map({
            target: this.props.run.uid + '_map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                }),
            ],
            view: new ol.View({
                projection: 'EPSG:3857',
                center: [110,0],
                zoom: 2,
                minZoom: 2,
                maxZoom: 22,
            }),
            interactions: ol.interaction.defaults({mouseWheelZoom: false}),
        });

        let source = new ol.source.Vector();

        const geojson = new ol.format.GeoJSON();
        const feature = geojson.readFeature(this.props.run.job.extent, {
            'featureProjection': 'EPSG:3857',
            'dataProjection': 'EPSG:4326'
        });
        source.addFeature(feature);
        const layer = new ol.layer.Vector({
            source: source,
        });
        map.addLayer(layer);
        map.getView().fit(source.getExtent(), map.getSize());
    }

    handleExpandChange = (expanded) => {
        this.setState({expanded: expanded});
    }

    toggleExpanded() {
        this.setState({expanded: !this.state.expanded});
    }

    render() {
        const cardTextFontSize = window.innerWidth < 768 ? 10 : 12;
        const titleFontSize = 22;
        const styles = {
            card: {
                backgroundColor: '#f7f8f8',
            },
            cardTitle:{
                wordWrap: 'break-word',
                padding: '10px'
            },
            cardTitle2: {fontSize: titleFontSize, height: '36px'},
            cardSubtitle: {fontSize: cardTextFontSize},
            completeIcon: {float: 'left', color: '#bcdfbb', fontSize: '20px'},
            errorIcon: {float: 'left', color: '#ce4427', fontSize: '20px', opacity: '0.6'},
            runningIcon: {float: 'left', color: '#f4D225', fontSize: '22px'},
            unpublishedIcon: {float: 'right', color: 'grey', fontSize: '18px', marginRight: '5px'},
            publishedIcon: {float: 'right', color: '#bcdfbb', fontSize: '20px', marginRight: '5px'},
            ownerLabel: {float: 'right', color: 'grey', padding: '0px, 10px', margin: '0px', fontSize: cardTextFontSize},
            cardTextMinimized: {
                position: 'absolute',
                wordWrap: 'break-word',
                width: '100%',
                backgroundColor: '#f7f8f8',
                zIndex: 2,
                padding: '0px 10px 5px',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
                WebkitLineClamp: 3,
                height: window.innerWidth < 768 ? '47px' : '56px'
            },
            cardText: {
                position: 'absolute',
                wordWrap: 'break-word', 
                width: '100%', 
                backgroundColor: '#f7f8f8', 
                zIndex: 2, 
                padding: '0px 10px 5px',
                
            },
            cardTextContainer: {
                fontSize: cardTextFontSize, 
                padding: '0px', 
                marginBottom: '10px', 
                height: window.innerWidth < 768 ? '42px' : '51px', 
                overflow: this.state.overflow ? 'visible' : 'hidden', 
                position: 'relative'
            },
            titleLink: {
                color: 'inherit', 
                display: 'block', 
                width: '100%', 
                height: '36px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                margin: '0px'
            }
        };

        return (
            <Card style={styles.card} key={this.props.run.uid} expanded={this.state.expanded} onExpandChange={this.handleExpandChange}>
                <CardTitle 
                    titleColor={'#4598bf'}
                    style={styles.cardTitle} 
                    titleStyle={styles.cardTitle2}
                    subtitleStyle={styles.cardSubtitle}
                    title={
                        <div>
                            <div style={{display: 'inline-block', width: 'calc(100% - 24px)', height: '36px'}}>
                                <Link 
                                    to={'/status/' + this.props.run.job.uid} 
                                    style={styles.titleLink}
                                >{this.props.run.job.name}</Link>
                            </div>
                            <IconMenu
                                style={{float: 'right', width: '24px', height: '100%'}}
                                iconButtonElement={
                                    <IconButton 
                                        style={{padding: '0px', width: '24px', height: '24px', verticalAlign: 'middle'}}
                                        iconStyle={{color: '#4598bf'}}>
                                        <NavigationMoreVert />
                                    </IconButton>}
                                anchorOrigin={{horizontal: 'middle', vertical: 'center'}}
                                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                            >
                                <MenuItem 
                                    style={{fontSize: cardTextFontSize}}
                                    primaryText={this.state.expanded ? "Hide Map" : "Show Map"}
                                    onClick={this.toggleExpanded}/>
                                <MenuItem 
                                    style={{fontSize: cardTextFontSize}}
                                    primaryText="Go to Export Detail"
                                    onClick={() => {browserHistory.push('/status/'+this.props.run.job.uid)}}/>
                               
                                {this.props.run.user == this.props.user.data.user.username ?
                                <MenuItem
                                    style={{fontSize: cardTextFontSize}}
                                    primaryText={'Delete Export'}
                                    onClick={() => {this.props.onRunDelete(this.props.run.uid)}}/>
                                : null}
                            </IconMenu>
                        </div>
                    } 
                    subtitle={
                        <div>
                        <div 
                            style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
                        >
                            {'Event: ' + this.props.run.job.event}
                        </div>
                        <span>{'Added: ' + moment(this.props.run.started_at).format('YYYY-MM-DD')}</span><br/>
                        <span>{'Expires: ' + moment(this.props.run.expiration).format('YYYY-MM-DD')}</span><br/>
                        </div>
                        } />
                <CardText 
                    style={styles.cardTextContainer}
                    onMouseEnter={() => {this.setState({overflow: true})}}
                    onMouseLeave={() => {this.setState({overflow: false})}}
                    onTouchTap={() => {this.setState({overflow: !this.state.overflow})}}
                >
                    <span style={this.state.overflow ? styles.cardText : styles.cardTextMinimized}>{this.props.run.job.description}</span>
                </CardText>
                <CardMedia expandable={true}>
                    <div id={this.props.run.uid + '_map'} className={style.map} style={{padding: '0px 2px'}}/>
                </CardMedia>
                <CardActions style={{height: '45px'}}>
                    <span>
                        {this.props.run.status == "SUBMITTED" ?
                            <NotificationSync style={styles.runningIcon}/>
                            :
                            this.props.run.status == "INCOMPLETE" ?
                                <AlertError style={styles.errorIcon}/>
                                :
                                <NavigationCheck style={styles.completeIcon}/>
                        }
                        {this.props.run.user == this.props.user.data.user.username ?
                            <p style={styles.ownerLabel}>My DataPack</p>
                            :
                            <p style={styles.ownerLabel}>{this.props.run.user}</p>
                        }
                        {this.props.run.job.published ? 
                            <SocialGroup style={styles.publishedIcon}/>
                            :
                            
                            <SocialPerson style={styles.unpublishedIcon}/>
                        }
                        
                    </span>
                </CardActions>
            </Card>
        )
    }
}

DataPackGridItem.propTypes = {
    run: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    onRunDelete: PropTypes.func.isRequired
};

export default DataPackGridItem;
