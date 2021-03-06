import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import { logout } from '../actions/userActions';


let createHandlers = function(dispatch) {
    let handleLogout = function (node, data) {
        dispatch(logout())
    };

    return {
        handleLogout,
    };
}

class Logout extends React.Component {

    constructor(props) {
        super(props);
        this.handlers = createHandlers(this.props.dispatch);
    }

    componentDidMount() {
        this.handlers.handleLogout();
    }

    render() {
        const styles = {
            wholeDiv: {
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                marginBottom: '0px',
            },
            root: {
                justifyContent: 'space-around',
                display: 'flex',
                flexWrap: 'wrap',
                height: window.innerHeight - 95,
            },
        }
        return (
            <div style={styles.wholeDiv}>
                <div style={styles.root}>
                </div>
            </div>
        )
    }
}

export default connect()(Logout);

