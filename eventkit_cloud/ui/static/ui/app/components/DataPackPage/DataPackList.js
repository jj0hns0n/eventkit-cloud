import React, {PropTypes, Component} from 'react'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow} from 'material-ui/Table';
import {GridList} from 'material-ui/GridList'
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import NavigationArrowDropUp from 'material-ui/svg-icons/navigation/arrow-drop-up';
import DataPackListItem from './DataPackListItem';
import DataPackTableItem from './DataPackTableItem';
import CustomScrollbar from '../CustomScrollbar';

export class DataPackList extends Component {
    constructor(props) {
        super(props);
        this.handleOrder = this.handleOrder.bind(this);
        this.getIcon = this.getIcon.bind(this);
        this.getHeaderStyle = this.getHeaderStyle.bind(this);
        this.isSameOrderType = this.isSameOrderType.bind(this);
    }

    handleOrder(order) {
        let newOrder = '';
        if (this.isSameOrderType(this.props.order, order)) {
            newOrder = this.props.order.charAt(0) == '-' ? this.props.order.substring(1) : '-' + this.props.order;
        }
        else {
            newOrder = order;
        }
        this.props.onSort(newOrder);
    }

    isSameOrderType(unknown, known) {
        return unknown.charAt(0) == '-' ? unknown.substring(1) == known : unknown == known;
    }

    //If it is a 'reversed' order the arrow should be up, otherwise it should be down
    getIcon(order) {
        const style = {verticalAlign: 'middle', marginBottom: '2px', fill: '#4498c0'};
        const icon = this.props.order == order ?
            <NavigationArrowDropUp style={style}/>
            :
            <NavigationArrowDropDown style={style}/>
        return icon;
    }

    getHeaderStyle(isActive) {
        return isActive ? {color: '#000', fontWeight: 'bold'} : {color: 'inherit'}
    }

    render() {
        const styles = {
            root: {
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                marginLeft: '10px',
                marginRight: '10px',
                paddingBottom: '10px'
            },
            clickable: {cursor: 'pointer', width: 'min-content'},
            tableRow: {marginLeft: '12px', paddingRight: '6px', color: '#fff', height: '50px'},
            nameColumn: {padding: '0px 0px 0px 10px', textAlign: 'left', height: 'inherit'},
            eventColumn: {padding: '0px 0px 0px 10px', textAlign: 'left', height: 'inherit'},
            dateColumn: {width: '98px', padding: '0px 0px 0px 10px', textAlign: 'left', height: 'inherit'},
            statusColumn: {width: '65px' ,padding: '0px 0px 0px 10px', textAlign: 'center', height: 'inherit'},
            permissionsColumn: {width: '100px', padding: '0px 0px 0px 10px', textAlign: 'center', height: 'inherit'},
            ownerColumn: {padding: '0px 0px 0px 10px', textAlign: 'left', height: 'inherit'},
        };
        if(window.innerWidth < 768) {
            return (
                <div style={styles.root}>
                    <GridList
                        cellHeight={'auto'}
                        cols={1}
                        padding={0}
                        style={{width: window.innerWidth - 10, minWidth: '360px'}}
                    >   
                    {this.props.runs.map((run) => (
                        <DataPackListItem 
                            run={run} 
                            user={this.props.user} 
                            key={run.uid}
                            onRunDelete={this.props.onRunDelete}/>
                    ))}
                    </GridList>
                </div>
            )
        }
        else {
            return (
                <div style={styles.root}>
                    <Table >
                        <TableHeader displaySelectAll={false} adjustForCheckbox={false} style={{height: '50px'}}>
                            <TableRow style={styles.tableRow}>
                                <TableHeaderColumn 
                                    style={styles.nameColumn}>
                                    <div onClick={() => {this.handleOrder('job__name')}} style={styles.clickable}>
                                        <span style={this.getHeaderStyle(this.isSameOrderType(this.props.order, 'job__name'))}>Name</span>
                                        {this.getIcon('-job__name')}
                                    </div>
                                </TableHeaderColumn>
                                <TableHeaderColumn style={styles.eventColumn}>
                                    <div onClick={() => {this.handleOrder('job__event')}} style={styles.clickable}>
                                        <span style={this.getHeaderStyle(this.isSameOrderType(this.props.order, 'job__event'))}>Event</span>
                                        {this.getIcon('-job__event')}
                                    </div>
                                </TableHeaderColumn>
                                <TableHeaderColumn style={styles.dateColumn}>
                                    <div onClick={() => {this.handleOrder('started_at')}} style={styles.clickable}>
                                        <span style={this.getHeaderStyle(this.isSameOrderType(this.props.order, 'started_at'))}>Date Added</span>
                                        {this.getIcon('started_at')}
                                    </div>
                                </TableHeaderColumn>
                                <TableHeaderColumn style={styles.statusColumn}>
                                    <div onClick={() => {this.handleOrder('status')}} style={styles.clickable}>
                                        <span style={this.getHeaderStyle(this.isSameOrderType(this.props.order, 'status'))}>Status</span>
                                        {this.getIcon('-status')}
                                    </div>
                                </TableHeaderColumn>
                                <TableHeaderColumn style={styles.permissionsColumn}>
                                    <div onClick={() => {this.handleOrder('job__published')}} style={styles.clickable}>
                                        <span style={this.getHeaderStyle(this.isSameOrderType(this.props.order, 'job__published'))}>Permissions</span>
                                        {this.getIcon('-job__published')}
                                    </div>
                                </TableHeaderColumn>
                                <TableHeaderColumn style={styles.ownerColumn}>
                                    <div onClick={() => {this.handleOrder('user__username')}} style={styles.clickable}>
                                        <span style={this.getHeaderStyle(this.isSameOrderType(this.props.order, 'user__username'))}>Owner</span>
                                        {this.getIcon('-user__username')}
                                    </div>
                                </TableHeaderColumn>
                                <TableHeaderColumn style={{padding: '0px', width: '30px', height: 'inherit'}}/>
                            </TableRow>
                        </TableHeader>
                    </Table>
                    <CustomScrollbar style={{height: window.innerHeight - 343}}>
                        <Table>
                            <TableBody displayRowCheckbox={false}>
                                
                                {this.props.runs.map((run) => (
                                    <DataPackTableItem 
                                        run={run} 
                                        user={this.props.user} 
                                        key={run.uid}
                                        onRunDelete={this.props.onRunDelete}
                                    />
                                ))}
                                
                            </TableBody>          
                        </Table>
                    </CustomScrollbar>
                </div>
            )
        }
        
    }
}

DataPackList.propTypes = {
    runs: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired,
    onRunDelete: PropTypes.func.isRequired,
    onSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
};

export default DataPackList;

